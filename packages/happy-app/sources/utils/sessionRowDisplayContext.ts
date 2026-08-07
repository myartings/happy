export type SessionRowDisplayContext = 'flat' | 'grouped' | 'workspace';

export type SessionEnvironmentPlacement = 'full' | 'branch-only' | 'hidden';

export interface SessionRowDisplayPolicy {
    showProjectName: boolean;
    showPlatform: boolean;
    environmentPlacement: SessionEnvironmentPlacement;
    showUnreadAttentionState: boolean;
}

export function shouldShowWorkspaceLabel(input: {
    workspaceCount: number;
    workspaceName: string | null;
}): boolean {
    return input.workspaceCount > 1 || !!input.workspaceName;
}

/**
 * Keep stable hierarchy labels on their owning group and reserve row metadata
 * for fields that can vary between neighboring sessions.
 */
export function resolveSessionRowDisplayPolicy(input: {
    context: SessionRowDisplayContext;
    environmentLabelsEnabled: boolean;
    needsAttentionSessionsEnabled: boolean;
}): SessionRowDisplayPolicy {
    const { context, environmentLabelsEnabled, needsAttentionSessionsEnabled } = input;

    return {
        showProjectName: context === 'flat',
        showPlatform: context === 'flat',
        environmentPlacement: !environmentLabelsEnabled
            ? 'hidden'
            : context === 'flat'
                ? 'full'
                : 'branch-only',
        showUnreadAttentionState: needsAttentionSessionsEnabled,
    };
}
