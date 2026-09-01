import { describe, expect, it, vi } from 'vitest';
import { createGithubIssueBindingClient, GITHUB_ISSUE_BINDING_CAPABILITY } from './githubIssueBindingClient';

describe('GitHub Issue binding client', () => {
    it('sends the exact capability and preserves typed repair state', async () => {
        const request = vi.fn(async () => ({
            outcome: 'repair-required',
            binding: {
                id: 'binding-1',
                accountId: 'account-1',
                issueKey: 'a'.repeat(64),
                sessionId: null,
                encryptedPayload: 'ciphertext',
                revision: 4,
                status: 'repair-required',
            },
        }));
        const client = createGithubIssueBindingClient({ request });

        const result = await client.resolve('a'.repeat(64));

        expect(result.outcome).toBe('repair-required');
        expect(request).toHaveBeenCalledWith('resolve', {
            capability: GITHUB_ISSUE_BINDING_CAPABILITY,
            issueKey: 'a'.repeat(64),
        });
    });

    it('fails closed on malformed or unknown authority outcomes', async () => {
        const client = createGithubIssueBindingClient({
            request: vi.fn(async () => ({ outcome: 'newest-session-wins', sessionId: 'unsafe' })),
        });
        await expect(client.resolve('b'.repeat(64))).rejects.toThrow();
    });

    it('sends an idempotent failed-first-dispatch receipt request', async () => {
        const request = vi.fn(async () => ({
            outcome: 'repair-required',
            binding: {
                id: 'binding-1', accountId: 'account-1', issueKey: 'c'.repeat(64),
                sessionId: null, lastSessionId: 'session-1', encryptedPayload: 'ciphertext',
                revision: 2, status: 'repair-required',
            },
        }));
        const client = createGithubIssueBindingClient({ request });

        await expect(client.abandonFirstDispatch({
            issueKey: 'c'.repeat(64), abandonedSessionId: 'session-1', expectedRevision: 1,
            requestId: 'failed-first-dispatch-request',
        })).resolves.toEqual(expect.objectContaining({ outcome: 'repair-required' }));
        expect(request).toHaveBeenCalledWith('abandon-first-dispatch', {
            capability: GITHUB_ISSUE_BINDING_CAPABILITY,
            issueKey: 'c'.repeat(64), abandonedSessionId: 'session-1', expectedRevision: 1,
            requestId: 'failed-first-dispatch-request',
        });
    });
});
