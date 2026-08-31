import { describe, expect, it } from 'vitest';
import {
    isGithubIssueBindingAccountGenerationCurrent,
    isGithubIssueBindingCacheOwnedByAccount,
} from './githubIssueBindingAccount';

describe('GitHub Issue binding account isolation', () => {
    it('rejects cache material derived for another account', () => {
        expect(isGithubIssueBindingCacheOwnedByAccount('scope-a', 'scope-b')).toBe(false);
        expect(isGithubIssueBindingCacheOwnedByAccount('scope-a', 'scope-a')).toBe(true);
    });

    it('rejects an asynchronous result after logout or account switch', () => {
        expect(isGithubIssueBindingAccountGenerationCurrent('token-a', null)).toBe(false);
        expect(isGithubIssueBindingAccountGenerationCurrent('token-a', 'token-b')).toBe(false);
        expect(isGithubIssueBindingAccountGenerationCurrent('token-a', 'token-a')).toBe(true);
    });
});
