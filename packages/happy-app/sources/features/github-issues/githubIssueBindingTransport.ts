import { TokenStorage } from '@/auth/tokenStorage';
import { decodeBase64 } from '@/encryption/base64';
import { deriveGithubIssueBindingAccountScope } from './githubIssueBindingIdentity';
import {
    decryptGithubIssueBindingRecord,
    deriveGithubIssueBindingSessionKey,
    encryptGithubIssueBindingRecord,
} from './githubIssueBindingIdentity';
import { kvBulkGet, kvList, kvMutate } from '@/sync/apiKv';
import type { GithubIssueBindingKvDependencies } from './githubIssueBindingKvClient';

const GITHUB_ISSUE_BINDING_KV_LIST_LIMIT = 1000;

export async function createPlatformGithubIssueBindingKvDependencies(
    expectedAccountScope?: string,
): Promise<GithubIssueBindingKvDependencies> {
    const credentials = await TokenStorage.getCredentials();
    if (!credentials) throw new Error('GitHub Issue binding KV unavailable');
    const accountMasterSecret = decodeBase64(credentials.secret, 'base64url');
    if (expectedAccountScope) {
        const actualAccountScope = await deriveGithubIssueBindingAccountScope(accountMasterSecret);
        if (actualAccountScope !== expectedAccountScope) {
            throw new Error('GitHub Issue binding account changed');
        }
    }

    const assertAccountGeneration = async () => {
        const current = await TokenStorage.getCredentials();
        if (
            current?.token !== credentials.token
            || current.secret !== credentials.secret
        ) {
            throw new Error('GitHub Issue binding account changed');
        }
    };
    const withinAccountGeneration = async <T>(operation: () => Promise<T>) => {
        await assertAccountGeneration();
        const result = await operation();
        await assertAccountGeneration();
        return result;
    };

    return {
        async bulkGet(keys) {
            return withinAccountGeneration(async () => (
                await kvBulkGet(credentials, keys)
            ).values);
        },
        async list(prefix) {
            return withinAccountGeneration(async () => {
                const items = (
                    await kvList(credentials, {
                        prefix,
                        limit: GITHUB_ISSUE_BINDING_KV_LIST_LIMIT,
                    })
                ).items;
                if (items.length >= GITHUB_ISSUE_BINDING_KV_LIST_LIMIT) {
                    throw new Error('GitHub Issue binding KV capacity exceeded');
                }
                return items;
            });
        },
        async mutate(mutations) {
            return withinAccountGeneration(() => kvMutate(credentials, mutations));
        },
        async deriveSessionKey(sessionId) {
            return withinAccountGeneration(() => deriveGithubIssueBindingSessionKey(
                accountMasterSecret,
                sessionId,
            ));
        },
        async encryptRecord(record) {
            return withinAccountGeneration(() => encryptGithubIssueBindingRecord(
                accountMasterSecret,
                record,
            ));
        },
        async decryptRecord(value) {
            return withinAccountGeneration(() => decryptGithubIssueBindingRecord(
                accountMasterSecret,
                value,
            ));
        },
    };
}
