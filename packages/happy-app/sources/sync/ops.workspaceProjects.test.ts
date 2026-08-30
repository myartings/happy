import { beforeEach, describe, expect, it, vi } from 'vitest';

const { machineRPC } = vi.hoisted(() => ({
    machineRPC: vi.fn(),
}));

vi.mock('./apiSocket', () => ({ apiSocket: { machineRPC } }));
vi.mock('./sync', () => ({ sync: {} }));
vi.mock('./storage', () => ({ storage: {} }));

describe('workspace project discovery operation', () => {
    beforeEach(() => {
        machineRPC.mockReset();
        machineRPC.mockResolvedValue({
            root: '/home/dev/workspace',
            projects: [],
            scannedAt: 1,
            truncated: false,
        });
    });

    it('calls the optional encrypted Machine RPC with a search query but no caller-provided root', async () => {
        const { listWorkspaceProjects } = await import('./ops');

        await listWorkspaceProjects('machine-a', 'happy');

        expect(machineRPC).toHaveBeenCalledWith('machine-a', 'list-workspace-projects', { query: 'happy' });
    });

    it('keeps the request compatible when no search query is provided', async () => {
        const { listWorkspaceProjects } = await import('./ops');

        await listWorkspaceProjects('machine-a');

        expect(machineRPC).toHaveBeenCalledWith('machine-a', 'list-workspace-projects', {});
    });
});
