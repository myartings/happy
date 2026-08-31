export function getGithubIssueSessionBadgeState(
    status: 'bound' | 'replaced' | 'repair-required',
    freshness: 'current' | 'changed' | 'unavailable' | 'identity-conflict',
) {
    if (status === 'replaced') return 'replaced' as const;
    if (status === 'repair-required') return 'repair-required' as const;
    if (freshness === 'identity-conflict') return 'identity-conflict' as const;
    if (freshness === 'unavailable') return 'cached' as const;
    if (freshness === 'changed') return 'stale' as const;
    return 'current' as const;
}

export function formatGithubIssueSessionBadgeLabel(payload: {
    ownerSnapshot: string;
    repositorySnapshot: string;
    number: number;
    titleSnapshot: string;
}): string {
    const identity = `${payload.ownerSnapshot}/${payload.repositorySnapshot}#${payload.number}`;
    const title = payload.titleSnapshot.trim();
    return title ? `${identity} · ${title}` : identity;
}
