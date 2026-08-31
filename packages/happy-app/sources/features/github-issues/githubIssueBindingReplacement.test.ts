import { describe, expect, it, vi } from 'vitest';
import { prepareGithubIssueExceptionalReplacement } from './githubIssueBindingReplacement';

const intent = {
    accountScope: 'f'.repeat(64), issueKey: 'a'.repeat(64), encryptedPayload: 'ciphertext',
    requestId: 'request-1', operation: 'claim' as const, issueLabel: 'myartings/happy#79',
};

describe('prepareGithubIssueExceptionalReplacement', () => {
    it('pins the intact former Session and authority revision', async () => {
        const client = { resolve: vi.fn(async () => ({
            outcome: 'bound' as const,
            binding: { sessionId: 'former-session', revision: 7 },
        })) } as any;
        await expect(prepareGithubIssueExceptionalReplacement(client, intent)).resolves.toEqual({
            ...intent,
            operation: 'replace',
            expectedRevision: 7,
            formerSessionId: 'former-session',
        });
    });

    it('does not turn an unbound Issue into an exceptional replacement', async () => {
        const client = { resolve: vi.fn(async () => ({ outcome: 'unbound' as const })) } as any;
        await expect(prepareGithubIssueExceptionalReplacement(client, intent)).rejects.toThrow(
            'A current canonical Session is required',
        );
    });
});
