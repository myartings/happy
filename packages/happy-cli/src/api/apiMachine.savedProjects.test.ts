import { beforeEach, describe, expect, it, vi } from 'vitest';

const registry = vi.hoisted(() => ({
    list: vi.fn(),
    add: vi.fn(),
    importDiscovered: vi.fn(),
    resolveProjectPath: vi.fn(),
}));

const workspaceScanner = vi.hoisted(() => ({
    listWorkspaceProjects: vi.fn(),
}));

vi.mock('@/projects/savedProjectRegistry', () => ({
    SavedProjectRegistry: class {
        list = registry.list;
        add = registry.add;
        importDiscovered = registry.importDiscovered;
        resolveProjectPath = registry.resolveProjectPath;
    },
}));

vi.mock('@/workspace/workspaceProjectScanner', () => ({
    MAX_WORKSPACE_PROJECT_QUERY_LENGTH: 256,
    listWorkspaceProjects: workspaceScanner.listWorkspaceProjects,
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
        registry.list.mockResolvedValue({ schemaVersion: 1, revision: 0, projects: [] });
        registry.importDiscovered.mockResolvedValue({
            importedCount: 0,
            skipped: [],
            registry: { schemaVersion: 1, revision: 0, projects: [] },
        });
        workspaceScanner.listWorkspaceProjects.mockResolvedValue({
            root: 'C:\\Users\\test\\workspace',
            projects: [],
            scannedAt: 1,
            truncated: false,
        });
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
        const importedProjects = [
            { id: 'alpha-id', primaryPath: 'C:\\Users\\test\\workspace\\alpha' },
            { id: 'bravo-id', primaryPath: 'C:\\Users\\test\\workspace\\bravo' },
        ];
        const snapshot = { schemaVersion: 1, revision: 2, projects: importedProjects };
        const added = { created: true, project: { id: 'project-1' }, registry: snapshot };
        workspaceScanner.listWorkspaceProjects.mockResolvedValue({
            root: 'C:\\Users\\test\\workspace',
            projects: [
                { path: 'C:\\Users\\test\\workspace\\alpha' },
                { path: 'C:\\Users\\test\\workspace\\bravo' },
            ],
            scannedAt: 1,
            truncated: false,
        });
        registry.importDiscovered.mockResolvedValue({
            importedCount: 2,
            skipped: [],
            registry: snapshot,
        });
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
        await expect(handlersFrom(client).get('machine-1:list-saved-projects')?.({}))
            .resolves.toBe(snapshot);
        await expect(handlersFrom(client).get('machine-1:add-saved-project')?.({
            path: '~/workspace/happy',
            expectedRevision: 1,
        })).resolves.toBe(added);

        expect(workspaceScanner.listWorkspaceProjects).toHaveBeenCalledWith({
            root: expect.stringMatching(/[\\/]workspace$/),
        });
        expect(workspaceScanner.listWorkspaceProjects).toHaveBeenCalledTimes(1);
        expect(registry.importDiscovered).toHaveBeenCalledTimes(1);
        expect(registry.importDiscovered).toHaveBeenCalledWith({
            paths: [
                'C:\\Users\\test\\workspace\\alpha',
                'C:\\Users\\test\\workspace\\bravo',
            ],
        });
        expect(registry.add).toHaveBeenCalledWith({
            path: '~/workspace/happy',
            expectedRevision: 1,
        });
    });

    it('returns the unchanged registry when workspace discovery is empty', async () => {
        const snapshot = {
            schemaVersion: 1,
            revision: 4,
            projects: [{ id: 'existing-id', primaryPath: 'C:\\existing' }],
        };
        registry.importDiscovered.mockResolvedValue({
            importedCount: 0,
            skipped: [],
            registry: snapshot,
        });
        registry.list.mockResolvedValue(snapshot);
        const { ApiMachineClient } = await import('./apiMachine');
        const client = new ApiMachineClient('token', machineClient());
        client.setRPCHandlers({
            spawnSession: vi.fn(),
            stopSession: vi.fn(),
            requestShutdown: vi.fn(),
        });

        await expect(handlersFrom(client).get('machine-1:list-saved-projects')?.({}))
            .resolves.toEqual(snapshot);
        expect(registry.importDiscovered).toHaveBeenCalledWith({ paths: [] });
    });

    it('keeps serving the local registry when the one-time workspace import fails', async () => {
        const snapshot = {
            schemaVersion: 1,
            revision: 4,
            projects: [{ id: 'existing-id', primaryPath: 'C:\\existing' }],
        };
        workspaceScanner.listWorkspaceProjects.mockRejectedValue(new Error('scan failed'));
        registry.list.mockResolvedValue(snapshot);
        const { ApiMachineClient } = await import('./apiMachine');
        const client = new ApiMachineClient('token', machineClient());
        client.setRPCHandlers({
            spawnSession: vi.fn(),
            stopSession: vi.fn(),
            requestShutdown: vi.fn(),
        });

        await expect(handlersFrom(client).get('machine-1:list-saved-projects')?.({}))
            .resolves.toBe(snapshot);
        expect(workspaceScanner.listWorkspaceProjects).toHaveBeenCalledTimes(1);
        expect(registry.importDiscovered).not.toHaveBeenCalled();
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
