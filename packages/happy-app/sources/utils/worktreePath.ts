// Compatibility facade for personal modules created before upstream introduced
// the pluralized canonical worktree path helper.
export {
    WORKTREE_DIR,
    WORKTREE_PATH_MARKER,
    getRepoPath,
    getWorktreeName,
    isWorktreePath,
} from './worktreePaths';
