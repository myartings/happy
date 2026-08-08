export type GithubIssueState = 'open' | 'closed';

export interface GithubIssueDto {
    number: number;
    nodeId: string;
    title: string;
    body: string | null;
    state: GithubIssueState;
    url: string;
    updatedAt: string;
    comments: number;
    author: { login: string; avatarUrl: string } | null;
    labels: Array<{ name: string; color: string }>;
    viewerCanDelete: boolean;
}

export interface GithubRepositoryDto {
    id: number;
    owner: string;
    name: string;
    fullName: string;
    private: boolean;
    url: string;
}

export interface GithubTransport {
    request<T>(token: string, method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<T>;
}

export interface GithubIssuesServiceDependencies {
    getUserToken(userId: string): Promise<string>;
    transport: GithubTransport;
}

type RawIssue = {
    number: number;
    node_id?: string;
    title: string;
    body?: string | null;
    state?: string;
    html_url?: string;
    updated_at?: string;
    comments?: number;
    user?: { login?: string; avatar_url?: string } | null;
    labels?: Array<string | { name?: string; color?: string }>;
    pull_request?: unknown;
};

function segment(value: string): string {
    if (!/^[A-Za-z0-9_.-]+$/.test(value) || value === '.' || value === '..') {
        throw new Error('Invalid GitHub repository identifier');
    }
    return encodeURIComponent(value);
}

function normalizeIssue(issue: RawIssue, viewerCanDelete = false): GithubIssueDto {
    return {
        number: issue.number,
        nodeId: issue.node_id ?? '',
        title: issue.title,
        body: issue.body ?? null,
        state: issue.state === 'closed' ? 'closed' : 'open',
        url: issue.html_url ?? '',
        updatedAt: issue.updated_at ?? '',
        comments: issue.comments ?? 0,
        author: issue.user?.login ? {
            login: issue.user.login,
            avatarUrl: issue.user.avatar_url ?? '',
        } : null,
        labels: (issue.labels ?? []).flatMap((label) => {
            if (typeof label === 'string') return [{ name: label, color: '' }];
            return label.name ? [{ name: label.name, color: label.color ?? '' }] : [];
        }),
        viewerCanDelete,
    };
}

export function createGithubIssuesService(deps: GithubIssuesServiceDependencies) {
    return {
        async listRepositories(userId: string): Promise<GithubRepositoryDto[]> {
            const token = await deps.getUserToken(userId);
            const installations = await deps.transport.request<{ installations?: Array<{ id: number }> }>(
                token, 'GET', '/user/installations?per_page=100',
            );
            const repositories = await Promise.all((installations.installations ?? []).map(async (installation) => {
                const result = await deps.transport.request<{ repositories?: Array<{
                    id: number;
                    owner?: { login?: string };
                    name: string;
                    full_name: string;
                    private?: boolean;
                    html_url?: string;
                }> }>(token, 'GET', `/user/installations/${installation.id}/repositories?per_page=100`);
                return result.repositories ?? [];
            }));
            const unique = new Map<number, GithubRepositoryDto>();
            for (const repository of repositories.flat()) {
                const owner = repository.owner?.login ?? repository.full_name.split('/')[0] ?? '';
                unique.set(repository.id, {
                    id: repository.id,
                    owner,
                    name: repository.name,
                    fullName: repository.full_name,
                    private: repository.private ?? false,
                    url: repository.html_url ?? '',
                });
            }
            return [...unique.values()].sort((a, b) => a.fullName.localeCompare(b.fullName));
        },
        async listIssues(userId: string, input: {
            owner: string;
            repo: string;
            state: GithubIssueState;
            page: number;
        }): Promise<{ items: GithubIssueDto[]; nextPage: number | null }> {
            const token = await deps.getUserToken(userId);
            const page = Math.max(1, Math.floor(input.page));
            const path = `/repos/${segment(input.owner)}/${segment(input.repo)}/issues?state=${input.state}&per_page=30&page=${page}`;
            const raw = await deps.transport.request<RawIssue[]>(token, 'GET', path);
            return {
                items: raw.filter((item) => !item.pull_request).map((item) => normalizeIssue(item)),
                nextPage: raw.length === 30 ? page + 1 : null,
            };
        },
        async getIssue(userId: string, input: {
            owner: string;
            repo: string;
            number: number;
        }): Promise<GithubIssueDto> {
            const token = await deps.getUserToken(userId);
            const owner = segment(input.owner);
            const repo = segment(input.repo);
            const number = Math.max(1, Math.floor(input.number));
            const issue = await deps.transport.request<RawIssue>(token, 'GET', `/repos/${owner}/${repo}/issues/${number}`);
            const capability = await deps.transport.request<{
                data?: { repository?: { issue?: { viewerCanDelete?: boolean } | null } | null };
            }>(token, 'POST', '/graphql', {
                query: 'query IssueDeleteCapability($owner:String!,$repo:String!,$number:Int!){repository(owner:$owner,name:$repo){issue(number:$number){viewerCanDelete}}}',
                variables: { owner: input.owner, repo: input.repo, number },
            });
            return normalizeIssue(issue, capability.data?.repository?.issue?.viewerCanDelete === true);
        },
        async createIssue(userId: string, input: {
            owner: string;
            repo: string;
            title: string;
            body?: string | null;
        }): Promise<GithubIssueDto> {
            const title = input.title.trim();
            if (!title) throw new Error('Issue title is required');
            const token = await deps.getUserToken(userId);
            const issue = await deps.transport.request<RawIssue>(
                token,
                'POST',
                `/repos/${segment(input.owner)}/${segment(input.repo)}/issues`,
                { title, body: input.body?.trim() || null },
            );
            return normalizeIssue(issue);
        },
        async setIssueState(userId: string, input: {
            owner: string;
            repo: string;
            number: number;
            state: GithubIssueState;
        }): Promise<GithubIssueDto> {
            const token = await deps.getUserToken(userId);
            const number = Math.max(1, Math.floor(input.number));
            const issue = await deps.transport.request<RawIssue>(
                token,
                'PATCH',
                `/repos/${segment(input.owner)}/${segment(input.repo)}/issues/${number}`,
                { state: input.state },
            );
            return normalizeIssue(issue);
        },
        async deleteIssue(userId: string, input: {
            owner: string;
            repo: string;
            number: number;
        }): Promise<void> {
            const token = await deps.getUserToken(userId);
            const owner = segment(input.owner);
            const repo = segment(input.repo);
            const number = Math.max(1, Math.floor(input.number));
            const issue = await deps.transport.request<RawIssue>(token, 'GET', `/repos/${owner}/${repo}/issues/${number}`);
            const capability = await deps.transport.request<{
                data?: { repository?: { issue?: { viewerCanDelete?: boolean } | null } | null };
            }>(token, 'POST', '/graphql', {
                query: 'query IssueDeleteCapability($owner:String!,$repo:String!,$number:Int!){repository(owner:$owner,name:$repo){issue(number:$number){viewerCanDelete}}}',
                variables: { owner: input.owner, repo: input.repo, number },
            });
            if (capability.data?.repository?.issue?.viewerCanDelete !== true) {
                throw new Error('Permanent issue deletion is not allowed');
            }
            await deps.transport.request(token, 'POST', '/graphql', {
                query: 'mutation DeleteIssue($issueId:ID!){deleteIssue(input:{issueId:$issueId}){repository{id}}}',
                variables: { issueId: issue.node_id },
            });
        },
    };
}
