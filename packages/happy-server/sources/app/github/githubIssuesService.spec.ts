import { describe, expect, it, vi } from 'vitest';
import { createGithubIssuesService, type GithubTransport } from './githubIssuesService';

function serviceWith(responses: unknown[]) {
    const request = vi.fn<GithubTransport['request']>();
    for (const response of responses) request.mockResolvedValueOnce(response);
    const service = createGithubIssuesService({
        getUserToken: async () => 'token',
        transport: { request: request as unknown as GithubTransport['request'] },
    });
    return { service, request };
}

describe('githubIssuesService', () => {
    it('rejects repository path traversal before calling GitHub', async () => {
        const { service, request } = serviceWith([]);
        await expect(service.listIssues('user', { owner: '..', repo: 'repo', state: 'open', page: 1 }))
            .rejects.toThrow('Invalid GitHub repository identifier');
        expect(request).not.toHaveBeenCalled();
    });

    it('lists normalized issues and excludes pull requests', async () => {
        const { service, request } = serviceWith([[{
            number: 12,
            node_id: 'I_12',
            title: 'Keep me',
            body: null,
            state: 'open',
            html_url: 'https://github.com/acme/repo/issues/12',
            updated_at: '2026-08-08T00:00:00Z',
            comments: 2,
            user: { login: 'octo', avatar_url: 'https://avatar' },
            labels: [{ name: 'bug', color: 'ff0000' }],
        }, {
            number: 13,
            title: 'Pull request',
            pull_request: { url: 'https://api.github.com/pulls/13' },
        }]]);

        const result = await service.listIssues('user', {
            owner: 'acme', repo: 'repo', state: 'open', page: 1,
        });

        expect(result).toEqual({
            items: [{
                number: 12,
                nodeId: 'I_12',
                title: 'Keep me',
                body: null,
                state: 'open',
                url: 'https://github.com/acme/repo/issues/12',
                updatedAt: '2026-08-08T00:00:00Z',
                comments: 2,
                author: { login: 'octo', avatarUrl: 'https://avatar' },
                labels: [{ name: 'bug', color: 'ff0000' }],
                viewerCanDelete: false,
            }],
            nextPage: null,
        });
        expect(request).toHaveBeenCalledWith('token', 'GET', '/repos/acme/repo/issues?state=open&per_page=30&page=1');
    });

    it('lists repositories granted to GitHub App installations', async () => {
        const { service, request } = serviceWith([
            { installations: [{ id: 7 }] },
            { repositories: [{
                id: 99,
                name: 'repo',
                full_name: 'acme/repo',
                private: true,
                html_url: 'https://github.com/acme/repo',
                owner: { login: 'acme' },
            }] },
        ]);

        await expect(service.listRepositories('user')).resolves.toEqual([{
            id: 99,
            owner: 'acme',
            name: 'repo',
            fullName: 'acme/repo',
            private: true,
            url: 'https://github.com/acme/repo',
        }]);
        expect(request).toHaveBeenNthCalledWith(1, 'token', 'GET', '/user/installations?per_page=100');
        expect(request).toHaveBeenNthCalledWith(2, 'token', 'GET', '/user/installations/7/repositories?per_page=100');
    });

    it('loads detail with the viewer permanent-delete capability', async () => {
        const { service } = serviceWith([{
            number: 4, node_id: 'I_4', title: 'Detail', body: 'Body', state: 'open',
            html_url: 'https://github.com/acme/repo/issues/4', updated_at: '2026-08-08T00:00:00Z',
            comments: 0, user: { login: 'octo', avatar_url: '' }, labels: [],
        }, { data: { repository: { issue: { viewerCanDelete: true } } } }]);

        const issue = await service.getIssue('user', { owner: 'acme', repo: 'repo', number: 4 });
        expect(issue.viewerCanDelete).toBe(true);
        expect(issue.nodeId).toBe('I_4');
    });

    it('creates an issue and returns the normalized result', async () => {
        const { service, request } = serviceWith([{
            number: 5, node_id: 'I_5', title: 'New issue', body: 'Details', state: 'open',
            html_url: 'https://github.com/acme/repo/issues/5', updated_at: '2026-08-08T00:00:00Z',
            comments: 0, user: { login: 'octo', avatar_url: '' }, labels: [],
        }]);

        const issue = await service.createIssue('user', {
            owner: 'acme', repo: 'repo', title: ' New issue ', body: 'Details',
        });
        expect(issue.number).toBe(5);
        expect(request).toHaveBeenCalledWith('token', 'POST', '/repos/acme/repo/issues', {
            title: 'New issue', body: 'Details',
        });
    });

    it('closes or reopens through the same state interface', async () => {
        const { service, request } = serviceWith([{
            number: 5, node_id: 'I_5', title: 'Issue', state: 'closed', labels: [],
        }]);
        const issue = await service.setIssueState('user', {
            owner: 'acme', repo: 'repo', number: 5, state: 'closed',
        });
        expect(issue.state).toBe('closed');
        expect(request).toHaveBeenCalledWith('token', 'PATCH', '/repos/acme/repo/issues/5', { state: 'closed' });
    });

    it('refuses permanent deletion when GitHub does not grant capability', async () => {
        const { service, request } = serviceWith([{
            number: 5, node_id: 'I_5', title: 'Issue', state: 'open', labels: [],
        }, { data: { repository: { issue: { viewerCanDelete: false } } } }]);

        await expect(service.deleteIssue('user', {
            owner: 'acme', repo: 'repo', number: 5,
        })).rejects.toThrow('Permanent issue deletion is not allowed');
        expect(request).toHaveBeenCalledTimes(2);
    });

    it('permanently deletes only after GitHub grants capability', async () => {
        const { service, request } = serviceWith([{
            number: 5, node_id: 'I_5', title: 'Issue', state: 'open', labels: [],
        }, { data: { repository: { issue: { viewerCanDelete: true } } } }, {
            data: { deleteIssue: { repository: { id: 'R_1' } } },
        }]);

        await service.deleteIssue('user', { owner: 'acme', repo: 'repo', number: 5 });
        expect(request).toHaveBeenNthCalledWith(3, 'token', 'POST', '/graphql', expect.objectContaining({
            variables: { issueId: 'I_5' },
        }));
    });
});
