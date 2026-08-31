import { describe, expect, it, vi } from 'vitest';
import {
    createGithubIssueBindingKvClient,
    githubIssueBindingIssueKeyFromKvKey,
    type GithubIssueBindingKvMutation,
} from './githubIssueBindingKvClient';

describe('GitHub Issue binding KV client', () => {
    it('recognizes only opaque Issue-direction keys from generic KV updates', () => {
        const issueKey = 'a'.repeat(64);
        expect(githubIssueBindingIssueKeyFromKvKey(
            `github-issue-session/v1/issue/${issueKey}`,
        )).toBe(issueKey);
        expect(githubIssueBindingIssueKeyFromKvKey(
            `github-issue-session/v1/session/${issueKey}`,
        )).toBeNull();
        expect(githubIssueBindingIssueKeyFromKvKey(
            'github-issue-session/v1/issue/not-opaque',
        )).toBeNull();
    });

    it('lists readable current and repair bindings from the Issue direction', async () => {
        const current = JSON.stringify({
            schemaVersion: 1,
            kind: 'current',
            issueKey: 'issue-key',
            sessionKey: 'session-key',
            sessionId: 'session-on-macos',
            encryptedPayload: 'payload',
            revision: 2,
        });
        const client = createGithubIssueBindingKvClient({
            bulkGet: vi.fn(async () => []),
            list: vi.fn(async () => [{
                key: 'github-issue-session/v1/issue/issue-key',
                value: current,
                version: 1,
            }, {
                key: 'github-issue-session/v1/issue/repair-issue-key',
                value: JSON.stringify({
                    schemaVersion: 1,
                    kind: 'repair-required',
                    issueKey: 'repair-issue-key',
                    sessionKey: 'abandoned-session-key',
                    sessionId: 'abandoned-session',
                    encryptedPayload: 'repair-payload',
                    revision: 4,
                }),
                version: 5,
            }, {
                key: 'github-issue-session/v1/issue/unreadable',
                value: 'unreadable',
                version: 4,
            }]),
            mutate: vi.fn(),
            deriveSessionKey: vi.fn(async () => 'session-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => (
                value === 'unreadable' ? null : JSON.parse(value)
            )),
        });

        await expect(client.list()).resolves.toEqual([
            expect.objectContaining({
                issueKey: 'issue-key',
                sessionId: 'session-on-macos',
                revision: 2,
            }),
            expect.objectContaining({
                issueKey: 'repair-issue-key',
                sessionId: null,
                lastSessionId: 'abandoned-session',
                revision: 4,
                status: 'repair-required',
            }),
        ]);
    });

    it('projects only direct transfer markers as visible history', async () => {
        const transferred = JSON.stringify({
            schemaVersion: 1,
            kind: 'transferred',
            issueKey: 'issue-key',
            sessionKey: 'former-session-key',
            sessionId: 'session-on-linux',
            currentSessionKey: 'current-session-key',
            currentSessionId: 'session-on-windows',
            encryptedPayload: 'payload',
            revision: 4,
        });
        const current = JSON.stringify({
            schemaVersion: 1,
            kind: 'current',
            issueKey: 'other-issue-key',
            sessionKey: 'current-session-key',
            sessionId: 'session-on-windows',
            encryptedPayload: 'other-payload',
            revision: 1,
        });
        const client = createGithubIssueBindingKvClient({
            bulkGet: vi.fn(async () => []),
            list: vi.fn(async () => [{
                key: 'github-issue-session/v1/session/former-session-key',
                value: transferred,
                version: 3,
            }, {
                key: 'github-issue-session/v1/session/current-session-key',
                value: current,
                version: 0,
            }]),
            mutate: vi.fn(),
            deriveSessionKey: vi.fn(async () => 'session-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });

        await expect(client.history()).resolves.toEqual([{
            issueKey: 'issue-key',
            formerSessionId: 'session-on-linux',
            encryptedPayload: 'payload',
            revision: 4,
        }]);
    });

    it('resolves the current Session from the encrypted Issue direction', async () => {
        const current = JSON.stringify({
            schemaVersion: 1,
            kind: 'current',
            issueKey: 'issue-key',
            sessionKey: 'session-key',
            sessionId: 'session-on-linux',
            encryptedPayload: 'encrypted-issue-payload',
            revision: 3,
        });
        const client = createGithubIssueBindingKvClient({
            bulkGet: vi.fn(async () => [{
                key: 'github-issue-session/v1/issue/issue-key',
                value: current,
                version: 2,
            }]),
            list: vi.fn(async () => []),
            mutate: vi.fn(),
            deriveSessionKey: vi.fn(async () => 'session-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });

        await expect(client.resolve('issue-key')).resolves.toEqual({
            outcome: 'bound',
            binding: expect.objectContaining({
                issueKey: 'issue-key',
                sessionId: 'session-on-linux',
                revision: 3,
            }),
        });
    });

    it('claims the opaque Issue and Session directions in one atomic mutation', async () => {
        const bulkGet = vi.fn(async () => []);
        const mutate = vi.fn(async (_mutations: GithubIssueBindingKvMutation[]) => ({
            success: true as const,
            results: [
                { key: 'github-issue-session/v1/issue/issue-key', version: 0 },
                { key: 'github-issue-session/v1/session/session-key', version: 0 },
            ],
        }));
        const client = createGithubIssueBindingKvClient({
            bulkGet,
            list: vi.fn(async () => []),
            mutate,
            deriveSessionKey: vi.fn(async () => 'session-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });

        const result = await client.claim({
            issueKey: 'issue-key',
            candidateSessionId: 'session-1',
            encryptedPayload: 'encrypted-issue-payload',
            requestId: 'request-claim',
        });

        expect(result).toEqual(expect.objectContaining({
            outcome: 'claimed',
            binding: expect.objectContaining({
                issueKey: 'issue-key',
                sessionId: 'session-1',
                revision: 1,
            }),
        }));
        expect(mutate).toHaveBeenCalledTimes(1);
        expect(mutate).toHaveBeenCalledWith([
            expect.objectContaining({
                key: 'github-issue-session/v1/issue/issue-key',
                version: -1,
            }),
            expect.objectContaining({
                key: 'github-issue-session/v1/session/session-key',
                version: -1,
            }),
        ]);
        const [mutations] = mutate.mock.calls[0]!;
        expect(JSON.parse(mutations[0].value!)).toEqual(expect.objectContaining({
            kind: 'current', issueKey: 'issue-key', sessionKey: 'session-key',
            sessionId: 'session-1', revision: 1,
        }));
        expect(mutations[0].value).toBe(mutations[1].value);
    });

    it('refetches after a lost claim race and converges on the winning Session', async () => {
        const winner = JSON.stringify({
            schemaVersion: 1,
            kind: 'current',
            issueKey: 'issue-key',
            sessionKey: 'winner-session-key',
            sessionId: 'session-on-macos',
            encryptedPayload: 'winner-payload',
            revision: 1,
        });
        const bulkGet = vi.fn()
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{
                key: 'github-issue-session/v1/issue/issue-key',
                value: winner,
                version: 0,
            }]);
        const mutate = vi.fn(async (_mutations: GithubIssueBindingKvMutation[]) => ({
            success: false as const,
            errors: [{
                key: 'github-issue-session/v1/issue/issue-key',
                error: 'version-mismatch' as const,
                version: 0,
                value: winner,
            }],
        }));
        const client = createGithubIssueBindingKvClient({
            bulkGet,
            list: vi.fn(async () => []),
            mutate,
            deriveSessionKey: vi.fn(async () => 'loser-session-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });

        await expect(client.claim({
            issueKey: 'issue-key',
            candidateSessionId: 'session-on-windows',
            encryptedPayload: 'loser-payload',
            requestId: 'request-race',
        })).resolves.toEqual(expect.objectContaining({
            outcome: 'resumed',
            binding: expect.objectContaining({ sessionId: 'session-on-macos' }),
        }));
        expect(bulkGet).toHaveBeenNthCalledWith(2, [
            'github-issue-session/v1/issue/issue-key',
            'github-issue-session/v1/session/loser-session-key',
        ]);
        expect(mutate).toHaveBeenCalledTimes(1);
    });

    it('resumes a winner that committed before the initial claim read', async () => {
        const winner = JSON.stringify({
            schemaVersion: 1,
            kind: 'current',
            issueKey: 'issue-key',
            sessionKey: 'winner-session-key',
            sessionId: 'session-on-linux',
            encryptedPayload: 'winner-payload',
            revision: 2,
        });
        const mutate = vi.fn();
        const client = createGithubIssueBindingKvClient({
            bulkGet: vi.fn(async () => [{
                key: 'github-issue-session/v1/issue/issue-key',
                value: winner,
                version: 4,
            }]),
            list: vi.fn(async () => []),
            mutate,
            deriveSessionKey: vi.fn(async () => 'candidate-session-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });

        await expect(client.claim({
            issueKey: 'issue-key',
            candidateSessionId: 'session-on-windows',
            encryptedPayload: 'candidate-payload',
            requestId: 'request-preexisting-winner',
        })).resolves.toEqual({
            outcome: 'resumed',
            binding: expect.objectContaining({ sessionId: 'session-on-linux' }),
        });
        expect(mutate).not.toHaveBeenCalled();
    });

    it('replaces both current directions and leaves one direct transfer marker atomically', async () => {
        const current = JSON.stringify({
            schemaVersion: 1,
            kind: 'current',
            issueKey: 'issue-key',
            sessionKey: 'former-session-key',
            sessionId: 'session-on-linux',
            encryptedPayload: 'old-payload',
            revision: 3,
        });
        const bulkGet = vi.fn()
            .mockResolvedValueOnce([{
                key: 'github-issue-session/v1/issue/issue-key',
                value: current,
                version: 7,
            }])
            .mockResolvedValueOnce([{
                key: 'github-issue-session/v1/session/former-session-key',
                value: current,
                version: 5,
            }]);
        const mutate = vi.fn(async (_mutations: GithubIssueBindingKvMutation[]) => ({
            success: true as const,
            results: [],
        }));
        const client = createGithubIssueBindingKvClient({
            bulkGet,
            list: vi.fn(async () => []),
            mutate,
            deriveSessionKey: vi.fn(async (sessionId) => (
                sessionId === 'session-on-windows'
                    ? 'replacement-session-key'
                    : 'former-session-key'
            )),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });

        await expect(client.replace({
            issueKey: 'issue-key',
            replacementSessionId: 'session-on-windows',
            encryptedPayload: 'new-payload',
            expectedRevision: 3,
            requestId: 'request-1',
        })).resolves.toEqual(expect.objectContaining({
            outcome: 'replaced',
            binding: expect.objectContaining({
                sessionId: 'session-on-windows',
                lastSessionId: 'session-on-linux',
                revision: 4,
            }),
        }));
        expect(mutate).toHaveBeenCalledTimes(1);
        const [mutations] = mutate.mock.calls[0]!;
        expect(mutations).toHaveLength(3);
        expect(mutations[0]).toEqual(expect.objectContaining({
            key: 'github-issue-session/v1/issue/issue-key', version: 7,
        }));
        expect(mutations[1]).toEqual(expect.objectContaining({
            key: 'github-issue-session/v1/session/replacement-session-key', version: -1,
        }));
        expect(mutations[2]).toEqual(expect.objectContaining({
            key: 'github-issue-session/v1/session/former-session-key', version: 5,
        }));
        expect(JSON.parse(mutations[0].value!)).toEqual(expect.objectContaining({
            kind: 'current', sessionId: 'session-on-windows', revision: 4,
        }));
        expect(mutations[1].value).toBe(mutations[0].value);
        expect(JSON.parse(mutations[2].value!)).toEqual(expect.objectContaining({
            kind: 'transferred',
            sessionId: 'session-on-linux',
            currentSessionId: 'session-on-windows',
            revision: 4,
        }));
    });

    it('repairs a failed first-dispatch binding through the same atomic replacement', async () => {
        const repair = JSON.stringify({
            schemaVersion: 1,
            kind: 'repair-required',
            issueKey: 'issue-key',
            sessionKey: 'abandoned-session-key',
            sessionId: 'abandoned-session',
            encryptedPayload: 'old-payload',
            revision: 2,
        });
        const bulkGet = vi.fn()
            .mockResolvedValueOnce([{
                key: 'github-issue-session/v1/issue/issue-key',
                value: repair,
                version: 3,
            }])
            .mockResolvedValueOnce([{
                key: 'github-issue-session/v1/session/abandoned-session-key',
                value: repair,
                version: 8,
            }]);
        const mutate = vi.fn(async (_mutations: GithubIssueBindingKvMutation[]) => ({
            success: true as const, results: [],
        }));
        const client = createGithubIssueBindingKvClient({
            bulkGet,
            list: vi.fn(async () => []),
            mutate,
            deriveSessionKey: vi.fn(async (sessionId) => (
                sessionId === 'replacement-session'
                    ? 'replacement-session-key'
                    : 'abandoned-session-key'
            )),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });

        await expect(client.replace({
            issueKey: 'issue-key',
            replacementSessionId: 'replacement-session',
            encryptedPayload: 'new-payload',
            expectedRevision: 2,
            requestId: 'request-repair',
        })).resolves.toEqual({
            outcome: 'replaced',
            binding: expect.objectContaining({
                sessionId: 'replacement-session',
                lastSessionId: 'abandoned-session',
                revision: 3,
            }),
        });
        expect(mutate).toHaveBeenCalledTimes(1);
    });

    it('atomically removes the older transfer marker when an Issue is replaced again', async () => {
        const current = JSON.stringify({
            schemaVersion: 1, kind: 'current', issueKey: 'issue-key',
            sessionKey: 'current-key', sessionId: 'current-session',
            transferSessionKey: 'older-key', encryptedPayload: 'payload', revision: 4,
        });
        const bulkGet = vi.fn()
            .mockResolvedValueOnce([{ key: 'github-issue-session/v1/issue/issue-key', value: current, version: 8 }])
            .mockResolvedValueOnce([
                { key: 'github-issue-session/v1/session/current-key', value: current, version: 6 },
                { key: 'github-issue-session/v1/session/older-key', value: 'older-transfer', version: 3 },
            ]);
        const mutate = vi.fn(async (_mutations: GithubIssueBindingKvMutation[]) => ({
            success: true as const, results: [],
        }));
        const client = createGithubIssueBindingKvClient({
            bulkGet, list: vi.fn(async () => []), mutate,
            deriveSessionKey: vi.fn(async () => 'replacement-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => value === 'older-transfer' ? null : JSON.parse(value)),
        });

        await expect(client.replace({
            issueKey: 'issue-key', replacementSessionId: 'replacement-session',
            encryptedPayload: 'new-payload', expectedRevision: 4, requestId: 'replace-again',
        })).resolves.toEqual(expect.objectContaining({ outcome: 'replaced' }));

        const [mutations] = mutate.mock.calls[0]!;
        expect(mutations).toContainEqual({
            key: 'github-issue-session/v1/session/older-key', value: null, version: 3,
        });
        expect(JSON.parse(mutations[0]!.value!)).toEqual(expect.objectContaining({
            transferSessionKey: 'current-key',
        }));
    });

    it('replaces an unreadable Issue record without guessing the former Session', async () => {
        const bulkGet = vi.fn()
            .mockResolvedValueOnce([{
                key: 'github-issue-session/v1/issue/issue-key',
                value: 'unreadable-record',
                version: 5,
            }])
            .mockResolvedValueOnce([]);
        const mutate = vi.fn(async () => ({ success: true as const, results: [] }));
        const client = createGithubIssueBindingKvClient({
            bulkGet,
            list: vi.fn(async () => []),
            mutate,
            deriveSessionKey: vi.fn(async () => 'replacement-session-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => (
                value === 'unreadable-record' ? null : JSON.parse(value)
            )),
        });

        await expect(client.replace({
            issueKey: 'issue-key',
            replacementSessionId: 'replacement-session',
            encryptedPayload: 'new-payload',
            expectedRevision: 6,
            requestId: 'request-unreadable-repair',
        })).resolves.toEqual({
            outcome: 'replaced',
            binding: expect.objectContaining({
                sessionId: 'replacement-session',
                lastSessionId: null,
                revision: 7,
            }),
        });
        expect(mutate).toHaveBeenCalledWith([
            expect.objectContaining({
                key: 'github-issue-session/v1/issue/issue-key', version: 5,
            }),
            expect.objectContaining({
                key: 'github-issue-session/v1/session/replacement-session-key', version: -1,
            }),
        ]);
    });

    it('refreshes the Issue and current Session directions in one mutation', async () => {
        const current = JSON.stringify({
            schemaVersion: 1,
            kind: 'current',
            issueKey: 'issue-key',
            sessionKey: 'session-key',
            sessionId: 'session-on-macos',
            encryptedPayload: 'old-payload',
            revision: 2,
        });
        const bulkGet = vi.fn(async () => [{
            key: 'github-issue-session/v1/issue/issue-key',
            value: current,
            version: 4,
        }, {
            key: 'github-issue-session/v1/session/session-key',
            value: current,
            version: 6,
        }]);
        const mutate = vi.fn(async (_mutations: GithubIssueBindingKvMutation[]) => ({
            success: true as const,
            results: [],
        }));
        const client = createGithubIssueBindingKvClient({
            bulkGet,
            list: vi.fn(async () => []),
            mutate,
            deriveSessionKey: vi.fn(async () => 'session-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });

        await expect(client.refresh({
            issueKey: 'issue-key',
            encryptedPayload: 'new-payload',
            expectedRevision: 2,
            requestId: 'request-2',
        })).resolves.toEqual(expect.objectContaining({
            outcome: 'refreshed',
            binding: expect.objectContaining({ revision: 3 }),
        }));
        expect(mutate).toHaveBeenCalledWith([
            expect.objectContaining({
                key: 'github-issue-session/v1/issue/issue-key', version: 4,
            }),
            expect.objectContaining({
                key: 'github-issue-session/v1/session/session-key', version: 6,
            }),
        ]);
        const [mutations] = mutate.mock.calls[0]!;
        expect(mutations[0].value).toBe(mutations[1].value);
        expect(JSON.parse(mutations[0].value!)).toEqual(expect.objectContaining({
            encryptedPayload: 'new-payload', revision: 3,
        }));
    });

    it('marks both directions repair-required after the first dispatch fails', async () => {
        const current = JSON.stringify({
            schemaVersion: 1,
            kind: 'current',
            issueKey: 'issue-key',
            sessionKey: 'session-key',
            sessionId: 'abandoned-session',
            transferSessionKey: 'former-transfer-key',
            encryptedPayload: 'payload',
            revision: 1,
        });
        const bulkGet = vi.fn(async () => [{
            key: 'github-issue-session/v1/issue/issue-key',
            value: current,
            version: 2,
        }, {
            key: 'github-issue-session/v1/session/session-key',
            value: current,
            version: 9,
        }]);
        const mutate = vi.fn(async (_mutations: GithubIssueBindingKvMutation[]) => ({
            success: true as const,
            results: [],
        }));
        const client = createGithubIssueBindingKvClient({
            bulkGet,
            list: vi.fn(async () => []),
            mutate,
            deriveSessionKey: vi.fn(async () => 'session-key'),
            encryptRecord: vi.fn(async (record) => JSON.stringify(record)),
            decryptRecord: vi.fn(async (value) => JSON.parse(value)),
        });

        await expect(client.abandonFirstDispatch({
            issueKey: 'issue-key',
            abandonedSessionId: 'abandoned-session',
            expectedRevision: 1,
            requestId: 'failed-dispatch',
        })).resolves.toEqual({
            outcome: 'repair-required',
            binding: expect.objectContaining({
                sessionId: null,
                lastSessionId: 'abandoned-session',
                revision: 2,
                status: 'repair-required',
            }),
        });
        expect(mutate).toHaveBeenCalledWith([
            expect.objectContaining({
                key: 'github-issue-session/v1/issue/issue-key', version: 2,
            }),
            expect.objectContaining({
                key: 'github-issue-session/v1/session/session-key', version: 9,
            }),
        ]);
        const [mutations] = mutate.mock.calls[0]!;
        expect(mutations[0].value).toBe(mutations[1].value);
        expect(JSON.parse(mutations[0].value!)).toEqual(expect.objectContaining({
            kind: 'repair-required', sessionId: 'abandoned-session',
            transferSessionKey: 'former-transfer-key', revision: 2,
        }));
    });
});
