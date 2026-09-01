import { describe, expect, it, vi } from 'vitest';

vi.mock('./githubIssueBindingStore', () => ({
    refreshGithubIssueSessionProjections: vi.fn(async () => undefined),
}));

import { reconcileGithubIssueBindingsAfterReconnect } from './githubIssueBindingReconnect';

describe('GitHub Issue binding reconnect reconciliation', () => {
    it('forces a list/history refresh after a missed socket invalidation', async () => {
        const refresh = vi.fn(async () => undefined);

        await reconcileGithubIssueBindingsAfterReconnect(true, refresh);

        expect(refresh).toHaveBeenCalledOnce();
    });

    it('keeps reconnect behavior unchanged while the personal feature is disabled', async () => {
        const refresh = vi.fn(async () => undefined);

        await reconcileGithubIssueBindingsAfterReconnect(false, refresh);

        expect(refresh).not.toHaveBeenCalled();
    });
});
