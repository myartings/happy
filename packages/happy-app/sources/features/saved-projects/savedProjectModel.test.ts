import { describe, expect, it, vi } from 'vitest';
import {
    SavedProjectAddGuard,
    SavedProjectRegistryLoader,
    filterSavedProjects,
    isAddSavedProjectResult,
    isResolvedSavedProject,
    isSavedProjectRegistrySnapshot,
    registryForMachine,
} from './savedProjectModel';

const project = {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Happy',
    primaryPath: '/home/dev/happy',
    canonicalPath: '/home/dev/happy',
    kind: 'git' as const,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('saved project model', () => {
    it('accepts only the machine registry contract and filters its own rows', async () => {
        const request = vi.fn().mockResolvedValue({
            schemaVersion: 1,
            revision: 3,
            projects: [project, {
                ...project,
                id: '22222222-2222-4222-8222-222222222222',
                name: 'Other',
                primaryPath: '/home/dev/other',
                canonicalPath: '/home/dev/other',
            }],
        });
        const loader = new SavedProjectRegistryLoader({ request, timeoutMs: 100 });

        const outcome = await loader.load('machine-1');

        expect(outcome).toEqual({
            status: 'ready',
            registry: expect.objectContaining({ revision: 3 }),
        });
        expect(filterSavedProjects(outcome?.status === 'ready' ? outcome.registry.projects : [], 'hap'))
            .toEqual([project]);
        expect(request).toHaveBeenCalledWith('machine-1');
    });

    it('fails closed on malformed or unavailable registry responses', async () => {
        const malformed = new SavedProjectRegistryLoader({
            request: vi.fn().mockResolvedValue({ schemaVersion: 1, revision: 0, projects: [{ ...project, id: 'not-a-uuid' }] }),
            timeoutMs: 100,
        });
        const unavailable = new SavedProjectRegistryLoader({
            request: vi.fn().mockRejectedValue(new Error('offline')),
            timeoutMs: 100,
        });

        await expect(malformed.load('machine-1')).resolves.toEqual({ status: 'unavailable' });
        await expect(unavailable.load('machine-1')).resolves.toEqual({ status: 'unavailable' });
    });

    it('rejects relative paths and primary/canonical identity mismatches', () => {
        expect(isSavedProjectRegistrySnapshot({
            schemaVersion: 1,
            revision: 1,
            projects: [{ ...project, primaryPath: 'relative/happy', canonicalPath: 'relative/happy' }],
        })).toBe(false);
        expect(isSavedProjectRegistrySnapshot({
            schemaVersion: 1,
            revision: 1,
            projects: [{ ...project, canonicalPath: '/home/dev/other' }],
        })).toBe(false);
    });

    it('rejects duplicate IDs and cross-platform canonical path identities', () => {
        expect(isSavedProjectRegistrySnapshot({
            schemaVersion: 1,
            revision: 1,
            projects: [project, { ...project, name: 'Duplicate' }],
        })).toBe(false);

        const windowsProject = {
            ...project,
            primaryPath: 'C:\\Users\\dev\\Happy',
            canonicalPath: 'C:\\Users\\dev\\Happy',
        };
        expect(isSavedProjectRegistrySnapshot({
            schemaVersion: 1,
            revision: 1,
            projects: [windowsProject, {
                ...windowsProject,
                id: '22222222-2222-4222-8222-222222222222',
                primaryPath: 'c:/users/dev/happy',
                canonicalPath: 'c:/users/dev/happy',
            }],
        })).toBe(false);
        expect(isSavedProjectRegistrySnapshot({
            schemaVersion: 1,
            revision: 1,
            projects: [{ ...windowsProject, canonicalPath: 'c:/users/dev/happy' }],
        })).toBe(true);
    });

    it('binds registry snapshots to their source machine and validates resolved paths', () => {
        const registry = { schemaVersion: 1 as const, revision: 1, projects: [project] };
        const binding = { machineId: 'machine-1', registry };

        expect(registryForMachine(binding, 'machine-1')).toBe(registry);
        expect(registryForMachine(binding, 'machine-2')).toBeNull();
        expect(isResolvedSavedProject({ projectId: project.id, primaryPath: '/home/dev/happy' })).toBe(true);
        expect(isResolvedSavedProject({ projectId: project.id, primaryPath: 'relative/happy' })).toBe(false);
    });

    it('accepts add responses only when the returned project belongs to the validated registry', () => {
        const valid = {
            created: true,
            project,
            registry: { schemaVersion: 1, revision: 1, projects: [project] },
        };

        expect(isAddSavedProjectResult(valid)).toBe(true);
        expect(isAddSavedProjectResult({
            ...valid,
            registry: { ...valid.registry, projects: [] },
        })).toBe(false);
        expect(isAddSavedProjectResult({ ...valid, project: { ...project, id: 'invalid' } })).toBe(false);
    });

    it('drops an old machine add response after the selected machine changes', () => {
        const guard = new SavedProjectAddGuard();
        guard.syncMachine('machine-1');
        const oldAttempt = guard.begin('machine-1');
        guard.syncMachine('machine-2');
        const currentAttempt = guard.begin('machine-2');
        const result = {
            created: true,
            project,
            registry: { schemaVersion: 1 as const, revision: 1, projects: [project] },
        };

        expect(guard.finish(oldAttempt, result)).toEqual({ status: 'stale' });
        expect(guard.finish(currentAttempt, result)).toEqual({ status: 'accepted', result });
    });

    it('drops an older overlapping add response on the same machine', () => {
        const guard = new SavedProjectAddGuard();
        guard.syncMachine('machine-1');
        const first = guard.begin('machine-1');
        const second = guard.begin('machine-1');

        expect(guard.finish(first, null)).toEqual({ status: 'stale' });
        expect(guard.finish(second, null)).toEqual({ status: 'invalid' });
    });
});
