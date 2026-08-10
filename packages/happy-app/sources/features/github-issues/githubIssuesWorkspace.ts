import type { GithubRepositoryRef } from './githubRepository';

export type GithubIssuesWorkspaceMode = 'list' | 'detail' | 'new';

export type GithubIssuesWorkspaceSelection = {
    repository: GithubRepositoryRef;
    mode: GithubIssuesWorkspaceMode;
    issueNumber?: number;
};

const selectionsBySession = new Map<string, GithubIssuesWorkspaceSelection>();

export function getGithubIssuesWorkspaceSelection(sessionId: string): GithubIssuesWorkspaceSelection | null {
    return selectionsBySession.get(sessionId) ?? null;
}

export function rememberGithubIssuesWorkspaceSelection(
    sessionId: string,
    selection: GithubIssuesWorkspaceSelection,
): void {
    selectionsBySession.set(sessionId, selection);
}

export function clearGithubIssuesWorkspaceMemory(): void {
    selectionsBySession.clear();
}

export function selectGithubIssue(
    repository: GithubRepositoryRef,
    issueNumber: number,
): GithubIssuesWorkspaceSelection {
    return { repository, issueNumber, mode: 'detail' };
}

export function createGithubIssueInWorkspace(
    repository: GithubRepositoryRef,
): GithubIssuesWorkspaceSelection {
    return { repository, mode: 'new' };
}
