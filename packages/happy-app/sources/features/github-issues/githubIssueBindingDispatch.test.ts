import { describe, expect, it, vi } from 'vitest';
import { getGithubIssueBindingDispatchActionKey, resolveGithubIssueBindingDispatch } from './githubIssueBindingDispatch';

describe('resolveGithubIssueBindingDispatch', () => {
    it.each([
        [{ outcome: 'unbound' }, { kind: 'unbound' }],
        [{ outcome: 'bound', binding: { sessionId: 'canonical-session' } }, { kind: 'continue', sessionId: 'canonical-session' }],
        [{ outcome: 'bound', binding: { sessionId: 'archived-session', sessionAvailability: 'archived' } }, { kind: 'restore', sessionId: 'archived-session' }],
        [{ outcome: 'bound', binding: { sessionId: 'missing-session', lastSessionId: 'missing-session', revision: 3, sessionAvailability: 'missing' } }, { kind: 'repair-required', expectedRevision: 3, formerSessionId: 'missing-session' }],
        [{ outcome: 'repair-required', binding: { sessionId: null, lastSessionId: 'former', revision: 4 } }, { kind: 'repair-required', expectedRevision: 4, formerSessionId: 'former' }],
    ])('maps authority result %o without heuristics', async (authority, expected) => {
        const client = { resolve: vi.fn(async () => authority) } as any;
        await expect(resolveGithubIssueBindingDispatch(client, 'a'.repeat(64))).resolves.toEqual(expected);
    });

    it('disables mutation when the authority is unavailable', async () => {
        const client = { resolve: vi.fn(async () => { throw new Error('offline'); }) } as any;
        await expect(resolveGithubIssueBindingDispatch(client, 'a'.repeat(64))).resolves.toEqual({ kind: 'unavailable' });
    });

    it('opens a synchronized cached canonical Session offline without permitting mutation', async () => {
        const client = { resolve: vi.fn(async () => { throw new Error('offline'); }) } as any;
        await expect(resolveGithubIssueBindingDispatch(client, 'a'.repeat(64), () => 'cached-session'))
            .resolves.toEqual({ kind: 'offline', sessionId: 'cached-session' });
    });

    it('requires repair when the canonical encrypted evidence is unreadable', async () => {
        const binding = {
            id: 'binding-1', accountId: 'account-1', issueKey: 'a'.repeat(64),
            sessionId: 'canonical-session', lastSessionId: null, encryptedPayload: 'corrupt',
            revision: 7, status: 'bound', sessionAvailability: 'active',
        } as const;
        const client = { resolve: vi.fn(async () => ({ outcome: 'bound', binding })) } as any;

        await expect(resolveGithubIssueBindingDispatch(client, binding.issueKey, undefined, async () => false))
            .resolves.toEqual({ kind: 'repair-required', expectedRevision: 7, formerSessionId: 'canonical-session' });
    });

    it('exposes distinct observable action states', () => {
        expect([
            getGithubIssueBindingDispatchActionKey({ kind: 'loading' }),
            getGithubIssueBindingDispatchActionKey({ kind: 'binding' }),
            getGithubIssueBindingDispatchActionKey({ kind: 'offline', sessionId: 'cached' }),
            getGithubIssueBindingDispatchActionKey({ kind: 'conflict' }),
            getGithubIssueBindingDispatchActionKey({ kind: 'repair-required', expectedRevision: 2, formerSessionId: null }),
        ]).toEqual([
            'githubIssues.checkingSession',
            'githubIssues.bindingSession',
            'githubIssues.openCachedSession',
            'githubIssues.bindingConflict',
            'githubIssues.repairSession',
        ]);
    });
});
