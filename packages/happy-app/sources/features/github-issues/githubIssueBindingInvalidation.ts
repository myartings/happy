export interface GithubIssueBindingInvalidation {
    issueKeys: string[];
}

const listeners = new Set<(event: GithubIssueBindingInvalidation) => void>();
let missedInvalidationEpoch = 0;

export function getGithubIssueBindingMissedInvalidationEpoch(): number {
    return missedInvalidationEpoch;
}

export function subscribeGithubIssueBindingInvalidation(
    listener: (event: GithubIssueBindingInvalidation) => void,
): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function publishGithubIssueBindingInvalidation(event: GithubIssueBindingInvalidation): void {
    for (const listener of listeners) listener(event);
}

export function publishGithubIssueBindingInvalidationIfEnabled(
    enabled: boolean,
    event: GithubIssueBindingInvalidation,
): void {
    if (!enabled) {
        missedInvalidationEpoch += 1;
        return;
    }
    publishGithubIssueBindingInvalidation(event);
}
