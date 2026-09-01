import type { GithubIssueBindingIntent } from './githubIssueBindingIdentity';
import type { GithubIssueBindingClient } from './githubIssueBindingTypes';

/**
 * Prepares the explicit exceptional transfer path for a canonical Session
 * that still exists but is permanently unavailable or intentionally
 * abandoned. The later mutation remains revision-safe and separately asks
 * for exact old/new/Issue confirmation once the replacement Session is known.
 */
export async function prepareGithubIssueExceptionalReplacement(
    client: GithubIssueBindingClient,
    intent: GithubIssueBindingIntent,
): Promise<GithubIssueBindingIntent> {
    const resolved = await client.resolve(intent.issueKey);
    if (resolved.outcome === 'unbound' || !resolved.binding.sessionId) {
        throw new Error('A current canonical Session is required for exceptional replacement');
    }
    return {
        ...intent,
        operation: 'replace',
        expectedRevision: resolved.binding.revision,
        formerSessionId: resolved.binding.sessionId,
    };
}

/**
 * Applies an existing-Session claim or replacement with one idempotent replay.
 * A transport failure can mean the mutation committed but its acknowledgement
 * was lost, so callers must let the authority receipt decide before touching
 * the Session draft.
 */
export async function mutateGithubIssueBindingForExistingSession(
    client: GithubIssueBindingClient,
    intent: GithubIssueBindingIntent,
    sessionId: string,
) {
    const request = () => intent.operation === 'replace'
        ? client.replace({
            accountScope: intent.accountScope,
            issueKey: intent.issueKey,
            encryptedPayload: intent.encryptedPayload,
            requestId: intent.requestId,
            expectedRevision: intent.expectedRevision!,
            replacementSessionId: sessionId,
        })
        : client.claim({
            accountScope: intent.accountScope,
            issueKey: intent.issueKey,
            encryptedPayload: intent.encryptedPayload,
            requestId: intent.requestId,
            candidateSessionId: sessionId,
        });
    let result: Awaited<ReturnType<typeof request>>;
    try {
        result = await request();
    } catch {
        result = await request();
    }
    if (
        (result.outcome === 'revision-conflict' || result.outcome === 'session-conflict')
        && result.binding.issueKey === intent.issueKey
        && result.binding.sessionId === sessionId
    ) {
        return {
            outcome: intent.operation === 'replace' ? 'replaced' as const : 'resumed' as const,
            binding: result.binding,
        };
    }
    return result;
}
