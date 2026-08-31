import { TokenStorage } from '@/auth/tokenStorage';
import { decodeBase64 } from '@/encryption/base64';
import { decryptAndValidateGithubIssueBindingPayload, deriveGithubIssueBindingAccountScope, encryptGithubIssueBindingPayload } from './githubIssueBindingIdentity';
import { subscribeGithubIssueBindingInvalidation } from './githubIssueBindingInvalidation';
import { projectGithubIssueBindings, type GithubIssueSessionProjection } from './githubIssueBindingProjection';
import { loadGithubIssueBindingProjectionRecords } from './githubIssueBindingProjectionLoad';
import { clearGithubIssueBindingCache, loadGithubIssueBindingCache, saveGithubIssueBindingCache } from '@/sync/persistence';
import { GithubIssueBindingHistoryEntrySchema, GithubIssueCanonicalBindingSchema } from './githubIssueBindingClient';
import type { GithubIssueCanonicalBinding } from './githubIssueBindingClient';
import { z } from 'zod';
import { refreshGithubIssueBindingLiveContext } from './githubIssueBindingFreshness';
import { createGithubIssueBindingRefreshQueue } from './githubIssueBindingRefreshQueue';
import { isGithubIssueBindingAccountGenerationCurrent, isGithubIssueBindingCacheOwnedByAccount } from './githubIssueBindingAccount';
import { randomUUID } from 'expo-crypto';

let projections = new Map<string, GithubIssueSessionProjection>();
let canonicalIssueKeysBySession = new Map<string, string>();
let freshness = new Map<string, 'changed' | 'unavailable' | 'identity-conflict'>();
let projectionAccountToken: string | null = null;
let projectionBootstrapAccountToken: string | null = null;
let projectionOfflineSessions = new Set<string>();
const listeners = new Set<() => void>();
const liveRefreshPromises = new Map<string, Promise<void>>();

export function getGithubIssueSessionProjection(sessionId: string) {
    return projections.get(sessionId) ?? null;
}

export function getGithubIssueCanonicalIssueKeyForSession(sessionId: string) {
    return canonicalIssueKeysBySession.get(sessionId) ?? null;
}

function buildCanonicalIssueKeysBySession(bindings: GithubIssueCanonicalBinding[]) {
    return new Map(
        bindings
            .filter((binding): binding is GithubIssueCanonicalBinding & { sessionId: string } =>
                binding.status === 'bound' && !!binding.sessionId)
            .map((binding) => [binding.sessionId, binding.issueKey]),
    );
}

export function getGithubIssueCanonicalProjectionByIssueKey(issueKey: string) {
    for (const projection of projections.values()) {
        if (projection.issueKey === issueKey && projection.status === 'bound') return projection;
    }
    return null;
}

export async function validateGithubIssueBindingEvidence(binding: GithubIssueCanonicalBinding) {
    try {
        const credentials = await TokenStorage.getCredentials();
        if (!credentials) return false;
        const payload = await decryptAndValidateGithubIssueBindingPayload(
            decodeBase64(credentials.secret, 'base64url'),
            binding.encryptedPayload,
            binding.issueKey,
        );
        return payload?.identity?.schemaVersion === 1;
    } catch {
        return false;
    }
}

export function getGithubIssueSessionFreshness(sessionId: string) {
    return freshness.get(sessionId) ?? 'current';
}

export function acknowledgeGithubIssueSessionFreshness(sessionId: string) {
    if (!freshness.delete(sessionId)) return;
    for (const listener of listeners) listener();
}

export async function acknowledgeGithubIssueAgentContext(sessionId: string) {
    const projection = projections.get(sessionId);
    if (!projection || projection.status !== 'bound') return false;
    const credentials = await TokenStorage.getCredentials();
    if (!credentials || credentials.token !== projectionAccountToken) return false;
    const payload = {
        ...projection.payload,
        agentContextObservedIssueUpdatedAt: projection.payload.observedIssueUpdatedAt,
    };
    const { githubIssueBindingApi } = await import('./githubIssueBindingApi');
    const encryptedPayload = await encryptGithubIssueBindingPayload(
        decodeBase64(credentials.secret, 'base64url'),
        payload,
    );
    if ((await TokenStorage.getCredentials())?.token !== credentials.token) return false;
    const refreshInput = {
        accountScope: await deriveGithubIssueBindingAccountScope(
            decodeBase64(credentials.secret, 'base64url'),
        ),
        issueKey: projection.issueKey,
        encryptedPayload,
        expectedRevision: projection.revision,
        requestId: randomUUID(),
    };
    let result;
    try {
        result = await githubIssueBindingApi.refresh(refreshInput);
    } catch {
        if ((await TokenStorage.getCredentials())?.token !== credentials.token) return false;
        result = await githubIssueBindingApi.refresh(refreshInput);
    }
    if ((await TokenStorage.getCredentials())?.token !== credentials.token) return false;
    if (result.outcome !== 'refreshed') {
        if (result.outcome === 'revision-conflict') await refreshGithubIssueSessionProjections();
        return false;
    }
    projections = new Map(projections).set(sessionId, {
        ...projection,
        revision: result.binding.revision,
        payload,
    });
    freshness = new Map(freshness);
    freshness.delete(sessionId);
    for (const listener of listeners) listener();
    return true;
}

export function subscribeGithubIssueSessionProjections(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

async function refreshGithubIssueSessionProjectionsOnce(): Promise<void> {
        const credentials = await TokenStorage.getCredentials();
        if (!credentials) {
            clearGithubIssueBindingCache();
            projections = new Map();
            canonicalIssueKeysBySession = new Map();
            freshness = new Map();
            projectionAccountToken = null;
            projectionOfflineSessions = new Set();
            for (const listener of listeners) listener();
            return;
        }
        const isCurrentGeneration = async () => isGithubIssueBindingAccountGenerationCurrent(
            credentials.token,
            (await TokenStorage.getCredentials())?.token,
        );
        const accountScope = await deriveGithubIssueBindingAccountScope(
            decodeBase64(credentials.secret, 'base64url'),
        );
        if (!await isCurrentGeneration()) return;
        if (projectionAccountToken !== credentials.token) {
            projections = new Map();
            canonicalIssueKeysBySession = new Map();
            freshness = new Map();
            projectionAccountToken = credentials.token;
            projectionOfflineSessions = new Set();
            const cached = z.object({
                accountScope: z.string().regex(/^[a-f0-9]{64}$/),
                bindings: z.array(GithubIssueCanonicalBindingSchema),
                history: z.array(GithubIssueBindingHistoryEntrySchema),
            }).safeParse(loadGithubIssueBindingCache());
            const cacheOwnedByAccount = cached.success
                && isGithubIssueBindingCacheOwnedByAccount(cached.data.accountScope, accountScope);
            if (!cacheOwnedByAccount) {
                clearGithubIssueBindingCache();
            } else {
                const cachedCanonicalIssueKeys = buildCanonicalIssueKeysBySession(cached.data.bindings);
                const masterSecret = decodeBase64(credentials.secret, 'base64url');
                try {
                    const cachedProjections = await projectGithubIssueBindings(
                        cached.data.bindings,
                        (ciphertext, issueKey) => decryptAndValidateGithubIssueBindingPayload(masterSecret, ciphertext, issueKey),
                        cached.data.history,
                    );
                    if (!await isCurrentGeneration()) return;
                    canonicalIssueKeysBySession = cachedCanonicalIssueKeys;
                    projections = cachedProjections;
                } catch {
                    // Raw canonical indexes remain usable for eligibility;
                    // authority resolution will classify unreadable evidence.
                    if (!await isCurrentGeneration()) return;
                    canonicalIssueKeysBySession = cachedCanonicalIssueKeys;
                    projections = new Map();
                }
            }
            for (const listener of listeners) listener();
        }
        try {
            const { githubIssueBindingApi } = await import('./githubIssueBindingApi');
            const { bindings, history } = await loadGithubIssueBindingProjectionRecords(
                githubIssueBindingApi,
            );
            if (!await isCurrentGeneration()) return;
            const nextCanonicalIssueKeys = buildCanonicalIssueKeysBySession(bindings);
            const masterSecret = decodeBase64(credentials.secret, 'base64url');
            const nextProjections = await projectGithubIssueBindings(
                bindings,
                (ciphertext, issueKey) => decryptAndValidateGithubIssueBindingPayload(masterSecret, ciphertext, issueKey),
                history,
            );
            if (!await isCurrentGeneration()) return;
            saveGithubIssueBindingCache({ accountScope, bindings, history });
            canonicalIssueKeysBySession = nextCanonicalIssueKeys;
            projections = nextProjections;
            if (projectionOfflineSessions.size > 0) {
                const nextFreshness = new Map(freshness);
                for (const sessionId of projectionOfflineSessions) {
                    if (nextFreshness.get(sessionId) === 'unavailable') nextFreshness.delete(sessionId);
                }
                freshness = nextFreshness;
                projectionOfflineSessions = new Set();
            }
        } catch {
            // Keep the last decrypted projection available while offline. It is
            // cleared as soon as account credentials disappear.
            const nextFreshness = new Map(freshness);
            for (const [sessionId, projection] of projections) {
                if (projection.status === 'bound' && nextFreshness.get(sessionId) !== 'changed') {
                    nextFreshness.set(sessionId, 'unavailable');
                    projectionOfflineSessions.add(sessionId);
                }
            }
            freshness = nextFreshness;
            for (const listener of listeners) listener();
            return;
        }
        for (const listener of listeners) listener();
}

const projectionRefreshQueue = createGithubIssueBindingRefreshQueue(refreshGithubIssueSessionProjectionsOnce);

export function refreshGithubIssueSessionProjections(): Promise<void> {
    return projectionRefreshQueue.request();
}

export async function ensureGithubIssueSessionProjectionsLoaded(): Promise<void> {
    const credentials = await TokenStorage.getCredentials();
    if (credentials && projectionBootstrapAccountToken === credentials.token) return;
    await refreshGithubIssueSessionProjections();
    const currentCredentials = await TokenStorage.getCredentials();
    projectionBootstrapAccountToken = credentials
        && currentCredentials?.token === credentials.token
        ? credentials.token
        : null;
}


export function refreshGithubIssueSessionLiveContext(sessionId: string): Promise<void> {
    const existing = liveRefreshPromises.get(sessionId);
    if (existing) return existing;
    const refresh = refreshGithubIssueSessionLiveContextOnce(sessionId)
        .finally(() => liveRefreshPromises.delete(sessionId));
    liveRefreshPromises.set(sessionId, refresh);
    return refresh;
}

async function refreshGithubIssueSessionLiveContextOnce(sessionId: string): Promise<void> {
    const projection = projections.get(sessionId);
    if (!projection || projection.status !== 'bound') return;
    const credentials = await TokenStorage.getCredentials();
    if (!credentials || credentials.token !== projectionAccountToken) return;
    const [{ githubIssuesApi }, { githubIssueBindingApi }] = await Promise.all([
        import('./githubIssuesApi'),
        import('./githubIssueBindingApi'),
    ]);
    const result = await refreshGithubIssueBindingLiveContext({
        projection,
        accountMasterSecret: decodeBase64(credentials.secret, 'base64url'),
        encrypt: encryptGithubIssueBindingPayload,
        listRepositories: () => githubIssuesApi.listRepositories(),
        getIssue: (input) => githubIssuesApi.getIssue(input),
        commit: async (input) => {
            if ((await TokenStorage.getCredentials())?.token !== credentials.token) {
                throw new Error('GitHub Issue binding account changed');
            }
            const refreshInput = {
                ...input,
                accountScope: await deriveGithubIssueBindingAccountScope(
                    decodeBase64(credentials.secret, 'base64url'),
                ),
                requestId: randomUUID(),
            };
            try {
                return await githubIssueBindingApi.refresh(refreshInput);
            } catch {
                if ((await TokenStorage.getCredentials())?.token !== credentials.token) {
                    throw new Error('GitHub Issue binding account changed');
                }
                return githubIssueBindingApi.refresh(refreshInput);
            }
        },
    });
    if ((await TokenStorage.getCredentials())?.token !== credentials.token) return;
    if (result.status === 'changed') {
        projections = new Map(projections).set(sessionId, {
            ...projection,
            revision: result.revision,
            payload: result.payload,
        });
        freshness = new Map(freshness).set(sessionId, 'changed');
    } else if (result.status === 'identity-conflict') {
        freshness = new Map(freshness).set(sessionId, 'identity-conflict');
    } else if (result.status === 'unavailable' && freshness.get(sessionId) !== 'changed') {
        freshness = new Map(freshness).set(sessionId, 'unavailable');
    } else if (result.status === 'revision-conflict') {
        await refreshGithubIssueSessionProjections();
    }
    for (const listener of listeners) listener();
}

subscribeGithubIssueBindingInvalidation(() => {
    void refreshGithubIssueSessionProjections();
});
