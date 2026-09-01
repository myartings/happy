import { describe, expect, it, vi } from 'vitest';
import { projectGithubIssueBindings, selectGithubIssueSessionProjection } from './githubIssueBindingProjection';

describe('projectGithubIssueBindings', () => {
    it('projects only decryptable current bindings without inferring legacy ownership', async () => {
        const payload = {
            schemaVersion: 1 as const,
            identity: { schemaVersion: 1 as const, provider: 'github' as const, host: 'github.com', repositoryId: '79', issueNodeId: 'I_1' },
            ownerSnapshot: 'myartings', repositorySnapshot: 'happy', number: 79,
            urlSnapshot: 'https://github.com/myartings/happy/issues/79', titleSnapshot: 'Canonical binding', observedIssueUpdatedAt: '2026-08-31T00:00:00Z',
        };
        const decrypt = vi.fn(async (value: string) => value === 'valid' ? payload : null);
        const result = await projectGithubIssueBindings([
            { id: 'b1', accountId: 'a1', issueKey: 'a'.repeat(64), sessionId: 's1', encryptedPayload: 'valid', revision: 1, status: 'bound' },
            { id: 'b2', accountId: 'a1', issueKey: 'b'.repeat(64), sessionId: null, lastSessionId: 'repair-session', encryptedPayload: 'valid', revision: 2, status: 'repair-required' },
            { id: 'b3', accountId: 'a1', issueKey: 'c'.repeat(64), sessionId: 's3', encryptedPayload: 'corrupt', revision: 1, status: 'bound' },
        ], decrypt, [{
            issueKey: 'a'.repeat(64), formerSessionId: 'former-session',
            encryptedPayload: 'valid', revision: 2,
        }]);

        expect([...result.keys()]).toEqual(['former-session', 's1', 'repair-session']);
        expect(result.get('s1')?.payload.number).toBe(79);
        expect(result.get('former-session')?.status).toBe('replaced');
        expect(result.get('repair-session')?.status).toBe('repair-required');
        expect(result.get('top-level-fork-with-copied-metadata')).toBeUndefined();
        expect(result.get('side-chat-child')).toBeUndefined();
        expect(selectGithubIssueSessionProjection(false, result.get('s1') ?? null)).toBeNull();
        expect(decrypt).toHaveBeenCalledWith('valid', 'a'.repeat(64));
        expect(decrypt).toHaveBeenCalledWith('corrupt', 'c'.repeat(64));
    });
});
