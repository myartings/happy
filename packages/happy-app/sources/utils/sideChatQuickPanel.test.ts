import { describe, expect, it } from 'vitest';
import {
    getSideChatQuickPanelLayout,
    getSideChatQuickPanelToggleAction,
    getRightWorkspaceTabs,
    resolveSideChatQuickPanelActivePanel,
} from './sideChatQuickPanel';

const baseLayoutInput = {
    activePanel: null,
    canUseFiles: true,
    canUseGithubIssues: true,
    canUseSideChat: true,
    codexFirstEnabled: true,
    featureEnabled: true,
    fileDiffsSidebarEnabled: false,
    pickerOpen: false,
    platformSupported: true,
    windowWidth: 1400,
    zenMode: false,
} as const;

describe('getSideChatQuickPanelLayout', () => {
    it('keeps the quick panel collapsed until a panel is selected', () => {
        expect(getSideChatQuickPanelLayout(baseLayoutInput)).toEqual({
            canShowSidebar: true,
            showFileActions: true,
            showQuickControls: true,
            showSidebar: false,
        });
    });

    it('shows a selected quick panel without requiring the file sidebar setting', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            activePanel: 'sideChat',
        }).showSidebar).toBe(true);
    });

    it('shows the official picker when explicitly opened without an active panel', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            pickerOpen: true,
        }).showSidebar).toBe(true);
    });

    it('keeps Changes and Files reachable when Side Chat is unavailable', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            canUseSideChat: false,
        })).toMatchObject({
            showFileActions: true,
            showQuickControls: true,
        });
    });

    it('preserves the legacy requirement for Side Chat before showing quick controls', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            canUseSideChat: false,
            codexFirstEnabled: false,
        }).showQuickControls).toBe(false);
    });

    it('opens the Issues workspace even when files and Side Session are unavailable', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            activePanel: 'issues',
            canUseFiles: false,
            canUseSideChat: false,
        })).toMatchObject({
            canShowSidebar: true,
            showSidebar: true,
        });
    });

    it('restores the official always-visible sidebar behavior when disabled', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            featureEnabled: false,
            fileDiffsSidebarEnabled: true,
        })).toEqual({
            canShowSidebar: true,
            showFileActions: false,
            showQuickControls: false,
            showSidebar: true,
        });
    });

    it('keeps the official sidebar disabled when its setting is off', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            featureEnabled: false,
        }).canShowSidebar).toBe(false);
    });

    it('hides the quick controls and panel in zen mode', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            activePanel: 'sideChat',
            zenMode: true,
        })).toMatchObject({
            showQuickControls: false,
            showSidebar: false,
        });
    });

    it('does not expose the desktop UI on narrow layouts', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            windowWidth: 1099,
        }).canShowSidebar).toBe(false);
    });
});

describe('getSideChatQuickPanelToggleAction', () => {
    it('collapses an expanded panel without touching sessions', () => {
        expect(getSideChatQuickPanelToggleAction({ expanded: true, sideChatCount: 1 })).toBe('collapse');
    });

    it('restores an existing side chat when collapsed', () => {
        expect(getSideChatQuickPanelToggleAction({ expanded: false, sideChatCount: 2 })).toBe('open');
    });

    it('opens the picker instead of creating a side chat when none exists', () => {
        expect(getSideChatQuickPanelToggleAction({ expanded: false, sideChatCount: 0 })).toBe('pick');
    });
});

describe('resolveSideChatQuickPanelActivePanel', () => {
    it('treats a null active panel as an intentional quick-panel collapse', () => {
        expect(resolveSideChatQuickPanelActivePanel({
            featureEnabled: true,
            openPanels: ['sideChat'],
            storedActivePanel: null,
        })).toBeNull();
    });

    it('preserves the official fallback to the last open panel', () => {
        expect(resolveSideChatQuickPanelActivePanel({
            featureEnabled: false,
            openPanels: ['changes', 'sideChat'],
            storedActivePanel: null,
        })).toBe('sideChat');
    });
});

describe('getRightWorkspaceTabs', () => {
    it('keeps one Issues tab beside Side Session without duplicating either', () => {
        expect(getRightWorkspaceTabs(['sideChat', 'issues', 'issues', 'sideChat'])).toEqual(['sideChat', 'issues']);
    });

    it('keeps a selected Issues workspace usable when Side Session quick mode is disabled', () => {
        expect(getSideChatQuickPanelLayout({
            ...baseLayoutInput,
            activePanel: 'issues',
            canUseFiles: false,
            canUseSideChat: false,
            featureEnabled: false,
        })).toMatchObject({
            canShowSidebar: true,
            showSidebar: true,
        });
    });
});
