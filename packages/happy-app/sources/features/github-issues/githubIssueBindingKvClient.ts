import type { GithubIssueBindingRecord } from './githubIssueBindingIdentity';

const KV_PREFIX = 'github-issue-session/v1';
const ISSUE_KV_PREFIX = `${KV_PREFIX}/issue/`;

export interface GithubIssueBindingKvItem {
    key: string;
    value: string;
    version: number;
}

export interface GithubIssueBindingKvMutation {
    key: string;
    value: string | null;
    version: number;
}

export type GithubIssueBindingKvMutateResult =
    | { success: true; results: Array<{ key: string; version: number }> }
    | {
        success: false;
        errors: Array<{
            key: string;
            error: 'version-mismatch';
            version: number;
            value: string | null;
        }>;
    };

export interface GithubIssueBindingKvDependencies {
    bulkGet(keys: string[]): Promise<GithubIssueBindingKvItem[]>;
    list(prefix: string): Promise<GithubIssueBindingKvItem[]>;
    mutate(mutations: GithubIssueBindingKvMutation[]): Promise<GithubIssueBindingKvMutateResult>;
    deriveSessionKey(sessionId: string): Promise<string>;
    encryptRecord(record: GithubIssueBindingRecord): Promise<string>;
    decryptRecord(value: string): Promise<GithubIssueBindingRecord | null>;
}

export interface GithubIssueKvBinding {
    id: string;
    accountId: 'client-kv';
    issueKey: string;
    sessionId: string | null;
    lastSessionId?: string | null;
    encryptedPayload: string;
    revision: number;
    status: 'bound' | 'repair-required';
    sessionAvailability?: 'active' | 'archived' | 'missing';
}

export type GithubIssueBindingKvMutationResult =
    | {
        outcome: 'claimed' | 'resumed' | 'replaced' | 'repair-required'
            | 'session-conflict' | 'revision-conflict';
        binding: GithubIssueKvBinding;
    }
    | { outcome: 'not-found' | 'request-conflict' };

export function githubIssueBindingIssueKvKey(issueKey: string): string {
    return `${ISSUE_KV_PREFIX}${issueKey}`;
}

export function githubIssueBindingIssueKeyFromKvKey(key: string): string | null {
    if (!key.startsWith(ISSUE_KV_PREFIX)) return null;
    const issueKey = key.slice(ISSUE_KV_PREFIX.length);
    return /^[a-f0-9]{64}$/.test(issueKey) ? issueKey : null;
}

export function githubIssueBindingSessionKvKey(sessionKey: string): string {
    return `${KV_PREFIX}/session/${sessionKey}`;
}

function projectBinding(
    record: Extract<GithubIssueBindingRecord, { kind: 'current' }>,
    lastSessionId?: string | null,
): GithubIssueKvBinding {
    return {
        id: record.issueKey,
        accountId: 'client-kv',
        issueKey: record.issueKey,
        sessionId: record.sessionId,
        ...(lastSessionId !== undefined ? { lastSessionId } : {}),
        encryptedPayload: record.encryptedPayload,
        revision: record.revision,
        status: 'bound',
    };
}

function projectRepairBinding(
    record: Extract<GithubIssueBindingRecord, { kind: 'repair-required' }>,
): GithubIssueKvBinding {
    return {
        id: record.issueKey,
        accountId: 'client-kv',
        issueKey: record.issueKey,
        sessionId: null,
        lastSessionId: record.sessionId,
        encryptedPayload: record.encryptedPayload,
        revision: record.revision,
        status: 'repair-required',
    };
}

export function createGithubIssueBindingKvClient(
    dependencies: GithubIssueBindingKvDependencies,
) {
    return {
        async list() {
            const items = await dependencies.list(ISSUE_KV_PREFIX);
            const bindings: GithubIssueKvBinding[] = [];
            for (const item of items) {
                const record = await dependencies.decryptRecord(item.value);
                if (record?.kind === 'current') {
                    bindings.push(projectBinding(record));
                } else if (record?.kind === 'repair-required') {
                    bindings.push(projectRepairBinding(record));
                }
            }
            return bindings;
        },
        async history() {
            const items = await dependencies.list(`${KV_PREFIX}/session/`);
            const history: Array<{
                issueKey: string;
                formerSessionId: string;
                encryptedPayload: string;
                revision: number;
            }> = [];
            for (const item of items) {
                const record = await dependencies.decryptRecord(item.value);
                if (record?.kind === 'transferred') {
                    history.push({
                        issueKey: record.issueKey,
                        formerSessionId: record.sessionId,
                        encryptedPayload: record.encryptedPayload,
                        revision: record.revision,
                    });
                }
            }
            return history;
        },
        async resolve(issueKey: string) {
            const issueKvKey = githubIssueBindingIssueKvKey(issueKey);
            const [item] = await dependencies.bulkGet([issueKvKey]);
            if (!item) return { outcome: 'unbound' as const };
            const record = await dependencies.decryptRecord(item.value);
            if (
                record?.kind === 'repair-required'
                && record.issueKey === issueKey
            ) {
                return {
                    outcome: 'repair-required' as const,
                    binding: projectRepairBinding(record),
                };
            }
            if (
                !record
                || record.schemaVersion !== 1
                || record.kind !== 'current'
                || record.issueKey !== issueKey
            ) {
                return {
                    outcome: 'repair-required' as const,
                    binding: {
                        id: issueKey,
                        accountId: 'client-kv' as const,
                        issueKey,
                        sessionId: null,
                        lastSessionId: null,
                        encryptedPayload: item.value,
                        revision: Math.max(1, item.version + 1),
                        status: 'repair-required' as const,
                    },
                };
            }
            return { outcome: 'bound' as const, binding: projectBinding(record) };
        },
        async claim(input: {
            accountScope?: string;
            issueKey: string;
            candidateSessionId: string;
            encryptedPayload: string;
            requestId: string;
        }): Promise<GithubIssueBindingKvMutationResult> {
            const sessionKey = await dependencies.deriveSessionKey(input.candidateSessionId);
            const issueKvKey = githubIssueBindingIssueKvKey(input.issueKey);
            const sessionKvKey = githubIssueBindingSessionKvKey(sessionKey);
            const existing = await dependencies.bulkGet([issueKvKey, sessionKvKey]);
            const existingIssue = existing.find((item) => item.key === issueKvKey);
            if (existingIssue) {
                const winner = await dependencies.decryptRecord(existingIssue.value);
                if (winner?.kind === 'current' && winner.issueKey === input.issueKey) {
                    return {
                        outcome: 'resumed' as const,
                        binding: projectBinding(winner),
                    };
                }
                if (winner?.kind === 'repair-required' && winner.issueKey === input.issueKey) {
                    return {
                        outcome: 'repair-required' as const,
                        binding: projectRepairBinding(winner),
                    };
                }
                return {
                    outcome: 'repair-required' as const,
                    binding: {
                        id: input.issueKey,
                        accountId: 'client-kv',
                        issueKey: input.issueKey,
                        sessionId: null,
                        lastSessionId: null,
                        encryptedPayload: existingIssue.value,
                        revision: Math.max(1, existingIssue.version + 1),
                        status: 'repair-required',
                    },
                };
            }
            const existingSession = existing.find((item) => item.key === sessionKvKey);
            if (existingSession) {
                const occupied = await dependencies.decryptRecord(existingSession.value);
                if (occupied?.kind === 'current') {
                    return {
                        outcome: 'session-conflict' as const,
                        binding: projectBinding(occupied),
                    };
                }
                throw new Error('GitHub Issue Session binding requires repair');
            }
            const record: Extract<GithubIssueBindingRecord, { kind: 'current' }> = {
                schemaVersion: 1,
                kind: 'current',
                issueKey: input.issueKey,
                sessionKey,
                sessionId: input.candidateSessionId,
                encryptedPayload: input.encryptedPayload,
                revision: 1,
            };
            const encryptedRecord = await dependencies.encryptRecord(record);
            const result = await dependencies.mutate([
                { key: issueKvKey, value: encryptedRecord, version: -1 },
                { key: sessionKvKey, value: encryptedRecord, version: -1 },
            ]);
            if (!result.success) {
                const refreshed = await dependencies.bulkGet([issueKvKey, sessionKvKey]);
                const issueItem = refreshed.find((item) => item.key === issueKvKey);
                const winner = issueItem
                    ? await dependencies.decryptRecord(issueItem.value)
                    : null;
                if (
                    winner?.schemaVersion === 1
                    && winner.kind === 'current'
                    && winner.issueKey === input.issueKey
                ) {
                    return {
                        outcome: 'resumed' as const,
                        binding: projectBinding(winner),
                    };
                }
                throw new Error('GitHub Issue binding conflict requires reconciliation');
            }
            return { outcome: 'claimed' as const, binding: projectBinding(record) };
        },
        async replace(input: {
            accountScope?: string;
            issueKey: string;
            replacementSessionId: string;
            encryptedPayload: string;
            expectedRevision: number;
            requestId: string;
        }): Promise<GithubIssueBindingKvMutationResult> {
            const issueKvKey = githubIssueBindingIssueKvKey(input.issueKey);
            const [issueItem] = await dependencies.bulkGet([issueKvKey]);
            if (!issueItem) return { outcome: 'not-found' as const };
            const current = await dependencies.decryptRecord(issueItem.value);
            if (
                !current
                || (current.kind !== 'current' && current.kind !== 'repair-required')
                || current.issueKey !== input.issueKey
            ) {
                const repairRevision = Math.max(1, issueItem.version + 1);
                const rawRepairBinding: GithubIssueKvBinding = {
                    id: input.issueKey,
                    accountId: 'client-kv',
                    issueKey: input.issueKey,
                    sessionId: null,
                    lastSessionId: null,
                    encryptedPayload: issueItem.value,
                    revision: repairRevision,
                    status: 'repair-required',
                };
                if (input.expectedRevision !== repairRevision) {
                    return {
                        outcome: 'repair-required' as const,
                        binding: rawRepairBinding,
                    };
                }
                const replacementSessionKey = await dependencies.deriveSessionKey(
                    input.replacementSessionId,
                );
                const replacementSessionKvKey = githubIssueBindingSessionKvKey(
                    replacementSessionKey,
                );
                const replacementItems = await dependencies.bulkGet([
                    replacementSessionKvKey,
                ]);
                const replacementItem = replacementItems.find(
                    (item) => item.key === replacementSessionKvKey,
                );
                if (replacementItem) {
                    const occupied = await dependencies.decryptRecord(replacementItem.value);
                    if (occupied?.kind === 'current') {
                        return {
                            outcome: 'session-conflict' as const,
                            binding: projectBinding(occupied),
                        };
                    }
                    throw new Error('GitHub Issue Session binding requires repair');
                }
                const replacementRecord: Extract<GithubIssueBindingRecord, { kind: 'current' }> = {
                    schemaVersion: 1,
                    kind: 'current',
                    issueKey: input.issueKey,
                    sessionKey: replacementSessionKey,
                    sessionId: input.replacementSessionId,
                    encryptedPayload: input.encryptedPayload,
                    revision: repairRevision + 1,
                };
                const encryptedReplacement = await dependencies.encryptRecord(replacementRecord);
                const result = await dependencies.mutate([
                    { key: issueKvKey, value: encryptedReplacement, version: issueItem.version },
                    { key: replacementSessionKvKey, value: encryptedReplacement, version: -1 },
                ]);
                if (!result.success) {
                    const [refreshedIssueItem] = await dependencies.bulkGet([issueKvKey]);
                    const winner = refreshedIssueItem
                        ? await dependencies.decryptRecord(refreshedIssueItem.value)
                        : null;
                    if (winner?.kind === 'current' && winner.issueKey === input.issueKey) {
                        return {
                            outcome: 'revision-conflict' as const,
                            binding: projectBinding(winner),
                        };
                    }
                    return {
                        outcome: 'repair-required' as const,
                        binding: rawRepairBinding,
                    };
                }
                return {
                    outcome: 'replaced' as const,
                    binding: projectBinding(replacementRecord, null),
                };
            }
            if (current.revision !== input.expectedRevision) {
                return {
                    outcome: 'revision-conflict' as const,
                    binding: current.kind === 'current'
                        ? projectBinding(current)
                        : projectRepairBinding(current),
                };
            }

            const replacementSessionKey = await dependencies.deriveSessionKey(
                input.replacementSessionId,
            );
            const formerSessionKey = current.sessionKey;
            const replacementSessionKvKey = githubIssueBindingSessionKvKey(
                replacementSessionKey,
            );
            const formerSessionKvKey = githubIssueBindingSessionKvKey(formerSessionKey);
            const priorTransferSessionKvKey = current.transferSessionKey
                ? githubIssueBindingSessionKvKey(current.transferSessionKey)
                : null;
            const sessionKeys = [
                formerSessionKvKey,
                replacementSessionKvKey,
            ];
            if (
                priorTransferSessionKvKey
                && priorTransferSessionKvKey !== formerSessionKvKey
                && priorTransferSessionKvKey !== replacementSessionKvKey
            ) {
                sessionKeys.push(priorTransferSessionKvKey);
            }
            const sessionItems = await dependencies.bulkGet(sessionKeys);
            const formerSessionItem = sessionItems.find(
                (item) => item.key === formerSessionKvKey,
            );
            const replacementSessionItem = sessionItems.find(
                (item) => item.key === replacementSessionKvKey,
            );
            const priorTransferSessionItem = priorTransferSessionKvKey
                ? sessionItems.find((item) => item.key === priorTransferSessionKvKey)
                : undefined;
            if (replacementSessionItem && replacementSessionKvKey !== formerSessionKvKey) {
                return {
                    outcome: 'session-conflict' as const,
                    binding: current.kind === 'current'
                        ? projectBinding(current)
                        : projectRepairBinding(current),
                };
            }

            const revision = current.revision + 1;
            const replacementRecord: Extract<GithubIssueBindingRecord, { kind: 'current' }> = {
                schemaVersion: 1,
                kind: 'current',
                issueKey: input.issueKey,
                sessionKey: replacementSessionKey,
                sessionId: input.replacementSessionId,
                transferSessionKey: formerSessionKey,
                encryptedPayload: input.encryptedPayload,
                revision,
            };
            const transferRecord: Extract<GithubIssueBindingRecord, { kind: 'transferred' }> = {
                schemaVersion: 1,
                kind: 'transferred',
                issueKey: input.issueKey,
                sessionKey: formerSessionKey,
                sessionId: current.sessionId,
                currentSessionKey: replacementSessionKey,
                currentSessionId: input.replacementSessionId,
                encryptedPayload: input.encryptedPayload,
                revision,
            };
            const [encryptedReplacement, encryptedTransfer] = await Promise.all([
                dependencies.encryptRecord(replacementRecord),
                dependencies.encryptRecord(transferRecord),
            ]);
            const mutations: GithubIssueBindingKvMutation[] = [
                { key: issueKvKey, value: encryptedReplacement, version: issueItem.version },
                {
                    key: replacementSessionKvKey,
                    value: encryptedReplacement,
                    version: replacementSessionItem?.version ?? -1,
                },
                {
                    key: formerSessionKvKey,
                    value: encryptedTransfer,
                    version: formerSessionItem?.version ?? -1,
                },
            ];
            if (
                priorTransferSessionItem
                && priorTransferSessionItem.key !== formerSessionKvKey
                && priorTransferSessionItem.key !== replacementSessionKvKey
            ) {
                mutations.push({
                    key: priorTransferSessionItem.key,
                    value: null,
                    version: priorTransferSessionItem.version,
                });
            }
            const result = await dependencies.mutate(mutations);
            if (!result.success) {
                const [refreshedIssueItem] = await dependencies.bulkGet([issueKvKey]);
                const winner = refreshedIssueItem
                    ? await dependencies.decryptRecord(refreshedIssueItem.value)
                    : null;
                if (
                    winner?.kind === 'current'
                    && winner.issueKey === input.issueKey
                ) {
                    return {
                        outcome: 'revision-conflict' as const,
                        binding: projectBinding(winner),
                    };
                }
                if (
                    winner?.kind === 'repair-required'
                    && winner.issueKey === input.issueKey
                ) {
                    return {
                        outcome: 'revision-conflict' as const,
                        binding: projectRepairBinding(winner),
                    };
                }
                throw new Error('GitHub Issue replacement conflict requires reconciliation');
            }
            return {
                outcome: 'replaced' as const,
                binding: projectBinding(replacementRecord, current.sessionId),
            };
        },
        async refresh(input: {
            accountScope?: string;
            issueKey: string;
            encryptedPayload: string;
            expectedRevision: number;
            requestId: string;
        }) {
            const issueKvKey = githubIssueBindingIssueKvKey(input.issueKey);
            const issueItems = await dependencies.bulkGet([issueKvKey]);
            const issueItem = issueItems.find((item) => item.key === issueKvKey);
            if (!issueItem) return { outcome: 'not-found' as const };
            const current = await dependencies.decryptRecord(issueItem.value);
            if (
                !current
                || current.kind !== 'current'
                || current.issueKey !== input.issueKey
            ) {
                throw new Error('GitHub Issue binding requires repair');
            }
            if (current.revision !== input.expectedRevision) {
                return {
                    outcome: 'revision-conflict' as const,
                    binding: projectBinding(current),
                };
            }
            const sessionKvKey = githubIssueBindingSessionKvKey(current.sessionKey);
            const sessionItems = await dependencies.bulkGet([sessionKvKey]);
            const sessionItem = sessionItems.find((item) => item.key === sessionKvKey);
            if (!sessionItem) {
                throw new Error('GitHub Issue binding requires repair');
            }
            const refreshedRecord: Extract<GithubIssueBindingRecord, { kind: 'current' }> = {
                ...current,
                encryptedPayload: input.encryptedPayload,
                revision: current.revision + 1,
            };
            const encryptedRecord = await dependencies.encryptRecord(refreshedRecord);
            const result = await dependencies.mutate([
                { key: issueKvKey, value: encryptedRecord, version: issueItem.version },
                { key: sessionKvKey, value: encryptedRecord, version: sessionItem.version },
            ]);
            if (!result.success) {
                const [refetchedIssueItem] = await dependencies.bulkGet([issueKvKey]);
                const winner = refetchedIssueItem
                    ? await dependencies.decryptRecord(refetchedIssueItem.value)
                    : null;
                if (winner?.kind === 'current' && winner.issueKey === input.issueKey) {
                    return {
                        outcome: 'revision-conflict' as const,
                        binding: projectBinding(winner),
                    };
                }
                return { outcome: 'not-found' as const };
            }
            return {
                outcome: 'refreshed' as const,
                binding: projectBinding(refreshedRecord),
            };
        },
        async abandonFirstDispatch(input: {
            accountScope?: string;
            issueKey: string;
            abandonedSessionId: string;
            expectedRevision: number;
            requestId: string;
        }) {
            const issueKvKey = githubIssueBindingIssueKvKey(input.issueKey);
            const issueItems = await dependencies.bulkGet([issueKvKey]);
            const issueItem = issueItems.find((item) => item.key === issueKvKey);
            if (!issueItem) return { outcome: 'not-found' as const };
            const current = await dependencies.decryptRecord(issueItem.value);
            if (
                current?.kind === 'repair-required'
                && current.issueKey === input.issueKey
                && current.sessionId === input.abandonedSessionId
            ) {
                return {
                    outcome: 'repair-required' as const,
                    binding: projectRepairBinding(current),
                };
            }
            if (
                !current
                || current.kind !== 'current'
                || current.issueKey !== input.issueKey
            ) {
                return { outcome: 'not-found' as const };
            }
            if (
                current.revision !== input.expectedRevision
                || current.sessionId !== input.abandonedSessionId
            ) {
                return {
                    outcome: 'revision-conflict' as const,
                    binding: projectBinding(current),
                };
            }
            const sessionKvKey = githubIssueBindingSessionKvKey(current.sessionKey);
            const sessionItems = await dependencies.bulkGet([sessionKvKey]);
            const sessionItem = sessionItems.find((item) => item.key === sessionKvKey);
            const repairRecord: Extract<GithubIssueBindingRecord, { kind: 'repair-required' }> = {
                schemaVersion: 1,
                kind: 'repair-required',
                issueKey: current.issueKey,
                sessionKey: current.sessionKey,
                sessionId: current.sessionId,
                transferSessionKey: current.transferSessionKey,
                encryptedPayload: current.encryptedPayload,
                revision: current.revision + 1,
            };
            const encryptedRecord = await dependencies.encryptRecord(repairRecord);
            const result = await dependencies.mutate([
                { key: issueKvKey, value: encryptedRecord, version: issueItem.version },
                {
                    key: sessionKvKey,
                    value: encryptedRecord,
                    version: sessionItem?.version ?? -1,
                },
            ]);
            if (!result.success) {
                const [refetchedIssueItem] = await dependencies.bulkGet([issueKvKey]);
                const winner = refetchedIssueItem
                    ? await dependencies.decryptRecord(refetchedIssueItem.value)
                    : null;
                if (winner?.kind === 'repair-required' && winner.issueKey === input.issueKey) {
                    return {
                        outcome: 'repair-required' as const,
                        binding: projectRepairBinding(winner),
                    };
                }
                if (winner?.kind === 'current' && winner.issueKey === input.issueKey) {
                    return {
                        outcome: 'revision-conflict' as const,
                        binding: projectBinding(winner),
                    };
                }
                return { outcome: 'not-found' as const };
            }
            return {
                outcome: 'repair-required' as const,
                binding: projectRepairBinding(repairRecord),
            };
        },
    };
}
