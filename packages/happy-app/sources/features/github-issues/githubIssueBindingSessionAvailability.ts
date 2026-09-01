import { isRigMetadata } from '@/sync/rig';
import { storage } from '@/sync/storage';

export type GithubIssueBindingSessionAvailability = 'active' | 'archived' | 'missing';

export function getGithubIssueBindingSessionAvailability(
    sessionId: string,
): GithubIssueBindingSessionAvailability {
    const session = storage.getState().sessions[sessionId];
    if (!session) return 'missing';
    if (
        session.metadata?.lifecycleState === 'archived'
        || (!isRigMetadata(session.metadata) && !session.active)
    ) {
        return 'archived';
    }
    return 'active';
}
