import { describe, expect, it } from 'vitest';

import {
    projectCodexFirstSettingsDestinations,
    resolveCodexFirstWorkspaceMenuKey,
    resolveCodexFirstSettingsPresentation,
    resolveCodexFirstWorkspaceChrome,
    resolveCodexFirstWorkspacePanelPresentation,
} from './codexFirstWorkspaceChrome';

describe('Codex-first secondary workspace chrome', () => {
    it('promotes the existing panel family globally while honoring capabilities', () => {
        expect(resolveCodexFirstWorkspaceChrome({
            canUseFiles: true,
            canUseSideChat: true,
            codexFirstEnabled: true,
            fileDiffsSidebarEnabled: false,
            githubIssuesEnabled: true,
            sideChatQuickPanelEnabled: false,
        })).toEqual({
            actions: [
                { id: 'changes', panel: 'changes' },
                { id: 'files', panel: 'allFiles' },
                { id: 'issues', panel: 'issues' },
                { id: 'side-chat', panel: 'sideChat' },
            ],
            fileDiffsSidebarEnabled: true,
            quickPanelEnabled: true,
        });

        expect(resolveCodexFirstWorkspaceChrome({
            canUseFiles: false,
            canUseSideChat: false,
            codexFirstEnabled: true,
            fileDiffsSidebarEnabled: false,
            githubIssuesEnabled: false,
            sideChatQuickPanelEnabled: false,
        }).actions).toEqual([]);
    });

    it('leaves legacy feature preferences authoritative outside Codex-first', () => {
        expect(resolveCodexFirstWorkspaceChrome({
            canUseFiles: true,
            canUseSideChat: true,
            codexFirstEnabled: false,
            fileDiffsSidebarEnabled: false,
            githubIssuesEnabled: true,
            sideChatQuickPanelEnabled: false,
        })).toEqual({
            actions: [],
            fileDiffsSidebarEnabled: false,
            quickPanelEnabled: false,
        });
    });

    it('uses one compact right-panel and Settings grammar in light and dark', () => {
        expect(resolveCodexFirstWorkspacePanelPresentation({ dark: false, enabled: true })).toEqual({
            backgroundColor: '#FAFAF9',
            borderColor: '#E5E5E6',
            headerHeight: 46,
            headerPaddingHorizontal: 12,
            surfaceColor: '#FFFFFF',
        });
        expect(resolveCodexFirstWorkspacePanelPresentation({ dark: true, enabled: true })).toMatchObject({
            backgroundColor: '#232323',
            borderColor: '#3B3B3B',
            surfaceColor: '#292929',
        });
        expect(resolveCodexFirstWorkspacePanelPresentation({ dark: false, enabled: false })).toBeNull();
        expect(resolveCodexFirstSettingsPresentation({ dark: false, enabled: true })).toMatchObject({
            contentMaxWidth: 760,
            identityCardRadius: 14,
            identityCompact: true,
        });
        expect(resolveCodexFirstSettingsPresentation({ dark: false, enabled: false })).toBeNull();
    });

    it('projects wrapped keyboard selection, activation, and dismissal for workspace menus', () => {
        expect(resolveCodexFirstWorkspaceMenuKey({ itemCount: 2, key: 'ArrowDown', selectedIndex: 1 }))
            .toEqual({ handled: true, nextIndex: 0, outcome: 'select' });
        expect(resolveCodexFirstWorkspaceMenuKey({ itemCount: 2, key: 'ArrowUp', selectedIndex: 0 }))
            .toEqual({ handled: true, nextIndex: 1, outcome: 'select' });
        expect(resolveCodexFirstWorkspaceMenuKey({ itemCount: 2, key: 'Enter', selectedIndex: 1 }))
            .toEqual({ handled: true, nextIndex: 1, outcome: 'activate' });
        expect(resolveCodexFirstWorkspaceMenuKey({ itemCount: 2, key: 'Escape', selectedIndex: 1 }))
            .toEqual({ handled: true, nextIndex: 1, outcome: 'close' });
        expect(resolveCodexFirstWorkspaceMenuKey({ itemCount: 2, key: 'Tab', selectedIndex: 1 }))
            .toEqual({ handled: false, nextIndex: 1, outcome: 'none' });
    });
});

describe('Codex-first Settings navigation inventory', () => {
    it('indexes every daily account, connection, appearance, agent, and system route once', () => {
        const destinations = projectCodexFirstSettingsDestinations({ experimentsEnabled: true });
        expect(destinations.map(item => item.id)).toEqual([
            'settings',
            'account',
            'settings-appearance',
            'settings-agents',
            'settings-personal-features',
            'settings-voice',
            'settings-language',
            'settings-voice-language',
            'settings-connect-claude',
            'connect',
            'settings-usage',
            'changelog',
        ]);
        expect(new Set(destinations.map(item => item.id)).size).toBe(destinations.length);
        expect(destinations.every(item => item.route.startsWith('/'))).toBe(true);
        expect(destinations.every(item => !('title' in item) && !('subtitle' in item))).toBe(true);
    });

    it('does not advertise the experimental usage route when its Happy flag is off', () => {
        expect(projectCodexFirstSettingsDestinations({ experimentsEnabled: false })
            .some(item => item.id === 'settings-usage')).toBe(false);
    });
});
