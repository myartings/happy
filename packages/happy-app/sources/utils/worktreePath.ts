/** Relative path prefix where Happy creates Git worktrees inside a repo. */
export const WORKTREE_DIR = '.dev/worktree';

/** Canonical POSIX marker retained for callers that need the literal path. */
export const WORKTREE_PATH_MARKER = `/${WORKTREE_DIR}/`;

const WORKTREE_PATH_PATTERN = /[\\/][.]dev[\\/]worktree[\\/]/;

function worktreeMatch(path: string): RegExpExecArray | null {
    return WORKTREE_PATH_PATTERN.exec(path);
}

/** Check whether a path points at one of Happy's managed worktrees. */
export function isWorktreePath(path: string): boolean {
    return worktreeMatch(path) !== null;
}

/** Extract the main repository checkout path from a possibly-worktree path. */
export function getRepoPath(path: string): string {
    const match = worktreeMatch(path);
    return match?.index === undefined ? path : path.slice(0, match.index);
}

/** Extract the managed worktree name from a path, or null for the primary tree. */
export function getWorktreeName(path: string): string | null {
    const match = worktreeMatch(path);
    if (!match || match.index === undefined) return null;
    const remainder = path.slice(match.index + match[0].length).replace(/[\\/]+$/, '');
    return remainder || null;
}
