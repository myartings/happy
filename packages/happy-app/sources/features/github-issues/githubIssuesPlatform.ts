import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { isTauri } from '@/utils/isTauri';
import {
    GithubIssuesError,
    type GithubCredentialStore,
    type GithubHttpRequest,
    type GithubHttpResponse,
    type GithubTransport,
} from './githubIssuesClient';

const MOBILE_CREDENTIAL_KEY = 'happy_github_issues_credentials_v1';
const TRUSTED_HOSTS = new Set(['github.com', 'api.github.com']);

async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(command, args);
}

function storageError(error: unknown): GithubIssuesError {
    if (error instanceof GithubIssuesError) return error;
    return new GithubIssuesError('secure_storage_unavailable', 'Secure credential storage is unavailable');
}

export function createPlatformGithubCredentialStore(): GithubCredentialStore {
    if (isTauri()) {
        return {
            async load() {
                try { return await tauriInvoke<string | null>('get_github_issues_credential'); }
                catch (error) { throw storageError(error); }
            },
            async save(value) {
                try { await tauriInvoke('set_github_issues_credential', { value }); }
                catch (error) { throw storageError(error); }
            },
            async remove() {
                try { await tauriInvoke('delete_github_issues_credential'); }
                catch (error) { throw storageError(error); }
            },
        };
    }
    if (Platform.OS === 'web') {
        const unsupported = async (): Promise<never> => {
            throw new GithubIssuesError('unsupported_platform', 'GitHub Issues is available in Happy desktop and mobile');
        };
        return { load: unsupported, save: unsupported, remove: unsupported };
    }
    return {
        async load() {
            try { return await SecureStore.getItemAsync(MOBILE_CREDENTIAL_KEY); }
            catch (error) { throw storageError(error); }
        },
        async save(value) {
            try {
                await SecureStore.setItemAsync(MOBILE_CREDENTIAL_KEY, value, {
                    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
                });
            } catch (error) { throw storageError(error); }
        },
        async remove() {
            try { await SecureStore.deleteItemAsync(MOBILE_CREDENTIAL_KEY); }
            catch (error) { throw storageError(error); }
        },
    };
}

function serializeBody(input: GithubHttpRequest): BodyInit | undefined {
    if (input.body === undefined) return undefined;
    if (input.headers?.['Content-Type'] === 'application/x-www-form-urlencoded') {
        const values = input.body as Record<string, string | number>;
        return new URLSearchParams(Object.entries(values).map(([key, value]) => [key, String(value)])).toString();
    }
    return JSON.stringify(input.body);
}

async function platformFetch(input: GithubHttpRequest): Promise<Response> {
    const url = new URL(input.url);
    if (url.protocol !== 'https:' || !TRUSTED_HOSTS.has(url.hostname)) {
        throw new GithubIssuesError('github_error', 'Refused an untrusted GitHub request');
    }
    const fetchImplementation = isTauri()
        ? (await import('@tauri-apps/plugin-http')).fetch
        : globalThis.fetch;
    const headers = { ...input.headers };
    if (input.body !== undefined && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    return fetchImplementation(input.url, {
        method: input.method,
        headers,
        body: serializeBody({ ...input, headers }),
        signal: input.signal,
    });
}

export function createPlatformGithubTransport(): GithubTransport {
    return {
        async request(input): Promise<GithubHttpResponse> {
            let response: Response;
            let text: string;
            try {
                response = await platformFetch(input);
                text = await response.text();
            } catch (error) {
                if (error instanceof GithubIssuesError) throw error;
                if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
                    throw new GithubIssuesError('authorization_cancelled', 'GitHub authorization was cancelled');
                }
                throw new GithubIssuesError('offline', 'Unable to reach GitHub');
            }
            let body: unknown = null;
            if (text) {
                try { body = JSON.parse(text); }
                catch { body = { message: 'GitHub returned an unreadable response' }; }
            }
            const headers: Record<string, string> = {};
            response.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
            return { status: response.status, headers, body };
        },
    };
}
