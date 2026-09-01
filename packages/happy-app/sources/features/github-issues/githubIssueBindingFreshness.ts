import type { GithubIssueBindingPayload } from './githubIssueBindingIdentity';
import type { GithubIssueSessionProjection } from './githubIssueBindingProjection';
import type { GithubIssue, GithubRepository } from './githubIssuesClient';

export interface GithubIssueLiveSnapshot {
    repositoryId: string;
    issueNodeId: string;
    owner: string;
    repository: string;
    number: number;
    url: string;
    title: string;
    updatedAt: string;
}

export type GithubIssueFreshness =
    | { status: 'unchanged'; payload: GithubIssueBindingPayload }
    | { status: 'changed'; payload: GithubIssueBindingPayload; requiresSnapshotCommit: boolean }
    | { status: 'identity-conflict'; payload: GithubIssueBindingPayload };

export function reconcileGithubIssueBindingSnapshot(
    cached: GithubIssueBindingPayload,
    live: GithubIssueLiveSnapshot,
): GithubIssueFreshness {
    if (cached.identity.repositoryId !== live.repositoryId
        || cached.identity.issueNodeId !== live.issueNodeId) {
        return { status: 'identity-conflict', payload: cached };
    }
    const next: GithubIssueBindingPayload = {
        ...cached,
        ownerSnapshot: live.owner,
        repositorySnapshot: live.repository,
        number: live.number,
        urlSnapshot: live.url,
        titleSnapshot: live.title,
        observedIssueUpdatedAt: live.updatedAt,
    };
    const snapshotChanged = Date.parse(live.updatedAt) > Date.parse(cached.observedIssueUpdatedAt)
        || cached.ownerSnapshot !== live.owner
        || cached.repositorySnapshot !== live.repository
        || cached.number !== live.number
        || cached.urlSnapshot !== live.url
        || cached.titleSnapshot !== live.title;
    const agentContextObservedAt = cached.agentContextObservedIssueUpdatedAt ?? cached.observedIssueUpdatedAt;
    const contextChanged = Date.parse(live.updatedAt) > Date.parse(agentContextObservedAt);
    const changed = snapshotChanged || contextChanged;
    return changed
        ? { status: 'changed', payload: next, requiresSnapshotCommit: snapshotChanged }
        : { status: 'unchanged', payload: cached };
}

export type GithubIssueBindingLiveRefreshResult =
    | { status: 'unchanged' }
    | { status: 'changed'; payload: GithubIssueBindingPayload; revision: number }
    | { status: 'unavailable' }
    | { status: 'identity-conflict' }
    | { status: 'revision-conflict' };

export async function refreshGithubIssueBindingLiveContext(input: {
    projection: GithubIssueSessionProjection;
    accountMasterSecret: Uint8Array;
    encrypt: (accountMasterSecret: Uint8Array, payload: GithubIssueBindingPayload) => Promise<string>;
    listRepositories: () => Promise<GithubRepository[]>;
    getIssue: (input: { owner: string; repo: string; number: number }) => Promise<GithubIssue>;
    commit: (input: { issueKey: string; encryptedPayload: string; expectedRevision: number }) => Promise<
        | { outcome: 'refreshed'; binding: { revision: number } }
        | { outcome: 'revision-conflict'; binding: { revision: number } }
        | { outcome: 'not-found' }
        | { outcome: 'request-conflict' }
    >;
}): Promise<GithubIssueBindingLiveRefreshResult> {
    if (input.projection.status !== 'bound') return { status: 'unchanged' };
    try {
        const repositories = await input.listRepositories();
        const repository = repositories.find((candidate) => (
            String(candidate.id) === input.projection.payload.identity.repositoryId
        ));
        if (!repository) return { status: 'unavailable' };
        const issue = await input.getIssue({
            owner: repository.owner,
            repo: repository.name,
            number: input.projection.payload.number,
        });
        const reconciled = reconcileGithubIssueBindingSnapshot(input.projection.payload, {
            repositoryId: String(repository.id),
            issueNodeId: issue.nodeId,
            owner: repository.owner,
            repository: repository.name,
            number: issue.number,
            url: issue.url,
            title: issue.title,
            updatedAt: issue.updatedAt,
        });
        if (reconciled.status === 'identity-conflict') return { status: 'identity-conflict' };
        if (reconciled.status === 'unchanged') return { status: 'unchanged' };
        if (!reconciled.requiresSnapshotCommit) {
            return { status: 'changed', payload: reconciled.payload, revision: input.projection.revision };
        }
        const committed = await input.commit({
            issueKey: input.projection.issueKey,
            encryptedPayload: await input.encrypt(input.accountMasterSecret, reconciled.payload),
            expectedRevision: input.projection.revision,
        });
        if (committed.outcome !== 'refreshed') {
            return { status: committed.outcome === 'revision-conflict' ? 'revision-conflict' : 'unavailable' };
        }
        return { status: 'changed', payload: reconciled.payload, revision: committed.binding.revision };
    } catch {
        return { status: 'unavailable' };
    }
}
