import { describe, expect, it } from 'vitest';
import {
    buildGithubIssueDispatchTask,
    createGithubIssueDetailState,
    createGithubIssueDispatchState,
    createGithubIssueDraftState,
    createGithubIssuesCollectionState,
    createGithubIssuesListState,
    getGithubIssueRelativeTime,
    getGithubIssuesErrorMessage,
    reduceGithubIssuesCollectionState,
    shouldShowGithubIssuesSessionEntry,
} from './githubIssuesPresentation';
import { isSameGithubRepository } from './githubRepository';

describe('GitHub Issues collection presentation', () => {
    it('normalizes known transport failures inside the feature module', () => {
        expect(getGithubIssuesErrorMessage(Object.assign(new Error('fetch failed'), { code: 'offline' }))).toBe('Unable to reach GitHub. Check your connection and try again.');
        expect(getGithubIssuesErrorMessage(new Error('specific failure'))).toBe('specific failure');
    });
    it('distinguishes initial loading from a successful result', () => {
        const initial = createGithubIssuesCollectionState<{ number: number }>();
        const loading = reduceGithubIssuesCollectionState(initial, { type: 'load' });
        const ready = reduceGithubIssuesCollectionState(loading, {
            type: 'success',
            items: [{ number: 241 }],
        });

        expect(loading).toEqual({ status: 'loading', items: [], error: null });
        expect(ready).toEqual({
            status: 'ready',
            items: [{ number: 241 }],
            error: null,
        });
    });

    it('preserves existing Issues when a refresh fails', () => {
        const ready = createGithubIssuesCollectionState([{ number: 241 }]);
        const refreshing = reduceGithubIssuesCollectionState(ready, { type: 'load' });
        const failed = reduceGithubIssuesCollectionState(refreshing, {
            type: 'failure',
            error: 'Unable to reach GitHub',
        });

        expect(refreshing).toEqual({
            status: 'refreshing',
            items: [{ number: 241 }],
            error: null,
        });
        expect(failed).toEqual({
            status: 'error',
            items: [{ number: 241 }],
            error: 'Unable to reach GitHub',
        });
    });
});

describe('GitHub Issue relative metadata', () => {
    it('returns translatable relative-time descriptors', () => {
        const now = Date.parse('2026-08-10T12:00:00.000Z');

        expect(getGithubIssueRelativeTime('2026-08-10T11:59:30.000Z', now)).toEqual({
            unit: 'now',
            value: 0,
        });
        expect(getGithubIssueRelativeTime('2026-08-10T11:58:00.000Z', now)).toEqual({
            unit: 'minute',
            value: 2,
        });
        expect(getGithubIssueRelativeTime('2026-08-10T09:00:00.000Z', now)).toEqual({
            unit: 'hour',
            value: 3,
        });
        expect(getGithubIssueRelativeTime('2026-08-08T12:00:00.000Z', now)).toEqual({
            unit: 'day',
            value: 2,
        });
        expect(getGithubIssueRelativeTime('not-a-date', now)).toBeNull();
    });
});

describe('GitHub repository identity', () => {
    it('matches owner and repository names without case sensitivity', () => {
        expect(
            isSameGithubRepository(
                { owner: 'MyArtings', repo: 'Happy' },
                { owner: 'myartings', repo: 'happy' },
            ),
        ).toBe(true);
        expect(
            isSameGithubRepository(
                { owner: 'myartings', repo: 'happy' },
                { owner: 'slopus', repo: 'happy' },
            ),
        ).toBe(false);
        expect(isSameGithubRepository(null, { owner: 'myartings', repo: 'happy' })).toBe(false);
    });
});

describe('GitHub Issue Session dispatch', () => {
    it('shows the Session Issues entry in Happy Desktop', () => {
        expect(shouldShowGithubIssuesSessionEntry({
            enabled: true,
            hasSession: true,
            deviceType: 'desktop',
            platform: 'web',
            isTauri: true,
        })).toBe(true);
    });

    it('builds a triage-first task without exposing Issue transport details', () => {
        const task = buildGithubIssueDispatchTask({
            repository: { owner: 'myartings', repo: 'happy' },
            workflow: 'triage-first',
            issue: {
                number: 241,
                title: '  Improve\nGitHub Issues UI  ',
                url: 'https://github.com/myartings/happy/issues/241',
            },
        });

        expect(task).toEqual({
            repository: { owner: 'myartings', repo: 'happy' },
            issueNumber: 241,
            title: 'Issue #241: Improve GitHub Issues UI',
            prompt: [
                '/triage #241',
                '',
                'Work on GitHub Issue #241 in myartings/happy.',
                'Title: Improve GitHub Issues UI',
                'Issue: https://github.com/myartings/happy/issues/241',
                '',
                'Follow the repository instructions and complete required triage before implementation.',
                'After triage is ready for Agent execution, continue through the repository development workflow in this Session.',
            ].join('\n'),
        });
        expect(task.prompt).not.toContain('accessToken');
        expect(task.prompt).not.toContain('installationId');
    });

    it('does not invent Triage for repositories without that workflow', () => {
        const task = buildGithubIssueDispatchTask({
            repository: { owner: 'octocat', repo: 'hello-world' },
            workflow: 'repository-rules',
            issue: {
                number: 7,
                title: 'Fix the greeting',
                url: 'https://github.com/octocat/hello-world/issues/7',
            },
        });

        expect(task.prompt).not.toContain('/triage');
        expect(task.prompt).toContain('Follow the repository instructions before implementation.');
    });
});

describe('GitHub Issues screen contracts', () => {
    it('creates safe initial controller state for each screen flow', () => {
        expect(createGithubIssuesListState()).toEqual({
            connection: { status: 'checking' },
            repositories: { status: 'idle', items: [], error: null },
            selectedRepository: null,
            filter: 'open',
            issues: { status: 'idle', items: [], error: null },
        });
        expect(createGithubIssueDetailState()).toEqual({
            status: 'idle',
            issue: null,
            mutation: null,
            error: null,
        });
        expect(createGithubIssueDraftState({ owner: 'myartings', repo: 'happy' })).toEqual({
            repository: { owner: 'myartings', repo: 'happy' },
            title: '',
            body: '',
            status: 'editing',
            createdIssue: null,
            error: null,
        });
        expect(createGithubIssueDispatchState()).toEqual({
            status: 'idle',
            task: null,
            error: null,
        });
    });
});
