export type CodexFirstWorkspacePanel = 'changes' | 'allFiles' | 'issues' | 'sideChat';

export type CodexFirstWorkspaceAction = Readonly<{
    id: 'changes' | 'files' | 'issues' | 'side-chat';
    panel: CodexFirstWorkspacePanel;
}>;

type ResolveCodexFirstWorkspaceChromeInput = Readonly<{
    canUseFiles: boolean;
    canUseSideChat: boolean;
    codexFirstEnabled: boolean;
    fileDiffsSidebarEnabled: boolean;
    githubIssuesEnabled: boolean;
    sideChatQuickPanelEnabled: boolean;
}>;

export function resolveCodexFirstWorkspaceChrome({
    canUseFiles,
    canUseSideChat,
    codexFirstEnabled,
    fileDiffsSidebarEnabled,
    githubIssuesEnabled,
    sideChatQuickPanelEnabled,
}: ResolveCodexFirstWorkspaceChromeInput): Readonly<{
    actions: readonly CodexFirstWorkspaceAction[];
    fileDiffsSidebarEnabled: boolean;
    quickPanelEnabled: boolean;
}> {
    if (!codexFirstEnabled) {
        return {
            actions: [],
            fileDiffsSidebarEnabled,
            quickPanelEnabled: sideChatQuickPanelEnabled,
        };
    }

    const actions: CodexFirstWorkspaceAction[] = [];
    if (canUseFiles) {
        actions.push({ id: 'changes', panel: 'changes' });
        actions.push({ id: 'files', panel: 'allFiles' });
    }
    if (githubIssuesEnabled) actions.push({ id: 'issues', panel: 'issues' });
    if (canUseSideChat) actions.push({ id: 'side-chat', panel: 'sideChat' });

    return {
        actions,
        fileDiffsSidebarEnabled: true,
        quickPanelEnabled: true,
    };
}

export type CodexFirstWorkspaceMenuKeyResult = Readonly<{
    handled: boolean;
    nextIndex: number;
    outcome: 'none' | 'select' | 'activate' | 'close';
}>;

export function resolveCodexFirstWorkspaceMenuKey({
    itemCount,
    key,
    selectedIndex,
}: Readonly<{
    itemCount: number;
    key: string;
    selectedIndex: number;
}>): CodexFirstWorkspaceMenuKeyResult {
    const safeItemCount = Math.max(0, Math.floor(itemCount));
    const safeIndex = safeItemCount === 0
        ? 0
        : Math.min(Math.max(0, selectedIndex), safeItemCount - 1);

    if (key === 'Escape') {
        return { handled: true, nextIndex: safeIndex, outcome: 'close' };
    }
    if (safeItemCount === 0) {
        return { handled: false, nextIndex: safeIndex, outcome: 'none' };
    }
    if (key === 'ArrowDown') {
        return { handled: true, nextIndex: (safeIndex + 1) % safeItemCount, outcome: 'select' };
    }
    if (key === 'ArrowUp') {
        return {
            handled: true,
            nextIndex: (safeIndex - 1 + safeItemCount) % safeItemCount,
            outcome: 'select',
        };
    }
    if (key === 'Home' || key === 'End') {
        return {
            handled: true,
            nextIndex: key === 'Home' ? 0 : safeItemCount - 1,
            outcome: 'select',
        };
    }
    if (key === 'Enter' || key === ' ') {
        return { handled: true, nextIndex: safeIndex, outcome: 'activate' };
    }
    return { handled: false, nextIndex: safeIndex, outcome: 'none' };
}

export type CodexFirstWorkspacePanelPresentation = Readonly<{
    backgroundColor: string;
    borderColor: string;
    headerHeight: number;
    headerPaddingHorizontal: number;
    surfaceColor: string;
}>;

export function resolveCodexFirstWorkspacePanelPresentation({
    dark,
    enabled,
}: Readonly<{ dark: boolean; enabled: boolean }>): CodexFirstWorkspacePanelPresentation | null {
    if (!enabled) return null;
    return {
        backgroundColor: dark ? '#232323' : '#FAFAF9',
        borderColor: dark ? '#3B3B3B' : '#E5E5E6',
        headerHeight: 46,
        headerPaddingHorizontal: 12,
        surfaceColor: dark ? '#292929' : '#FFFFFF',
    };
}

export type CodexFirstSettingsPresentation = Readonly<{
    backgroundColor: string;
    contentMaxWidth: number;
    identityCardRadius: number;
    identityCompact: true;
    surfaceColor: string;
}>;

export function resolveCodexFirstSettingsPresentation({
    dark,
    enabled,
}: Readonly<{ dark: boolean; enabled: boolean }>): CodexFirstSettingsPresentation | null {
    if (!enabled) return null;
    return {
        backgroundColor: dark ? '#202020' : '#FAFAF9',
        contentMaxWidth: 760,
        identityCardRadius: 14,
        identityCompact: true,
        surfaceColor: dark ? '#292929' : '#FFFFFF',
    };
}

export type CodexFirstSettingsDestination = Readonly<{
    icon: string;
    id:
        | 'settings'
        | 'account'
        | 'settings-appearance'
        | 'settings-agents'
        | 'settings-personal-features'
        | 'settings-voice'
        | 'settings-language'
        | 'settings-voice-language'
        | 'settings-connect-claude'
        | 'connect'
        | 'settings-usage'
        | 'changelog';
    route: string;
}>;

const SETTINGS_DESTINATIONS: readonly (CodexFirstSettingsDestination & { experimental?: true })[] = Object.freeze([
    { id: 'settings', icon: 'settings-outline', route: '/settings' },
    { id: 'account', icon: 'person-circle-outline', route: '/settings/account' },
    { id: 'settings-appearance', icon: 'color-palette-outline', route: '/settings/appearance' },
    { id: 'settings-agents', icon: 'desktop-outline', route: '/settings/agents' },
    { id: 'settings-personal-features', icon: 'options-outline', route: '/settings/personal-features' },
    { id: 'settings-voice', icon: 'mic-outline', route: '/settings/voice' },
    { id: 'settings-language', icon: 'language-outline', route: '/settings/language' },
    { id: 'settings-voice-language', icon: 'chatbubble-ellipses-outline', route: '/settings/voice/language' },
    { id: 'settings-connect-claude', icon: 'link-outline', route: '/settings/connect/claude' },
    { id: 'connect', icon: 'qr-code-outline', route: '/terminal/connect' },
    { id: 'settings-usage', icon: 'analytics-outline', route: '/settings/usage', experimental: true },
    { id: 'changelog', icon: 'sparkles-outline', route: '/changelog' },
]);

export function projectCodexFirstSettingsDestinations({
    experimentsEnabled,
}: Readonly<{ experimentsEnabled: boolean }>): readonly CodexFirstSettingsDestination[] {
    return SETTINGS_DESTINATIONS.filter(destination => !destination.experimental || experimentsEnabled)
        .map(({ experimental: _experimental, ...destination }) => destination);
}
