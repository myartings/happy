import { describe, expect, it, vi } from 'vitest';
import { createGithubIssueBindingRefreshQueue } from './githubIssueBindingRefreshQueue';

describe('createGithubIssueBindingRefreshQueue', () => {
    it('runs one trailing refresh when invalidated during an active refresh', async () => {
        let release!: () => void;
        const first = new Promise<void>((resolve) => { release = resolve; });
        const run = vi.fn()
            .mockReturnValueOnce(first)
            .mockResolvedValue(undefined);
        const queue = createGithubIssueBindingRefreshQueue(run);

        const active = queue.request();
        const coalesced = queue.request();
        expect(coalesced).toBe(active);
        expect(run).toHaveBeenCalledTimes(1);

        release();
        await active;
        expect(run).toHaveBeenCalledTimes(2);
    });

    it('coalesces multiple invalidations into one trailing refresh', async () => {
        let release!: () => void;
        const run = vi.fn()
            .mockReturnValueOnce(new Promise<void>((resolve) => { release = resolve; }))
            .mockResolvedValue(undefined);
        const queue = createGithubIssueBindingRefreshQueue(run);

        const active = queue.request();
        queue.request();
        queue.request();
        release();
        await active;

        expect(run).toHaveBeenCalledTimes(2);
    });
});
