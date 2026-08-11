export const SIDE_CHAT_QUICK_PANEL_MIN_WINDOW_WIDTH = 1100;
export type SideChatQuickPanelMode = 'changes' | 'allFiles' | 'sideChat' | 'issues';

export function getRightWorkspaceTabs(openPanels: SideChatQuickPanelMode[]): SideChatQuickPanelMode[] {
    return openPanels.filter((panel, index) => openPanels.indexOf(panel) === index);
}

export function resolveSideChatQuickPanelActivePanel(input: {
    featureEnabled: boolean;
    openPanels: SideChatQuickPanelMode[];
    storedActivePanel: SideChatQuickPanelMode | null;
}): SideChatQuickPanelMode | null {
    if (input.featureEnabled && input.storedActivePanel === null) {
        return null;
    }
    if (input.storedActivePanel && input.openPanels.includes(input.storedActivePanel)) {
        return input.storedActivePanel;
    }
    return input.openPanels[input.openPanels.length - 1] ?? null;
}

export type SideChatQuickPanelLayoutInput = {
    activePanel: SideChatQuickPanelMode | null;
    canUseFiles: boolean;
    canUseGithubIssues: boolean;
    canUseSideChat: boolean;
    featureEnabled: boolean;
    fileDiffsSidebarEnabled: boolean;
    pickerOpen: boolean;
    platformSupported: boolean;
    windowWidth: number;
    zenMode: boolean;
};

export function getSideChatQuickPanelLayout(input: SideChatQuickPanelLayoutInput) {
    const wideDesktop = input.platformSupported
        && input.windowWidth >= SIDE_CHAT_QUICK_PANEL_MIN_WINDOW_WIDTH;

    if (!input.featureEnabled) {
        const issuesSelected = input.activePanel === 'issues' && input.canUseGithubIssues;
        const canShowSidebar = wideDesktop && (
            issuesSelected
            || (input.fileDiffsSidebarEnabled && input.canUseFiles)
        );
        return {
            canShowSidebar,
            showFileActions: false,
            showQuickControls: false,
            showSidebar: canShowSidebar && !input.zenMode && (issuesSelected || input.fileDiffsSidebarEnabled),
        };
    }

    const canShowSidebar = wideDesktop
        && (input.canUseSideChat || input.canUseFiles || input.canUseGithubIssues);
    return {
        canShowSidebar,
        showFileActions: wideDesktop && input.canUseFiles,
        showQuickControls: wideDesktop && input.canUseSideChat && !input.zenMode,
        showSidebar: canShowSidebar
            && !input.zenMode
            && (input.activePanel !== null || input.pickerOpen),
    };
}

export type SideChatQuickPanelToggleAction = 'collapse' | 'open' | 'pick';

export function getSideChatQuickPanelToggleAction(input: {
    expanded: boolean;
    sideChatCount: number;
}): SideChatQuickPanelToggleAction {
    if (input.expanded) return 'collapse';
    return input.sideChatCount > 0 ? 'open' : 'pick';
}
