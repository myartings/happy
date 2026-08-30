import React, { useCallback, useMemo } from 'react';
import { Appearance, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Modal } from '@/modal';
import { CommandPalette } from './CommandPalette';
import { Command } from './types';
import { useGlobalKeyboard } from '@/hooks/useGlobalKeyboard';
import { useAuth } from '@/auth/AuthContext';
import { storage, useAllMachines, useSetting } from '@/sync/storage';
import { useShallow } from 'zustand/react/shallow';
import { useNavigateToSession } from '@/hooks/useNavigateToSession';
import { ShortcutHintsProvider } from '@/components/ShortcutHints';
import {
    formatShortcut,
    getPreferredShortcutModifier,
} from '@/keyboard/shortcuts';
import { isTauri } from '@/utils/isTauri';
import { useVisibleSessionListViewData } from '@/hooks/useVisibleSessionListViewData';
import { getSessionShortcutIdsInDisplayOrder } from '@/utils/sessionDisplayOrder';
import { t } from '@/text';
import {
    resolveCommandPaletteDarkSnapshot,
    resolveStudioOverlayPresentation,
} from '@/features/studio-overlays/studioOverlayPresentation';
import { resolveCurrentCodexFirstDesktopRuntime } from '@/features/codex-first-shell/resolveCurrentCodexFirstDesktopRuntime';
import { resolveDesktopCommandPaletteAccess } from '@/features/codex-first-shell/codexFirstCommandAccess';
import { projectCodexFirstSidebarDestinations } from '@/features/codex-first-shell/codexFirstSidebarNavigation';
import { buildCodexFirstSearchEntries } from '@/features/codex-first-shell/codexFirstSearchIndex';
import { getSessionName, getSessionSubtitle } from '@/utils/sessionUtils';
import { getRepoPath, isWorktreePath } from '@/utils/worktreePaths';
import {
    projectCodexFirstSettingsDestinations,
    type CodexFirstSettingsDestination,
} from '@/features/codex-first-shell/codexFirstWorkspaceChrome';

const EMPTY_SESSION_IDS: readonly string[] = [];

function codexFirstDestinationTitle(id: string): string {
    switch (id) {
        case 'tasks': return t('projectTodos.shortTitle');
        case 'issues': return t('githubIssues.title');
        case 'artifacts': return t('artifacts.title');
        case 'machines-agents': return t('codexFirst.machinesAndAgents');
        default: return t('sidebar.newSession');
    }
}

function codexFirstSettingsDestinationCopy(
    id: CodexFirstSettingsDestination['id'],
): { subtitle?: string; title: string } {
    switch (id) {
        case 'settings':
            return { title: t('settings.title'), subtitle: t('codexFirst.settingsIdentity') };
        case 'account':
            return { title: t('settings.account'), subtitle: t('settings.accountSubtitle') };
        case 'settings-appearance':
            return { title: t('settings.appearance'), subtitle: t('settings.appearanceSubtitle') };
        case 'settings-agents':
            return { title: t('codexFirst.machinesAndAgents') };
        case 'settings-personal-features':
            return { title: t('settings.featuresTitle'), subtitle: t('settings.featuresSubtitle') };
        case 'settings-voice':
            return { title: t('settings.voiceAssistant'), subtitle: t('settings.voiceAssistantSubtitle') };
        case 'settings-language':
            return { title: t('settingsLanguage.title'), subtitle: t('settingsLanguage.description') };
        case 'settings-voice-language':
            return { title: t('settingsVoice.languageTitle'), subtitle: t('settingsVoice.languageDescription') };
        case 'settings-connect-claude':
            return { title: `${t('settings.connectAccount')} · ${t('agentInput.agent.claude')}` };
        case 'connect':
            return { title: t('navigation.connectTerminal'), subtitle: t('modals.pasteUrlFromTerminal') };
        case 'settings-usage':
            return { title: t('settings.usage'), subtitle: t('settings.usageSubtitle') };
        case 'changelog':
            return { title: t('settings.whatsNew'), subtitle: t('settings.whatsNewSubtitle') };
    }
}

function sessionProjectIdentity(path: string | null, nativeProjectName?: string): {
    name: string | null;
    path: string | null;
} {
    if (!path) return { name: nativeProjectName ?? null, path: null };
    const projectPath = isWorktreePath(path) ? getRepoPath(path) : path;
    const inferredName = projectPath.replace(/[\\/]+$/, '').split(/[\\/]/).filter(Boolean).at(-1) ?? null;
    return {
        name: nativeProjectName ?? inferredName,
        path: projectPath,
    };
}

type CommandPaletteLauncher = {
    available: boolean;
    open: (restoreFocusTarget?: CommandPaletteFocusTarget | null) => void;
};

type CommandPaletteFocusTarget = { focus?: () => void };

const CommandPaletteLauncherContext = React.createContext<CommandPaletteLauncher>({
    available: false,
    open: () => {},
});

export function useCommandPaletteLauncher(): CommandPaletteLauncher {
    return React.useContext(CommandPaletteLauncherContext);
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { logout, isAuthenticated } = useAuth();
    const sessions = storage(useShallow((state) => state.sessions));
    const commandPaletteEnabled = storage(useShallow((state) => state.localSettings.commandPaletteEnabled));
    const requestedVisualStyle = storage(useShallow((state) => state.localSettings.visualStyle));
    const projectTodosEnabled = storage(useShallow((state) => state.localSettings.devProjectTodosEnabled));
    const githubIssuesEnabled = storage(useShallow((state) => state.localSettings.devGithubIssuesEnabled));
    const experiments = useSetting('experiments');
    const sessionListViewData = useVisibleSessionListViewData();
    const machines = useAllMachines({ includeOffline: true });
    const sortActiveSessionsGlobally = useSetting('sortActiveSessionsGlobally');
    const navigateToSession = useNavigateToSession();
    const preferredModifier = useMemo(() => getPreferredShortcutModifier(
        typeof navigator === 'undefined' ? undefined : navigator
    ), []);
    const browserSafeShortcuts = useMemo(() => Platform.OS === 'web' && !isTauri(), []);
    const codexFirstContract = useMemo(
        () => resolveCurrentCodexFirstDesktopRuntime(requestedVisualStyle),
        [requestedVisualStyle],
    );
    const commandPaletteAvailable = resolveDesktopCommandPaletteAccess({
        codexFirstEnabled: codexFirstContract.enabled,
        isAuthenticated,
        platformOS: Platform.OS,
        settingEnabled: commandPaletteEnabled,
    });
    const visibleSessionShortcutIds = useMemo(() => getSessionShortcutIdsInDisplayOrder(
        sessionListViewData,
        machines,
        t('status.unknown'),
        sortActiveSessionsGlobally,
    ), [machines, sessionListViewData, sortActiveSessionsGlobally]);

    // Define available commands
    const commands = useMemo((): Command[] => {
        const cmds: Command[] = [
            // Navigation commands
            {
                id: 'new-session',
                title: codexFirstContract.enabled ? t('sidebar.newSession') : 'New Session',
                subtitle: codexFirstContract.enabled ? t('codexFirst.commandNewSessionSubtitle') : 'Start a new chat session',
                icon: 'add-circle-outline',
                category: codexFirstContract.enabled ? t('tabs.sessions') : 'Sessions',
                shortcut: formatShortcut(preferredModifier, 'N', browserSafeShortcuts),
                action: () => {
                    router.navigate('/new');
                }
            },
            {
                id: 'sessions',
                title: codexFirstContract.enabled ? t('sessionHistory.viewAll') : 'View All Sessions',
                subtitle: codexFirstContract.enabled ? t('codexFirst.commandSessionsSubtitle') : 'Browse your chat history',
                icon: 'chatbubbles-outline',
                category: codexFirstContract.enabled ? t('tabs.sessions') : 'Sessions',
                action: () => {
                    router.push('/');
                }
            },
            {
                id: 'settings',
                title: codexFirstContract.enabled ? t('settings.title') : 'Settings',
                subtitle: codexFirstContract.enabled ? t('codexFirst.commandSettingsSubtitle') : 'Configure your preferences',
                icon: 'settings-outline',
                category: codexFirstContract.enabled ? t('codexFirst.commandNavigationCategory') : 'Navigation',
                shortcut: formatShortcut(preferredModifier, ',', browserSafeShortcuts),
                action: () => {
                    router.push('/settings');
                }
            },
            {
                id: 'account',
                title: codexFirstContract.enabled ? t('settings.account') : 'Account',
                subtitle: codexFirstContract.enabled ? t('settings.accountSubtitle') : 'Manage your account',
                icon: 'person-circle-outline',
                category: codexFirstContract.enabled ? t('codexFirst.commandNavigationCategory') : 'Navigation',
                action: () => {
                    router.push('/settings/account');
                }
            },
            {
                id: 'connect',
                title: codexFirstContract.enabled ? t('navigation.connectTerminal') : 'Connect Device',
                subtitle: codexFirstContract.enabled ? t('modals.pasteUrlFromTerminal') : 'Connect a new device via web',
                icon: 'link-outline',
                category: codexFirstContract.enabled ? t('codexFirst.commandNavigationCategory') : 'Navigation',
                action: () => {
                    router.push('/terminal/connect');
                }
            },
        ];

        if (codexFirstContract.enabled) {
            const machineNames = new Map(machines.map((machine) => [
                machine.id,
                machine.metadata?.displayName || machine.metadata?.host || machine.id,
            ]));
            const destinations = projectCodexFirstSidebarDestinations({
                contract: codexFirstContract,
                githubIssuesEnabled,
                projectTodosEnabled,
            })
                .filter((destination) => destination.id !== 'new-session')
                .map((destination) => ({
                    id: destination.id,
                    icon: destination.icon,
                    route: destination.route,
                    title: codexFirstDestinationTitle(destination.id),
                }));
            if (codexFirstContract.navigation.notificationsVisible) {
                destinations.push({
                    id: 'inbox' as any,
                    icon: 'notifications-outline' as any,
                    route: '/inbox' as any,
                    title: t('tabs.inbox'),
                });
            }

            const searchEntries = buildCodexFirstSearchEntries({
                categories: {
                    destinations: t('settings.title'),
                    machines: t('codexFirst.machinesAndAgents'),
                    projects: t('sidebar.projects'),
                    sessions: t('tabs.sessions'),
                },
                destinations,
                machines: machines.map((machine) => ({
                    id: machine.id,
                    name: machineNames.get(machine.id)!,
                    platform: machine.metadata?.platform,
                })),
                sessions: Object.values(sessions)
                    .filter((session) => !session.metadata?.isSideChat)
                    .map((session) => {
                        const path = session.metadata?.path ?? null;
                        const project = sessionProjectIdentity(path, session.metadata?.project?.name);
                        return {
                            id: session.id,
                            machineId: session.metadata?.machineId ?? null,
                            machineName: session.metadata?.machineId
                                ? machineNames.get(session.metadata.machineId) ?? session.metadata.host
                                : session.metadata?.host,
                            path: session.metadata ? getSessionSubtitle(session) : null,
                            projectName: project.name,
                            projectPath: project.path,
                            title: getSessionName(session),
                            updatedAt: session.updatedAt,
                        };
                    }),
            });

            let visibleSessionEntries = 0;
            searchEntries.forEach((entry) => {
                const target = entry.target;
                const searchOnly = entry.kind !== 'destination'
                    && (entry.kind !== 'session' || visibleSessionEntries >= 5);
                if (entry.kind === 'session') visibleSessionEntries += 1;
                cmds.push({
                    id: entry.id,
                    title: entry.title,
                    subtitle: entry.subtitle,
                    icon: entry.icon,
                    category: entry.category,
                    searchOnly,
                    action: () => {
                        if (target.kind === 'session') {
                            navigateToSession(target.sessionId);
                            return;
                        }
                        router.push(target.route as any);
                    },
                });
            });

            const existingCommandIds = new Set(cmds.map(command => command.id));
            projectCodexFirstSettingsDestinations({ experimentsEnabled: experiments })
                .filter(destination => !existingCommandIds.has(destination.id))
                .forEach(destination => {
                    const copy = codexFirstSettingsDestinationCopy(destination.id);
                    cmds.push({
                        id: destination.id,
                        title: copy.title,
                        subtitle: copy.subtitle,
                        icon: destination.icon,
                        category: t('settings.title'),
                        searchOnly: true,
                        action: () => router.push(destination.route as any),
                    });
                });
        } else {
            // Preserve the existing compact recent-Session search outside the
            // packaged Codex-first desktop shell.
            const recentSessions = Object.values(sessions)
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, 5);

            recentSessions.forEach(session => {
                const sessionName = session.metadata?.name || `Session ${session.id.slice(0, 6)}`;
                cmds.push({
                    id: `session-${session.id}`,
                    title: sessionName,
                    subtitle: session.metadata?.path || 'Switch to session',
                    icon: 'time-outline',
                    category: 'Recent Sessions',
                    action: () => {
                        navigateToSession(session.id);
                    }
                });
            });
        }

        // System commands
        cmds.push({
            id: 'sign-out',
            title: codexFirstContract.enabled ? t('common.logout') : 'Sign Out',
            subtitle: codexFirstContract.enabled ? t('codexFirst.commandSignOutSubtitle') : 'Sign out of your account',
            icon: 'log-out-outline',
            category: codexFirstContract.enabled ? t('codexFirst.commandSystemCategory') : 'System',
            action: async () => {
                await logout();
            }
        });

        // Dev commands (if in development)
        if (__DEV__) {
            cmds.push({
                id: 'dev-menu',
                title: codexFirstContract.enabled ? t('settings.developerTools') : 'Developer Menu',
                subtitle: codexFirstContract.enabled ? t('codexFirst.commandDeveloperSubtitle') : 'Access developer tools',
                icon: 'code-slash-outline',
                category: codexFirstContract.enabled ? t('codexFirst.commandDeveloperCategory') : 'Developer',
                action: () => {
                    router.push('/dev');
                }
            });
        }

        return cmds;
    }, [
        browserSafeShortcuts,
        codexFirstContract,
        experiments,
        githubIssuesEnabled,
        logout,
        machines,
        navigateToSession,
        preferredModifier,
        projectTodosEnabled,
        router,
        sessions,
    ]);

    const showCommandPalette = useCallback((requestedRestoreFocusTarget?: CommandPaletteFocusTarget | null) => {
        if (!commandPaletteAvailable) return;

        const restoreFocusTarget = Platform.OS === 'web' && typeof document !== 'undefined'
            ? (requestedRestoreFocusTarget ?? document.activeElement) as CommandPaletteFocusTarget | null
            : null;
        const currentThemePreference = storage.getState().localSettings.themePreference;
        const studioIsDark = resolveCommandPaletteDarkSnapshot({
            currentThemeIsDark: Appearance.getColorScheme() === 'dark',
            themePreference: currentThemePreference,
        });
        const studioPresentation = resolveStudioOverlayPresentation({
            isDark: studioIsDark,
            isTauriRuntime: codexFirstContract.presentation.usesStudioPrimitives,
            previewStyle: process.env.EXPO_PUBLIC_HAPPY_VISUAL_STYLE,
            requestedStyle: codexFirstContract.presentation.visualStyle,
        });

        Modal.show({
            component: CommandPalette,
            props: {
                commands,
                restoreFocusTarget,
                studioIsDark,
                studioPresentation,
            }
        } as any);
    }, [codexFirstContract.presentation.usesStudioPrimitives, codexFirstContract.presentation.visualStyle, commandPaletteAvailable, commands]);

    const openNewSession = useCallback(() => {
        router.navigate('/new');
    }, [router]);

    const openSettings = useCallback(() => {
        router.push('/settings');
    }, [router]);

    const openRecentSession = useCallback((index: number) => {
        const sessionId = visibleSessionShortcutIds[index];
        if (!sessionId) {
            return false;
        }
        navigateToSession(sessionId);
        return true;
    }, [navigateToSession, visibleSessionShortcutIds]);

    const visibleModifier = useGlobalKeyboard(
        {
            commandPalette: commandPaletteAvailable ? showCommandPalette : undefined,
            newSession: isAuthenticated ? openNewSession : undefined,
            settings: isAuthenticated ? openSettings : undefined,
            recentSession: isAuthenticated ? openRecentSession : undefined,
        },
        browserSafeShortcuts,
    );

    const launcher = useMemo<CommandPaletteLauncher>(() => ({
        available: commandPaletteAvailable,
        open: showCommandPalette,
    }), [commandPaletteAvailable, showCommandPalette]);

    return (
        <CommandPaletteLauncherContext.Provider value={launcher}>
            <ShortcutHintsProvider
                modifier={isAuthenticated ? visibleModifier : null}
                commandPaletteEnabled={commandPaletteAvailable}
                recentSessionIds={isAuthenticated ? visibleSessionShortcutIds : EMPTY_SESSION_IDS}
                browserSafeShortcuts={browserSafeShortcuts}
            >
                {children}
            </ShortcutHintsProvider>
        </CommandPaletteLauncherContext.Provider>
    );
}
