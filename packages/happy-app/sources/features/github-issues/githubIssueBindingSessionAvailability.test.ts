import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ sessions: {} as Record<string, any> }));

vi.mock('@/sync/storage', () => ({
    storage: { getState: () => ({ sessions: mocks.sessions }) },
}));
vi.mock('@/sync/rig', () => ({
    isRigMetadata: (metadata: any) => metadata?.rigMetadataVersion === 1,
}));

import { getGithubIssueBindingSessionAvailability } from './githubIssueBindingSessionAvailability';

describe('GitHub Issue binding Session availability', () => {
    beforeEach(() => {
        mocks.sessions = {
            active: { active: true, metadata: {} },
            archived: { active: false, metadata: {} },
            explicitArchived: { active: true, metadata: { lifecycleState: 'archived' } },
            offlineRig: { active: false, metadata: { rigMetadataVersion: 1 } },
        };
    });

    it('classifies exact synced Sessions as active, archived, or missing', () => {
        expect(getGithubIssueBindingSessionAvailability('active')).toBe('active');
        expect(getGithubIssueBindingSessionAvailability('archived')).toBe('archived');
        expect(getGithubIssueBindingSessionAvailability('explicitArchived')).toBe('archived');
        expect(getGithubIssueBindingSessionAvailability('offlineRig')).toBe('active');
        expect(getGithubIssueBindingSessionAvailability('deleted')).toBe('missing');
    });
});
