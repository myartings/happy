import type { SessionListViewItem, SessionRowData } from '@/sync/storage';

type SessionRowLocation =
    | { kind: 'session'; itemIndex: number }
    | { kind: 'collection'; itemIndex: number; rowIndex: number }
    | { kind: 'project'; itemIndex: number; workspaceIndex: number; rowIndex: number };

export type SessionListDraftPatch = {
    data: SessionListViewItem[] | null;
    reprojectedRows: number;
};

function patchRow(row: SessionRowData, hasDraft: boolean): SessionRowData {
    return row.hasDraft === hasDraft ? row : { ...row, hasDraft };
}

/**
 * Indexes Session-row locations while the complete list is already being
 * built. A draft-only update can then replace one row and its containing
 * object chain without regrouping, sorting, or scanning unrelated Sessions.
 */
export class SessionListDraftProjectionIndex {
    private readonly locations = new Map<string, SessionRowLocation>();

    rebuild(data: SessionListViewItem[] | null): void {
        this.locations.clear();
        if (!data) return;

        data.forEach((item, itemIndex) => {
            if (item.type === 'session') {
                this.locations.set(item.session.id, { kind: 'session', itemIndex });
                return;
            }
            if (item.type === 'attention-sessions' || item.type === 'active-sessions') {
                item.sessions.forEach((row, rowIndex) => {
                    this.locations.set(row.id, { kind: 'collection', itemIndex, rowIndex });
                });
                return;
            }
            if (item.type === 'project') {
                item.project.workspaces.forEach((workspace, workspaceIndex) => {
                    workspace.sessions.forEach((row, rowIndex) => {
                        this.locations.set(row.id, {
                            kind: 'project',
                            itemIndex,
                            workspaceIndex,
                            rowIndex,
                        });
                    });
                });
            }
        });
    }

    patch(
        data: SessionListViewItem[] | null,
        sessionId: string,
        hasDraft: boolean,
    ): SessionListDraftPatch {
        if (!data) return { data, reprojectedRows: 0 };

        let location = this.locations.get(sessionId);
        if (!location || !this.locationMatches(data, location, sessionId)) {
            // This is an invariant fallback for externally replaced Zustand
            // state and test harnesses. Normal production state rebuilds the
            // index together with the complete Session list.
            this.rebuild(data);
            location = this.locations.get(sessionId);
        }
        if (!location) return { data, reprojectedRows: 0 };

        const item = data[location.itemIndex];
        if (location.kind === 'session') {
            if (item.type !== 'session') return { data, reprojectedRows: 0 };
            const session = patchRow(item.session, hasDraft);
            if (session === item.session) return { data, reprojectedRows: 0 };
            const nextData = [...data];
            nextData[location.itemIndex] = { ...item, session };
            return { data: nextData, reprojectedRows: 1 };
        }

        if (location.kind === 'collection') {
            if (item.type !== 'attention-sessions' && item.type !== 'active-sessions') {
                return { data, reprojectedRows: 0 };
            }
            const row = item.sessions[location.rowIndex];
            const session = patchRow(row, hasDraft);
            if (session === row) return { data, reprojectedRows: 0 };
            const sessions = [...item.sessions];
            sessions[location.rowIndex] = session;
            const nextData = [...data];
            nextData[location.itemIndex] = { ...item, sessions };
            return { data: nextData, reprojectedRows: 1 };
        }

        if (item.type !== 'project') return { data, reprojectedRows: 0 };
        const workspace = item.project.workspaces[location.workspaceIndex];
        const row = workspace.sessions[location.rowIndex];
        const session = patchRow(row, hasDraft);
        if (session === row) return { data, reprojectedRows: 0 };
        const sessions = [...workspace.sessions];
        sessions[location.rowIndex] = session;
        const workspaces = [...item.project.workspaces];
        workspaces[location.workspaceIndex] = { ...workspace, sessions };
        const nextData = [...data];
        nextData[location.itemIndex] = {
            ...item,
            project: { ...item.project, workspaces },
        };
        return { data: nextData, reprojectedRows: 1 };
    }

    private locationMatches(
        data: SessionListViewItem[],
        location: SessionRowLocation,
        sessionId: string,
    ): boolean {
        const item = data[location.itemIndex];
        if (!item) return false;
        if (location.kind === 'session') {
            return item.type === 'session' && item.session.id === sessionId;
        }
        if (location.kind === 'collection') {
            return (item.type === 'attention-sessions' || item.type === 'active-sessions')
                && item.sessions[location.rowIndex]?.id === sessionId;
        }
        return item.type === 'project'
            && item.project.workspaces[location.workspaceIndex]?.sessions[location.rowIndex]?.id === sessionId;
    }
}
