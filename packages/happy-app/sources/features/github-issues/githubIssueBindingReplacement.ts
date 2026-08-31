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
