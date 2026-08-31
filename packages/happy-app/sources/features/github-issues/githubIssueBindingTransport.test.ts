import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getCredentials: vi.fn(),
    deriveAccountScope: vi.fn(),
    deriveSessionKey: vi.fn(),
    encryptRecord: vi.fn(),
    decryptRecord: vi.fn(),
    kvBulkGet: vi.fn(),
    kvList: vi.fn(),
    kvMutate: vi.fn(),
}));

vi.mock('@/auth/tokenStorage', () => ({
    TokenStorage: { getCredentials: mocks.getCredentials },
}));
vi.mock('@/encryption/base64', () => ({ decodeBase64: () => new Uint8Array([1, 2, 3]) }));
vi.mock('@/sync/apiKv', () => ({
    kvBulkGet: mocks.kvBulkGet,
    kvList: mocks.kvList,
    kvMutate: mocks.kvMutate,
}));
vi.mock('./githubIssueBindingIdentity', () => ({
    deriveGithubIssueBindingAccountScope: mocks.deriveAccountScope,
    deriveGithubIssueBindingSessionKey: mocks.deriveSessionKey,
    encryptGithubIssueBindingRecord: mocks.encryptRecord,
    decryptGithubIssueBindingRecord: mocks.decryptRecord,
}));

import {
    createPlatformGithubIssueBindingKvDependencies,
} from './githubIssueBindingTransport';

describe('GitHub Issue binding transport account generation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.deriveAccountScope.mockResolvedValue('a'.repeat(64));
    });

    it('binds official KV operations and record crypto to one account generation', async () => {
        const credentials = { token: 'token-a', secret: 'secret-a' };
        mocks.getCredentials.mockResolvedValue(credentials);
        mocks.deriveSessionKey.mockResolvedValue('session-key');
        mocks.encryptRecord.mockResolvedValue('ciphertext');
        mocks.decryptRecord.mockResolvedValue(null);
        mocks.kvBulkGet.mockResolvedValue({ values: [] });
        mocks.kvList.mockResolvedValue({ items: [] });
        mocks.kvMutate.mockResolvedValue({ success: true, results: [] });

        const dependencies = await createPlatformGithubIssueBindingKvDependencies();
        await dependencies.bulkGet(['issue-key']);
        await dependencies.mutate([{ key: 'issue-key', value: 'ciphertext', version: -1 }]);

        expect(mocks.kvBulkGet).toHaveBeenCalledWith(credentials, ['issue-key']);
        expect(mocks.kvMutate).toHaveBeenCalledWith(credentials, [
            { key: 'issue-key', value: 'ciphertext', version: -1 },
        ]);
    });

    it('rejects dependencies when the intent belongs to another account scope', async () => {
        mocks.getCredentials.mockResolvedValue({ token: 'token-a', secret: 'secret-a' });
        mocks.deriveAccountScope.mockResolvedValue('a'.repeat(64));

        await expect(createPlatformGithubIssueBindingKvDependencies(
            'b'.repeat(64),
        )).rejects.toThrow('account changed');
    });

    it('rejects an operation if the account generation changes in flight', async () => {
        const credentialsA = { token: 'token-a', secret: 'secret-a' };
        const credentialsB = { token: 'token-b', secret: 'secret-b' };
        mocks.getCredentials
            .mockResolvedValueOnce(credentialsA)
            .mockResolvedValueOnce(credentialsA)
            .mockResolvedValueOnce(credentialsB);
        mocks.kvBulkGet.mockResolvedValue({ values: [] });
        const dependencies = await createPlatformGithubIssueBindingKvDependencies();

        await expect(dependencies.bulkGet(['issue-key'])).rejects.toThrow('account changed');
    });

    it('uses the official maximum and fails closed instead of truncating a full page', async () => {
        const credentials = { token: 'token-a', secret: 'secret-a' };
        mocks.getCredentials.mockResolvedValue(credentials);
        mocks.kvList.mockResolvedValue({
            items: Array.from({ length: 1000 }, (_, index) => ({
                key: `key-${index}`, value: 'ciphertext', version: 0,
            })),
        });
        const dependencies = await createPlatformGithubIssueBindingKvDependencies();

        await expect(dependencies.list('github-issue-session/v1/issue/'))
            .rejects.toThrow('capacity exceeded');
        expect(mocks.kvList).toHaveBeenCalledWith(credentials, {
            prefix: 'github-issue-session/v1/issue/', limit: 1000,
        });
    });
});
