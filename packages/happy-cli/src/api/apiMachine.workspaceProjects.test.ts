import { beforeEach, describe, expect, it, vi } from 'vitest';
import { homedir } from 'node:os';
import { join } from 'node:path';

const { mockListWorkspaceProjects } = vi.hoisted(() => ({
    mockListWorkspaceProjects: vi.fn(),
}));

vi.mock('@/workspace/workspaceProjectScanner', () => ({
    MAX_WORKSPACE_PROJECT_QUERY_LENGTH: 256,
    listWorkspaceProjects: mockListWorkspaceProjects,
}));

function machineClient() {
    return {
        id: 'machine-1',
        encryptionKey: new Uint8Array(32),
        encryptionVariant: 'legacy',
    } as any;
}

function handlersFrom(client: any): Map<string, (params: unknown) => Promise<unknown>> {
    return client.rpcHandlerManager.handlers;
}

describe('ApiMachineClient workspace project discovery RPC', () => {
    beforeEach(() => {
        mockListWorkspaceProjects.mockReset();
    });

    it('lists projects from the daemon-owned conventional workspace root', async () => {
        const expected = {
            root: join(homedir(), 'workspace'),
            projects: [],
            scannedAt: 1,
            truncated: false,
        };
        mockListWorkspaceProjects.mockResolvedValue(expected);

        const { ApiMachineClient } = await import('./apiMachine');
        const client = new ApiMachineClient('token', machineClient());
        client.setRPCHandlers({
            spawnSession: vi.fn(),
            stopSession: vi.fn(),
            requestShutdown: vi.fn(),
        });

        const handler = handlersFrom(client).get('machine-1:list-workspace-projects');
        const result = await handler?.({ root: 'C:\\untrusted', query: '  happy  ' });

        expect(result).toBe(expected);
        expect(mockListWorkspaceProjects).toHaveBeenCalledWith({
            root: join(homedir(), 'workspace'),
            query: 'happy',
        });
    }, 15_000);
});
