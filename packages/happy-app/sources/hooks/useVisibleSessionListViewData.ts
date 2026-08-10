import * as React from 'react';
import { SessionListViewItem, useSessionListViewData, useSetting } from '@/sync/storage';
import { buildVisibleSessionListViewData } from '@/utils/visibleSessionListViewData';

/**
 * Applies archive visibility plus the personal active-session ordering options
 * to both the shared project-card layout and the legacy flat list shape.
 *
 * The synced setting keeps its historical `hideInactiveSessions` key, but its
 * current meaning is "hide archived sessions". A disconnected Rig session is
 * still live work and must remain visible until its lifecycle is archived.
 */
export function useVisibleSessionListViewData(): SessionListViewItem[] | null {
    const data = useSessionListViewData();
    const hideArchivedSessions = useSetting('hideInactiveSessions');
    const sortActiveSessionsGlobally = useSetting('sortActiveSessionsGlobally');
    const groupActiveSessionsByDate = useSetting('groupActiveSessionsByDate');
    const needsAttentionSessionsEnabled = useSetting('needsAttentionSessionsEnabled');
    const pinnedSessionIds = useSetting('pinnedSessionIds');
    const favoriteProjectIds = useSetting('favoriteProjectIds');

    return React.useMemo(() => buildVisibleSessionListViewData(data, {
        hideArchivedSessions,
        sortActiveSessionsGlobally,
        groupActiveSessionsByDate,
        needsAttentionSessionsEnabled,
        pinnedSessionIds,
        favoriteProjectIds,
    }), [data, hideArchivedSessions, sortActiveSessionsGlobally, groupActiveSessionsByDate, needsAttentionSessionsEnabled, pinnedSessionIds, favoriteProjectIds]);
}

/** Whether the unfiltered list contains at least one archived session. */
export function useHasArchivedSessions(): boolean {
    const data = useSessionListViewData();
    return React.useMemo(() => {
        if (!data) return false;
        return data.some((item) => {
            if (item.type === 'project') {
                return item.project.workspaces.some((workspace) =>
                    workspace.sessions.some((session) => session.archived),
                );
            }
            if (item.type === 'active-sessions' || item.type === 'attention-sessions') {
                return item.sessions.some((session) => session.archived);
            }
            return item.type === 'session' && item.session.archived;
        });
    }, [data]);
}
