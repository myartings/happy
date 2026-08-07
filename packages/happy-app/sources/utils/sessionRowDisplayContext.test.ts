import { describe, expect, it } from 'vitest';
import {
    resolveSessionRowDisplayPolicy,
    shouldShowWorkspaceLabel,
    type SessionRowDisplayContext,
} from './sessionRowDisplayContext';

describe('resolveSessionRowDisplayPolicy', () => {
    it.each([
        ['flat', true, true, 'full'],
        ['grouped', false, false, 'branch-only'],
        ['workspace', false, false, 'branch-only'],
    ] as const)(
        'uses hierarchy-aware metadata in the %s context',
        (context, showProjectName, showPlatform, environmentPlacement) => {
            expect(resolveSessionRowDisplayPolicy({
                context,
                environmentLabelsEnabled: true,
                needsAttentionSessionsEnabled: true,
            })).toEqual({
                showProjectName,
                showPlatform,
                environmentPlacement,
                showUnreadAttentionState: true,
            });
        },
    );

    it.each(['flat', 'grouped', 'workspace'] satisfies SessionRowDisplayContext[])(
        'hides all row environment labels in the %s context when disabled',
        (context) => {
            expect(resolveSessionRowDisplayPolicy({
                context,
                environmentLabelsEnabled: false,
                needsAttentionSessionsEnabled: true,
            }).environmentPlacement).toBe('hidden');
        },
    );

    it('restores the official unread status treatment when needs-attention is disabled', () => {
        expect(resolveSessionRowDisplayPolicy({
            context: 'flat',
            environmentLabelsEnabled: true,
            needsAttentionSessionsEnabled: false,
        }).showUnreadAttentionState).toBe(false);
    });

    it('keeps a named worktree visible even when it is the project’s only workspace', () => {
        expect(shouldShowWorkspaceLabel({ workspaceCount: 1, workspaceName: 'eager-desert' })).toBe(true);
    });

    it('does not repeat a worktree name after official identity turns it into the project title', () => {
        expect(shouldShowWorkspaceLabel({ workspaceCount: 1, workspaceName: null })).toBe(false);
    });

    it('labels every workspace when a project contains more than one', () => {
        expect(shouldShowWorkspaceLabel({ workspaceCount: 2, workspaceName: null })).toBe(true);
        expect(shouldShowWorkspaceLabel({ workspaceCount: 2, workspaceName: 'feature-a' })).toBe(true);
    });
});
