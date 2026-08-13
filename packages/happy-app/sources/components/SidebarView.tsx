import * as React from 'react';
import { Platform, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@/utils/responsive';
import { VoiceAssistantStatusBar } from './VoiceAssistantStatusBar';
import { useLocalSetting, useRealtimeStatus, useSetting, useSettingMutable } from '@/sync/storage';
import { MainView } from './MainView';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { t } from '@/text';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { ShortcutHintBadge, useShortcutHints } from './ShortcutHints';
import { ProjectTodoButton } from './ProjectTodoButton';
import { useHasArchivedSessions } from '@/hooks/useVisibleSessionListViewData';
import {
    resolveDesktopTodoRowStyle,
    resolveDesktopSidebarFooterStyle,
    resolveDesktopTopControlsStyle,
    type DesktopSidebarFrame,
} from '@/features/studio-visual-style/studioVisualStyle';
import { resolveStudioSidebarInteractionPresentation } from '@/features/studio-visual-style/studioSidebarInteractionPresentation';
import { useStudioInteractionState } from '@/features/studio-visual-style/useStudioInteractionState';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        borderStyle: 'solid',
        backgroundColor: theme.colors.groupped.background,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
    },
    topControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        gap: 8,
    },
    newSessionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surface,
        gap: 8,
    },
    newSessionButtonPressed: {
        backgroundColor: theme.colors.surfacePressed,
    },
    projectTodosButton: {
        marginHorizontal: 16,
        marginBottom: 4,
        justifyContent: 'flex-start',
        paddingHorizontal: 14,
    },
    projectTodosButtonStudio: {
        minHeight: 36,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    projectTodosText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        ...Typography.default(),
    },
    projectTodosCount: {
        marginLeft: 'auto',
        fontSize: 11,
        color: theme.colors.textSecondary,
        ...Typography.default(),
    },
    archiveButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surface,
    },
    archiveButtonActive: {
        backgroundColor: theme.colors.surfaceSelected,
    },
    shortcutTargetActive: {
        backgroundColor: theme.colors.surfacePressed,
    },
    newSessionText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        ...Typography.default('semiBold'),
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.divider,
        gap: 10,
    },
    settingsText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        ...Typography.default(),
    },
    shortcutBadgeInline: {
        marginLeft: 'auto',
    },
}));

export const SidebarView = React.memo(({ sidebarFrame }: { sidebarFrame?: DesktopSidebarFrame }) => {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const safeArea = useSafeAreaInsets();
    const router = useRouter();
    const headerHeight = useHeaderHeight();
    const realtimeStatus = useRealtimeStatus();
    const hasArchivedSessions = useHasArchivedSessions();
    const projectTodosEnabled = useLocalSetting('devProjectTodosEnabled');
    const projectTodos = useSetting('projectTodos');
    const pendingProjectTodos = React.useMemo(
        () => Object.values(projectTodos).flat().filter((todo) => !todo.completed).length,
        [projectTodos],
    );
    // Stored under its original `hideInactiveSessions` key — synced settings
    // have no rename migration — but it hides archived sessions only.
    const [hideArchivedSessions, setHideArchivedSessions] = useSettingMutable('hideInactiveSessions');
    const { visible: shortcutHintsVisible } = useShortcutHints();
    const topControlsStyle = React.useMemo(() => resolveDesktopTopControlsStyle({
        isTauriRuntime: sidebarFrame?.visualStyle === 'studio',
        requestedStyle: sidebarFrame?.visualStyle ?? 'default',
    }), [sidebarFrame?.visualStyle]);
    const isStudio = topControlsStyle.visualStyle === 'studio';
    const interactionPresentation = React.useMemo(() => resolveStudioSidebarInteractionPresentation({
        isDark: theme.dark,
        isTauriRuntime: isStudio,
        requestedStyle: isStudio ? 'studio' : 'default',
    }), [isStudio, theme.dark]);
    const newSessionState = useStudioInteractionState(isStudio);
    const archiveState = useStudioInteractionState(isStudio);
    const todoState = useStudioInteractionState(isStudio);
    const settingsState = useStudioInteractionState(isStudio);
    const todoRowStyle = React.useMemo(() => resolveDesktopTodoRowStyle({
        isTauriRuntime: isStudio,
        requestedStyle: isStudio ? 'studio' : 'default',
    }), [isStudio]);
    const footerStyle = React.useMemo(() => resolveDesktopSidebarFooterStyle({
        isTauriRuntime: isStudio,
        requestedStyle: isStudio ? 'studio' : 'default',
    }), [isStudio]);

    const handleNewSession = React.useCallback(() => {
        router.navigate('/new');
    }, [router]);
    const handleArchiveVisibility = React.useCallback(() => {
        setHideArchivedSessions(!hideArchivedSessions);
    }, [hideArchivedSessions, setHideArchivedSessions]);
    const handleProjectTodos = React.useCallback(() => {
        router.push('/project-todos' as any);
    }, [router]);

    return (
        <View style={[
            styles.container,
            {
                paddingTop: safeArea.top + headerHeight,
                backgroundColor: isStudio
                    ? interactionPresentation.surfaceColor
                    : sidebarFrame?.sidebarBackground,
                ...(sidebarFrame?.visualStyle === 'studio'
                    ? {
                        borderTopWidth: 0,
                        borderBottomWidth: 0,
                        borderLeftWidth: 0,
                        borderRightWidth: 0,
                    }
                    : {}),
            },
        ]}>
            <View style={[
                styles.topControls,
                isStudio && { gap: topControlsStyle.groupGap! },
            ]}>
                <Pressable
                    onPress={handleNewSession}
                    {...newSessionState.interactionProps}
                    hitSlop={isStudio ? { top: 4, bottom: 4 } : undefined}
                    accessibilityLabel={t('sidebar.newSession')}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                        styles.newSessionButton,
                        isStudio && {
                            height: topControlsStyle.controlHeight!,
                            paddingVertical: 0,
                            paddingHorizontal: topControlsStyle.horizontalPadding!,
                            borderRadius: topControlsStyle.cornerRadius!,
                            gap: topControlsStyle.contentGap!,
                            shadowOpacity: 0,
                            elevation: 0,
                            borderWidth: topControlsStyle.showRestingBorder ? StyleSheet.hairlineWidth : 0,
                            borderColor: interactionPresentation.dividerColor,
                        },
                        shortcutHintsVisible && styles.shortcutTargetActive,
                        pressed && styles.newSessionButtonPressed,
                        isStudio && {
                            backgroundColor: pressed || shortcutHintsVisible
                                ? interactionPresentation.controlPressedColor
                                : newSessionState.hovered
                                    ? interactionPresentation.controlHoverColor
                                    : topControlsStyle.showRestingSurface
                                        ? interactionPresentation.controlSurfaceColor
                                        : 'transparent',
                            ...(Platform.OS === 'web' && newSessionState.focused ? {
                                outlineColor: interactionPresentation.focusRingColor,
                                outlineOffset: -2,
                                outlineStyle: 'solid',
                                outlineWidth: 2,
                            } as any : {}),
                        },
                    ]}
                >
                    <Ionicons name="create-outline" size={16} color={stylesheet.newSessionText.color} />
                    <Text style={[
                        styles.newSessionText,
                        isStudio && { fontWeight: '400', ...Typography.default() },
                    ]}>{t('sidebar.newSession')}</Text>
                    <ShortcutHintBadge shortcutKey="N" style={styles.shortcutBadgeInline} />
                </Pressable>
                {hasArchivedSessions && (
                    <Pressable
                        onPress={handleArchiveVisibility}
                        {...archiveState.interactionProps}
                        hitSlop={isStudio ? 4 : undefined}
                        accessibilityLabel={hideArchivedSessions
                            ? t('sidebar.showArchived')
                            : t('sidebar.hideArchived')}
                        accessibilityRole="button"
                        accessibilityState={{ selected: !hideArchivedSessions }}
                        style={({ pressed }) => [
                            styles.archiveButton,
                            isStudio && {
                                width: topControlsStyle.archiveWidth!,
                                height: topControlsStyle.controlHeight!,
                                borderRadius: topControlsStyle.cornerRadius!,
                                shadowOpacity: 0,
                                elevation: 0,
                                borderWidth: topControlsStyle.showRestingBorder ? StyleSheet.hairlineWidth : 0,
                                borderColor: interactionPresentation.dividerColor,
                            },
                            !hideArchivedSessions && styles.archiveButtonActive,
                            pressed && styles.newSessionButtonPressed,
                            isStudio && {
                                backgroundColor: pressed
                                    ? interactionPresentation.controlPressedColor
                                    : !hideArchivedSessions
                                        ? interactionPresentation.rowSelectedColor
                                        : archiveState.hovered
                                            ? interactionPresentation.controlHoverColor
                                            : topControlsStyle.showRestingSurface
                                                ? interactionPresentation.controlSurfaceColor
                                                : 'transparent',
                                ...(Platform.OS === 'web' && archiveState.focused ? {
                                    outlineColor: interactionPresentation.focusRingColor,
                                    outlineOffset: -2,
                                    outlineStyle: 'solid',
                                    outlineWidth: 2,
                                } as any : {}),
                            },
                        ]}
                    >
                        <Ionicons
                            name={hideArchivedSessions ? 'archive-outline' : 'archive'}
                            size={18}
                            color={stylesheet.newSessionText.color}
                        />
                    </Pressable>
                )}
            </View>

            {isStudio ? (
                projectTodosEnabled && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('projectTodos.title')}
                        onPress={handleProjectTodos}
                        hitSlop={{ top: 4, bottom: 4 }}
                        {...todoState.interactionProps}
                        style={({ pressed }) => [
                            styles.projectTodosButton,
                            styles.projectTodosButtonStudio,
                            {
                                height: todoRowStyle.height!,
                                paddingHorizontal: todoRowStyle.horizontalPadding!,
                                borderRadius: todoRowStyle.cornerRadius!,
                                borderWidth: todoRowStyle.showRestingBorder ? StyleSheet.hairlineWidth : 0,
                                borderColor: interactionPresentation.dividerColor,
                                gap: todoRowStyle.contentGap!,
                                backgroundColor: pressed
                                    ? interactionPresentation.controlPressedColor
                                    : todoState.hovered
                                        ? interactionPresentation.controlHoverColor
                                        : todoRowStyle.showRestingSurface
                                            ? interactionPresentation.controlSurfaceColor
                                            : 'transparent',
                                ...(Platform.OS === 'web' && todoState.focused ? {
                                    outlineColor: interactionPresentation.focusRingColor,
                                    outlineOffset: -2,
                                    outlineStyle: 'solid',
                                    outlineWidth: 2,
                                } as any : {}),
                            },
                        ]}
                    >
                        <Ionicons name="checkbox-outline" size={17} color={stylesheet.projectTodosText.color} />
                        <Text style={styles.projectTodosText}>{t('projectTodos.shortTitle')}</Text>
                        {pendingProjectTodos > 0 && (
                            <Text style={styles.projectTodosCount}>
                                {pendingProjectTodos > 99 ? '99+' : pendingProjectTodos}
                            </Text>
                        )}
                    </Pressable>
                )
            ) : (
                <ProjectTodoButton
                    showLabel
                    presentationStyle={todoRowStyle}
                    style={styles.projectTodosButton}
                />
            )}

            {realtimeStatus !== 'disconnected' && (
                <VoiceAssistantStatusBar variant="sidebar" />
            )}

            {/* Sessions list */}
            <MainView variant="sidebar" sidebarVisualStyle={sidebarFrame?.visualStyle} />

            {/* Settings at bottom */}
            <Pressable
                onPress={() => router.push('/settings')}
                {...settingsState.interactionProps}
                style={({ pressed }) => [
                    styles.settingsRow,
                    isStudio && {
                        height: footerStyle.height!,
                        paddingHorizontal: footerStyle.horizontalPadding!,
                        paddingVertical: 0,
                        gap: footerStyle.contentGap!,
                    },
                    shortcutHintsVisible && styles.shortcutTargetActive,
                    isStudio && {
                        backgroundColor: pressed
                            ? interactionPresentation.controlPressedColor
                            : settingsState.hovered
                                ? interactionPresentation.controlHoverColor
                                : 'transparent',
                        borderTopColor: interactionPresentation.dividerColor,
                        ...(Platform.OS === 'web' && settingsState.focused ? {
                            outlineColor: interactionPresentation.focusRingColor,
                            outlineOffset: -2,
                            outlineStyle: 'solid',
                            outlineWidth: 2,
                        } as any : {}),
                    },
                ]}
            >
                <Ionicons name="settings-outline" size={isStudio ? footerStyle.iconSize! : 18} color={stylesheet.settingsText.color} />
                <Text style={[styles.settingsText, isStudio && { fontSize: footerStyle.labelFontSize! }]}>{t('settings.title')}</Text>
                <ShortcutHintBadge shortcutKey="," style={styles.shortcutBadgeInline} />
            </Pressable>
        </View>
    );
});
