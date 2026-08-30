import type { SessionListViewItem } from '@/sync/storage';

export type CodexFirstHomeState =
    | 'loading'
    | 'no-machines'
    | 'reconnecting'
    | 'all-offline'
    | 'connection-error'
    | 'archived-only'
    | 'no-sessions'
    | 'ready';

type ResolveCodexFirstHomeStateInput = {
    dataLoaded: boolean;
    hasArchivedSessions: boolean;
    machineCount: number;
    onlineMachineCount: number;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    visibleSessionCount: number;
};

export type CodexFirstRecentProject = {
    id: string;
    machineLabel?: string;
    name: string;
    sessionId: string;
    updatedAt: number;
};

export type CodexFirstRecentProjectMachine = Readonly<{
    id: string;
    machineIds?: readonly string[];
    name: string;
}>;

export function resolveCodexFirstHomeState({
    dataLoaded,
    hasArchivedSessions,
    machineCount,
    onlineMachineCount,
    connectionStatus,
    visibleSessionCount,
}: ResolveCodexFirstHomeStateInput): CodexFirstHomeState {
    if (!dataLoaded) return 'loading';
    if (machineCount === 0) return 'no-machines';
    if (connectionStatus === 'connecting') return 'reconnecting';
    if (onlineMachineCount === 0) return 'all-offline';
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') return 'connection-error';
    if (visibleSessionCount === 0 && hasArchivedSessions) return 'archived-only';
    if (visibleSessionCount === 0) return 'no-sessions';
    return 'ready';
}

function visitVisibleSessions(
    data: readonly SessionListViewItem[],
    visit: (session: { id: string; lastActivityAt: number }) => void,
): void {
    for (const item of data) {
        if (item.type === 'project') {
            for (const workspace of item.project.workspaces) {
                for (const session of workspace.sessions) visit(session);
            }
            continue;
        }
        if (item.type === 'active-sessions' || item.type === 'attention-sessions') {
            for (const session of item.sessions) visit(session);
            continue;
        }
        if (item.type === 'session') visit(item.session);
    }
}

export function countCodexFirstVisibleSessions(data: readonly SessionListViewItem[]): number {
    const sessionIds = new Set<string>();
    visitVisibleSessions(data, (session) => sessionIds.add(session.id));
    return sessionIds.size;
}

export function collectCodexFirstRecentProjects(
    data: readonly SessionListViewItem[],
    limit = 3,
    machines: readonly CodexFirstRecentProjectMachine[] = [],
    unknownMachineLabel = 'Unknown machine',
): CodexFirstRecentProject[] {
    type RecentProjectCandidate = CodexFirstRecentProject & { machineId: string | null };
    const projects = new Map<string, RecentProjectCandidate>();

    for (const item of data) {
        if (item.type !== 'project') continue;
        const sessions = item.project.workspaces.flatMap((workspace) => workspace.sessions);
        const latestSession = sessions.reduce<(typeof sessions)[number] | null>((latest, session) => (
            latest === null || session.lastActivityAt > latest.lastActivityAt ? session : latest
        ), null);
        if (!latestSession) continue;

        const projectKey = JSON.stringify([item.source, item.project.id, item.project.machineId]);
        const current = projects.get(projectKey);
        if (!current || latestSession.lastActivityAt > current.updatedAt) {
            projects.set(projectKey, {
                id: item.project.id,
                machineId: item.project.machineId,
                name: item.project.name,
                sessionId: latestSession.id,
                updatedAt: latestSession.lastActivityAt,
            });
        }
    }

    const candidates = [...projects.values()];
    const nameCounts = new Map<string, number>();
    for (const project of candidates) {
        const key = project.name.trim().toLocaleLowerCase();
        nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
    }
    const machineNames = new Map<string, string>();
    for (const machine of machines) {
        const name = machine.name.trim() || machine.id;
        machineNames.set(machine.id, name);
        for (const machineId of machine.machineIds ?? []) machineNames.set(machineId, name);
    }

    return candidates
        .sort((left, right) => right.updatedAt - left.updatedAt)
        .slice(0, Math.max(0, limit))
        .map(({ machineId, ...project }) => {
            const normalizedName = project.name.trim().toLocaleLowerCase();
            if ((nameCounts.get(normalizedName) ?? 0) < 2) return project;
            return {
                ...project,
                machineLabel: machineId === null
                    ? unknownMachineLabel
                    : machineNames.get(machineId) ?? machineId,
            };
        });
}
