import { describe, expect, it, vi } from 'vitest';
import { createGithubIssueBindingKvClient, type GithubIssueBindingKvMutation } from './githubIssueBindingKvClient';
import {
    mutateGithubIssueBindingForExistingSession,
    prepareGithubIssueExceptionalReplacement,
} from './githubIssueBindingReplacement';

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

    it('confirms a committed replacement after its acknowledgement is lost against the real KV client', async () => {
        const issueKey = 'a'.repeat(64);
        const issueKvKey = `github-issue-session/v1/issue/${issueKey}`;
        const formerSessionKvKey = 'github-issue-session/v1/session/former-session-key';
        const store = new Map<string, { value: string; version: number }>([
            [issueKvKey, {
                value: JSON.stringify({
                    schemaVersion: 1,
                    kind: 'current',
                    issueKey,
                    sessionKey: 'former-session-key',
                    sessionId: 'former-session',
                    encryptedPayload: 'old-payload',
                    revision: 4,
                }),
                version: 7,
            }],
            [formerSessionKvKey, {
                value: JSON.stringify({
                    schemaVersion: 1,
                    kind: 'current',
                    issueKey,
                    sessionKey: 'former-session-key',
                    sessionId: 'former-session',
                    encryptedPayload: 'old-payload',
                    revision: 4,
                }),
                version: 5,
            }],
        ]);
        const realClient = createGithubIssueBindingKvClient({
            bulkGet: vi.fn(async (keys: string[]) => keys.flatMap((key) => {
                const item = store.get(key);
                return item ? [{ key, ...item }] : [];
            })),
            list: vi.fn(async () => []),
            mutate: vi.fn(async (mutations: GithubIssueBindingKvMutation[]) => {
                const matches = mutations.every((mutation) => {
                    const current = store.get(mutation.key);
                    return mutation.version === -1 ? !current : current?.version === mutation.version;
                });
                if (!matches) return {
                    success: false as const,
                    errors: mutations.map((mutation) => {
                        const current = store.get(mutation.key);
                        return {
                            key: mutation.key,
                            error: 'version-mismatch' as const,
                            version: current?.version ?? -1,
                            value: current?.value ?? null,
                        };
                    }),
                };
                const results = mutations.map((mutation) => {
                    const current = store.get(mutation.key);
                    const version = current ? current.version + 1 : 0;
                    if (mutation.value === null) store.delete(mutation.key);
                    else store.set(mutation.key, { value: mutation.value, version });
                    return { key: mutation.key, version };
                });
                return { success: true as const, results };
            }),
            deriveSessionKey: vi.fn(async (sessionId: string) => (
                sessionId === 'replacement-session' ? 'replacement-session-key' : 'former-session-key'
            )),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });
        let replaceCalls = 0;
        const client = {
            ...realClient,
            replace: async (input: Parameters<typeof realClient.replace>[0]) => {
                const result = await realClient.replace(input);
                replaceCalls += 1;
                if (replaceCalls === 1) throw new Error('acknowledgement lost');
                return result;
            },
        } as any;

        await expect(mutateGithubIssueBindingForExistingSession(client, {
            ...intent,
            issueKey,
            operation: 'replace',
            expectedRevision: 4,
            formerSessionId: 'former-session',
        }, 'replacement-session')).resolves.toEqual({
            outcome: 'replaced',
            binding: expect.objectContaining({
                issueKey,
                sessionId: 'replacement-session',
                revision: 5,
            }),
        });
        expect(replaceCalls).toBe(2);
    });
});
