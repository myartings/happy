import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    sessions: {} as Record<string, any>, settings: {}, resume: vi.fn(), refresh: vi.fn(), setModes: vi.fn(),
}));
vi.mock('@/sync/storage', () => ({ storage: { getState: () => ({ sessions: mocks.sessions, settings: mocks.settings }) } }));
vi.mock('@/sync/messageMeta', () => ({ resolveMessageModeMeta: () => ({ model: 'model-1', permissionMode: 'auto' }) }));
vi.mock('@/sync/ops', () => ({ machineResumeSession: mocks.resume, sessionSetAgentModes: mocks.setModes }));
vi.mock('@/sync/sync', () => ({ sync: { refreshSessions: mocks.refresh } }));

import { restoreGithubIssueCanonicalSession } from './githubIssueBindingRestore';

describe('restoreGithubIssueCanonicalSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessions = {
            archived: { id: 'archived', active: false, permissionMode: 'auto', metadata: { machineId: 'machine-1' } },
        };
        mocks.resume.mockResolvedValue({ type: 'success', sessionId: 'archived' });
        mocks.refresh.mockResolvedValue(undefined);
    });

    it('resumes the archived canonical Session and refreshes it before opening', async () => {
        await expect(restoreGithubIssueCanonicalSession('archived'))
            .resolves.toEqual({ outcome: 'restored', sessionId: 'archived' });
        expect(mocks.resume).toHaveBeenCalledWith({
            machineId: 'machine-1', sessionId: 'archived', model: 'model-1', permissionMode: 'auto',
        });
        expect(mocks.refresh).toHaveBeenCalledOnce();
    });

    it('resumes an explicitly archived Session even when the legacy active flag is still true', async () => {
        mocks.sessions.archived = {
            id: 'archived', active: true, permissionMode: 'auto',
            metadata: { machineId: 'machine-1', lifecycleState: 'archived' },
        };

        await expect(restoreGithubIssueCanonicalSession('archived'))
            .resolves.toEqual({ outcome: 'restored', sessionId: 'archived' });
        expect(mocks.resume).toHaveBeenCalledOnce();
    });

    it('preserves recovery when resume fails', async () => {
        mocks.resume.mockResolvedValue({ type: 'error', errorMessage: 'machine offline' });
        await expect(restoreGithubIssueCanonicalSession('archived'))
            .resolves.toEqual({ outcome: 'unavailable' });
    });

    it('does not expose thrown daemon errors', async () => {
        mocks.resume.mockRejectedValue(new Error('daemon secret detail'));
        await expect(restoreGithubIssueCanonicalSession('archived'))
            .resolves.toEqual({ outcome: 'unavailable' });
    });
});
