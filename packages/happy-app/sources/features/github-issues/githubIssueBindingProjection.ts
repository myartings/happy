import type { GithubIssueBindingHistoryEntry, GithubIssueCanonicalBinding } from './githubIssueBindingClient';
import type { GithubIssueBindingPayload } from './githubIssueBindingIdentity';

export interface GithubIssueSessionProjection {
    issueKey: string;
    sessionId: string;
    revision: number;
    status: 'bound' | 'replaced' | 'repair-required';
    payload: GithubIssueBindingPayload;
}

export function selectGithubIssueSessionProjection(
    enabled: boolean,
    projection: GithubIssueSessionProjection | null,
) {
    return enabled ? projection : null;
}

export async function projectGithubIssueBindings(
    bindings: GithubIssueCanonicalBinding[],
    decrypt: (ciphertext: string, issueKey: string) => Promise<GithubIssueBindingPayload | null>,
    history: GithubIssueBindingHistoryEntry[] = [],
): Promise<Map<string, GithubIssueSessionProjection>> {
    const projected = new Map<string, GithubIssueSessionProjection>();
    for (const entry of history) {
        const payload = await decrypt(entry.encryptedPayload, entry.issueKey);
        if (!payload || payload.identity.schemaVersion !== 1 || projected.has(entry.formerSessionId)) continue;
        projected.set(entry.formerSessionId, {
            issueKey: entry.issueKey,
            sessionId: entry.formerSessionId,
            revision: entry.revision,
            status: 'replaced',
            payload,
        });
    }
    for (const binding of bindings) {
        const sessionId = binding.status === 'repair-required'
            ? binding.lastSessionId
            : binding.sessionId;
        if (!sessionId) continue;
        const payload = await decrypt(binding.encryptedPayload, binding.issueKey);
        if (!payload || payload.identity.schemaVersion !== 1) continue;
        projected.set(sessionId, {
            issueKey: binding.issueKey,
            sessionId,
            revision: binding.revision,
            status: binding.status,
            payload,
        });
    }
    return projected;
}
