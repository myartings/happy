import type { SessionListViewItem, SessionRowData } from '@/sync/storage';

function sessionNeedsAttention(session: SessionRowData): boolean {
    return !session.archived && (
        session.hasUnread
        || session.state === 'permission_required'
        || session.state === 'input_required'
    );
}

function visitCodexFirstSessions(
    data: readonly SessionListViewItem[],
    visit: (session: SessionRowData) => void,
): void {
    for (const item of data) {
        if (item.type === 'attention-sessions' || item.type === 'active-sessions') {
            item.sessions.forEach(visit);
        } else if (item.type === 'project') {
            item.project.workspaces.forEach((workspace) => workspace.sessions.forEach(visit));
        } else if (item.type === 'session') {
            visit(item.session);
        }
    }
}

export function countCodexFirstAttentionSessions(
    data: readonly SessionListViewItem[] | null,
): number {
    if (!data) return 0;
    const sessionIds = new Set<string>();
    const add = (session: SessionRowData) => {
        if (sessionNeedsAttention(session)) sessionIds.add(session.id);
    };

    visitCodexFirstSessions(data, add);

    return sessionIds.size;
}

export type CodexFirstNotificationTarget =
    | Readonly<{ kind: 'session'; sessionId: string }>
    | Readonly<{ kind: 'inbox' }>;

export function resolveCodexFirstNotificationTarget(
    data: readonly SessionListViewItem[] | null,
): CodexFirstNotificationTarget {
    if (!data) return { kind: 'inbox' };
    let sessionId: string | null = null;
    visitCodexFirstSessions(data, (session) => {
        if (sessionId === null && sessionNeedsAttention(session)) sessionId = session.id;
    });
    return sessionId === null ? { kind: 'inbox' } : { kind: 'session', sessionId };
}
