import { beforeEach, describe, expect, it } from 'vitest';
import {
    clearGithubIssuesWorkspaceMemory,
    getGithubIssuesWorkspaceSelection,
    rememberGithubIssuesWorkspaceSelection,
} from './githubIssuesWorkspace';

describe('GitHub Issues workspace memory', () => {
    beforeEach(clearGithubIssuesWorkspaceMemory);

    it('keeps Issue selection isolated by parent Session', () => {
        rememberGithubIssuesWorkspaceSelection('session-a', {
            repository: { owner: 'myartings', repo: 'happy' },
            mode: 'detail',
            issueNumber: 42,
        });

        expect(getGithubIssuesWorkspaceSelection('session-a')?.issueNumber).toBe(42);
        expect(getGithubIssuesWorkspaceSelection('session-b')).toBeNull();
    });
});
