import { describe, expect, it } from 'vitest';
import { reconcileGithubIssueBindingSnapshot, refreshGithubIssueBindingLiveContext } from './githubIssueBindingFreshness';
import { vi } from 'vitest';

const cached = {
    schemaVersion: 1 as const,
    identity: { schemaVersion: 1 as const, provider: 'github' as const, host: 'github.com', repositoryId: 'repo-79', issueNodeId: 'issue-79' },
    ownerSnapshot: 'old-owner', repositorySnapshot: 'old-repo', number: 79,
    urlSnapshot: 'https://github.com/old-owner/old-repo/issues/79', titleSnapshot: 'Old title', observedIssueUpdatedAt: '2026-08-01T00:00:00Z',
};

describe('reconcileGithubIssueBindingSnapshot', () => {
    it('refreshes rename/transfer display fields without changing stable identity', () => {
        const result = reconcileGithubIssueBindingSnapshot(cached, {
            repositoryId: 'repo-79', issueNodeId: 'issue-79', owner: 'new-owner', repository: 'new-repo', number: 79,
            url: 'https://github.com/new-owner/new-repo/issues/79', title: 'New title', updatedAt: '2026-08-31T00:00:00Z',
        });
        expect(result.status).toBe('changed');
        expect(result.payload.identity).toEqual(cached.identity);
        expect(result.payload.ownerSnapshot).toBe('new-owner');
    });

    it('fails closed instead of adopting contradictory GitHub identity', () => {
        const result = reconcileGithubIssueBindingSnapshot(cached, {
            repositoryId: 'other-repo', issueNodeId: 'other-issue', owner: 'old-owner', repository: 'old-repo', number: 79,
            url: cached.urlSnapshot, title: cached.titleSnapshot, updatedAt: '2026-08-31T00:00:00Z',
        });
        expect(result).toEqual({ status: 'identity-conflict', payload: cached });
    });
});

describe('refreshGithubIssueBindingLiveContext', () => {
    it('finds a renamed repository by stable id and commits a revision-safe encrypted snapshot', async () => {
        const commit = vi.fn(async () => ({ outcome: 'refreshed' as const, binding: { revision: 5 } }));
        const numericRepositoryPayload = {
            ...cached,
            identity: { ...cached.identity, repositoryId: '79' },
        };
        const result = await refreshGithubIssueBindingLiveContext({
            projection: { issueKey: 'a'.repeat(64), sessionId: 'session-1', revision: 4, status: 'bound', payload: numericRepositoryPayload },
            accountMasterSecret: new Uint8Array(32).fill(7),
            encrypt: async () => 'opaque-encrypted-payload',
            listRepositories: async () => [{
                id: 79, owner: 'new-owner', name: 'new-repo', fullName: 'new-owner/new-repo', private: true,
                url: 'https://github.com/new-owner/new-repo',
            }],
            getIssue: async () => ({
                number: 79, nodeId: 'issue-79', title: 'New title', body: null, state: 'open',
                url: 'https://github.com/new-owner/new-repo/issues/79', updatedAt: '2026-08-31T00:00:00Z',
                comments: 0, viewerCanDelete: false, author: null, labels: [],
            }),
            commit,
        });

        expect(result).toMatchObject({ status: 'changed', revision: 5 });
        expect(commit).toHaveBeenCalledWith(expect.objectContaining({
            issueKey: 'a'.repeat(64),
            expectedRevision: 4,
        }));
        expect(commit).toHaveBeenCalledWith(expect.objectContaining({ encryptedPayload: 'opaque-encrypted-payload' }));
    });

    it('keeps the cached binding when GitHub access is unavailable', async () => {
        const result = await refreshGithubIssueBindingLiveContext({
            projection: { issueKey: 'a'.repeat(64), sessionId: 'session-1', revision: 4, status: 'bound', payload: cached },
            accountMasterSecret: new Uint8Array(32).fill(7),
            encrypt: async () => 'must-not-encrypt',
            listRepositories: async () => [],
            getIssue: async () => { throw new Error('must not fetch'); },
            commit: async () => { throw new Error('must not commit'); },
        });
        expect(result).toEqual({ status: 'unavailable' });
    });

    it('keeps Agent-context reconciliation pending after restart without rewriting the snapshot', async () => {
        const commit = vi.fn();
        const pendingContext = {
            ...cached,
            ownerSnapshot: 'new-owner', repositorySnapshot: 'new-repo', titleSnapshot: 'New title',
            urlSnapshot: 'https://github.com/new-owner/new-repo/issues/79',
            observedIssueUpdatedAt: '2026-08-31T00:00:00Z',
            agentContextObservedIssueUpdatedAt: '2026-08-01T00:00:00Z',
            identity: { ...cached.identity, repositoryId: '79' },
        };
        const result = await refreshGithubIssueBindingLiveContext({
            projection: { issueKey: 'a'.repeat(64), sessionId: 'session-1', revision: 5, status: 'bound', payload: pendingContext },
            accountMasterSecret: new Uint8Array(32).fill(7),
            encrypt: async () => 'must-not-encrypt',
            listRepositories: async () => [{
                id: 79, owner: 'new-owner', name: 'new-repo', fullName: 'new-owner/new-repo', private: true, url: '',
            }],
            getIssue: async () => ({
                number: 79, nodeId: 'issue-79', title: 'New title', body: null, state: 'open',
                url: pendingContext.urlSnapshot, updatedAt: pendingContext.observedIssueUpdatedAt,
                comments: 0, viewerCanDelete: false, author: null, labels: [],
            }),
            commit,
        });

        expect(result).toMatchObject({ status: 'changed', revision: 5 });
        expect(commit).not.toHaveBeenCalled();
    });
});
