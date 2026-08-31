import * as React from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Typography } from '@/constants/Typography';
import { useHasArchivedSessions, useVisibleSessionListViewData } from '@/hooks/useVisibleSessionListViewData';
import { useNavigateToSession } from '@/hooks/useNavigateToSession';
import { useOfflineMachineTroubleshooting } from '@/hooks/useOfflineMachineTroubleshooting';
import { useConnectTerminal } from '@/hooks/useConnectTerminal';
import { Modal } from '@/modal';
import { collectMachineChoices } from '@/sync/machineChoices';
import { sync } from '@/sync/sync';
import { useAllMachines, useSettingMutable, useSocketStatus } from '@/sync/storage';
import { t } from '@/text';
import { trackConnectAttempt } from '@/track';

import {
    collectCodexFirstRecentProjects,
    countCodexFirstVisibleSessions,
    resolveCodexFirstHomeState,
    type CodexFirstHomeState,
} from './codexFirstHomeState';

type CodexFirstHomeCanvasProps = {
    compact?: boolean;
};

const stylesheet = StyleSheet.create((theme) => ({
    canvas: {
        flex: 1,
        minHeight: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
        backgroundColor: theme.colors.groupped.background,
    },
    canvasCompact: {
        paddingHorizontal: 18,
        paddingVertical: 28,
    },
    content: {
        width: '100%',
        maxWidth: 560,
        alignItems: 'center',
    },
    contentCompact: {
        maxWidth: 290,
    },
    iconWell: {
        width: 44,
        height: 44,
        marginBottom: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceHigh,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
    },
    iconWellCompact: {
        width: 38,
        height: 38,
        marginBottom: 14,
        borderRadius: 10,
    },
    title: {
        maxWidth: 520,
        color: theme.colors.text,
        fontSize: 26,
        lineHeight: 34,
        textAlign: 'center',
        ...Typography.default('semiBold'),
    },
    titleCompact: {
        fontSize: 17,
        lineHeight: 23,
    },
    description: {
        maxWidth: 470,
        marginTop: 8,
        color: theme.colors.textSecondary,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center',
        ...Typography.default(),
    },
    descriptionCompact: {
        fontSize: 12,
        lineHeight: 18,
    },
    actions: {
        marginTop: 22,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
    },
    action: {
        minHeight: 38,
        paddingHorizontal: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        borderWidth: StyleSheet.hairlineWidth,
    },
    actionCompact: {
        minHeight: 34,
        paddingHorizontal: 12,
    },
    actionPrimary: {
        backgroundColor: theme.colors.button.primary.background,
        borderColor: theme.colors.button.primary.background,
    },
    actionSecondary: {
        backgroundColor: theme.colors.surfaceHigh,
        borderColor: theme.colors.divider,
    },
    actionPressed: {
        opacity: 0.74,
    },
    actionDisabled: {
        opacity: 0.48,
    },
    actionText: {
        fontSize: 13,
        lineHeight: 18,
        ...Typography.default('semiBold'),
    },
    recent: {
        width: '100%',
        maxWidth: 440,
        marginTop: 36,
    },
    recentTitle: {
        marginBottom: 8,
        color: theme.colors.textSecondary,
        fontSize: 12,
        lineHeight: 18,
        ...Typography.default('semiBold'),
    },
    recentList: {
        overflow: 'hidden',
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surface,
    },
    recentRow: {
        minHeight: 43,
        paddingHorizontal: 13,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.divider,
    },
    recentRowLast: {
        borderBottomWidth: 0,
    },
    recentRowPressed: {
        backgroundColor: theme.colors.surfacePressedOverlay,
    },
    recentName: {
        flex: 1,
        minWidth: 0,
        color: theme.colors.text,
        fontSize: 13,
        lineHeight: 18,
        ...Typography.default(),
    },
}));

function resolvePresentation(state: CodexFirstHomeState): {
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
} {
    switch (state) {
        case 'loading':
            return {
                description: '',
                icon: 'ellipsis-horizontal',
                title: t('common.loading'),
            };
        case 'no-machines':
            return {
                description: t('codexFirst.homeNoMachinesDescription'),
                icon: 'desktop-outline',
                title: t('codexFirst.homeNoMachinesTitle'),
            };
        case 'reconnecting':
            return {
                description: t('codexFirst.homeReconnectingDescription'),
                icon: 'sync-outline',
                title: t('codexFirst.homeReconnectingTitle'),
            };
        case 'all-offline':
            return {
                description: t('codexFirst.homeOfflineDescription'),
                icon: 'cloud-offline-outline',
                title: t('codexFirst.homeOfflineTitle'),
            };
        case 'connection-error':
            return {
                description: t('codexFirst.homeConnectionErrorDescription'),
                icon: 'warning-outline',
                title: t('codexFirst.homeConnectionErrorTitle'),
            };
        case 'archived-only':
            return {
                description: t('codexFirst.homeArchivedDescription'),
                icon: 'archive-outline',
                title: t('codexFirst.homeArchivedTitle'),
            };
        case 'no-sessions':
            return {
                description: t('codexFirst.homeNoSessionsDescription'),
                icon: 'terminal-outline',
                title: t('codexFirst.homeNoSessionsTitle'),
            };
        case 'ready':
            return {
                description: t('codexFirst.homeReadyDescription'),
                icon: 'code-slash-outline',
                title: t('codexFirst.homeReadyTitle'),
            };
    }
}

const HomeAction = React.memo(({
    compact,
    disabled = false,
    icon,
    label,
    loading = false,
    onPress,
    primary = false,
}: {
    compact: boolean;
    disabled?: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    loading?: boolean;
    onPress: () => void;
    primary?: boolean;
}) => {
    const { theme } = useUnistyles();
    const tint = primary ? theme.colors.button.primary.tint : theme.colors.text;

    return (
        <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ disabled: disabled || loading }}
            disabled={disabled || loading}
            onPress={onPress}
            style={({ pressed }) => [
                stylesheet.action,
                compact && stylesheet.actionCompact,
                primary ? stylesheet.actionPrimary : stylesheet.actionSecondary,
                pressed && stylesheet.actionPressed,
                (disabled || loading) && stylesheet.actionDisabled,
                Platform.OS === 'web' ? { cursor: disabled || loading ? 'default' : 'pointer' } as any : null,
            ]}
        >
            {loading
                ? <ActivityIndicator size="small" color={tint} />
                : <Ionicons name={icon} size={16} color={tint} />}
            <Text style={[stylesheet.actionText, { color: tint }]}>{label}</Text>
        </Pressable>
    );
});

export const CodexFirstHomeCanvas = React.memo(({ compact = false }: CodexFirstHomeCanvasProps) => {
    const { theme } = useUnistyles();
    const router = useRouter();
    const navigateToSession = useNavigateToSession();
    const sessionListViewData = useVisibleSessionListViewData();
    const hasArchivedSessions = useHasArchivedSessions();
    const machines = useAllMachines({ includeOffline: true });
    const { status: socketStatus } = useSocketStatus();
    const [, setHideArchivedSessions] = useSettingMutable('hideInactiveSessions');
    const { connectWithUrl, isLoading: isConnectingTerminal } = useConnectTerminal();
    const [isRetrying, setIsRetrying] = React.useState(false);

    const machineChoices = React.useMemo(() => collectMachineChoices(machines), [machines]);
    const troubleshoot = useOfflineMachineTroubleshooting(machineChoices);
    const visibleSessionCount = React.useMemo(
        () => sessionListViewData ? countCodexFirstVisibleSessions(sessionListViewData) : 0,
        [sessionListViewData],
    );
    const recentProjects = React.useMemo(
        () => sessionListViewData
            ? collectCodexFirstRecentProjects(sessionListViewData, 3, machineChoices, t('codexFirst.unknownMachine'))
            : [],
        [machineChoices, sessionListViewData],
    );
    const state = resolveCodexFirstHomeState({
        dataLoaded: sessionListViewData !== null,
        hasArchivedSessions,
        machineCount: machineChoices.length,
        onlineMachineCount: machineChoices.filter((machine) => machine.online).length,
        connectionStatus: socketStatus,
        visibleSessionCount,
    });
    const presentation = resolvePresentation(state);

    const openMachines = React.useCallback(() => {
        router.push('/settings/agents' as any);
    }, [router]);
    const openNewSession = React.useCallback(() => {
        router.navigate('/new');
    }, [router]);
    const connectTerminal = React.useCallback(async () => {
        trackConnectAttempt();
        const url = await Modal.prompt(
            t('modals.authenticateTerminal'),
            t('modals.pasteUrlFromTerminal'),
            {
                placeholder: 'happy://terminal?...',
                cancelText: t('common.cancel'),
                confirmText: t('common.authenticate'),
            },
        );
        if (url?.trim()) await connectWithUrl(url.trim());
    }, [connectWithUrl]);
    const retry = React.useCallback(async () => {
        if (isRetrying) return;
        setIsRetrying(true);
        try {
            await Promise.all([sync.refreshMachines(), sync.refreshSessions()]);
        } catch (error) {
            console.warn('Failed to refresh Codex-first home data', error);
        } finally {
            setIsRetrying(false);
        }
    }, [isRetrying]);

    const actions = (() => {
        switch (state) {
            case 'loading':
                return null;
            case 'no-machines':
                return (
                    <>
                        <HomeAction
                            compact={compact}
                            icon="link-outline"
                            label={t('navigation.connectTerminal')}
                            loading={isConnectingTerminal}
                            onPress={() => { void connectTerminal(); }}
                            primary
                        />
                        <HomeAction compact={compact} icon="desktop-outline" label={t('codexFirst.machinesAndAgents')} onPress={openMachines} />
                    </>
                );
            case 'reconnecting':
                return <HomeAction compact={compact} icon="desktop-outline" label={t('codexFirst.machinesAndAgents')} onPress={openMachines} />;
            case 'all-offline':
                return (
                    <>
                        <HomeAction compact={compact} icon="help-circle-outline" label={t('codexFirst.troubleshoot')} onPress={troubleshoot} primary />
                        <HomeAction compact={compact} icon="desktop-outline" label={t('codexFirst.machinesAndAgents')} onPress={openMachines} />
                    </>
                );
            case 'connection-error':
                return (
                    <>
                        <HomeAction compact={compact} icon="refresh-outline" label={t('common.retry')} loading={isRetrying} onPress={() => { void retry(); }} primary />
                        <HomeAction compact={compact} icon="desktop-outline" label={t('codexFirst.machinesAndAgents')} onPress={openMachines} />
                    </>
                );
            case 'archived-only':
                return (
                    <>
                        <HomeAction compact={compact} icon="add-outline" label={t('sidebar.newSession')} onPress={openNewSession} primary />
                        <HomeAction compact={compact} icon="archive-outline" label={t('sidebar.showArchived')} onPress={() => setHideArchivedSessions(false)} />
                    </>
                );
            case 'no-sessions':
            case 'ready':
                return <HomeAction compact={compact} icon="add-outline" label={t('sidebar.newSession')} onPress={openNewSession} primary />;
        }
    })();

    return (
        <View style={[stylesheet.canvas, compact && stylesheet.canvasCompact]}>
            <View style={[stylesheet.content, compact && stylesheet.contentCompact]}>
                <View style={[stylesheet.iconWell, compact && stylesheet.iconWellCompact]}>
                    {state === 'loading' || state === 'reconnecting'
                        ? <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                        : <Ionicons name={presentation.icon} size={compact ? 19 : 22} color={theme.colors.textSecondary} />}
                </View>
                <Text style={[stylesheet.title, compact && stylesheet.titleCompact]}>{presentation.title}</Text>
                {presentation.description ? (
                    <Text style={[stylesheet.description, compact && stylesheet.descriptionCompact]}>
                        {presentation.description}
                    </Text>
                ) : null}
                {actions ? <View style={stylesheet.actions}>{actions}</View> : null}

                {!compact && state === 'ready' && recentProjects.length > 0 ? (
                    <View style={stylesheet.recent}>
                        <Text style={stylesheet.recentTitle}>{t('codexFirst.recentProjects')}</Text>
                        <View style={stylesheet.recentList}>
                            {recentProjects.map((project, index) => {
                                const projectLabel = project.machineLabel
                                    ? `${project.name} — ${project.machineLabel}`
                                    : project.name;
                                return (
                                    <Pressable
                                        key={`${project.id}:${project.machineLabel ?? ''}`}
                                        accessibilityLabel={projectLabel}
                                        accessibilityRole="button"
                                        onPress={() => navigateToSession(project.sessionId)}
                                        style={({ pressed }) => [
                                            stylesheet.recentRow,
                                            index === recentProjects.length - 1 && stylesheet.recentRowLast,
                                            pressed && stylesheet.recentRowPressed,
                                            Platform.OS === 'web' ? { cursor: 'pointer' } as any : null,
                                        ]}
                                    >
                                        <Ionicons name="folder-outline" size={16} color={theme.colors.textSecondary} />
                                        <Text numberOfLines={1} style={stylesheet.recentName}>{projectLabel}</Text>
                                        <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ) : null}
            </View>
        </View>
    );
});
