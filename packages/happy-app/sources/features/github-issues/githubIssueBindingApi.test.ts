import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    createDependencies: vi.fn(),
    getAvailability: vi.fn(),
}));

vi.mock('./githubIssueBindingTransport', () => ({
    createPlatformGithubIssueBindingKvDependencies: mocks.createDependencies,
}));
vi.mock('./githubIssueBindingSessionAvailability', () => ({
    getGithubIssueBindingSessionAvailability: mocks.getAvailability,
}));

import { githubIssueBindingApi } from './githubIssueBindingApi';

describe('GitHub Issue binding platform API', () => {
    it('coordinates a claim through the official KV adapter, not a dedicated route', async () => {
        const mutate = vi.fn(async () => ({ success: true as const, results: [] }));
        mocks.createDependencies.mockResolvedValue({
            bulkGet: vi.fn(async () => []),
            list: vi.fn(async () => []),
            mutate,
            deriveSessionKey: vi.fn(async () => 'session-key'),
            encryptRecord: vi.fn(async () => 'encrypted-record'),
            decryptRecord: vi.fn(async () => null),
        });

        await expect(githubIssueBindingApi.claim({
            accountScope: 'account-scope',
            issueKey: 'issue-key',
            candidateSessionId: 'session-1',
            encryptedPayload: 'payload',
            requestId: 'request-1',
        })).resolves.toEqual(expect.objectContaining({ outcome: 'claimed' }));

        expect(mocks.createDependencies).toHaveBeenCalledTimes(1);
        expect(mutate).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['archived', 'archived-session'],
        ['missing', 'deleted-session'],
    ] as const)('enriches resolved bindings with %s synced Session availability', async (availability, sessionId) => {
        const current = {
            schemaVersion: 1 as const,
            kind: 'current' as const,
            issueKey: 'issue-key',
            sessionKey: 'session-key',
            sessionId,
            encryptedPayload: 'payload',
            revision: 2,
        };
        mocks.getAvailability.mockReturnValue(availability);
        mocks.createDependencies.mockResolvedValue({
            bulkGet: vi.fn(async () => [{
                key: 'github-issue-session/v1/issue/issue-key',
                value: 'encrypted-record',
                version: 1,
            }]),
            list: vi.fn(async () => []),
            mutate: vi.fn(),
            deriveSessionKey: vi.fn(async () => 'session-key'),
            encryptRecord: vi.fn(),
            decryptRecord: vi.fn(async () => current),
        });

        await expect(githubIssueBindingApi.resolve('issue-key')).resolves.toEqual({
            outcome: 'bound',
            binding: expect.objectContaining({ sessionId, sessionAvailability: availability }),
        });
    });
});
