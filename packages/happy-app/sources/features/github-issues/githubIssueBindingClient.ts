import { z } from 'zod';

export const GITHUB_ISSUE_BINDING_CAPABILITY = 'github-issue-session-binding-v1' as const;

export const GithubIssueCanonicalBindingSchema = z.object({
    id: z.string().min(1),
    accountId: z.string().min(1),
    issueKey: z.string().regex(/^[a-f0-9]{64}$/),
    sessionId: z.string().min(1).nullable(),
    lastSessionId: z.string().min(1).nullable().optional(),
    encryptedPayload: z.string().min(1),
    revision: z.number().int().positive(),
    status: z.enum(['bound', 'repair-required']),
    sessionAvailability: z.enum(['active', 'archived', 'missing']).optional(),
}).strict();

const resolveResult = z.union([
    z.object({ outcome: z.literal('unbound') }).strict(),
    z.object({
        outcome: z.enum(['bound', 'repair-required']),
        binding: GithubIssueCanonicalBindingSchema,
    }).strict(),
]);
const mutationResult = z.union([
    z.object({ outcome: z.enum(['claimed', 'resumed', 'replaced', 'repair-required', 'session-conflict', 'revision-conflict']), binding: GithubIssueCanonicalBindingSchema }).strict(),
    z.object({ outcome: z.enum(['not-found', 'request-conflict']) }).strict(),
]);
const refreshResult = z.union([
    z.object({ outcome: z.enum(['refreshed', 'revision-conflict']), binding: GithubIssueCanonicalBindingSchema }).strict(),
    z.object({ outcome: z.enum(['not-found', 'request-conflict']) }).strict(),
]);
const abandonResult = z.union([
    z.object({ outcome: z.literal('repair-required'), binding: GithubIssueCanonicalBindingSchema }).strict(),
    z.object({ outcome: z.literal('revision-conflict'), binding: GithubIssueCanonicalBindingSchema }).strict(),
    z.object({ outcome: z.literal('not-found') }).strict(),
    z.object({ outcome: z.literal('request-conflict') }).strict(),
]);
export const GithubIssueBindingHistoryEntrySchema = z.object({
    issueKey: z.string().regex(/^[a-f0-9]{64}$/),
    formerSessionId: z.string().min(1),
    encryptedPayload: z.string().min(1),
    revision: z.number().int().positive(),
}).strict();

export interface GithubIssueBindingTransport {
    request(path: 'list' | 'history' | 'resolve' | 'claim' | 'replace' | 'refresh' | 'abandon-first-dispatch', body: Record<string, unknown>): Promise<unknown>;
}

export function createGithubIssueBindingClient(transport: GithubIssueBindingTransport) {
    return {
        async list() {
            return z.array(GithubIssueCanonicalBindingSchema).parse(await transport.request('list', {
                capability: GITHUB_ISSUE_BINDING_CAPABILITY,
            }));
        },
        async history() {
            return z.array(GithubIssueBindingHistoryEntrySchema).parse(await transport.request('history', {
                capability: GITHUB_ISSUE_BINDING_CAPABILITY,
            }));
        },
        async resolve(issueKey: string) {
            return resolveResult.parse(await transport.request('resolve', {
                capability: GITHUB_ISSUE_BINDING_CAPABILITY,
                issueKey,
            }));
        },
        async claim(input: {
            accountScope?: string;
            issueKey: string;
            candidateSessionId: string;
            encryptedPayload: string;
            requestId: string;
        }) {
            return mutationResult.parse(await transport.request('claim', {
                capability: GITHUB_ISSUE_BINDING_CAPABILITY,
                ...input,
            }));
        },
        async replace(input: {
            accountScope?: string;
            issueKey: string;
            replacementSessionId: string;
            encryptedPayload: string;
            expectedRevision: number;
            requestId: string;
        }) {
            return mutationResult.parse(await transport.request('replace', {
                capability: GITHUB_ISSUE_BINDING_CAPABILITY,
                ...input,
            }));
        },
        async refresh(input: {
            accountScope?: string;
            issueKey: string;
            encryptedPayload: string;
            expectedRevision: number;
            requestId: string;
        }) {
            return refreshResult.parse(await transport.request('refresh', {
                capability: GITHUB_ISSUE_BINDING_CAPABILITY,
                ...input,
            }));
        },
        async abandonFirstDispatch(input: {
            accountScope?: string;
            issueKey: string;
            abandonedSessionId: string;
            expectedRevision: number;
            requestId: string;
        }) {
            return abandonResult.parse(await transport.request('abandon-first-dispatch', {
                capability: GITHUB_ISSUE_BINDING_CAPABILITY,
                ...input,
            }));
        },
    };
}

export type GithubIssueCanonicalBinding = z.infer<typeof GithubIssueCanonicalBindingSchema>;
export type GithubIssueBindingHistoryEntry = z.infer<typeof GithubIssueBindingHistoryEntrySchema>;
