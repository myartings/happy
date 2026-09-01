import { beforeEach, describe, expect, it, vi } from 'vitest';

const registry = vi.hoisted(() => ({
    list: vi.fn(),
    add: vi.fn(),
    resolveProjectPath: vi.fn(),
}));

vi.mock('@/projects/savedProjectRegistry', () => ({
    SavedProjectRegistry: class {
        list = registry.list;
        add = registry.add;
        resolveProjectPath = registry.resolveProjectPath;
    },
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

describe('ApiMachineClient saved-project RPC', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('resolves project identity on the machine and ignores a stale caller directory', async () => {
        registry.resolveProjectPath.mockResolvedValue('C:\\canonical\\primary');
        const spawnSession = vi.fn().mockResolvedValue({ type: 'success', sessionId: 'session-1' });
        const { ApiMachineClient } = await import('./apiMachine');
        const client = new ApiMachineClient('token', machineClient());
        client.setRPCHandlers({
            spawnSession,
            stopSession: vi.fn(),
            requestShutdown: vi.fn(),
        });

        const handler = handlersFrom(client).get('machine-1:spawn-happy-session');
        await expect(handler?.({
            type: 'spawn-in-directory',
            projectId: 'project-1',
            directory: 'C:\\stale\\wrong',
            agent: 'codex',
        })).resolves.toEqual({ type: 'success', sessionId: 'session-1' });

        expect(registry.resolveProjectPath).toHaveBeenCalledWith('project-1');
        expect(spawnSession).toHaveBeenCalledWith(expect.objectContaining({
            directory: 'C:\\canonical\\primary',
        }));
    });

    it('exposes machine-local list and revision-aware add operations', async () => {
        const snapshot = { schemaVersion: 1, revision: 2, projects: [] };
        const added = { created: true, project: { id: 'project-1' }, registry: snapshot };
        registry.list.mockResolvedValue(snapshot);
        registry.add.mockResolvedValue(added);
        const { ApiMachineClient } = await import('./apiMachine');
        const client = new ApiMachineClient('token', machineClient());
        client.setRPCHandlers({
            spawnSession: vi.fn(),
            stopSession: vi.fn(),
            requestShutdown: vi.fn(),
        });

        await expect(handlersFrom(client).get('machine-1:list-saved-projects')?.({}))
            .resolves.toBe(snapshot);
        await expect(handlersFrom(client).get('machine-1:add-saved-project')?.({
            path: '~/workspace/happy',
            expectedRevision: 1,
        })).resolves.toBe(added);

        expect(registry.add).toHaveBeenCalledWith({
            path: '~/workspace/happy',
            expectedRevision: 1,
        });
    });

    it('revalidates and resolves a project for capability-gated starts', async () => {
        registry.resolveProjectPath.mockResolvedValue('/home/dev/happy');
        const { ApiMachineClient } = await import('./apiMachine');
        const client = new ApiMachineClient('token', machineClient());
        client.setRPCHandlers({
            spawnSession: vi.fn(),
            stopSession: vi.fn(),
            requestShutdown: vi.fn(),
        });

        await expect(handlersFrom(client).get('machine-1:resolve-saved-project')?.({
            projectId: '11111111-1111-4111-8111-111111111111',
        })).resolves.toEqual({
            projectId: '11111111-1111-4111-8111-111111111111',
            primaryPath: '/home/dev/happy',
        });
        expect(registry.resolveProjectPath).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111');
    });

    it('does not invoke a Rig spawn when the selected project is no longer available', async () => {
        registry.resolveProjectPath.mockRejectedValue(new Error('Saved project is unavailable'));
        const spawnSession = vi.fn();
        const { ApiMachineClient } = await import('./apiMachine');
        const client = new ApiMachineClient('token', machineClient());
        client.setRPCHandlers({
            spawnSession,
            stopSession: vi.fn(),
            requestShutdown: vi.fn(),
        });

        await expect(handlersFrom(client).get('machine-1:spawn-happy-session')?.({
            type: 'spawn-in-directory',
            projectId: 'project-1',
            directory: 'C:\\stale\\wrong',
            agent: 'rig',
            clientRequestId: 'request-1',
        })).rejects.toThrow('Saved project is unavailable');
        expect(spawnSession).not.toHaveBeenCalled();
    });
});
