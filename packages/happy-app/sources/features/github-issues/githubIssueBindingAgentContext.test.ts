import { describe, expect, it } from 'vitest';
import { prepareGithubIssueAgentContextRefreshDraft } from './githubIssueBindingAgentContext';

const payload = {
    schemaVersion: 1 as const,
    identity: { schemaVersion: 1 as const, provider: 'github' as const, host: 'github.com', repositoryId: 'R_1', issueNodeId: 'I_79' },
    ownerSnapshot: 'myartings', repositorySnapshot: 'happy', number: 79,
    urlSnapshot: 'https://github.com/myartings/happy/issues/79',
    titleSnapshot: 'Canonical Session binding', observedIssueUpdatedAt: '2026-08-31T12:00:00Z',
};

describe('prepareGithubIssueAgentContextRefreshDraft', () => {
    it('creates a reviewable refresh task with exact Issue identity and live snapshot', () => {
        const draft = prepareGithubIssueAgentContextRefreshDraft(null, payload);
        expect(draft).toContain('myartings/happy#79');
        expect(draft).toContain(payload.urlSnapshot);
        expect(draft).toContain(payload.titleSnapshot);
        expect(draft).toContain(payload.observedIssueUpdatedAt);
        expect(draft).toContain('Reconcile the current implementation plan');
    });

    it('preserves an existing draft and appends the refresh task', () => {
        expect(prepareGithubIssueAgentContextRefreshDraft('Keep this instruction', payload))
            .toMatch(/^Keep this instruction\n\nRefresh the Agent task context/);
    });
});
