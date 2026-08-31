import { describe, expect, it, vi } from 'vitest';
import {
    publishGithubIssueBindingInvalidation,
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
});
