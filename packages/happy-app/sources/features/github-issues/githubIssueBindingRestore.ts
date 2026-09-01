import { resolveMessageModeMeta } from '@/sync/messageMeta';
import { machineResumeSession, sessionSetAgentModes } from '@/sync/ops';
import { storage } from '@/sync/storage';
import { sync } from '@/sync/sync';
import { getGithubIssueBindingSessionAvailability } from './githubIssueBindingSessionAvailability';

export async function restoreGithubIssueCanonicalSession(sessionId: string) {
    const session = storage.getState().sessions[sessionId];
    if (!session) return { outcome: 'unavailable' as const };
    if (getGithubIssueBindingSessionAvailability(sessionId) === 'active') {
        return { outcome: 'restored' as const, sessionId };
    }
    const machineId = session.metadata?.machineId;
    if (!machineId) return { outcome: 'unavailable' as const };

    try {
        const mode = resolveMessageModeMeta(session, storage.getState().settings);
        const result = await machineResumeSession({
            machineId,
            sessionId,
            model: mode.model ?? undefined,
            permissionMode: mode.permissionMode,
        });
        if (result.type !== 'success') {
            return { outcome: 'unavailable' as const };
        }
        await sync.refreshSessions();
        if (session.permissionMode) {
            sessionSetAgentModes(result.sessionId, { permissionMode: session.permissionMode });
        }
        return { outcome: 'restored' as const, sessionId: result.sessionId };
    } catch {
        return { outcome: 'unavailable' as const };
    }
}
