import type { GithubIssueCanonicalBinding } from './githubIssueBindingClient';
import type { GithubIssueBindingClient } from './githubIssueBindingTypes';

export type GithubIssueBindingDispatchResolution =
    | { kind: 'loading' }
    | { kind: 'binding' }
    | { kind: 'unbound' }
    | { kind: 'continue'; sessionId: string }
    | { kind: 'restore'; sessionId: string }
    | { kind: 'offline'; sessionId: string }
    | { kind: 'conflict' }
    | { kind: 'repair-required'; expectedRevision: number; formerSessionId: string | null }
    | { kind: 'unavailable' };

export function getGithubIssueBindingDispatchActionKey(resolution: GithubIssueBindingDispatchResolution) {
    switch (resolution.kind) {
        case 'loading': return 'githubIssues.checkingSession' as const;
        case 'binding': return 'githubIssues.bindingSession' as const;
        case 'continue': return 'githubIssues.continueSession' as const;
        case 'restore': return 'githubIssues.restoreSession' as const;
        case 'offline': return 'githubIssues.openCachedSession' as const;
        case 'repair-required': return 'githubIssues.repairSession' as const;
        case 'conflict': return 'githubIssues.bindingConflict' as const;
        case 'unavailable': return 'githubIssues.bindingOffline' as const;
        default: return 'githubIssues.workOnIssue' as const;
    }
}

export async function resolveGithubIssueBindingDispatch(
    client: GithubIssueBindingClient,
    issueKey: string,
    getCachedCanonicalSessionId?: (issueKey: string) => string | null,
    validateBindingEvidence?: (binding: GithubIssueCanonicalBinding) => Promise<boolean>,
): Promise<GithubIssueBindingDispatchResolution> {
    try {
        const result = await client.resolve(issueKey);
        if (result.outcome === 'unbound') return { kind: 'unbound' };
        if (validateBindingEvidence && !await validateBindingEvidence(result.binding)) {
            return {
                kind: 'repair-required',
                expectedRevision: result.binding.revision,
                formerSessionId: result.binding.lastSessionId ?? result.binding.sessionId ?? null,
            };
        }
        if (result.outcome === 'repair-required' || !result.binding.sessionId) {
            return {
                kind: 'repair-required',
                expectedRevision: result.binding.revision,
                formerSessionId: result.binding.lastSessionId ?? null,
            };
        }
        if (result.binding.sessionAvailability === 'missing') {
            return {
                kind: 'repair-required',
                expectedRevision: result.binding.revision,
                formerSessionId: result.binding.lastSessionId ?? result.binding.sessionId,
            };
        }
        if (result.binding.sessionAvailability === 'archived') {
            return { kind: 'restore', sessionId: result.binding.sessionId };
        }
        return { kind: 'continue', sessionId: result.binding.sessionId };
    } catch {
        const cachedSessionId = getCachedCanonicalSessionId?.(issueKey);
        if (cachedSessionId) return { kind: 'offline', sessionId: cachedSessionId };
        return { kind: 'unavailable' };
    }
}
