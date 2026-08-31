import type { GithubIssueBindingPayload } from './githubIssueBindingIdentity';

export function prepareGithubIssueAgentContextRefreshDraft(
    existingDraft: string | null | undefined,
    payload: GithubIssueBindingPayload,
): string {
    const prompt = [
        'Refresh the Agent task context before continuing:',
        `- Re-read GitHub Issue ${payload.ownerSnapshot}/${payload.repositorySnapshot}#${payload.number}: ${payload.urlSnapshot}`,
        `- Latest observed title: ${payload.titleSnapshot}`,
        `- Latest observed Issue update: ${payload.observedIssueUpdatedAt}`,
        '- Reconcile the current implementation plan with the updated Issue before making further changes.',
    ].join('\n');
    const current = existingDraft?.trim();
    return current ? `${current}\n\n${prompt}` : prompt;
}
