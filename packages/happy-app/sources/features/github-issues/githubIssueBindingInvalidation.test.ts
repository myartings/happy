import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
    getGithubIssueBindingMissedInvalidationEpoch,
    publishGithubIssueBindingInvalidation,
    publishGithubIssueBindingInvalidationIfEnabled,
    subscribeGithubIssueBindingInvalidation,
} from './githubIssueBindingInvalidation';

describe('GitHub Issue binding invalidation', () => {
    it('notifies active consumers and stops after unsubscribe', () => {
        const listener = vi.fn();
        const unsubscribe = subscribeGithubIssueBindingInvalidation(listener);
        const event = { issueKeys: ['a'.repeat(64)] };

        publishGithubIssueBindingInvalidation(event);
        unsubscribe();
        publishGithubIssueBindingInvalidation({ issueKeys: ['b'.repeat(64)] });

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(event);
    });

    it('does not notify projection refresh consumers while the feature is disabled', () => {
        const listener = vi.fn();
        const unsubscribe = subscribeGithubIssueBindingInvalidation(listener);
        const event = { issueKeys: ['a'.repeat(64)] };
        const epochBeforeDisable = getGithubIssueBindingMissedInvalidationEpoch();

        publishGithubIssueBindingInvalidationIfEnabled(false, event);
        expect(getGithubIssueBindingMissedInvalidationEpoch()).toBe(epochBeforeDisable + 1);
        publishGithubIssueBindingInvalidationIfEnabled(true, event);
        unsubscribe();

        expect(listener).toHaveBeenCalledOnce();
        expect(listener).toHaveBeenCalledWith(event);
        expect(getGithubIssueBindingMissedInvalidationEpoch()).toBe(epochBeforeDisable + 1);
    });

    it('gates socket invalidation publication with the current local feature setting', () => {
        const syncSource = readFileSync(new URL('../../sync/sync.ts', import.meta.url), 'utf8');

        expect(syncSource).toContain('publishGithubIssueBindingInvalidationIfEnabled(');
        expect(syncSource).toContain('storage.getState().localSettings.devGithubIssuesEnabled');
    });

    it('forces the next projection ensure to observe a disabled-period invalidation', () => {
        const storeSource = readFileSync(new URL('./githubIssueBindingStore.ts', import.meta.url), 'utf8');

        expect(storeSource).toContain('getGithubIssueBindingMissedInvalidationEpoch()');
        expect(storeSource).toContain('projectionBootstrapMissedInvalidationEpoch === missedInvalidationEpoch');
        expect(storeSource).toContain('projectionBootstrapMissedInvalidationEpoch = missedInvalidationEpoch;');
    });
});
