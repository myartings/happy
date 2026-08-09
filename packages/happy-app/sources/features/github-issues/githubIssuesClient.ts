export type GithubIssueState = 'open' | 'closed';

export interface GithubRepository {
    id: number;
    owner: string;
    name: string;
    fullName: string;
    private: boolean;
    url: string;
}

export interface GithubIssue {
    number: number;
    nodeId: string;
    title: string;
    body: string | null;
    state: GithubIssueState;
    url: string;
    updatedAt: string;
    comments: number;
    viewerCanDelete: boolean;
    author: { login: string; avatarUrl: string } | null;
    labels: Array<{ name: string; color: string }>;
}

export interface GithubConnectedAccount {
    id: number;
    login: string;
    avatarUrl: string;
}

export interface DeviceVerificationPrompt {
    userCode: string;
    verificationUri: string;
    expiresAt: number;
}

export interface GithubHttpRequest {
    method: 'GET' | 'POST' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
    signal?: AbortSignal;
}

export interface GithubHttpResponse {
    status: number;
    headers: Record<string, string>;
    body: unknown;
}

export interface GithubTransport {
    request(input: GithubHttpRequest): Promise<GithubHttpResponse>;
}

export interface GithubCredentialStore {
    load(): Promise<string | null>;
    save(value: string): Promise<void>;
    remove(): Promise<void>;
}

interface GithubTokenBundleV1 {
    schemaVersion: 1;
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    refreshTokenExpiresAt?: number;
    tokenType: 'bearer';
    account: GithubConnectedAccount;
}

interface GithubIssuesClientDependencies {
    clientId: string;
    appSlug: string;
    store: GithubCredentialStore;
    transport: GithubTransport;
    now?: () => number;
    sleep?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
}

export class GithubIssuesError extends Error {
    constructor(
        readonly code: string,
        message: string,
        readonly status = 0,
        readonly retryAt?: number,
    ) {
        super(message);
        this.name = 'GithubIssuesError';
    }
}

function objectBody(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new GithubIssuesError('github_error', 'GitHub returned an invalid response');
    }
    return value as Record<string, unknown>;
}

function requiredString(body: Record<string, unknown>, key: string): string {
    const value = body[key];
    if (typeof value !== 'string' || !value) {
        throw new GithubIssuesError('github_error', 'GitHub returned an invalid response');
    }
    return value;
}

function optionalSeconds(body: Record<string, unknown>, key: string, now: number): number | undefined {
    const value = body[key];
    return typeof value === 'number' && Number.isFinite(value) ? now + value * 1000 : undefined;
}

function parseTokenBundle(value: string): GithubTokenBundleV1 {
    try {
        const parsed = JSON.parse(value) as Partial<GithubTokenBundleV1>;
        if (parsed.schemaVersion !== 1 || typeof parsed.accessToken !== 'string'
            || parsed.tokenType !== 'bearer' || !parsed.account
            || typeof parsed.account.id !== 'number' || typeof parsed.account.login !== 'string') {
            throw new Error('invalid bundle');
        }
        return parsed as GithubTokenBundleV1;
    } catch {
        throw new GithubIssuesError('reauthorization_required', 'GitHub Issues needs to be connected again');
    }
}

function githubHeaders(accessToken: string): Record<string, string> {
    return {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'X-GitHub-Api-Version': '2026-03-10',
    };
}

function segment(value: string): string {
    if (!/^[A-Za-z0-9_.-]+$/.test(value) || value === '.' || value === '..') {
        throw new GithubIssuesError('github_error', 'Invalid GitHub repository identifier');
    }
    return encodeURIComponent(value);
}

function normalizeIssue(value: unknown, viewerCanDelete = false): GithubIssue {
    const issue = objectBody(value);
    const user = issue.user && typeof issue.user === 'object' ? issue.user as Record<string, unknown> : null;
    const labels = Array.isArray(issue.labels) ? issue.labels : [];
    return {
        number: typeof issue.number === 'number' ? issue.number : 0,
        nodeId: typeof issue.node_id === 'string' ? issue.node_id : '',
        title: typeof issue.title === 'string' ? issue.title : '',
        body: typeof issue.body === 'string' ? issue.body : null,
        state: issue.state === 'closed' ? 'closed' : 'open',
        url: typeof issue.html_url === 'string' ? issue.html_url : '',
        updatedAt: typeof issue.updated_at === 'string' ? issue.updated_at : '',
        comments: typeof issue.comments === 'number' ? issue.comments : 0,
        viewerCanDelete,
        author: user && typeof user.login === 'string' ? {
            login: user.login,
            avatarUrl: typeof user.avatar_url === 'string' ? user.avatar_url : '',
        } : null,
        labels: labels.flatMap((label) => {
            if (typeof label === 'string') return [{ name: label, color: '' }];
            if (!label || typeof label !== 'object') return [];
            const item = label as Record<string, unknown>;
            return typeof item.name === 'string'
                ? [{ name: item.name, color: typeof item.color === 'string' ? item.color : '' }]
                : [];
        }),
    };
}

function defaultSleep(milliseconds: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new GithubIssuesError('authorization_cancelled', 'GitHub authorization was cancelled'));
            return;
        }
        const timer = setTimeout(resolve, milliseconds);
        signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new GithubIssuesError('authorization_cancelled', 'GitHub authorization was cancelled'));
        }, { once: true });
    });
}

export function createGithubIssuesClient(deps: GithubIssuesClientDependencies) {
    const now = deps.now ?? Date.now;
    const sleep = deps.sleep ?? defaultSleep;
    let refreshInFlight: Promise<GithubTokenBundleV1> | null = null;
    let connectInFlight = false;

    function assertConfigured(): void {
        if (!deps.clientId || !deps.appSlug) {
            throw new GithubIssuesError('not_configured', 'GitHub Issues is not configured for this build');
        }
    }

    async function refresh(bundle: GithubTokenBundleV1): Promise<GithubTokenBundleV1> {
        if (!bundle.refreshToken || (bundle.refreshTokenExpiresAt !== undefined && bundle.refreshTokenExpiresAt <= now())) {
            throw new GithubIssuesError('reauthorization_required', 'GitHub Issues needs to be connected again');
        }
        const response = await deps.transport.request({
            method: 'POST',
            url: 'https://github.com/login/oauth/access_token',
            headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
            body: {
                client_id: deps.clientId,
                grant_type: 'refresh_token',
                refresh_token: bundle.refreshToken,
            },
        });
        const token = objectBody(response.body);
        if (token.error === 'bad_refresh_token' || response.status === 401) {
            await deps.store.remove();
            throw new GithubIssuesError('reauthorization_required', 'GitHub Issues needs to be connected again', response.status);
        }
        if (response.status < 200 || response.status >= 300 || token.error) {
            throw new GithubIssuesError('github_error', 'Unable to refresh GitHub authorization', response.status);
        }
        const receivedAt = now();
        const updated: GithubTokenBundleV1 = {
            ...bundle,
            accessToken: requiredString(token, 'access_token'),
            refreshToken: typeof token.refresh_token === 'string' ? token.refresh_token : bundle.refreshToken,
            accessTokenExpiresAt: optionalSeconds(token, 'expires_in', receivedAt),
            refreshTokenExpiresAt: optionalSeconds(token, 'refresh_token_expires_in', receivedAt),
        };
        await deps.store.save(JSON.stringify(updated));
        return updated;
    }

    async function authorizedBundle(): Promise<GithubTokenBundleV1> {
        assertConfigured();
        const stored = await deps.store.load();
        if (!stored) throw new GithubIssuesError('not_connected', 'Connect GitHub Issues to continue');
        let bundle: GithubTokenBundleV1;
        try {
            bundle = parseTokenBundle(stored);
        } catch (error) {
            await deps.store.remove();
            throw error;
        }
        if (bundle.accessTokenExpiresAt === undefined || bundle.accessTokenExpiresAt > now() + 5 * 60 * 1000) {
            return bundle;
        }
        if (!refreshInFlight) {
            refreshInFlight = refresh(bundle).finally(() => { refreshInFlight = null; });
        }
        return refreshInFlight;
    }

    function refreshOnce(bundle: GithubTokenBundleV1): Promise<GithubTokenBundleV1> {
        if (!refreshInFlight) {
            refreshInFlight = refresh(bundle).finally(() => { refreshInFlight = null; });
        }
        return refreshInFlight;
    }

    function responseError(response: GithubHttpResponse): GithubIssuesError {
        if (response.status === 401) {
            return new GithubIssuesError('reauthorization_required', 'GitHub Issues needs to be connected again', 401);
        }
        if (response.status === 403) {
            const reset = Number(response.headers['x-ratelimit-reset']);
            if (response.headers['x-ratelimit-remaining'] === '0' && Number.isFinite(reset)) {
                return new GithubIssuesError('rate_limited', 'GitHub rate limit reached', 403, reset * 1000);
            }
            return new GithubIssuesError('permission_denied', 'GitHub denied this Issue operation', 403);
        }
        if (response.status === 404) {
            return new GithubIssuesError('not_found', 'The GitHub repository or Issue was not found', 404);
        }
        if (response.status === 429) {
            const retryAfter = Number(response.headers['retry-after']);
            return new GithubIssuesError(
                'rate_limited',
                'GitHub rate limit reached',
                429,
                Number.isFinite(retryAfter) ? now() + retryAfter * 1000 : undefined,
            );
        }
        return new GithubIssuesError('github_error', 'GitHub request failed', response.status);
    }

    function graphqlData(value: unknown): Record<string, unknown> {
        const response = objectBody(value);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
            const types = response.errors.flatMap((error) => {
                if (!error || typeof error !== 'object') return [];
                const extensions = (error as Record<string, unknown>).extensions;
                if (!extensions || typeof extensions !== 'object') return [];
                const type = (extensions as Record<string, unknown>).type;
                return typeof type === 'string' ? [type.toUpperCase()] : [];
            });
            if (types.some((type) => type === 'FORBIDDEN')) {
                throw new GithubIssuesError('permission_denied', 'GitHub denied this Issue operation', 403);
            }
            if (types.some((type) => type === 'NOT_FOUND')) {
                throw new GithubIssuesError('not_found', 'The GitHub repository or Issue was not found', 404);
            }
            throw new GithubIssuesError('github_error', 'GitHub could not complete the Issue operation');
        }
        return response.data && typeof response.data === 'object'
            ? response.data as Record<string, unknown>
            : {};
    }

    async function githubRequest(path: string, init?: { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown }): Promise<unknown> {
        let bundle = await authorizedBundle();
        const request = () => deps.transport.request({
            method: init?.method ?? 'GET',
            url: `https://api.github.com${path}`,
            headers: githubHeaders(bundle.accessToken),
            body: init?.body,
        });
        let response = await request();
        if (response.status === 401 && bundle.refreshToken) {
            bundle = await refreshOnce(bundle);
            response = await request();
        }
        if (response.status < 200 || response.status >= 300) {
            throw responseError(response);
        }
        return response.body;
    }

    return {
        installationUrl: deps.appSlug
            ? `https://github.com/apps/${encodeURIComponent(deps.appSlug)}/installations/new`
            : null,

        async getConnectionState(): Promise<
            { status: 'disconnected' }
            | { status: 'connected'; account: GithubConnectedAccount }
        > {
            assertConfigured();
            const stored = await deps.store.load();
            if (!stored) return { status: 'disconnected' };
            try {
                return { status: 'connected', account: parseTokenBundle(stored).account };
            } catch (error) {
                await deps.store.remove();
                throw error;
            }
        },

        async disconnect(): Promise<void> {
            await deps.store.remove();
        },

        async connect(options: {
            signal?: AbortSignal;
            onVerification: (prompt: DeviceVerificationPrompt) => void;
        }): Promise<GithubConnectedAccount> {
            assertConfigured();
            if (connectInFlight) {
                throw new GithubIssuesError('authorization_in_progress', 'GitHub authorization is already in progress');
            }
            connectInFlight = true;
            try {

            const codeResponse = await deps.transport.request({
                method: 'POST',
                url: 'https://github.com/login/device/code',
                headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
                body: { client_id: deps.clientId },
                signal: options.signal,
            });
            const code = objectBody(codeResponse.body);
            if (codeResponse.status < 200 || codeResponse.status >= 300) {
                throw new GithubIssuesError('github_error', 'Unable to start GitHub authorization', codeResponse.status);
            }

            const deviceCode = requiredString(code, 'device_code');
            const userCode = requiredString(code, 'user_code');
            const verificationUri = requiredString(code, 'verification_uri');
            let verificationUrl: URL;
            try { verificationUrl = new URL(verificationUri); }
            catch { throw new GithubIssuesError('github_error', 'GitHub returned an invalid verification URL'); }
            if (verificationUrl.protocol !== 'https:' || verificationUrl.hostname !== 'github.com') {
                throw new GithubIssuesError('github_error', 'GitHub returned an invalid verification URL');
            }
            const expiresIn = typeof code.expires_in === 'number' ? code.expires_in : 900;
            let interval = typeof code.interval === 'number' ? code.interval : 5;
            const expiresAt = now() + expiresIn * 1000;
            options.onVerification({ userCode, verificationUri, expiresAt });

            let token: Record<string, unknown>;
            for (;;) {
                if (now() >= expiresAt) {
                    throw new GithubIssuesError('authorization_expired', 'GitHub authorization code expired');
                }
                await sleep(interval * 1000, options.signal);
                const tokenResponse = await deps.transport.request({
                    method: 'POST',
                    url: 'https://github.com/login/oauth/access_token',
                    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: {
                        client_id: deps.clientId,
                        device_code: deviceCode,
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    },
                    signal: options.signal,
                });
                token = objectBody(tokenResponse.body);
                if (token.error === 'authorization_pending') continue;
                if (token.error === 'slow_down') {
                    interval = typeof token.interval === 'number' ? token.interval : interval + 5;
                    continue;
                }
                if (token.error === 'access_denied') {
                    throw new GithubIssuesError('authorization_denied', 'GitHub authorization was denied');
                }
                if (token.error === 'expired_token') {
                    throw new GithubIssuesError('authorization_expired', 'GitHub authorization code expired');
                }
                if (token.error) {
                    throw new GithubIssuesError('github_error', 'Unable to complete GitHub authorization', tokenResponse.status);
                }
                break;
            }

            const receivedAt = now();
            const accessToken = requiredString(token, 'access_token');
            const profileResponse = await deps.transport.request({
                method: 'GET',
                url: 'https://api.github.com/user',
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: `Bearer ${accessToken}`,
                    'X-GitHub-Api-Version': '2026-03-10',
                },
                signal: options.signal,
            });
            if (profileResponse.status < 200 || profileResponse.status >= 300) {
                throw responseError(profileResponse);
            }
            const profile = objectBody(profileResponse.body);
            if (typeof profile.id !== 'number') {
                throw new GithubIssuesError('github_error', 'GitHub returned an invalid response');
            }
            const account: GithubConnectedAccount = {
                id: profile.id,
                login: requiredString(profile, 'login'),
                avatarUrl: typeof profile.avatar_url === 'string' ? profile.avatar_url : '',
            };
            const bundle: GithubTokenBundleV1 = {
                schemaVersion: 1,
                accessToken,
                refreshToken: typeof token.refresh_token === 'string' ? token.refresh_token : undefined,
                accessTokenExpiresAt: optionalSeconds(token, 'expires_in', receivedAt),
                refreshTokenExpiresAt: optionalSeconds(token, 'refresh_token_expires_in', receivedAt),
                tokenType: 'bearer',
                account,
            };
            await deps.store.save(JSON.stringify(bundle));
            return account;
            } finally {
                connectInFlight = false;
            }
        },

        async listRepositories(): Promise<GithubRepository[]> {
            const installationItems: unknown[] = [];
            for (let page = 1; page <= 100; page += 1) {
                const path = `/user/installations?per_page=100${page === 1 ? '' : `&page=${page}`}`;
                const installations = objectBody(await githubRequest(path));
                const pageItems = Array.isArray(installations.installations) ? installations.installations : [];
                installationItems.push(...pageItems);
                if (pageItems.length < 100) break;
            }
            const repositories = await Promise.all(installationItems.map(async (item) => {
                if (!item || typeof item !== 'object' || typeof (item as { id?: unknown }).id !== 'number') return [];
                const items: unknown[] = [];
                for (let page = 1; page <= 100; page += 1) {
                    const suffix = page === 1 ? '' : `&page=${page}`;
                    const body = objectBody(await githubRequest(`/user/installations/${(item as { id: number }).id}/repositories?per_page=100${suffix}`));
                    const pageItems = Array.isArray(body.repositories) ? body.repositories : [];
                    items.push(...pageItems);
                    if (pageItems.length < 100) break;
                }
                return items;
            }));
            const unique = new Map<number, GithubRepository>();
            for (const raw of repositories.flat()) {
                if (!raw || typeof raw !== 'object') continue;
                const repository = raw as Record<string, unknown>;
                if (repository.has_issues === false || typeof repository.id !== 'number'
                    || typeof repository.name !== 'string' || typeof repository.full_name !== 'string') continue;
                const ownerValue = repository.owner && typeof repository.owner === 'object'
                    ? (repository.owner as Record<string, unknown>).login : undefined;
                const owner = typeof ownerValue === 'string' ? ownerValue : repository.full_name.split('/')[0];
                unique.set(repository.id, {
                    id: repository.id,
                    owner,
                    name: repository.name,
                    fullName: repository.full_name,
                    private: repository.private === true,
                    url: typeof repository.html_url === 'string' ? repository.html_url : '',
                });
            }
            return [...unique.values()].sort((left, right) => left.fullName.localeCompare(right.fullName));
        },

        async listIssues(input: {
            owner: string;
            repo: string;
            state: GithubIssueState;
            page?: number;
        }): Promise<{ items: GithubIssue[]; nextPage: number | null }> {
            const page = Math.max(1, Math.floor(input.page ?? 1));
            const body = await githubRequest(
                `/repos/${segment(input.owner)}/${segment(input.repo)}/issues?state=${input.state}&per_page=30&page=${page}`,
            );
            if (!Array.isArray(body)) throw new GithubIssuesError('github_error', 'GitHub returned an invalid response');
            const items = body
                .filter((item) => !item || typeof item !== 'object' || !('pull_request' in item))
                .map((item) => normalizeIssue(item));
            return { items, nextPage: body.length === 30 ? page + 1 : null };
        },

        async getIssue(input: { owner: string; repo: string; number: number }): Promise<GithubIssue> {
            const number = Math.max(1, Math.floor(input.number));
            const issue = await githubRequest(`/repos/${segment(input.owner)}/${segment(input.repo)}/issues/${number}`);
            const data = graphqlData(await githubRequest('/graphql', {
                method: 'POST',
                body: {
                    query: 'query IssueDeleteCapability($owner:String!,$repo:String!,$number:Int!){repository(owner:$owner,name:$repo){issue(number:$number){viewerCanDelete}}}',
                    variables: { owner: input.owner, repo: input.repo, number },
                },
            }));
            const repository = data.repository && typeof data.repository === 'object' ? data.repository as Record<string, unknown> : {};
            const capabilityIssue = repository.issue && typeof repository.issue === 'object' ? repository.issue as Record<string, unknown> : {};
            return normalizeIssue(issue, capabilityIssue.viewerCanDelete === true);
        },

        async createIssue(input: { owner: string; repo: string; title: string; body?: string | null }): Promise<GithubIssue> {
            const title = input.title.trim();
            if (!title) throw new GithubIssuesError('github_error', 'Issue title is required');
            const issue = await githubRequest(`/repos/${segment(input.owner)}/${segment(input.repo)}/issues`, {
                method: 'POST',
                body: { title, body: input.body?.trim() || null },
            });
            return normalizeIssue(issue);
        },

        async setIssueState(input: {
            owner: string;
            repo: string;
            number: number;
            state: GithubIssueState;
        }): Promise<GithubIssue> {
            const number = Math.max(1, Math.floor(input.number));
            const issue = await githubRequest(`/repos/${segment(input.owner)}/${segment(input.repo)}/issues/${number}`, {
                method: 'PATCH',
                body: { state: input.state },
            });
            return normalizeIssue(issue);
        },

        async deleteIssue(input: { owner: string; repo: string; number: number }): Promise<void> {
            const number = Math.max(1, Math.floor(input.number));
            const issue = objectBody(await githubRequest(`/repos/${segment(input.owner)}/${segment(input.repo)}/issues/${number}`));
            const data = graphqlData(await githubRequest('/graphql', {
                method: 'POST',
                body: {
                    query: 'query IssueDeleteCapability($owner:String!,$repo:String!,$number:Int!){repository(owner:$owner,name:$repo){issue(number:$number){viewerCanDelete}}}',
                    variables: { owner: input.owner, repo: input.repo, number },
                },
            }));
            const repository = data.repository && typeof data.repository === 'object' ? data.repository as Record<string, unknown> : {};
            const capabilityIssue = repository.issue && typeof repository.issue === 'object' ? repository.issue as Record<string, unknown> : {};
            if (capabilityIssue.viewerCanDelete !== true) {
                throw new GithubIssuesError('permission_denied', 'Permanent Issue deletion is not allowed', 403);
            }
            const issueId = requiredString(issue, 'node_id');
            graphqlData(await githubRequest('/graphql', {
                method: 'POST',
                body: {
                    query: 'mutation DeleteIssue($issueId:ID!){deleteIssue(input:{issueId:$issueId}){repository{id}}}',
                    variables: { issueId },
                },
            }));
        },
    };
}
