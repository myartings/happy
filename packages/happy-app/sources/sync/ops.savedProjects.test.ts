import { beforeEach, describe, expect, it, vi } from 'vitest';

const { machineRPC } = vi.hoisted(() => ({ machineRPC: vi.fn() }));

vi.mock('./apiSocket', () => ({ apiSocket: { machineRPC } }));
vi.mock('./sync', () => ({ sync: {} }));
vi.mock('./storage', () => ({ storage: {} }));

describe('saved project operations', () => {
    beforeEach(() => machineRPC.mockReset());

    it('uses the machine-local list and revision-aware add RPCs', async () => {
        const snapshot = { schemaVersion: 1, revision: 0, projects: [] };
        machineRPC.mockResolvedValueOnce(snapshot).mockResolvedValueOnce({
            created: true,
            project: { id: 'project-1' },
            registry: { ...snapshot, revision: 1 },
        }).mockResolvedValueOnce({
            projectId: '11111111-1111-4111-8111-111111111111',
            primaryPath: '/home/dev/happy',
        });
        const { addSavedProject, listSavedProjects, resolveSavedProject } = await import('./ops');

        await expect(listSavedProjects('machine-1')).resolves.toBe(snapshot);
        await addSavedProject('machine-1', '~/workspace/happy', 0);
        await expect(resolveSavedProject('machine-1', '11111111-1111-4111-8111-111111111111'))
            .resolves.toEqual({
                projectId: '11111111-1111-4111-8111-111111111111',
                primaryPath: '/home/dev/happy',
            });

        expect(machineRPC).toHaveBeenNthCalledWith(1, 'machine-1', 'list-saved-projects', {});
        expect(machineRPC).toHaveBeenNthCalledWith(2, 'machine-1', 'add-saved-project', {
            path: '~/workspace/happy',
            expectedRevision: 0,
        });
        expect(machineRPC).toHaveBeenNthCalledWith(3, 'machine-1', 'resolve-saved-project', {
            projectId: '11111111-1111-4111-8111-111111111111',
        });
    });

    it('fails closed on a malformed or mismatched resolution response', async () => {
        const { resolveSavedProject } = await import('./ops');
        machineRPC.mockResolvedValueOnce({ projectId: 'wrong', primaryPath: 'relative/path' });

        await expect(resolveSavedProject('machine-1', '11111111-1111-4111-8111-111111111111'))
            .rejects.toThrow('Saved project resolution response was invalid');
    });

    it('sends saved project identity with a main-directory spawn request', async () => {
        machineRPC.mockResolvedValue({ type: 'success', sessionId: 'session-1' });
        const { machineSpawnNewSession } = await import('./ops');

        await expect(machineSpawnNewSession({
            machineId: 'machine-1',
            directory: 'C:\\stale\\display-path',
            projectId: '11111111-1111-4111-8111-111111111111',
            agent: 'codex',
        })).resolves.toEqual({ type: 'success', sessionId: 'session-1' });

        expect(machineRPC).toHaveBeenCalledWith(
            'machine-1',
            'spawn-happy-session',
            expect.objectContaining({
                type: 'spawn-in-directory',
                directory: 'C:\\stale\\display-path',
                projectId: '11111111-1111-4111-8111-111111111111',
            }),
        );
    });
});
