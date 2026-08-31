import { beforeAll, describe, expect, it, vi } from 'vitest';
import sodium from 'libsodium-wrappers';

vi.mock('expo-crypto', async () => {
    const { createHash, randomBytes } = await import('node:crypto');
    return {
        CryptoDigestAlgorithm: { SHA512: 'SHA-512' },
        digest: async (_algorithm: string, data: Uint8Array) => {
            const value = createHash('sha512').update(data).digest();
            return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
        },
        getRandomBytes: (length: number) => new Uint8Array(randomBytes(length)),
    };
});

vi.mock('@/encryption/libsodium.lib', () => ({
    default: sodium,
}));

import { encodeUTF8 } from '@/encryption/text';
import {
    decryptAndValidateGithubIssueBindingPayload,
    decryptGithubIssueBindingRecord,
    decryptGithubIssueBindingPayload,
    deriveGithubIssueBindingAccountScope,
    deriveGithubIssueBindingKey,
    deriveGithubIssueBindingSessionKey,
    encryptGithubIssueBindingRecord,
    encryptGithubIssueBindingPayload,
    type GithubIssueBindingIdentity,
} from './githubIssueBindingIdentity';

beforeAll(async () => {
    await sodium.ready;
});

describe('deriveGithubIssueBindingKey', () => {
    it('derives a stable opaque account scope that differs across accounts', async () => {
        const first = encodeUTF8('first-account-master-secret');
        const second = encodeUTF8('second-account-master-secret');

        await expect(deriveGithubIssueBindingAccountScope(first))
            .resolves.toBe(await deriveGithubIssueBindingAccountScope(first));
        await expect(deriveGithubIssueBindingAccountScope(first))
            .resolves.not.toBe(await deriveGithubIssueBindingAccountScope(second));
    });
    it('derives the same opaque key on two devices for the same account and stable Issue identity', async () => {
        const identity: GithubIssueBindingIdentity = {
            schemaVersion: 1,
            provider: 'github',
            host: 'github.com',
            repositoryId: '987654321',
            issueNodeId: 'I_kwDO_PRIVATE_NODE',
        };
        const accountMasterSecret = encodeUTF8('deterministic-account-master-secret');

        const deviceOne = await deriveGithubIssueBindingKey(accountMasterSecret, identity);
        const deviceTwo = await deriveGithubIssueBindingKey(accountMasterSecret, {
            ...identity,
            host: 'GITHUB.COM',
        });

        expect(deviceOne).toBe(deviceTwo);
        expect(deviceOne).toMatch(/^[0-9a-f]{64}$/);
        expect(deviceOne).not.toContain(identity.repositoryId);
        expect(deviceOne).not.toContain(identity.issueNodeId);
    });

    it('encrypts human-readable Issue snapshots with a separate account key', async () => {
        const accountMasterSecret = encodeUTF8('deterministic-account-master-secret');
        const payload = {
            schemaVersion: 1 as const,
            identity: {
                schemaVersion: 1 as const,
                provider: 'github' as const,
                host: 'github.com',
                repositoryId: '987654321',
                issueNodeId: 'I_kwDO_PRIVATE_NODE',
            },
            ownerSnapshot: 'private-owner',
            repositorySnapshot: 'private-repository',
            number: 79,
            urlSnapshot: 'https://github.com/private-owner/private-repository/issues/79',
            titleSnapshot: 'Private roadmap title',
            observedIssueUpdatedAt: '2026-08-31T01:28:16Z',
        };

        const encrypted = await encryptGithubIssueBindingPayload(accountMasterSecret, payload);

        expect(encrypted).not.toContain(payload.ownerSnapshot);
        expect(encrypted).not.toContain(payload.repositorySnapshot);
        expect(encrypted).not.toContain(payload.titleSnapshot);
        await expect(decryptGithubIssueBindingPayload(accountMasterSecret, encrypted))
            .resolves.toEqual(payload);
    });

    it('rejects authenticated payloads whose stable identity does not match the opaque authority key', async () => {
        const accountMasterSecret = encodeUTF8('deterministic-account-master-secret');
        const payload = {
            schemaVersion: 1 as const,
            identity: {
                schemaVersion: 1 as const, provider: 'github' as const, host: 'github.com',
                repositoryId: '987654321', issueNodeId: 'I_issue_b',
            },
            ownerSnapshot: 'private-owner', repositorySnapshot: 'private-repository', number: 80,
            urlSnapshot: 'https://github.com/private-owner/private-repository/issues/80',
            titleSnapshot: 'Issue B', observedIssueUpdatedAt: '2026-08-31T01:28:16Z',
        };
        const issueAKey = await deriveGithubIssueBindingKey(accountMasterSecret, {
            ...payload.identity,
            issueNodeId: 'I_issue_a',
        });
        const issueBKey = await deriveGithubIssueBindingKey(accountMasterSecret, payload.identity);
        const encrypted = await encryptGithubIssueBindingPayload(accountMasterSecret, payload);

        await expect(decryptAndValidateGithubIssueBindingPayload(accountMasterSecret, encrypted, issueAKey))
            .resolves.toBeNull();
        await expect(decryptAndValidateGithubIssueBindingPayload(accountMasterSecret, encrypted, issueBKey))
            .resolves.toEqual(payload);
    });

    it('rejects authenticated but incomplete payload schemas', async () => {
        const accountMasterSecret = encodeUTF8('deterministic-account-master-secret');
        const encrypted = await encryptGithubIssueBindingPayload(accountMasterSecret, {
            schemaVersion: 1,
            identity: {
                schemaVersion: 1, provider: 'github', host: 'github.com',
                repositoryId: '987654321', issueNodeId: 'I_issue_a',
            },
        } as never);

        await expect(decryptGithubIssueBindingPayload(accountMasterSecret, encrypted)).resolves.toBeNull();
    });

    it('keeps the Session direction and complete association record opaque', async () => {
        const accountMasterSecret = encodeUTF8('deterministic-account-master-secret');
        const first = await deriveGithubIssueBindingSessionKey(
            accountMasterSecret,
            'session-on-windows',
        );
        const second = await deriveGithubIssueBindingSessionKey(
            accountMasterSecret,
            'session-on-windows',
        );
        const record = {
            schemaVersion: 1 as const,
            kind: 'current' as const,
            issueKey: 'a'.repeat(64),
            sessionKey: first,
            sessionId: 'session-on-windows',
            encryptedPayload: 'encrypted-issue-payload',
            revision: 1,
        };

        expect(first).toBe(second);
        expect(first).toMatch(/^[0-9a-f]{64}$/);
        expect(first).not.toContain(record.sessionId);
        const encrypted = await encryptGithubIssueBindingRecord(
            accountMasterSecret,
            record,
        );
        expect(encrypted).not.toContain(record.sessionId);
        expect(encrypted).not.toContain(record.issueKey);
        await expect(decryptGithubIssueBindingRecord(accountMasterSecret, encrypted))
            .resolves.toEqual(record);
    });
});
