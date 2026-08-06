import { describe, expect, it } from 'vitest';
import { getRepoPath, getWorktreeName, isWorktreePath } from './worktreePath';

describe('managed worktree path identity', () => {
    it('extracts the repo and worktree names from POSIX paths', () => {
        const path = '/Users/dev/workspace/happy/.dev/worktree/bright-river';

        expect(isWorktreePath(path)).toBe(true);
        expect(getRepoPath(path)).toBe('/Users/dev/workspace/happy');
        expect(getWorktreeName(path)).toBe('bright-river');
    });

    it('supports Windows separators and mixed paths produced by Happy', () => {
        expect(getRepoPath('C:\\workspace\\happy\\.dev\\worktree\\bright-river'))
            .toBe('C:\\workspace\\happy');
        expect(getWorktreeName('C:\\workspace\\happy/.dev/worktree/bright-river'))
            .toBe('bright-river');
    });

    it('leaves primary checkout paths unchanged', () => {
        expect(isWorktreePath('/workspace/happy')).toBe(false);
        expect(getRepoPath('/workspace/happy')).toBe('/workspace/happy');
        expect(getWorktreeName('/workspace/happy')).toBeNull();
    });
});
