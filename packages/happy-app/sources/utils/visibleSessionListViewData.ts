import type { SessionListViewItem, SessionRowData } from '@/sync/storage';

export interface VisibleSessionListOptions {
    hideInactiveSessions: boolean;
    sortActiveSessionsGlobally: boolean;
    groupActiveSessionsByDate?: boolean;
    now?: number;
}

function activityTime(session: SessionRowData): number {
    return session.lastMessageSentAt ?? session.createdAt ?? 0;
}

export function buildVisibleSessionListViewData(
    data: readonly SessionListViewItem[] | null,
    options: VisibleSessionListOptions,
): SessionListViewItem[] | null {
    if (!data) {
        return null;
    }

    let sourceData = [...data];

    if (options.sortActiveSessionsGlobally) {
        const activeSessions: SessionRowData[] = [];
        const remainingItems: SessionListViewItem[] = [];

        for (const item of sourceData) {
            if (item.type === 'active-sessions') {
                activeSessions.push(...item.sessions);
                continue;
            }

            if (item.type !== 'project') {
                remainingItems.push(item);
                continue;
            }

            const workspaces = item.project.workspaces
                .map((workspace) => {
                    const inactiveSessions = workspace.sessions.filter((session) => {
                        if (session.active) {
                            activeSessions.push(session);
                            return false;
                        }
                        return true;
                    });
                    return { ...workspace, sessions: inactiveSessions };
                })
                .filter((workspace) => workspace.sessions.length > 0);

            if (workspaces.length > 0) {
                const sessions = workspaces.flatMap((workspace) => workspace.sessions);
                remainingItems.push({
                    ...item,
                    project: {
                        ...item.project,
                        workspaces,
                        sessionCount: sessions.length,
                        activeCount: 0,
                    },
                });
            }
        }

        activeSessions.sort((left, right) => activityTime(right) - activityTime(left));
        const hasRemainingProjects = remainingItems.some((item) => item.type === 'project');
        const activeItems: SessionListViewItem[] = [];
        if (options.groupActiveSessionsByDate && activeSessions.length > 0) {
            const now = new Date(options.now ?? Date.now());
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const today = activeSessions.filter((session) => activityTime(session) >= startOfToday);
            const earlier = activeSessions.filter((session) => activityTime(session) < startOfToday);
            if (today.length > 0) activeItems.push({ type: 'active-sessions', period: 'today', sessions: today });
            if (earlier.length > 0) activeItems.push({ type: 'active-sessions', period: 'earlier', sessions: earlier });
        } else if (activeSessions.length > 0) {
            activeItems.push({ type: 'active-sessions', sessions: activeSessions });
        }

        sourceData = [
            ...activeItems,
            ...remainingItems.filter((item) => item.type !== 'projects-header' || hasRemainingProjects),
        ];
    }

    const result: SessionListViewItem[] = [];
    const projects = sourceData.filter((item) => item.type === 'projects-header' || item.type === 'project');
    const active = sourceData.filter((item) => item.type === 'active-sessions');

    if (options.sortActiveSessionsGlobally) {
        result.push(...active);
    }
    result.push(...projects);
    if (!options.sortActiveSessionsGlobally) {
        result.push(...active);
    }

    const hasInactive = sourceData.some((item) => item.type === 'session' && !item.session.active);
    if (hasInactive) {
        result.push({ type: 'archive-toggle', hidden: options.hideInactiveSessions });
    }

    if (!options.hideInactiveSessions) {
        let pendingProjectGroup: SessionListViewItem | null = null;

        for (const item of sourceData) {
            if (item.type === 'active-sessions' || item.type === 'projects-header' || item.type === 'project') {
                continue;
            }
            if (item.type === 'project-group') {
                pendingProjectGroup = item;
                continue;
            }
            if (item.type === 'session') {
                if (!item.session.active) {
                    if (pendingProjectGroup) {
                        result.push(pendingProjectGroup);
                        pendingProjectGroup = null;
                    }
                    result.push(item);
                }
                continue;
            }

            pendingProjectGroup = null;
            if (item.type === 'header') {
                result.push(item);
            }
        }
    }

    return result;
}
