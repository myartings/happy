import type { SessionListViewItem, SessionRowData } from '@/sync/storage';

export interface VisibleSessionListOptions {
    hideArchivedSessions: boolean;
    sortActiveSessionsGlobally: boolean;
    groupActiveSessionsByDate?: boolean;
    now?: number;
}

function activityTime(session: SessionRowData): number {
    return session.lastMessageSentAt ?? session.createdAt ?? 0;
}

function filterProjectSessions(
    item: Extract<SessionListViewItem, { type: 'project' }>,
    predicate: (session: SessionRowData) => boolean,
): Extract<SessionListViewItem, { type: 'project' }> | null {
    const workspaces = item.project.workspaces
        .map((workspace) => ({
            ...workspace,
            sessions: workspace.sessions.filter(predicate),
        }))
        .filter((workspace) => workspace.sessions.length > 0);

    if (workspaces.length === 0) return null;
    const sessions = workspaces.flatMap((workspace) => workspace.sessions);
    return {
        ...item,
        project: {
            ...item.project,
            workspaces,
            sessionCount: sessions.length,
            activeCount: sessions.filter((session) => session.active).length,
        },
    };
}

function removeEmptyProjectHeaders(data: readonly SessionListViewItem[]): SessionListViewItem[] {
    const visibleSources = new Set(
        data.flatMap((item) => item.type === 'project' ? [item.source] : []),
    );
    return data.filter((item) =>
        item.type !== 'projects-header' || visibleSources.has(item.source),
    );
}

function filterArchivedSessions(
    data: readonly SessionListViewItem[],
    hideArchivedSessions: boolean,
): SessionListViewItem[] {
    if (!hideArchivedSessions) return [...data];

    const result: SessionListViewItem[] = [];
    let pendingHeader: Extract<SessionListViewItem, { type: 'header' }> | null = null;
    let pendingProjectGroup: Extract<SessionListViewItem, { type: 'project-group' }> | null = null;

    for (const item of data) {
        if (item.type === 'header') {
            pendingHeader = item;
            pendingProjectGroup = null;
            continue;
        }
        if (item.type === 'project-group') {
            pendingProjectGroup = item;
            continue;
        }
        if (item.type === 'session') {
            if (item.session.archived) continue;
            if (pendingHeader) {
                result.push(pendingHeader);
                pendingHeader = null;
            }
            if (pendingProjectGroup) {
                result.push(pendingProjectGroup);
                pendingProjectGroup = null;
            }
            result.push(item);
            continue;
        }

        pendingHeader = null;
        pendingProjectGroup = null;
        if (item.type === 'project') {
            const project = filterProjectSessions(item, (session) => !session.archived);
            if (project) result.push(project);
            continue;
        }
        if (item.type === 'active-sessions') {
            const sessions = item.sessions.filter((session) => !session.archived);
            if (sessions.length > 0) result.push({ ...item, sessions });
            continue;
        }
        result.push(item);
    }

    return removeEmptyProjectHeaders(result);
}

export function buildVisibleSessionListViewData(
    data: readonly SessionListViewItem[] | null,
    options: VisibleSessionListOptions,
): SessionListViewItem[] | null {
    if (!data) return null;

    const visibleData = filterArchivedSessions(data, options.hideArchivedSessions);
    if (!options.sortActiveSessionsGlobally) return visibleData;

    const activeSessions: SessionRowData[] = [];
    const remainingItems: SessionListViewItem[] = [];

    for (const item of visibleData) {
        if (item.type === 'active-sessions') {
            activeSessions.push(...item.sessions);
            continue;
        }
        if (item.type === 'project') {
            for (const workspace of item.project.workspaces) {
                for (const session of workspace.sessions) {
                    if (session.active) activeSessions.push(session);
                }
            }
            const project = filterProjectSessions(item, (session) => !session.active);
            if (project) remainingItems.push(project);
            continue;
        }
        remainingItems.push(item);
    }

    activeSessions.sort((left, right) => activityTime(right) - activityTime(left));
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

    return [...activeItems, ...removeEmptyProjectHeaders(remainingItems)];
}
