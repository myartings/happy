import { describe, expect, it } from 'vitest';
import {
    createGithubIssuesClient,
    type GithubCredentialStore,
    type GithubHttpRequest,
    type GithubHttpResponse,
    type GithubTransport,
} from './githubIssuesClient';

function memoryStore(): GithubCredentialStore & { value: string | null } {
    return {
        value: null,
        async load() { return this.value; },
        async save(value) { this.value = value; },
        async remove() { this.value = null; },
    };
}

function scriptedTransport(responses: GithubHttpResponse[]): GithubTransport & { requests: GithubHttpRequest[] } {
    return {
        requests: [],
        async request(input) {
            this.requests.push(input);
            const response = responses.shift();
            if (!response) throw new Error(`Unexpected request: ${input.method} ${input.url}`);
            return response;
        },
    };
}

const response = (status: number, body: unknown, headers: Record<string, string> = {}): GithubHttpResponse => ({ status, body, headers });

describe('GithubIssuesClient', () => {
    it('connects with Device Flow and persists the completed token bundle', async () => {
        const store = memoryStore();
        const transport = scriptedTransport([
            response(200, {
                device_code: 'device-secret',
                user_code: 'ABCD-EFGH',
                verification_uri: 'https://github.com/login/device',
                expires_in: 900,
                interval: 0,
            }),
            response(200, {
                access_token: 'ghu_access',
                refresh_token: 'ghr_refresh',
                expires_in: 28800,
                refresh_token_expires_in: 15897600,
                token_type: 'bearer',
            }),
            response(200, { id: 42, login: 'octocat', avatar_url: 'https://avatars.example/octocat' }),
        ]);
        const prompts: unknown[] = [];
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public',
            appSlug: 'happy-issues',
            store,
            transport,
            now: () => 1_000_000,
            sleep: async () => undefined,
        });

        const account = await client.connect({ onVerification: (prompt) => prompts.push(prompt) });

        expect(account).toEqual({ id: 42, login: 'octocat', avatarUrl: 'https://avatars.example/octocat' });
        expect(prompts).toEqual([{
            userCode: 'ABCD-EFGH',
            verificationUri: 'https://github.com/login/device',
            expiresAt: 1_900_000,
        }]);
        expect(JSON.parse(store.value!)).toMatchObject({
            schemaVersion: 1,
            accessToken: 'ghu_access',
            refreshToken: 'ghr_refresh',
            accessTokenExpiresAt: 29_800_000,
            refreshTokenExpiresAt: 15_898_600_000,
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat' },
        });
        expect(transport.requests.map((request) => request.url)).toEqual([
            'https://github.com/login/device/code',
            'https://github.com/login/oauth/access_token',
            'https://api.github.com/user',
        ]);
    });

    it('refreshes an expiring token once and lists selected repositories', async () => {
        const store = memoryStore();
        store.value = JSON.stringify({
            schemaVersion: 1,
            accessToken: 'old-access',
            refreshToken: 'old-refresh',
            accessTokenExpiresAt: 1_100_000,
            refreshTokenExpiresAt: 10_000_000,
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat', avatarUrl: '' },
        });
        const transport = scriptedTransport([
            response(200, {
                access_token: 'new-access',
                refresh_token: 'new-refresh',
                expires_in: 28800,
                refresh_token_expires_in: 15897600,
                token_type: 'bearer',
            }),
            response(200, { installations: [{ id: 7 }, { id: 8 }] }),
            response(200, { repositories: [{
                id: 2,
                owner: { login: 'zeta' },
                name: 'two',
                full_name: 'zeta/two',
                private: true,
                html_url: 'https://github.com/zeta/two',
                has_issues: true,
            }] }),
            response(200, { repositories: [{
                id: 1,
                owner: { login: 'alpha' },
                name: 'one',
                full_name: 'alpha/one',
                private: false,
                html_url: 'https://github.com/alpha/one',
                has_issues: true,
            }, {
                id: 2,
                owner: { login: 'zeta' },
                name: 'two',
                full_name: 'zeta/two',
                private: true,
                html_url: 'https://github.com/zeta/two',
                has_issues: true,
            }] }),
        ]);
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public',
            appSlug: 'happy-issues',
            store,
            transport,
            now: () => 1_000_000,
            sleep: async () => undefined,
        });

        const repositories = await client.listRepositories();

        expect(repositories.map((repository) => repository.fullName)).toEqual(['alpha/one', 'zeta/two']);
        expect(transport.requests[0]).toMatchObject({
            url: 'https://github.com/login/oauth/access_token',
            body: { client_id: 'Iv1.public', grant_type: 'refresh_token', refresh_token: 'old-refresh' },
        });
        expect(transport.requests.slice(1).every((request) => request.headers?.Authorization === 'Bearer new-access')).toBe(true);
        expect(JSON.parse(store.value!)).toMatchObject({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    });

    it('lists normalized Issues and excludes pull requests', async () => {
        const store = memoryStore();
        store.value = JSON.stringify({
            schemaVersion: 1,
            accessToken: 'access',
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat', avatarUrl: '' },
        });
        const transport = scriptedTransport([response(200, [{
            number: 12,
            node_id: 'I_12',
            title: 'Keep me',
            body: null,
            state: 'open',
            html_url: 'https://github.com/acme/app/issues/12',
            updated_at: '2026-08-09T00:00:00Z',
            comments: 3,
            user: { login: 'octocat', avatar_url: 'avatar' },
            labels: [{ name: 'bug', color: 'ff0000' }],
        }, {
            number: 13,
            title: 'Pull request',
            pull_request: {},
        }])]);
        const client = createGithubIssuesClient({ clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport });

        const result = await client.listIssues({ owner: 'acme', repo: 'app', state: 'open', page: 1 });

        expect(result).toEqual({
            items: [{
                number: 12,
                nodeId: 'I_12',
                title: 'Keep me',
                body: null,
                state: 'open',
                url: 'https://github.com/acme/app/issues/12',
                updatedAt: '2026-08-09T00:00:00Z',
                comments: 3,
                viewerCanDelete: false,
                author: { login: 'octocat', avatarUrl: 'avatar' },
                labels: [{ name: 'bug', color: 'ff0000' }],
            }],
            nextPage: null,
        });
        expect(transport.requests[0].url).toBe('https://api.github.com/repos/acme/app/issues?state=open&per_page=30&page=1');
    });

    it('gets, creates, changes state, and permanently deletes an eligible Issue', async () => {
        const store = memoryStore();
        store.value = JSON.stringify({
            schemaVersion: 1,
            accessToken: 'access',
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat', avatarUrl: '' },
        });
        const rawIssue = { number: 12, node_id: 'I_12', title: 'Issue', state: 'open' };
        const transport = scriptedTransport([
            response(200, rawIssue),
            response(200, { data: { repository: { issue: { viewerCanDelete: true } } } }),
            response(201, { ...rawIssue, number: 13, node_id: 'I_13', title: 'Created' }),
            response(200, { ...rawIssue, state: 'closed' }),
            response(200, rawIssue),
            response(200, { data: { repository: { issue: { viewerCanDelete: true } } } }),
            response(200, { data: { deleteIssue: { repository: { id: 'R_1' } } } }),
        ]);
        const client = createGithubIssuesClient({ clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport });

        expect((await client.getIssue({ owner: 'acme', repo: 'app', number: 12 })).viewerCanDelete).toBe(true);
        expect((await client.createIssue({ owner: 'acme', repo: 'app', title: '  Created  ', body: ' body ' })).title).toBe('Created');
        expect((await client.setIssueState({ owner: 'acme', repo: 'app', number: 12, state: 'closed' })).state).toBe('closed');
        await expect(client.deleteIssue({ owner: 'acme', repo: 'app', number: 12 })).resolves.toBeUndefined();

        expect(transport.requests[2].body).toEqual({ title: 'Created', body: 'body' });
        expect(transport.requests[3].body).toEqual({ state: 'closed' });
        expect(transport.requests[6].body).toMatchObject({ variables: { issueId: 'I_12' } });
    });

    it('reports connection state and removes only the local Issue credential', async () => {
        const store = memoryStore();
        store.value = JSON.stringify({
            schemaVersion: 1,
            accessToken: 'access',
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat', avatarUrl: 'avatar' },
        });
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public',
            appSlug: 'happy-issues',
            store,
            transport: scriptedTransport([]),
        });

        await expect(client.getConnectionState()).resolves.toEqual({
            status: 'connected',
            account: { id: 42, login: 'octocat', avatarUrl: 'avatar' },
        });
        expect(client.installationUrl).toBe('https://github.com/apps/happy-issues/installations/new');
        await client.disconnect();
        await expect(client.getConnectionState()).resolves.toEqual({ status: 'disconnected' });
    });

    it('refreshes after an authenticated 401 and retries the GitHub request once', async () => {
        const store = memoryStore();
        store.value = JSON.stringify({
            schemaVersion: 1,
            accessToken: 'old-access',
            refreshToken: 'old-refresh',
            accessTokenExpiresAt: 10_000_000,
            refreshTokenExpiresAt: 20_000_000,
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat', avatarUrl: '' },
        });
        const transport = scriptedTransport([
            response(401, { message: 'Bad credentials' }),
            response(200, {
                access_token: 'new-access',
                refresh_token: 'new-refresh',
                expires_in: 28800,
                refresh_token_expires_in: 15897600,
                token_type: 'bearer',
            }),
            response(200, { installations: [] }),
        ]);
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport, now: () => 1_000_000,
        });

        await expect(client.listRepositories()).resolves.toEqual([]);
        expect(transport.requests.map((request) => request.url)).toEqual([
            'https://api.github.com/user/installations?per_page=100',
            'https://github.com/login/oauth/access_token',
            'https://api.github.com/user/installations?per_page=100',
        ]);
        expect(transport.requests[2].headers?.Authorization).toBe('Bearer new-access');
    });

    it('shares one refresh across concurrent Issue requests', async () => {
        const store = memoryStore();
        store.value = JSON.stringify({
            schemaVersion: 1,
            accessToken: 'old-access',
            refreshToken: 'old-refresh',
            accessTokenExpiresAt: 1_100_000,
            refreshTokenExpiresAt: 20_000_000,
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat', avatarUrl: '' },
        });
        const transport = scriptedTransport([
            response(200, {
                access_token: 'new-access', refresh_token: 'new-refresh', expires_in: 28800,
                refresh_token_expires_in: 15897600, token_type: 'bearer',
            }),
            response(200, { installations: [] }),
            response(200, { installations: [] }),
        ]);
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport, now: () => 1_000_000,
        });

        await Promise.all([client.listRepositories(), client.listRepositories()]);

        expect(transport.requests.filter((request) => request.url === 'https://github.com/login/oauth/access_token')).toHaveLength(1);
    });

    it('respects authorization_pending and GitHub slow_down polling intervals', async () => {
        const store = memoryStore();
        const transport = scriptedTransport([
            response(200, {
                device_code: 'device-secret', user_code: 'ABCD-EFGH',
                verification_uri: 'https://github.com/login/device', expires_in: 900, interval: 1,
            }),
            response(200, { error: 'authorization_pending' }),
            response(200, { error: 'slow_down', interval: 7 }),
            response(200, { access_token: 'access', token_type: 'bearer' }),
            response(200, { id: 42, login: 'octocat' }),
        ]);
        const waits: number[] = [];
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport,
            now: () => 1_000_000,
            sleep: async (milliseconds) => { waits.push(milliseconds); },
        });

        await client.connect({ onVerification: () => undefined });

        expect(waits).toEqual([1_000, 1_000, 7_000]);
    });

    it('removes a definitively invalid refresh credential and requests reauthorization', async () => {
        const store = memoryStore();
        store.value = JSON.stringify({
            schemaVersion: 1,
            accessToken: 'old-access',
            refreshToken: 'invalid-refresh',
            accessTokenExpiresAt: 1_100_000,
            refreshTokenExpiresAt: 20_000_000,
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat', avatarUrl: '' },
        });
        const transport = scriptedTransport([response(200, { error: 'bad_refresh_token' })]);
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport, now: () => 1_000_000,
        });

        await expect(client.listRepositories()).rejects.toMatchObject({ code: 'reauthorization_required' });
        expect(store.value).toBeNull();
    });

    it('removes a corrupt credential bundle instead of repeatedly loading it', async () => {
        const store = memoryStore();
        store.value = '{"schemaVersion":99,"accessToken":"stale"}';
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport: scriptedTransport([]),
        });

        await expect(client.getConnectionState()).rejects.toMatchObject({ code: 'reauthorization_required' });
        expect(store.value).toBeNull();
    });

    it('preserves the credential when refresh fails offline', async () => {
        const store = memoryStore();
        store.value = JSON.stringify({
            schemaVersion: 1,
            accessToken: 'old-access',
            refreshToken: 'old-refresh',
            accessTokenExpiresAt: 1_100_000,
            refreshTokenExpiresAt: 20_000_000,
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat', avatarUrl: '' },
        });
        const original = store.value;
        const transport: GithubTransport = { async request() { throw new Error('offline'); } };
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport, now: () => 1_000_000,
        });

        await expect(client.listRepositories()).rejects.toThrow('offline');
        expect(store.value).toBe(original);
    });

    it('normalizes GraphQL errors without exposing GitHub response messages', async () => {
        const store = memoryStore();
        store.value = JSON.stringify({
            schemaVersion: 1,
            accessToken: 'access',
            tokenType: 'bearer',
            account: { id: 42, login: 'octocat', avatarUrl: '' },
        });
        const transport = scriptedTransport([
            response(200, { number: 12, node_id: 'I_12', title: 'Issue', state: 'open' }),
            response(200, { errors: [{ message: 'sensitive upstream detail', extensions: { type: 'FORBIDDEN' } }] }),
        ]);
        const client = createGithubIssuesClient({ clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport });

        await expect(client.getIssue({ owner: 'acme', repo: 'app', number: 12 })).rejects.toMatchObject({
            code: 'permission_denied',
            message: 'GitHub denied this Issue operation',
        });
    });

    it('rejects a second concurrent Device Flow authorization', async () => {
        const store = memoryStore();
        let releaseCode!: (response: GithubHttpResponse) => void;
        const codeResponse = new Promise<GithubHttpResponse>((resolve) => { releaseCode = resolve; });
        const transport: GithubTransport = {
            async request(input) {
                if (input.url.endsWith('/device/code')) return codeResponse;
                if (input.url.endsWith('/access_token')) return response(200, { access_token: 'access', token_type: 'bearer' });
                return response(200, { id: 42, login: 'octocat' });
            },
        };
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public', appSlug: 'happy-issues', store, transport, sleep: async () => undefined,
        });
        const first = client.connect({ onVerification: () => undefined });

        await expect(client.connect({ onVerification: () => undefined })).rejects.toMatchObject({ code: 'authorization_in_progress' });
        releaseCode(response(200, {
            device_code: 'device-secret', user_code: 'ABCD-EFGH',
            verification_uri: 'https://github.com/login/device', expires_in: 900, interval: 0,
        }));
        await expect(first).resolves.toMatchObject({ login: 'octocat' });
    });

    it.each([
        ['access_denied', 'authorization_denied'],
        ['expired_token', 'authorization_expired'],
    ])('maps Device Flow %s to %s', async (githubError, expectedCode) => {
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public',
            appSlug: 'happy-issues',
            store: memoryStore(),
            transport: scriptedTransport([
                response(200, {
                    device_code: 'device-secret', user_code: 'ABCD-EFGH',
                    verification_uri: 'https://github.com/login/device', expires_in: 900, interval: 0,
                }),
                response(200, { error: githubError }),
            ]),
            sleep: async () => undefined,
        });

        await expect(client.connect({ onVerification: () => undefined })).rejects.toMatchObject({ code: expectedCode });
    });

    it('cancels Device Flow without persisting a partial credential', async () => {
        const store = memoryStore();
        const controller = new AbortController();
        controller.abort();
        const client = createGithubIssuesClient({
            clientId: 'Iv1.public',
            appSlug: 'happy-issues',
            store,
            transport: scriptedTransport([response(200, {
                device_code: 'device-secret', user_code: 'ABCD-EFGH',
                verification_uri: 'https://github.com/login/device', expires_in: 900, interval: 0,
            })]),
        });

        await expect(client.connect({ signal: controller.signal, onVerification: () => undefined }))
            .rejects.toMatchObject({ code: 'authorization_cancelled' });
        expect(store.value).toBeNull();
    });

    it('fails closed for missing configuration and an untrusted verification URL', async () => {
        const store = memoryStore();
        const unconfigured = createGithubIssuesClient({
            clientId: '', appSlug: '', store, transport: scriptedTransport([]),
        });
        await expect(unconfigured.getConnectionState()).rejects.toMatchObject({ code: 'not_configured' });

        const malformed = createGithubIssuesClient({
            clientId: 'Iv1.public',
            appSlug: 'happy-issues',
            store,
            transport: scriptedTransport([response(200, {
                device_code: 'device-secret', user_code: 'ABCD-EFGH',
                verification_uri: 'https://example.com/device', expires_in: 900, interval: 0,
            })]),
        });
        await expect(malformed.connect({ onVerification: () => undefined }))
            .rejects.toMatchObject({ code: 'github_error', message: 'GitHub returned an invalid verification URL' });
        expect(store.value).toBeNull();
    });
});
