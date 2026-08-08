import type { AuthCredentials } from '@/auth/tokenStorage';
import { getServerUrl } from '@/sync/serverConfig';
import { getHappyClientId } from '@/sync/apiSocket';

export type GithubIssueState = 'open' | 'closed';
export interface GithubRepository { id: number; owner: string; name: string; fullName: string; private: boolean; url: string }
export interface GithubIssue {
    number: number; nodeId: string; title: string; body: string | null; state: GithubIssueState;
    url: string; updatedAt: string; comments: number; viewerCanDelete: boolean;
    author: { login: string; avatarUrl: string } | null; labels: Array<{ name: string; color: string }>;
}

export class GithubIssuesApiError extends Error {
    constructor(message: string, readonly code: string, readonly status: number) { super(message); }
}

async function request<T>(credentials: AuthCredentials, path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${getServerUrl()}${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${credentials.token}`,
            'Content-Type': 'application/json',
            'X-Happy-Client': getHappyClientId(),
            ...init?.headers,
        },
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string; error?: string } | null;
        throw new GithubIssuesApiError(
            payload?.message ?? payload?.error ?? `GitHub Issues request failed (${response.status})`,
            payload?.error ?? 'github_issues_error',
            response.status,
        );
    }
    return response.json() as Promise<T>;
}

const repoPath = (owner: string, repo: string) => `/v1/github-issues/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

export const githubIssuesApi = {
    repositories: (credentials: AuthCredentials) => request<{ repositories: GithubRepository[]; installationUrl: string | null }>(credentials, '/v1/github-issues/repositories'),
    list: (credentials: AuthCredentials, owner: string, repo: string, state: GithubIssueState) =>
        request<{ items: GithubIssue[]; nextPage: number | null }>(credentials, `${repoPath(owner, repo)}/issues?state=${state}&page=1`),
    get: (credentials: AuthCredentials, owner: string, repo: string, number: number) =>
        request<GithubIssue>(credentials, `${repoPath(owner, repo)}/issues/${number}`),
    create: (credentials: AuthCredentials, owner: string, repo: string, title: string, body: string) =>
        request<GithubIssue>(credentials, `${repoPath(owner, repo)}/issues`, { method: 'POST', body: JSON.stringify({ title, body }) }),
    setState: (credentials: AuthCredentials, owner: string, repo: string, number: number, state: GithubIssueState) =>
        request<GithubIssue>(credentials, `${repoPath(owner, repo)}/issues/${number}`, { method: 'PATCH', body: JSON.stringify({ state }) }),
    delete: (credentials: AuthCredentials, owner: string, repo: string, number: number) =>
        request<{ success: true }>(credentials, `${repoPath(owner, repo)}/issues/${number}`, { method: 'DELETE' }),
};
