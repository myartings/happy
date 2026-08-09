import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ Platform: { OS: 'web' } }));
vi.mock('@/utils/isTauri', () => ({ isTauri: () => false }));
vi.mock('expo-secure-store', () => ({
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1,
    getItemAsync: vi.fn(),
    setItemAsync: vi.fn(),
    deleteItemAsync: vi.fn(),
}));

import { createPlatformGithubCredentialStore, createPlatformGithubTransport } from './githubIssuesPlatform';

describe('GitHub Issues platform adapters', () => {
    beforeEach(() => vi.unstubAllGlobals());

    it('does not provide a browser credential-storage fallback', async () => {
        const store = createPlatformGithubCredentialStore();

        await expect(store.load()).rejects.toMatchObject({ code: 'unsupported_platform' });
    });

    it('refuses to attach GitHub credentials to an untrusted host', async () => {
        const fetch = vi.fn();
        vi.stubGlobal('fetch', fetch);
        const transport = createPlatformGithubTransport();

        await expect(transport.request({
            method: 'GET',
            url: 'https://example.com/steal',
            headers: { Authorization: 'Bearer secret' },
        })).rejects.toMatchObject({ code: 'github_error' });
        expect(fetch).not.toHaveBeenCalled();
    });

    it('normalizes a response-body read failure instead of leaking Failed to fetch', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            text: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
        }));
        const transport = createPlatformGithubTransport();

        await expect(transport.request({
            method: 'POST',
            url: 'https://github.com/login/device/code',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: { client_id: 'Iv1.public' },
        })).rejects.toMatchObject({
            code: 'offline',
            message: 'Unable to reach GitHub',
        });
    });
});
