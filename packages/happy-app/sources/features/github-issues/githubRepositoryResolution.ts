import type { GithubRepository } from './githubIssuesClient';
import {
    isSameGithubRepository,
    parseGithubRepository,
    type GithubRepositoryRef,
} from './githubRepository';

export interface GithubRepositoryAssociationIdentity {
    machineId?: string | null;
    path?: string | null;
}

export interface GithubRepositoryAssociation {
    repository: GithubRepositoryRef;
    remoteFingerprint: string;
}

export type GithubRepositoryAssociations = Record<string, GithubRepositoryAssociation>;

export type GithubRemoteLookup =
    | { status: 'success'; output: string }
    | { status: 'failed' };

export interface GithubRepositoryResolutionInput {
    identity: GithubRepositoryAssociationIdentity;
    remoteLookup: GithubRemoteLookup;
    repositories: readonly GithubRepository[];
    cachedAssociations: GithubRepositoryAssociations;
    lastRepository: GithubRepositoryRef | null;
}

export interface GithubRepositoryPreferences {
    lastRepository: GithubRepositoryRef | null;
    associations: GithubRepositoryAssociations;
}

export interface GithubRepositoryEntryInput {
    sessionId?: string;
    machineId?: string | null;
    path?: string | null;
}

export interface GithubRepositoryEntryResolverDependencies {
    listRepositories(): Promise<readonly GithubRepository[]>;
    lookupRemotes(input: { sessionId: string; path: string }): Promise<GithubRemoteLookup>;
    getPreferences(): GithubRepositoryPreferences;
    savePreferences(preferences: GithubRepositoryPreferences): void;
    getMachineId?(sessionId: string): string | null;
}

export interface GithubRepositoryManualAssociation {
    identity: GithubRepositoryEntryInput;
    remoteFingerprint: string;
}

export type GithubRepositoryResolution =
    | {
        status: 'resolved';
        source: 'cache' | 'origin' | 'sole-remote' | 'last-repository' | 'path';
        repository: GithubRepository;
        association: GithubRepositoryAssociation | null;
    }
    | {
        status: 'picker';
        reason: 'lookup-failed' | 'ambiguous' | 'inaccessible' | 'no-remote';
        repositories: readonly GithubRepository[];
        suggestedRepository: GithubRepository | null;
        selectionRemoteFingerprint: string | null;
        association: null;
    };

interface GithubRemoteRepository {
    name: string;
    repository: GithubRepositoryRef;
}

export function createGithubRepositoryAssociationKey(
    identity: GithubRepositoryAssociationIdentity,
): string | null {
    const machineId = identity.machineId?.trim();
    const path = identity.path?.trim().replace(/\\/g, '/').replace(/\/+$/, '');
    if (!machineId || !path) return null;
    return JSON.stringify([machineId, path]);
}

function parseGithubRemoteRepositories(output: string): GithubRemoteRepository[] {
    const repositories = new Map<string, GithubRemoteRepository>();
    for (const line of output.split(/\r?\n/)) {
        const match = line.trim().match(/^(\S+)\s+(\S+)(?:\s+\((fetch|push)\))?$/);
        if (!match) continue;
        if (match[3] === 'push') continue;
        const repository = parseGithubRepository(match[2]);
        if (!repository) continue;
        const key = `${match[1].toLowerCase()}:${repository.owner.toLowerCase()}/${repository.repo.toLowerCase()}`;
        if (!repositories.has(key)) {
            repositories.set(key, { name: match[1], repository });
        }
    }
    return [...repositories.values()];
}

function remoteFingerprint(remotes: readonly GithubRemoteRepository[]): string {
    return remotes
        .map((remote) => (
            `${remote.name.toLowerCase()}:${remote.repository.owner.toLowerCase()}/${remote.repository.repo.toLowerCase()}`
        ))
        .sort()
        .join('|');
}

function findAccessibleRepository(
    repositories: readonly GithubRepository[],
    reference: GithubRepositoryRef | null | undefined,
): GithubRepository | null {
    if (!reference) return null;
    return repositories.find((repository) => isSameGithubRepository(
        { owner: repository.owner, repo: repository.name },
        reference,
    )) ?? null;
}

function projectNamesFromPath(path: string | null | undefined): string[] {
    const segments = path?.trim().replace(/\\/g, '/').replace(/\/+$/, '').split('/').filter(Boolean) ?? [];
    if (segments.length === 0) return [];
    const names = new Set<string>();
    const managedWorktreeIndex = segments.findIndex((segment, index) => (
        segment.toLowerCase() === '.dev'
        && ['worktree', 'worktrees'].includes(segments[index + 1]?.toLowerCase())
    ));
    if (managedWorktreeIndex > 0) names.add(segments[managedWorktreeIndex - 1]);
    const worktreeDirectoryIndex = segments.findIndex((segment) => (
        ['.worktree', '.worktrees', 'worktrees'].includes(segment.toLowerCase())
    ));
    if (worktreeDirectoryIndex > 0) names.add(segments[worktreeDirectoryIndex - 1]);
    return [...names];
}

function findRepositoryFromProjectPath(
    repositories: readonly GithubRepository[],
    path: string | null | undefined,
    lastRepository: GithubRepositoryRef | null,
): GithubRepository | null {
    for (const projectName of projectNamesFromPath(path)) {
        const matches = repositories.filter((repository) => (
            repository.name.toLowerCase() === projectName.toLowerCase()
        ));
        if (matches.length === 1) return matches[0];
        const lastMatch = matches.find((repository) => isSameGithubRepository(
            { owner: repository.owner, repo: repository.name },
            lastRepository,
        ));
        if (lastMatch) return lastMatch;
    }
    return null;
}

export function resolveGithubRepositoryAssociation(
    input: GithubRepositoryResolutionInput,
): GithubRepositoryResolution {
    const suggestedRepository = findAccessibleRepository(input.repositories, input.lastRepository);
    if (input.remoteLookup.status === 'failed') {
        return {
            status: 'picker',
            reason: 'lookup-failed',
            repositories: input.repositories,
            suggestedRepository,
            selectionRemoteFingerprint: null,
            association: null,
        };
    }

    const remotes = parseGithubRemoteRepositories(input.remoteLookup.output);
    const fingerprint = remoteFingerprint(remotes);
    const associationKey = createGithubRepositoryAssociationKey(input.identity);
    const cachedAssociation = associationKey ? input.cachedAssociations[associationKey] : null;
    const cachedRepository = cachedAssociation?.remoteFingerprint === fingerprint
        ? findAccessibleRepository(input.repositories, cachedAssociation.repository)
        : null;
    if (cachedRepository) {
        return {
            status: 'resolved',
            source: 'cache',
            repository: cachedRepository,
            association: cachedAssociation,
        };
    }

    const origin = remotes.find((remote) => remote.name.toLowerCase() === 'origin');
    const uniqueRepositories = remotes.filter((remote, index) => remotes.findIndex((candidate) => (
        isSameGithubRepository(candidate.repository, remote.repository)
    )) === index);
    const detected = origin?.repository
        ?? (uniqueRepositories.length === 1 ? uniqueRepositories[0].repository : null);
    if (detected) {
        const repository = findAccessibleRepository(input.repositories, detected);
        if (!repository) {
            return {
                status: 'picker',
                reason: 'inaccessible',
                repositories: input.repositories,
                suggestedRepository,
                selectionRemoteFingerprint: null,
                association: null,
            };
        }
        return {
            status: 'resolved',
            source: origin ? 'origin' : 'sole-remote',
            repository,
            association: { repository: detected, remoteFingerprint: fingerprint },
        };
    }

    if (uniqueRepositories.length > 1) {
        return {
            status: 'picker',
            reason: 'ambiguous',
            repositories: input.repositories,
            suggestedRepository,
            selectionRemoteFingerprint: null,
            association: null,
        };
    }
    if (suggestedRepository) {
        return {
            status: 'resolved',
            source: 'last-repository',
            repository: suggestedRepository,
            association: null,
        };
    }
    return {
        status: 'picker',
        reason: 'no-remote',
        repositories: input.repositories,
        suggestedRepository: null,
        selectionRemoteFingerprint: fingerprint,
        association: null,
    };
}

export function createGithubRepositoryEntryResolver(
    dependencies: GithubRepositoryEntryResolverDependencies,
) {
    const localResolutions = new Map<string, GithubRepositoryRef>();
    const localKey = (input: GithubRepositoryEntryInput): string | null => {
        const sessionId = input.sessionId?.trim();
        const path = input.path?.trim().replace(/\\/g, '/').replace(/\/+$/, '');
        return sessionId && path ? JSON.stringify([sessionId, path]) : null;
    };
    const rememberLocal = (input: GithubRepositoryEntryInput, repository: GithubRepositoryRef): void => {
        const key = localKey(input);
        if (key) localResolutions.set(key, repository);
    };

    return {
        resolveLocal(input: GithubRepositoryEntryInput): GithubRepositoryRef | null {
            const key = localKey(input);
            const cached = key ? localResolutions.get(key) : null;
            if (cached) return cached;

            const lastRepository = dependencies.getPreferences().lastRepository;
            if (!lastRepository) return null;
            const matchesManagedProjectPath = projectNamesFromPath(input.path).some((projectName) => (
                projectName.toLowerCase() === lastRepository.repo.toLowerCase()
            ));
            return matchesManagedProjectPath ? lastRepository : null;
        },
        remember(repository: GithubRepository, manualAssociation?: GithubRepositoryManualAssociation): void {
            const preferences = dependencies.getPreferences();
            const associations = { ...preferences.associations };
            if (manualAssociation) {
                const identity = {
                    ...manualAssociation.identity,
                    machineId: manualAssociation.identity.machineId
                        ?? (manualAssociation.identity.sessionId
                            ? dependencies.getMachineId?.(manualAssociation.identity.sessionId) ?? null
                            : null),
                };
                const associationKey = createGithubRepositoryAssociationKey(identity);
                if (associationKey) {
                    associations[associationKey] = {
                        repository: { owner: repository.owner, repo: repository.name },
                        remoteFingerprint: manualAssociation.remoteFingerprint,
                    };
                }
            }
            dependencies.savePreferences({
                lastRepository: { owner: repository.owner, repo: repository.name },
                associations,
            });
            if (manualAssociation) {
                rememberLocal(manualAssociation.identity, { owner: repository.owner, repo: repository.name });
            }
        },
        async resolve(input: GithubRepositoryEntryInput): Promise<GithubRepositoryResolution> {
            const repositories = await dependencies.listRepositories();
            const preferences = dependencies.getPreferences();
            const path = input.path?.trim();
            const pathRepository = findRepositoryFromProjectPath(
                repositories,
                path,
                preferences.lastRepository,
            );
            if (pathRepository) {
                rememberLocal(input, { owner: pathRepository.owner, repo: pathRepository.name });
                dependencies.savePreferences({
                    ...preferences,
                    lastRepository: { owner: pathRepository.owner, repo: pathRepository.name },
                });
                return {
                    status: 'resolved',
                    source: 'path',
                    repository: pathRepository,
                    association: null,
                };
            }
            const remoteLookup = input.sessionId && path
                ? await dependencies.lookupRemotes({ sessionId: input.sessionId, path })
                : { status: 'success' as const, output: '' };
            const identity = {
                ...input,
                machineId: input.machineId ?? (input.sessionId
                    ? dependencies.getMachineId?.(input.sessionId) ?? null
                    : null),
            };
            const resolution = resolveGithubRepositoryAssociation({
                identity,
                remoteLookup,
                repositories,
                cachedAssociations: preferences.associations,
                lastRepository: preferences.lastRepository,
            });
            const associationKey = createGithubRepositoryAssociationKey(identity);

            if (resolution.status === 'resolved') {
                rememberLocal(input, { owner: resolution.repository.owner, repo: resolution.repository.name });
                const associations = { ...preferences.associations };
                if (associationKey && resolution.association) {
                    associations[associationKey] = resolution.association;
                } else if (associationKey && remoteLookup.status === 'success') {
                    delete associations[associationKey];
                }
                dependencies.savePreferences({
                    lastRepository: {
                        owner: resolution.repository.owner,
                        repo: resolution.repository.name,
                    },
                    associations,
                });
            } else if (
                associationKey
                && resolution.reason !== 'lookup-failed'
                && preferences.associations[associationKey]
            ) {
                const associations = { ...preferences.associations };
                delete associations[associationKey];
                dependencies.savePreferences({ ...preferences, associations });
            }

            return resolution;
        },
    };
}
