export function isGithubIssueBindingAccountGenerationCurrent(
    expectedToken: string,
    currentToken: string | null | undefined,
) {
    return !!currentToken && currentToken === expectedToken;
}

export function isGithubIssueBindingCacheOwnedByAccount(
    cachedAccountScope: string,
    currentAccountScope: string,
) {
    return cachedAccountScope === currentAccountScope;
}
