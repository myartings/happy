import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    sessionRPC: vi.fn(),
    emitWithAck: vi.fn(),
    updateSessionAgentModes: vi.fn(),
    randomUUID: vi.fn(),
    decryptRaw: vi.fn(),
    session: {
        id: 'session-1',
        permissionMode: 'auto' as string | null,
        permissionModeRevision: 0,
        metadataVersion: 1,
        metadata: { permissionMode: 'auto' } as Record<string, unknown>,
    },
    liveState: {
        permissionMode: 'auto',
        revision: 0,
        generation: 'generation-1',
    },
}));

vi.mock('expo-crypto', () => ({ randomUUID: mocks.randomUUID }));
vi.mock('./apiSocket', () => ({
    apiSocket: {
        sessionRPC: mocks.sessionRPC,
        emitWithAck: mocks.emitWithAck,
    },
}));
vi.mock('./sync', () => ({
    sync: {
        encryption: {
            getSessionEncryption: () => ({
                encryptRaw: vi.fn(async () => 'encrypted-metadata'),
                decryptRaw: mocks.decryptRaw,
            }),
        },
    },
}));
vi.mock('./storage', () => ({
    storage: {
        getState: () => ({
            sessions: {
                'session-1': mocks.session,
            },
            updateSessionAgentModes: mocks.updateSessionAgentModes,
        }),
    },
}));

describe('sessionSetPermissionMode', () => {
    beforeEach(() => {
        mocks.sessionRPC.mockReset();
        mocks.emitWithAck.mockReset();
        mocks.updateSessionAgentModes.mockReset();
        mocks.randomUUID.mockReset();
        mocks.decryptRaw.mockReset();
        mocks.session.permissionMode = 'auto';
        mocks.session.permissionModeRevision = 0;
        mocks.session.metadataVersion = 1;
        mocks.session.metadata = { permissionMode: 'auto' };
        mocks.liveState.permissionMode = 'auto';
        mocks.liveState.revision = 0;
        mocks.liveState.generation = 'generation-1';
        mocks.updateSessionAgentModes.mockImplementation((_sessionId, patch) => {
            Object.assign(mocks.session, patch);
        });
        mocks.sessionRPC.mockImplementation(async (_sessionId, method, payload) => {
            if (method === 'permission-mode-state') {
                return { ...mocks.liveState };
            }
            if (method === 'permission-mode') {
                mocks.liveState.permissionMode = payload.permissionMode;
                mocks.liveState.revision += 1;
                return {
                    requestId: payload.requestId,
                    permissionMode: payload.permissionMode,
                    pendingApprovalsResolved: 0,
                    revision: mocks.liveState.revision,
                    generation: mocks.liveState.generation,
                };
            }
            if (method === 'permission-mode-confirm') {
                return { ...mocks.liveState };
            }
            throw new Error(`Unexpected RPC method: ${method}`);
        });
        mocks.randomUUID.mockReturnValue('permission-request-1');
        mocks.emitWithAck.mockResolvedValue({ result: 'success', version: 2 });
    });

    it('changes the shared picker mirror only after the connected CLI acknowledges the live mode', async () => {
        let acknowledge!: (value: unknown) => void;
        mocks.sessionRPC.mockImplementation(async (_sessionId, method, payload) => {
            if (method === 'permission-mode-state') {
                return { ...mocks.liveState };
            }
            if (method === 'permission-mode-confirm') {
                return { ...mocks.liveState };
            }
            return new Promise((resolve) => {
                acknowledge = (value) => {
                    mocks.liveState.permissionMode = payload.permissionMode;
                    mocks.liveState.revision = 1;
                    resolve(value);
                };
            });
        });
        const { sessionSetPermissionMode } = await import('./ops');

        const change = sessionSetPermissionMode('session-1', 'yolo');
        await vi.waitFor(() => {
            expect(mocks.sessionRPC.mock.calls.some((call) => call[1] === 'permission-mode')).toBe(true);
        });
        expect(mocks.updateSessionAgentModes).not.toHaveBeenCalled();

        acknowledge({
            requestId: 'permission-request-1',
            permissionMode: 'yolo',
            pendingApprovalsResolved: 1,
            revision: 1,
            generation: 'generation-1',
        });
        await change;

        expect(mocks.sessionRPC).toHaveBeenCalledWith('session-1', 'permission-mode', {
            requestId: 'permission-request-1',
            permissionMode: 'yolo',
            generation: 'generation-1',
        });
        expect(mocks.updateSessionAgentModes).toHaveBeenCalledWith('session-1', {
            permissionMode: 'yolo',
            permissionModeRevision: 1,
        });
    });

    it('serializes rapid selections for the same session', async () => {
        let acknowledgeFirst!: (value: unknown) => void;
        mocks.randomUUID
            .mockReturnValueOnce('permission-request-1')
            .mockReturnValueOnce('permission-request-2');
        mocks.sessionRPC.mockImplementation(async (_sessionId, method, payload) => {
            if (method === 'permission-mode-state') {
                return { ...mocks.liveState };
            }
            if (method === 'permission-mode-confirm') {
                return { ...mocks.liveState };
            }
            if (payload.requestId === 'permission-request-1') {
                return new Promise((resolve) => {
                    acknowledgeFirst = (value) => {
                        mocks.liveState.permissionMode = 'yolo';
                        mocks.liveState.revision = 1;
                        resolve(value);
                    };
                });
            }
            mocks.liveState.permissionMode = 'auto';
            mocks.liveState.revision = 2;
            return {
                requestId: 'permission-request-2',
                permissionMode: 'auto',
                pendingApprovalsResolved: 0,
                revision: 2,
                generation: 'generation-1',
            };
        });
        const { sessionSetPermissionMode } = await import('./ops');

        const yolo = sessionSetPermissionMode('session-1', 'yolo');
        const auto = sessionSetPermissionMode('session-1', 'auto');
        await vi.waitFor(() => {
            expect(mocks.sessionRPC.mock.calls.filter((call) => call[1] === 'permission-mode')).toHaveLength(1);
        });

        acknowledgeFirst({
            requestId: 'permission-request-1',
            permissionMode: 'yolo',
            pendingApprovalsResolved: 0,
            revision: 1,
            generation: 'generation-1',
        });
        await expect(yolo).resolves.toMatchObject({
            requestId: 'permission-request-1',
            revision: 1,
        });
        await auto;

        const modeCalls = mocks.sessionRPC.mock.calls.filter((call) => call[1] === 'permission-mode');
        expect(modeCalls).toHaveLength(2);
        expect(modeCalls[1]).toEqual(['session-1', 'permission-mode', {
            requestId: 'permission-request-2',
            permissionMode: 'auto',
            generation: 'generation-1',
        }]);
    });

    it('leaves the shared picker mirror unchanged when the CLI is disconnected', async () => {
        mocks.sessionRPC.mockImplementation(async (_sessionId, method) => {
            if (method === 'permission-mode-state') {
                return { ...mocks.liveState };
            }
            throw new Error('The computer did not respond');
        });
        const { sessionSetPermissionMode } = await import('./ops');

        await expect(sessionSetPermissionMode('session-1', 'yolo'))
            .rejects.toThrow('The computer did not respond');
        expect(mocks.updateSessionAgentModes).not.toHaveBeenCalled();
        expect(mocks.emitWithAck).not.toHaveBeenCalled();
    });

    it('rejects a mismatched acknowledgement without changing the shared picker mirror', async () => {
        mocks.sessionRPC.mockImplementation(async (_sessionId, method) => {
            if (method === 'permission-mode-state') {
                return { ...mocks.liveState };
            }
            return {
                requestId: 'different-request',
                permissionMode: 'yolo',
                revision: 1,
                generation: 'generation-1',
                pendingApprovalsResolved: 0,
            };
        });
        const { sessionSetPermissionMode } = await import('./ops');

        await expect(sessionSetPermissionMode('session-1', 'yolo'))
            .rejects.toThrow('invalid permission-mode acknowledgement');
        expect(mocks.updateSessionAgentModes).not.toHaveBeenCalled();
    });

    it('rejects an acknowledgement without a positive CLI revision', async () => {
        mocks.sessionRPC.mockImplementation(async (_sessionId, method) => {
            if (method === 'permission-mode-state') {
                return { ...mocks.liveState };
            }
            return {
                requestId: 'permission-request-1',
                permissionMode: 'yolo',
                generation: 'generation-1',
                pendingApprovalsResolved: 0,
            };
        });
        const { sessionSetPermissionMode } = await import('./ops');

        await expect(sessionSetPermissionMode('session-1', 'yolo'))
            .rejects.toThrow('invalid permission-mode acknowledgement');
        expect(mocks.updateSessionAgentModes).not.toHaveBeenCalled();
    });

    it('keeps the mirror at the greatest CLI revision when another client persists later first', async () => {
        mocks.emitWithAck.mockResolvedValueOnce({
            result: 'version-mismatch',
            version: 2,
            metadata: 'encrypted-newer-metadata',
        });
        mocks.decryptRaw.mockResolvedValueOnce({
            permissionMode: 'auto',
            permissionModeRevision: 2,
        });
        const { sessionSetPermissionMode } = await import('./ops');

        await sessionSetPermissionMode('session-1', 'yolo');

        await vi.waitFor(() => {
            expect(mocks.updateSessionAgentModes).toHaveBeenLastCalledWith('session-1', {
                permissionMode: 'auto',
                permissionModeRevision: 2,
            });
        });
        expect(mocks.emitWithAck).toHaveBeenCalledTimes(1);
    });

    it('does not persist an acknowledgement invalidated by an abort before confirmation', async () => {
        mocks.sessionRPC.mockImplementation(async (_sessionId, method, payload) => {
            if (method === 'permission-mode-state') {
                return { permissionMode: 'auto', revision: 0, generation: 'generation-before-abort' };
            }
            if (method === 'permission-mode-confirm') {
                return { permissionMode: 'auto', revision: 1, generation: 'generation-after-abort' };
            }
            return {
                requestId: payload.requestId,
                permissionMode: 'yolo',
                pendingApprovalsResolved: 0,
                revision: 1,
                generation: 'generation-before-abort',
            };
        });
        const { sessionSetPermissionMode } = await import('./ops');

        await expect(sessionSetPermissionMode('session-1', 'yolo'))
            .rejects.toThrow('invalidated before confirmation');
        expect(mocks.updateSessionAgentModes).not.toHaveBeenCalled();
        expect(mocks.emitWithAck).not.toHaveBeenCalled();
    });
});
