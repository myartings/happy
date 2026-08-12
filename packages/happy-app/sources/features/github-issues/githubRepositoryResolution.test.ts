import { describe, expect, it, vi } from 'vitest';
import type { GithubRepository } from './githubIssuesClient';
import {
    createGithubRepositoryEntryResolver,
    createGithubRepositoryAssociationKey,
    resolveGithubRepositoryAssociation,
} from './githubRepositoryResolution';

function repository(id: number, owner: string, name: string): GithubRepository {
    return {
        id,
        owner,
        name,
        fullName: `${owner}/${name}`,
        private: false,
        url: `https://github.com/${owner}/${name}`,
    };
}

describe('GitHub repository association resolution', () => {
    it('uses cache only while the Session remote evidence still matches', () => {
        const identity = { machineId: 'machine-a', path: 'C:\\workspace\\happy' };
        const key = createGithubRepositoryAssociationKey(identity)!;
        const repositories = [
            repository(1, 'myartings', 'happy'),
            repository(2, 'myartings', 'other'),
        ];
        const cachedAssociations = {
            [key]: {
                repository: { owner: 'myartings', repo: 'happy' },
                remoteFingerprint: 'origin:myartings/happy',
            },
        };

        expect(resolveGithubRepositoryAssociation({
            identity,
            remoteLookup: {
                status: 'success',
                output: 'origin\tgit@github.com:myartings/happy.git (fetch)',
            },
            repositories,
            cachedAssociations,
            lastRepository: null,
        })).toMatchObject({
            status: 'resolved',
            source: 'cache',
            repository: { fullName: 'myartings/happy' },
        });

        expect(resolveGithubRepositoryAssociation({
            identity,
            remoteLookup: {
                status: 'success',
                output: 'origin\thttps://github.com/myartings/other.git (fetch)',
            },
            repositories,
            cachedAssociations,
            lastRepository: null,
        })).toMatchObject({
            status: 'resolved',
            source: 'origin',
            repository: { fullName: 'myartings/other' },
        });
    });

    it('isolates cache keys by machine and exact project path', () => {
        const base = createGithubRepositoryAssociationKey({
            machineId: 'machine-a',
            path: '/work/Happy/',
        });

        expect(base).not.toBe(createGithubRepositoryAssociationKey({
            machineId: 'machine-b',
            path: '/work/Happy',
        }));
        expect(base).not.toBe(createGithubRepositoryAssociationKey({
            machineId: 'machine-a',
            path: '/work/happy',
        }));
        expect(base).toBe(createGithubRepositoryAssociationKey({
            machineId: 'machine-a',
            path: '/work/Happy',
        }));
    });

    it('uses fetch remotes as repository evidence instead of a separate push target', () => {
        const result = resolveGithubRepositoryAssociation({
            identity: { machineId: 'machine-a', path: '/work/widget' },
            remoteLookup: {
                status: 'success',
                output: [
                    'upstream\thttps://github.com/acme/widget.git (fetch)',
                    'upstream\tgit@github.com:mirror/widget.git (push)',
                ].join('\n'),
            },
            repositories: [repository(1, 'acme', 'widget')],
            cachedAssociations: {},
            lastRepository: null,
        });

        expect(result).toMatchObject({
            status: 'resolved',
            source: 'sole-remote',
            repository: { fullName: 'acme/widget' },
        });
    });

    it('resolves a Session repository and persists only its local association', async () => {
        const saved: unknown[] = [];
        const resolver = createGithubRepositoryEntryResolver({
            listRepositories: async () => [repository(1, 'myartings', 'happy')],
            lookupRemotes: async () => ({
                status: 'success',
                output: 'origin\tgit@github.com:myartings/happy.git (fetch)',
            }),
            getPreferences: () => ({
                lastRepository: null,
                associations: {},
            }),
            savePreferences: (preferences) => saved.push(preferences),
        });

        const result = await resolver.resolve({
            sessionId: 'session-a',
            machineId: 'machine-a',
            path: '/work/happy',
        });

        expect(result).toMatchObject({
            status: 'resolved',
            repository: { fullName: 'myartings/happy' },
        });
        expect(saved).toEqual([{
            lastRepository: { owner: 'myartings', repo: 'happy' },
            associations: {
                '["machine-a","/work/happy"]': {
                    repository: { owner: 'myartings', repo: 'happy' },
                    remoteFingerprint: 'origin:myartings/happy',
                },
            },
        }]);
    });

    it('resolves a managed worktree from its project path without waiting for Session shell lookup', async () => {
        const lookupRemotes = vi.fn(async () => ({ status: 'failed' as const }));
        const resolver = createGithubRepositoryEntryResolver({
            listRepositories: async () => [
                repository(1, 'myartings', 'android-coding-template'),
                repository(2, 'myartings', 'happy-manager'),
            ],
            lookupRemotes,
            getPreferences: () => ({
                lastRepository: { owner: 'myartings', repo: 'android-coding-template' },
                associations: {},
            }),
            savePreferences: () => undefined,
        });

        await expect(resolver.resolve({
            sessionId: 'session-a',
            path: 'C:\\Users\\myartings\\workspace\\happy-manager\\.dev\\worktree\\brave-harbor',
        })).resolves.toMatchObject({
            status: 'resolved',
            source: 'path',
            repository: { fullName: 'myartings/happy-manager' },
        });
        expect(lookupRemotes).not.toHaveBeenCalled();
    });

    it('reuses the last confirmed managed-worktree repository synchronously', () => {
        const listRepositories = vi.fn(async () => [repository(1, 'myartings', 'happy-manager')]);
        const resolver = createGithubRepositoryEntryResolver({
            listRepositories,
            lookupRemotes: async () => ({ status: 'failed' }),
            getPreferences: () => ({
                lastRepository: { owner: 'myartings', repo: 'happy-manager' },
                associations: {},
            }),
            savePreferences: () => undefined,
        });

        expect(resolver.resolveLocal({
            sessionId: 'session-a',
            path: 'C:\\workspace\\happy-manager\\.dev\\worktree\\brave-harbor',
        })).toEqual({ owner: 'myartings', repo: 'happy-manager' });
        expect(listRepositories).not.toHaveBeenCalled();
    });

    it('remembers a manual picker choice without creating a Session association', () => {
        const saved: unknown[] = [];
        const resolver = createGithubRepositoryEntryResolver({
            listRepositories: async () => [],
            lookupRemotes: async () => ({ status: 'success', output: '' }),
            getPreferences: () => ({
                lastRepository: null,
                associations: {
                    existing: {
                        repository: { owner: 'acme', repo: 'existing' },
                        remoteFingerprint: 'origin:acme/existing',
                    },
                },
            }),
            savePreferences: (preferences) => saved.push(preferences),
        });

        resolver.remember(repository(2, 'myartings', 'happy'));

        expect(saved).toEqual([{
            lastRepository: { owner: 'myartings', repo: 'happy' },
            associations: {
                existing: {
                    repository: { owner: 'acme', repo: 'existing' },
                    remoteFingerprint: 'origin:acme/existing',
                },
            },
        }]);
    });

    it('associates a manual choice only when successful remote evidence found no contradiction', () => {
        const saved: unknown[] = [];
        const resolver = createGithubRepositoryEntryResolver({
            listRepositories: async () => [],
            lookupRemotes: async () => ({ status: 'success', output: '' }),
            getPreferences: () => ({ lastRepository: null, associations: {} }),
            savePreferences: (preferences) => saved.push(preferences),
        });

        resolver.remember(repository(2, 'myartings', 'happy'), {
            identity: { machineId: 'machine-a', path: '/work/happy' },
            remoteFingerprint: '',
        });

        expect(saved).toEqual([{
            lastRepository: { owner: 'myartings', repo: 'happy' },
            associations: {
                '["machine-a","/work/happy"]': {
                    repository: { owner: 'myartings', repo: 'happy' },
                    remoteFingerprint: '',
                },
            },
        }]);
    });

    it('opens the remembered accessible repository from the global entry', async () => {
        const lookupRemotes = vi.fn(async () => ({ status: 'success' as const, output: '' }));
        const resolver = createGithubRepositoryEntryResolver({
            listRepositories: async () => [repository(1, 'myartings', 'happy')],
            lookupRemotes,
            getPreferences: () => ({
                lastRepository: { owner: 'MYARTINGS', repo: 'HAPPY' },
                associations: {},
            }),
            savePreferences: () => undefined,
        });

        await expect(resolver.resolve({})).resolves.toMatchObject({
            status: 'resolved',
            source: 'last-repository',
            repository: { fullName: 'myartings/happy' },
        });
        expect(lookupRemotes).not.toHaveBeenCalled();
    });

    it.each([
        {
            name: 'ambiguous remotes',
            remoteLookup: {
                status: 'success' as const,
                output: [
                    'upstream\thttps://github.com/acme/widget.git (fetch)',
                    'fork\thttps://github.com/myartings/widget.git (fetch)',
                ].join('\n'),
            },
            repositories: [repository(1, 'acme', 'widget'), repository(2, 'myartings', 'widget')],
            reason: 'ambiguous',
        },
        {
            name: 'inaccessible origin',
            remoteLookup: {
                status: 'success' as const,
                output: 'origin\thttps://github.com/private/widget.git (fetch)',
            },
            repositories: [repository(1, 'acme', 'widget')],
            reason: 'inaccessible',
        },
        {
            name: 'failed remote lookup',
            remoteLookup: { status: 'failed' as const },
            repositories: [repository(1, 'acme', 'widget')],
            reason: 'lookup-failed',
        },
    ])('returns a visible picker reason for $name', ({ remoteLookup, repositories, reason }) => {
        expect(resolveGithubRepositoryAssociation({
            identity: { machineId: 'machine-a', path: '/work/widget' },
            remoteLookup,
            repositories,
            cachedAssociations: {},
            lastRepository: null,
        })).toMatchObject({ status: 'picker', reason });
    });

    it('preserves the detected repository when the GitHub App cannot access it', () => {
        expect(resolveGithubRepositoryAssociation({
            identity: { machineId: 'machine-a', path: '/work/widget' },
            remoteLookup: {
                status: 'success',
                output: 'origin\thttps://github.com/private/widget.git (fetch)',
            },
            repositories: [repository(1, 'acme', 'widget')],
            cachedAssociations: {},
            lastRepository: null,
        })).toMatchObject({
            status: 'picker',
            reason: 'inaccessible',
            detectedRepository: { owner: 'private', repo: 'widget' },
        });
    });
});
