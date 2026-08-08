import { describe, expect, it } from 'vitest';
import { isGithubIssuesEnabled } from './githubIssuesFeature';

describe('isGithubIssuesEnabled', () => {
    it('fails closed unless explicitly enabled', () => {
        expect(isGithubIssuesEnabled({})).toBe(false);
        expect(isGithubIssuesEnabled({ HAPPY_GITHUB_ISSUES_ENABLED: 'false' })).toBe(false);
        expect(isGithubIssuesEnabled({ HAPPY_GITHUB_ISSUES_ENABLED: 'true' })).toBe(true);
    });
});

