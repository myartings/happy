/** Relative path prefix where Happy creates git worktrees inside a repo. */
export const WORKTREE_DIR = '.dev/worktree';

/** Canonical POSIX marker retained for callers that need the literal path. */
export const WORKTREE_PATH_MARKER = `/${WORKTREE_DIR}/`;

const WORKTREE_PATH_PATTERN = /[\\/][.]dev[\\/]worktree[\\/]/;

function worktreeMatch(path: string): RegExpExecArray | null {
    return WORKTREE_PATH_PATTERN.exec(path);
}

/** Check if a path is inside a Happy-created worktree on POSIX or Windows. */
export function isWorktreePath(path: string): boolean {
    return worktreeMatch(path) !== null;
}

/** Extract the main repository checkout path from a possibly-worktree path. */
export function getRepoPath(path: string): string {
    const match = worktreeMatch(path);
    return match?.index === undefined ? path : path.slice(0, match.index);
}

/** Extract the worktree name from a worktree path, or null if it is not one. */
export function getWorktreeName(path: string): string | null {
    const match = worktreeMatch(path);
    if (!match || match.index === undefined) return null;
    const remainder = path.slice(match.index + match[0].length).replace(/[\\/]+$/, '');
    return remainder || null;
}
