import { getWorktreeName } from './worktreePath';

export interface SessionEnvironmentDisplay {
    worktreeName: string | null;
    branchName: string | null;
}

/**
 * Resolve the Git context shown beneath a session title in the sidebar.
 * Live Git status wins over the branch captured when the session started.
 */
export function resolveSessionEnvironmentDisplay(
    path: string | null | undefined,
    liveBranch: string | null | undefined,
    reportedBranch: string | null | undefined,
): SessionEnvironmentDisplay | null {
    const worktreeName = getWorktreeName(path?.trim() || '');
    const branchName = liveBranch?.trim() || reportedBranch?.trim() || null;

    if (!worktreeName && !branchName) return null;
    return { worktreeName, branchName };
}
