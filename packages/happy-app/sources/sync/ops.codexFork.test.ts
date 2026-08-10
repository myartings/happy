import { beforeEach, describe, expect, it, vi } from 'vitest';

const { machineRPC, refreshSessions } = vi.hoisted(() => ({
    machineRPC: vi.fn(),
    refreshSessions: vi.fn(),
}));

vi.mock('./apiSocket', () => ({
    apiSocket: { machineRPC },
}));

vi.mock('./sync', () => ({
    sync: { refreshSessions },
}));

// ops.ts imports storage (for sessionSetAgentModes), which transitively pulls
// in react-native — mock it out, these tests never touch it.
vi.mock('./storage', () => ({
    storage: { getState: vi.fn(() => ({ sessions: {} })) },
}));

describe('codex fork ops', () => {
    beforeEach(() => {
        machineRPC.mockReset();
        refreshSessions.mockReset();
    });

    it('passes new-session mode defaults through spawn RPC', async () => {
        machineRPC.mockResolvedValue({ type: 'success', sessionId: 'happy-new' });

        const { machineSpawnNewSession } = await import('./ops');
        const result = await machineSpawnNewSession({
            machineId: 'machine-1',
            directory: '/tmp/project',
            agent: 'claude',
            permissionMode: 'bypassPermissions',
            modelMode: 'opus',
            effortLevel: 'xhigh',
        });

        expect(result).toEqual({ type: 'success', sessionId: 'happy-new' });
        expect(machineRPC).toHaveBeenCalledWith(
            'machine-1',
            'spawn-happy-session',
            expect.objectContaining({
                directory: '/tmp/project',
                agent: 'claude',
                permissionMode: 'bypassPermissions',
                modelMode: 'opus',
                effortLevel: 'xhigh',
            }),
        );
    });

    it('forks a full Codex thread and spawns a Codex session resumed to the new thread', async () => {
        machineRPC.mockImplementation(async (_machineId: string, method: string) => {
            if (method === 'codex-fork-thread') {
                return { type: 'success', newCodexThreadId: 'thread-forked' };
            }
            if (method === 'spawn-happy-session') {
                return { type: 'success', sessionId: 'happy-forked' };
            }
            throw new Error(`unexpected method ${method}`);
        });

        const { forkAndSpawn } = await import('./ops');
        const result = await forkAndSpawn({
            kind: 'codex',
            sessionId: 'happy-source',
            machineId: 'machine-1',
            directory: '/tmp/project',
            codexThreadId: 'thread-source',
        });

        expect(result).toEqual({ type: 'success', sessionId: 'happy-forked' });
        expect(machineRPC).toHaveBeenNthCalledWith(
            1,
            'machine-1',
            'codex-fork-thread',
            { directory: '/tmp/project', codexThreadId: 'thread-source' },
        );
        expect(machineRPC).toHaveBeenNthCalledWith(
            2,
            'machine-1',
            'spawn-happy-session',
            expect.objectContaining({
                agent: 'codex',
                directory: '/tmp/project',
                resumeCodexThreadId: 'thread-forked',
                parentSessionId: 'happy-source',
            }),
        );
        expect(refreshSessions).toHaveBeenCalledTimes(1);
    });

    it('duplicates a Codex thread from a selected user item before spawning', async () => {
        machineRPC.mockImplementation(async (_machineId: string, method: string) => {
            if (method === 'codex-duplicate-thread') {
                return { type: 'success', newCodexThreadId: 'thread-cut' };
            }
            if (method === 'spawn-happy-session') {
                return { type: 'success', sessionId: 'happy-cut' };
            }
            throw new Error(`unexpected method ${method}`);
        });

        const { forkAndSpawn } = await import('./ops');
        const result = await forkAndSpawn({
            kind: 'codex',
            sessionId: 'happy-source',
            machineId: 'machine-1',
            directory: '/tmp/project',
            codexThreadId: 'thread-source',
        }, {
            cutAfterItemId: 'user-item-2',
            forkedFromMessageId: 'message-2',
        });

        expect(result).toEqual({ type: 'success', sessionId: 'happy-cut' });
        expect(machineRPC).toHaveBeenNthCalledWith(
            1,
            'machine-1',
            'codex-duplicate-thread',
            { directory: '/tmp/project', codexThreadId: 'thread-source', cutAfterItemId: 'user-item-2' },
        );
        expect(machineRPC).toHaveBeenNthCalledWith(
            2,
            'machine-1',
            'spawn-happy-session',
            expect.objectContaining({
                agent: 'codex',
                resumeCodexThreadId: 'thread-cut',
                forkedFromMessageId: 'message-2',
            }),
        );
    });

    it('forks a Codex session into an isolated worktree and finalizes it after spawn', async () => {
        machineRPC.mockImplementation(async (_machineId: string, method: string) => {
            if (method === 'worktree-snapshot-create') {
                return {
                    sourceDirectory: '/repo/packages/app',
                    repositoryRoot: '/repo',
                    primaryRepositoryRoot: '/repo',
                    head: 'abc123',
                    branch: 'dev',
                    stagedCount: 1,
                    unstagedCount: 2,
                    untrackedCount: 1,
                    untrackedBytes: 42,
                    isDirty: true,
                    worktreeRoot: '/repo/.dev/worktree/fork-1234',
                    sessionDirectory: '/repo/.dev/worktree/fork-1234/packages/app',
                    branchName: 'happy/fork/1234',
                    cleanupToken: 'cleanup-1234',
                };
            }
            if (method === 'codex-fork-thread') {
                return { type: 'success', newCodexThreadId: 'thread-worktree' };
            }
            if (method === 'spawn-happy-session') {
                return { type: 'success', sessionId: 'happy-worktree' };
            }
            if (method === 'worktree-snapshot-finalize') {
                return { success: true };
            }
            throw new Error(`unexpected method ${method}`);
        });

        const { forkInWorktreeAndSpawn } = await import('./ops');
        const result = await forkInWorktreeAndSpawn({
            kind: 'codex',
            sessionId: 'happy-source',
            machineId: 'machine-1',
            directory: '/repo/packages/app',
            codexThreadId: 'thread-source',
        }, true);

        expect(result).toEqual({ type: 'success', sessionId: 'happy-worktree' });
        expect(machineRPC).toHaveBeenNthCalledWith(1, 'machine-1', 'worktree-snapshot-create', {
            directory: '/repo/packages/app',
            inheritChanges: true,
        });
        expect(machineRPC).toHaveBeenNthCalledWith(2, 'machine-1', 'codex-fork-thread', {
            directory: '/repo/.dev/worktree/fork-1234/packages/app',
            codexThreadId: 'thread-source',
        });
        expect(machineRPC).toHaveBeenNthCalledWith(3, 'machine-1', 'spawn-happy-session', expect.objectContaining({
            agent: 'codex',
            directory: '/repo/.dev/worktree/fork-1234/packages/app',
            resumeCodexThreadId: 'thread-worktree',
            parentSessionId: 'happy-source',
        }));
        expect(machineRPC).toHaveBeenNthCalledWith(4, 'machine-1', 'worktree-snapshot-finalize', {
            cleanupToken: 'cleanup-1234',
        });
        expect(refreshSessions).toHaveBeenCalledTimes(1);
    });

    it('cleans up the worktree when provider forking fails', async () => {
        machineRPC.mockImplementation(async (_machineId: string, method: string) => {
            if (method === 'worktree-snapshot-create') {
                return {
                    sessionDirectory: '/repo/.dev/worktree/fork-fail',
                    cleanupToken: 'cleanup-fail',
                };
            }
            if (method === 'codex-fork-thread') {
                return { type: 'error', errorMessage: 'provider failed' };
            }
            if (method === 'worktree-snapshot-cleanup') {
                return { success: true };
            }
            throw new Error(`unexpected method ${method}`);
        });

        const { forkInWorktreeAndSpawn } = await import('./ops');
        const result = await forkInWorktreeAndSpawn({
            kind: 'codex',
            sessionId: 'happy-source',
            machineId: 'machine-1',
            directory: '/repo',
            codexThreadId: 'thread-source',
        }, false);

        expect(result).toEqual({ type: 'error', errorMessage: 'provider failed' });
        expect(machineRPC).toHaveBeenLastCalledWith('machine-1', 'worktree-snapshot-cleanup', {
            cleanupToken: 'cleanup-fail',
        });
    });

    it('copies a Claude conversation to the target project and cleans up when spawn fails', async () => {
        machineRPC.mockImplementation(async (_machineId: string, method: string) => {
            if (method === 'worktree-snapshot-create') {
                return {
                    sessionDirectory: '/repo/.dev/worktree/fork-claude',
                    cleanupToken: 'cleanup-claude',
                };
            }
            if (method === 'claude-fork-session') {
                return { type: 'success', newClaudeSessionId: 'claude-forked' };
            }
            if (method === 'spawn-happy-session') {
                return { type: 'error', errorMessage: 'spawn failed' };
            }
            if (method === 'worktree-snapshot-cleanup') {
                return { success: true };
            }
            throw new Error(`unexpected method ${method}`);
        });

        const { forkInWorktreeAndSpawn } = await import('./ops');
        const result = await forkInWorktreeAndSpawn({
            sessionId: 'happy-source',
            machineId: 'machine-1',
            directory: '/repo',
            claudeSessionId: 'claude-source',
        }, true);

        expect(result).toEqual({ type: 'error', errorMessage: 'spawn failed' });
        expect(machineRPC).toHaveBeenNthCalledWith(2, 'machine-1', 'claude-fork-session', {
            directory: '/repo',
            targetDirectory: '/repo/.dev/worktree/fork-claude',
            claudeSessionId: 'claude-source',
        });
        expect(machineRPC).toHaveBeenLastCalledWith('machine-1', 'worktree-snapshot-cleanup', {
            cleanupToken: 'cleanup-claude',
        });
    });
});
