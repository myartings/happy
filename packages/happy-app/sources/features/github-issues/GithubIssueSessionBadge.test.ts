import { describe, expect, it } from 'vitest';
import { formatGithubIssueSessionBadgeLabel, getGithubIssueSessionBadgeState } from './githubIssueBindingBadgeState';

describe('getGithubIssueSessionBadgeState', () => {
    it('shows explicit non-color states for current, cached, stale, replaced, repair, and conflict projections', () => {
        expect(getGithubIssueSessionBadgeState('bound', 'current')).toBe('current');
        expect(getGithubIssueSessionBadgeState('bound', 'unavailable')).toBe('cached');
        expect(getGithubIssueSessionBadgeState('bound', 'changed')).toBe('stale');
        expect(getGithubIssueSessionBadgeState('replaced', 'current')).toBe('replaced');
        expect(getGithubIssueSessionBadgeState('repair-required', 'unavailable')).toBe('repair-required');
        expect(getGithubIssueSessionBadgeState('bound', 'identity-conflict')).toBe('identity-conflict');
    });
});

describe('formatGithubIssueSessionBadgeLabel', () => {
    it('projects both the Issue identity and cached title into list badges', () => {
        expect(formatGithubIssueSessionBadgeLabel({
            ownerSnapshot: 'myartings',
            repositorySnapshot: 'happy',
            number: 79,
            titleSnapshot: 'Canonical 1:1 Happy Session binding',
        })).toBe('myartings/happy#79 · Canonical 1:1 Happy Session binding');
    });
});
