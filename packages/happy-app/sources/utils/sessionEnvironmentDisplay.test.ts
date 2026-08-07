import { describe, expect, it } from 'vitest';
import { resolveSessionEnvironmentDisplay } from './sessionEnvironmentDisplay';

describe('resolveSessionEnvironmentDisplay', () => {
    it('shows the reported branch for a primary checkout', () => {
        expect(resolveSessionEnvironmentDisplay(
            '/workspace/happy',
            null,
            'feature/sidebar-labels',
        )).toEqual({
            worktreeName: null,
            branchName: 'feature/sidebar-labels',
        });
    });

    it('shows both the worktree and its branch', () => {
        expect(resolveSessionEnvironmentDisplay(
            '/workspace/happy/.dev/worktree/eager-desert',
            'feature/sidebar-labels',
            'stale-branch',
        )).toEqual({
            worktreeName: 'eager-desert',
            branchName: 'feature/sidebar-labels',
        });
    });

    it('keeps both labels when the worktree and branch have the same name', () => {
        expect(resolveSessionEnvironmentDisplay(
            'C:\\workspace\\happy\\.dev\\worktree\\eager-desert',
            null,
            'eager-desert',
        )).toEqual({
            worktreeName: 'eager-desert',
            branchName: 'eager-desert',
        });
    });

    it('returns null outside Git when no worktree is present', () => {
        expect(resolveSessionEnvironmentDisplay('/tmp/scratch', null, null)).toBeNull();
    });
});
