import { describe, expect, it, vi } from 'vitest';
import { loadGithubIssueBindingProjectionRecords } from './githubIssueBindingProjectionLoad';

describe('loadGithubIssueBindingProjectionRecords', () => {
    it('keeps canonical bindings when optional transfer history reaches capacity', async () => {
        const bindings = [{ issueKey: 'issue-key', sessionId: 'session-current' }];
        const api = {
            list: vi.fn(async () => bindings),
            history: vi.fn(async () => { throw new Error('capacity exceeded'); }),
        };

        await expect(loadGithubIssueBindingProjectionRecords(api))
            .resolves.toEqual({ bindings, history: [] });
    });

    it('still fails closed when canonical bindings cannot be loaded', async () => {
        const api = {
            list: vi.fn(async () => { throw new Error('capacity exceeded'); }),
            history: vi.fn(async () => []),
        };

        await expect(loadGithubIssueBindingProjectionRecords(api))
            .rejects.toThrow('capacity exceeded');
    });
});
