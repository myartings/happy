import type { SessionListViewItem, SessionRowData } from '@/sync/storage';

export interface VisibleSessionListOptions {
    hideArchivedSessions: boolean;
    sortActiveSessionsGlobally: boolean;
    groupActiveSessionsByDate?: boolean;
    needsAttentionSessionsEnabled?: boolean;
    pinnedSessionIds?: readonly string[];
    favoriteProjectIds?: readonly string[];
    now?: number;
}

function stablePreferredFirst<T>(items: readonly T[], preferred: (item: T) => boolean): T[] {
    return items
        .map((item, index) => ({ item, index }))
        .sort((left, right) => Number(preferred(right.item)) - Number(preferred(left.item)) || left.index - right.index)
        .map(({ item }) => item);
}

function applyPinnedSessionOrder(
    data: readonly SessionListViewItem[],
    pinnedSessionIds: readonly string[],
): SessionListViewItem[] {
    if (pinnedSessionIds.length === 0) return [...data];
    const pinned = new Set(pinnedSessionIds);
    const result: SessionListViewItem[] = [];

    for (let index = 0; index < data.length; index += 1) {
        const item = data[index];
        if (item.type === 'project') {
            result.push({
                ...item,
                project: {
                    ...item.project,
                    workspaces: item.project.workspaces.map((workspace) => ({
                        ...workspace,
                        sessions: stablePreferredFirst(workspace.sessions, (session) => pinned.has(session.id)),
                    })),
                },
            });
            continue;
        }
        if (item.type === 'attention-sessions') {
            result.push({
                ...item,
                sessions: item.sessions
                    .map((session, originalIndex) => ({ session, originalIndex }))
                    .sort((left, right) => {
                        const permissionPriority = Number(right.session.state === 'permission_required')
                            - Number(left.session.state === 'permission_required');
                        const pinPriority = Number(pinned.has(right.session.id)) - Number(pinned.has(left.session.id));
                        return permissionPriority || pinPriority || left.originalIndex - right.originalIndex;
                    })
                    .map(({ session }) => session),
            });
            continue;
        }
        if (item.type === 'active-sessions') {
            result.push({
                ...item,
                sessions: stablePreferredFirst(item.sessions, (session) => pinned.has(session.id)),
            });
            continue;
        }
        if (item.type === 'session') {
            const run: Extract<SessionListViewItem, { type: 'session' }>[] = [item];
            while (data[index + 1]?.type === 'session') {
                index += 1;
                run.push(data[index] as Extract<SessionListViewItem, { type: 'session' }>);
            }
            result.push(...stablePreferredFirst(run, (entry) => pinned.has(entry.session.id)));
            continue;
        }
        result.push(item);
    }

    return result;
}

function applyFavoriteProjectOrder(
    data: readonly SessionListViewItem[],
    favoriteProjectIds: readonly string[],
): SessionListViewItem[] {
    if (favoriteProjectIds.length === 0) return [...data];
    const favorites = new Set(favoriteProjectIds);
    const result: SessionListViewItem[] = [];

    for (let index = 0; index < data.length; index += 1) {
        const item = data[index];
        if (item.type !== 'project') {
            result.push(item);
            continue;
        }

        const run: Extract<SessionListViewItem, { type: 'project' }>[] = [item];
        while (true) {
            const next = data[index + 1];
            if (!next || next.type !== 'project' || next.source !== item.source) break;
            index += 1;
            run.push(next);
        }
        result.push(...stablePreferredFirst(run, (entry) => favorites.has(entry.project.id)));
    }

    return result;
}

function applyPreferenceOrder(
    data: readonly SessionListViewItem[],
    options: VisibleSessionListOptions,
): SessionListViewItem[] {
    return applyFavoriteProjectOrder(
        applyPinnedSessionOrder(data, options.pinnedSessionIds ?? []),
        options.favoriteProjectIds ?? [],
    );
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

function removeEmptyFlatHeaders(data: readonly SessionListViewItem[]): SessionListViewItem[] {
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
            if (pendingHeader) result.push(pendingHeader);
            if (pendingProjectGroup) result.push(pendingProjectGroup);
            pendingHeader = null;
            pendingProjectGroup = null;
            result.push(item);
            continue;
        }

        pendingHeader = null;
        pendingProjectGroup = null;
        result.push(item);
    }

    return result;
}

function needsAttention(session: SessionRowData): boolean {
    return !session.archived && (session.state === 'permission_required' || session.hasUnread);
}

function prioritizeAttentionSessions(data: readonly SessionListViewItem[]): SessionListViewItem[] {
    const attentionSessions: SessionRowData[] = [];
    const remainingItems: SessionListViewItem[] = [];

    for (const item of data) {
        if (item.type === 'attention-sessions') {
            attentionSessions.push(...item.sessions);
            continue;
        }
        if (item.type === 'active-sessions') {
            const attention = item.sessions.filter(needsAttention);
            const remaining = item.sessions.filter((session) => !needsAttention(session));
            attentionSessions.push(...attention);
            if (remaining.length > 0) remainingItems.push({ ...item, sessions: remaining });
            continue;
        }
        if (item.type === 'project') {
            for (const workspace of item.project.workspaces) {
                attentionSessions.push(...workspace.sessions.filter(needsAttention));
            }
            const project = filterProjectSessions(item, (session) => !needsAttention(session));
            if (project) remainingItems.push(project);
            continue;
        }
        if (item.type === 'session' && needsAttention(item.session)) {
            attentionSessions.push(item.session);
            continue;
        }
        remainingItems.push(item);
    }

    if (attentionSessions.length === 0) return [...data];

    attentionSessions.sort((left, right) => {
        const permissionPriority = Number(right.state === 'permission_required')
            - Number(left.state === 'permission_required');
        return permissionPriority || activityTime(right) - activityTime(left);
    });

    const cleanedItems = removeEmptyProjectHeaders(removeEmptyFlatHeaders(remainingItems));
    return [{ type: 'attention-sessions', sessions: attentionSessions }, ...cleanedItems];
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
        if (item.type === 'active-sessions' || item.type === 'attention-sessions') {
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
    const prioritize = (items: readonly SessionListViewItem[]) => options.needsAttentionSessionsEnabled === false
        ? [...items]
        : prioritizeAttentionSessions(items);
    if (!options.sortActiveSessionsGlobally) return applyPreferenceOrder(prioritize(visibleData), options);

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

    return applyPreferenceOrder(
        prioritize([...activeItems, ...removeEmptyProjectHeaders(remainingItems)]),
        options,
    );
}
