import { db } from '@/storage/db';
import { decryptString, encryptString } from '@/modules/encrypt';
import { createGithubIssuesService, type GithubTransport } from './githubIssuesService';

const GITHUB_API_URL = 'https://api.github.com';

export class GithubIssuesError extends Error {
    constructor(
        message: string,
        readonly statusCode: number,
        readonly code: string,
    ) {
        super(message);
    }
}

export const githubTransport: GithubTransport = {
    async request<T>(token: string, method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown) {
        const response = await fetch(`${GITHUB_API_URL}${path}`, {
            method,
            headers: {
                Accept: path === '/graphql' ? 'application/json' : 'application/vnd.github+json',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'Happy-GitHub-Issues',
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const payload = await response.json().catch(() => null) as { message?: string; errors?: unknown } | null;
        if (!response.ok) {
            const code = response.status === 401 ? 'github_auth_required'
                : response.status === 429 || response.headers.get('x-ratelimit-remaining') === '0' ? 'github_rate_limited'
                    : response.status === 403 ? 'github_forbidden'
                    : response.status === 404 || response.status === 410 ? 'github_not_found'
                        : 'github_request_failed';
            throw new GithubIssuesError(payload?.message ?? 'GitHub request failed', response.status, code);
        }
        if (payload && Array.isArray((payload as { errors?: unknown }).errors)) {
            throw new GithubIssuesError('GitHub GraphQL request failed', 400, 'github_graphql_error');
        }
        return payload as T;
    },
};

const refreshes = new Map<string, Promise<string>>();

async function refreshUserToken(userId: string, githubUserId: string, encryptedRefreshToken: Uint8Array<ArrayBuffer>): Promise<string> {
    const existing = refreshes.get(userId);
    if (existing) return existing;
    const refresh = (async () => {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        if (!clientId || !clientSecret) throw new GithubIssuesError('GitHub reconnect required', 401, 'github_reconnect_required');
        const refreshToken = decryptString(['user', userId, 'github', 'refresh-token'], encryptedRefreshToken);
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'refresh_token', refresh_token: refreshToken }),
        });
        const payload = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number; refresh_token_expires_in?: number };
        if (!response.ok || !payload.access_token) throw new GithubIssuesError('GitHub reconnect required', 401, 'github_reconnect_required');
        await db.githubUser.update({ where: { id: githubUserId }, data: {
            token: encryptString(['user', userId, 'github', 'token'], payload.access_token),
            refreshToken: payload.refresh_token ? encryptString(['user', userId, 'github', 'refresh-token'], payload.refresh_token) : undefined,
            tokenExpiresAt: payload.expires_in ? new Date(Date.now() + payload.expires_in * 1000) : undefined,
            refreshTokenExpiresAt: payload.refresh_token_expires_in ? new Date(Date.now() + payload.refresh_token_expires_in * 1000) : undefined,
        } });
        return payload.access_token;
    })().finally(() => refreshes.delete(userId));
    refreshes.set(userId, refresh);
    return refresh;
}

async function getUserToken(userId: string): Promise<string> {
    const account = await db.account.findUnique({
        where: { id: userId },
        select: { githubUser: { select: { id: true, token: true, refreshToken: true, tokenExpiresAt: true, authKind: true } } },
    });
    if (!account?.githubUser?.token) {
        throw new GithubIssuesError('Connect GitHub before using issues', 401, 'github_not_connected');
    }
    if (account.githubUser.authKind !== 'github_app') {
        throw new GithubIssuesError('Reconnect GitHub to authorize selected repositories', 401, 'github_reconnect_required');
    }
    if (account.githubUser.tokenExpiresAt && account.githubUser.tokenExpiresAt.getTime() <= Date.now() + 60_000) {
        if (!account.githubUser.refreshToken) throw new GithubIssuesError('GitHub reconnect required', 401, 'github_reconnect_required');
        return refreshUserToken(userId, account.githubUser.id, account.githubUser.refreshToken);
    }
    return decryptString(['user', userId, 'github', 'token'], account.githubUser.token);
}

export const githubIssuesService = createGithubIssuesService({ getUserToken, transport: githubTransport });
