import { afterEach, describe, expect, it, vi } from 'vitest';
import { githubTransport } from './githubIssuesRuntime';

describe('githubTransport', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('normalizes a permanently deleted GitHub Issue response as not found', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
            JSON.stringify({ message: 'Gone' }),
            { status: 410, headers: { 'Content-Type': 'application/json' } },
        )));

        await expect(githubTransport.request('token', 'GET', '/repos/myartings/happy/issues/21'))
            .rejects.toMatchObject({
                statusCode: 410,
                code: 'github_not_found',
            });
    });
});
