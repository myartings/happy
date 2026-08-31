export interface GithubIssueBindingInvalidation {
    issueKeys: string[];
}

const listeners = new Set<(event: GithubIssueBindingInvalidation) => void>();

export function subscribeGithubIssueBindingInvalidation(
    listener: (event: GithubIssueBindingInvalidation) => void,
): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function publishGithubIssueBindingInvalidation(event: GithubIssueBindingInvalidation): void {
    for (const listener of listeners) listener(event);
}
