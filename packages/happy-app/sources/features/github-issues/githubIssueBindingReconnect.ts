import { refreshGithubIssueSessionProjections } from './githubIssueBindingStore';

export function reconcileGithubIssueBindingsAfterReconnect(
    enabled: boolean,
    refresh: () => Promise<void> = refreshGithubIssueSessionProjections,
): Promise<void> {
    return enabled ? refresh() : Promise.resolve();
}
