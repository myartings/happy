import { deriveKey } from '@/encryption/deriveKey';
import { decodeBase64, encodeBase64 } from '@/encryption/base64';
import { encodeHex } from '@/encryption/hex';
import { hmac_sha512 } from '@/encryption/hmac_sha512';
import { decryptSecretBox, encryptSecretBox } from '@/encryption/libsodium';
import { encodeUTF8 } from '@/encryption/text';
import { z } from 'zod';

export const GithubIssueBindingPayloadSchema = z.object({
    schemaVersion: z.literal(1),
    identity: z.object({
        schemaVersion: z.literal(1), provider: z.literal('github'), host: z.string().min(1),
        repositoryId: z.string().min(1), issueNodeId: z.string().min(1),
    }).strict(),
    ownerSnapshot: z.string(), repositorySnapshot: z.string(), number: z.number().int().positive(),
    urlSnapshot: z.string().url(), titleSnapshot: z.string(), observedIssueUpdatedAt: z.string().datetime(),
    agentContextObservedIssueUpdatedAt: z.string().datetime().optional(),
}).strict();

const GithubIssueCurrentBindingRecordSchema = z.object({
    schemaVersion: z.literal(1),
    kind: z.literal('current'),
    issueKey: z.string().regex(/^[a-f0-9]{64}$/),
    sessionKey: z.string().regex(/^[a-f0-9]{64}$/),
    sessionId: z.string().min(1),
    transferSessionKey: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    encryptedPayload: z.string().min(1),
    revision: z.number().int().positive(),
}).strict();

const GithubIssueTransferredBindingRecordSchema = z.object({
    schemaVersion: z.literal(1),
    kind: z.literal('transferred'),
    issueKey: z.string().regex(/^[a-f0-9]{64}$/),
    sessionKey: z.string().regex(/^[a-f0-9]{64}$/),
    sessionId: z.string().min(1),
    currentSessionKey: z.string().regex(/^[a-f0-9]{64}$/),
    currentSessionId: z.string().min(1),
    encryptedPayload: z.string().min(1),
    revision: z.number().int().positive(),
}).strict();

const GithubIssueRepairBindingRecordSchema = z.object({
    schemaVersion: z.literal(1),
    kind: z.literal('repair-required'),
    issueKey: z.string().regex(/^[a-f0-9]{64}$/),
    sessionKey: z.string().regex(/^[a-f0-9]{64}$/),
    sessionId: z.string().min(1),
    transferSessionKey: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    encryptedPayload: z.string().min(1),
    revision: z.number().int().positive(),
}).strict();

export const GithubIssueBindingRecordSchema = z.discriminatedUnion('kind', [
    GithubIssueCurrentBindingRecordSchema,
    GithubIssueTransferredBindingRecordSchema,
    GithubIssueRepairBindingRecordSchema,
]);

export type GithubIssueBindingRecord = z.infer<typeof GithubIssueBindingRecordSchema>;

export interface GithubIssueBindingIdentity {
    schemaVersion: 1;
    provider: 'github';
    host: string;
    repositoryId: string;
    issueNodeId: string;
}

export interface GithubIssueBindingPayload {
    schemaVersion: 1;
    identity: GithubIssueBindingIdentity;
    ownerSnapshot: string;
    repositorySnapshot: string;
    number: number;
    urlSnapshot: string;
    titleSnapshot: string;
    observedIssueUpdatedAt: string;
    agentContextObservedIssueUpdatedAt?: string;
}

export interface GithubIssueBindingIntent {
    accountScope?: string;
    issueKey: string;
    encryptedPayload: string;
    requestId: string;
    operation: 'claim' | 'replace';
    expectedRevision?: number;
    formerSessionId?: string | null;
    issueLabel: string;
}

export async function deriveGithubIssueBindingAccountScope(accountMasterSecret: Uint8Array): Promise<string> {
    const scopeKey = await deriveKey(accountMasterSecret, 'Happy GitHub Issue Binding', ['account-scope', 'v1']);
    const digest = await hmac_sha512(scopeKey, encodeUTF8('account-scope-v1'));
    return encodeHex(digest.slice(0, 32)).toLowerCase();
}

function canonicalIssueIdentity(identity: GithubIssueBindingIdentity): string {
    return JSON.stringify([
        identity.schemaVersion,
        identity.provider,
        identity.host.toLowerCase(),
        identity.repositoryId,
        identity.issueNodeId,
    ]);
}

export async function deriveGithubIssueBindingKey(
    accountMasterSecret: Uint8Array,
    identity: GithubIssueBindingIdentity,
): Promise<string> {
    const indexKey = await deriveKey(
        accountMasterSecret,
        'Happy GitHub Issue Binding',
        ['index', 'v1'],
    );
    const digest = await hmac_sha512(
        indexKey,
        encodeUTF8(canonicalIssueIdentity(identity)),
    );
    return encodeHex(digest.slice(0, 32)).toLowerCase();
}

export async function deriveGithubIssueBindingSessionKey(
    accountMasterSecret: Uint8Array,
    sessionId: string,
): Promise<string> {
    const indexKey = await deriveKey(
        accountMasterSecret,
        'Happy GitHub Issue Binding',
        ['session-index', 'v1'],
    );
    const digest = await hmac_sha512(indexKey, encodeUTF8(sessionId));
    return encodeHex(digest.slice(0, 32)).toLowerCase();
}

async function derivePayloadKey(accountMasterSecret: Uint8Array): Promise<Uint8Array> {
    return deriveKey(
        accountMasterSecret,
        'Happy GitHub Issue Binding',
        ['payload', 'v1'],
    );
}

async function deriveRecordKey(accountMasterSecret: Uint8Array): Promise<Uint8Array> {
    return deriveKey(
        accountMasterSecret,
        'Happy GitHub Issue Binding',
        ['record', 'v1'],
    );
}

export async function encryptGithubIssueBindingRecord(
    accountMasterSecret: Uint8Array,
    record: GithubIssueBindingRecord,
): Promise<string> {
    const recordKey = await deriveRecordKey(accountMasterSecret);
    return encodeBase64(encryptSecretBox(record, recordKey), 'base64');
}

export async function decryptGithubIssueBindingRecord(
    accountMasterSecret: Uint8Array,
    encryptedRecord: string,
): Promise<GithubIssueBindingRecord | null> {
    const recordKey = await deriveRecordKey(accountMasterSecret);
    const parsed = GithubIssueBindingRecordSchema.safeParse(decryptSecretBox(
        decodeBase64(encryptedRecord, 'base64'),
        recordKey,
    ));
    return parsed.success ? parsed.data : null;
}

export async function encryptGithubIssueBindingPayload(
    accountMasterSecret: Uint8Array,
    payload: GithubIssueBindingPayload,
): Promise<string> {
    const payloadKey = await derivePayloadKey(accountMasterSecret);
    return encodeBase64(encryptSecretBox(payload, payloadKey), 'base64');
}

export async function decryptGithubIssueBindingPayload(
    accountMasterSecret: Uint8Array,
    encryptedPayload: string,
): Promise<GithubIssueBindingPayload | null> {
    const payloadKey = await derivePayloadKey(accountMasterSecret);
    const parsed = GithubIssueBindingPayloadSchema.safeParse(decryptSecretBox(
        decodeBase64(encryptedPayload, 'base64'),
        payloadKey,
    ));
    return parsed.success ? parsed.data : null;
}

export async function decryptAndValidateGithubIssueBindingPayload(
    accountMasterSecret: Uint8Array,
    encryptedPayload: string,
    expectedIssueKey: string,
): Promise<GithubIssueBindingPayload | null> {
    const payload = await decryptGithubIssueBindingPayload(accountMasterSecret, encryptedPayload);
    if (!payload) return null;
    return await deriveGithubIssueBindingKey(accountMasterSecret, payload.identity) === expectedIssueKey
        ? payload
        : null;
}

export async function createGithubIssueBindingIntent(input: {
    accountMasterSecret: Uint8Array;
    repositoryId: string;
    issueNodeId: string;
    owner: string;
    repository: string;
    number: number;
    url: string;
    title: string;
    updatedAt: string;
    requestId: string;
    host?: string;
}): Promise<GithubIssueBindingIntent> {
    const identity: GithubIssueBindingIdentity = {
        schemaVersion: 1,
        provider: 'github',
        host: input.host ?? 'github.com',
        repositoryId: input.repositoryId,
        issueNodeId: input.issueNodeId,
    };
    const payload: GithubIssueBindingPayload = {
        schemaVersion: 1,
        identity,
        ownerSnapshot: input.owner,
        repositorySnapshot: input.repository,
        number: input.number,
        urlSnapshot: input.url,
        titleSnapshot: input.title,
        observedIssueUpdatedAt: input.updatedAt,
        agentContextObservedIssueUpdatedAt: input.updatedAt,
    };
    return {
        accountScope: await deriveGithubIssueBindingAccountScope(input.accountMasterSecret),
        issueKey: await deriveGithubIssueBindingKey(input.accountMasterSecret, identity),
        encryptedPayload: await encryptGithubIssueBindingPayload(input.accountMasterSecret, payload),
        requestId: input.requestId,
        operation: 'claim',
        issueLabel: `${input.owner}/${input.repository}#${input.number}`,
    };
}
