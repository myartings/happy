import React from 'react';
import { Platform, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { ProjectGroupData, ProjectWorkspaceGroup, useAllMachines, useLocalSettingMutable, useSettingMutable } from '@/sync/storage';
import { CompactSessionRow } from './ActiveSessionsGroupCompact';
import { ProjectTodoButton } from './ProjectTodoButton';
import { shouldShowWorkspaceLabel } from '@/utils/sessionRowDisplayContext';
import type { DesktopSessionRowStyle } from '@/features/studio-visual-style/studioVisualStyle';
import { resolveStudioSidebarGroupPresentation } from '@/features/studio-visual-style/studioSidebarGroupPresentation';
import { resolveStudioSidebarInteractionPresentation } from '@/features/studio-visual-style/studioSidebarInteractionPresentation';
import { useStudioInteractionState } from '@/features/studio-visual-style/useStudioInteractionState';

interface ProjectGroupProps {
    project: ProjectGroupData;
    selectedSessionId?: string;
    sessionRowStyle: DesktopSessionRowStyle;
}

/**
 * One project and its sessions. Rig supplies native workspace identity; Happy
 * CLI sessions derive primary/worktree workspaces from their managed paths.
 */
export const ProjectGroup = React.memo(({ project, selectedSessionId, sessionRowStyle }: ProjectGroupProps) => {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const machines = useAllMachines();
    const [collapsedProjects, setCollapsedProjects] = useLocalSettingMutable('collapsedProjects');
    const [favoriteProjectIds, setFavoriteProjectIds] = useSettingMutable('favoriteProjectIds');
    const collapsed = !!collapsedProjects[project.id];
    const isFavorite = favoriteProjectIds.includes(project.id);
    const groupPresentation = resolveStudioSidebarGroupPresentation(sessionRowStyle);
    const isStudio = sessionRowStyle.visualStyle === 'studio';
    const interactionPresentation = React.useMemo(() => resolveStudioSidebarInteractionPresentation({
        isDark: theme.dark,
        isTauriRuntime: isStudio,
        requestedStyle: isStudio ? 'studio' : 'default',
    }), [isStudio, theme.dark]);
    const headerInteraction = useStudioInteractionState(isStudio);
    const favoriteInteraction = useStudioInteractionState(isStudio);

    const toggleCollapsed = React.useCallback(() => {
        setCollapsedProjects({ ...collapsedProjects, [project.id]: !collapsed });
    }, [collapsed, collapsedProjects, project.id, setCollapsedProjects]);

    const toggleFavorite = React.useCallback((event: { stopPropagation?: () => void }) => {
        event.stopPropagation?.();
        setFavoriteProjectIds(isFavorite
            ? favoriteProjectIds.filter((id) => id !== project.id)
            : [project.id, ...favoriteProjectIds.filter((id) => id !== project.id)]
        );
    }, [favoriteProjectIds, isFavorite, project.id, setFavoriteProjectIds]);

    const machineName = React.useMemo(() => {
        if (!project.machineId) return null;
        const machine = machines.find(m => m.id === project.machineId);
        return machine?.metadata?.displayName || machine?.metadata?.host || null;
    }, [machines, project.machineId]);
    return (
        <View style={groupPresentation === 'card' ? styles.container : styles.containerUnboxed}>
            <Pressable
                {...headerInteraction.interactionProps}
                style={({ pressed }) => [
                    styles.header,
                    groupPresentation === 'unboxed' && styles.headerUnboxed,
                    isStudio && {
                        backgroundColor: pressed
                            ? interactionPresentation.rowPressedColor
                            : headerInteraction.hovered
                                ? interactionPresentation.rowHoverColor
                                : 'transparent',
                        borderRadius: sessionRowStyle.cornerRadius!,
                        ...(Platform.OS === 'web' && headerInteraction.focused ? {
                            outlineColor: interactionPresentation.focusRingColor,
                            outlineOffset: -2,
                            outlineStyle: 'solid',
                            outlineWidth: 2,
                        } as any : {}),
                    },
                ]}
                onPress={toggleCollapsed}
                hitSlop={8}
            >
                <Ionicons
                    name={collapsed ? 'chevron-forward' : 'chevron-down'}
                    size={16}
                    color={theme.colors.textSecondary}
                    style={styles.chevron}
                />
                <View style={styles.headerText}>
                    <Text style={styles.title} numberOfLines={1}>
                        {project.name}
                    </Text>
                    {machineName && (
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {machineName}
                        </Text>
                    )}
                </View>
                <Pressable
                    accessibilityLabel={isFavorite ? 'Remove project from favorites' : 'Add project to favorites'}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isFavorite }}
                    hitSlop={8}
                    onPress={toggleFavorite}
                    {...favoriteInteraction.interactionProps}
                    style={({ pressed }) => [
                        styles.favoriteButton,
                        isStudio && (pressed || favoriteInteraction.hovered) && {
                            backgroundColor: pressed
                                ? interactionPresentation.controlPressedColor
                                : interactionPresentation.controlHoverColor,
                        },
                        isStudio && Platform.OS === 'web' && favoriteInteraction.focused && ({
                            outlineColor: interactionPresentation.focusRingColor,
                            outlineOffset: 1,
                            outlineStyle: 'solid',
                            outlineWidth: 2,
                        } as any),
                    ]}
                >
                    <Ionicons
                        name={isFavorite ? 'star' : 'star-outline'}
                        size={16}
                        color={isFavorite ? theme.colors.textLink : theme.colors.textSecondary}
                    />
                </Pressable>
                <ProjectTodoButton
                    projectKey={`project:${project.id}`}
                />
                <Text style={styles.count}>
                    {project.activeCount > 0 ? `${project.activeCount}/${project.sessionCount}` : project.sessionCount}
                </Text>
            </Pressable>

            {!collapsed && project.workspaces.map((workspace, workspaceIndex) => (
                <WorkspaceSection
                    key={workspace.id || 'primary'}
                    workspace={workspace}
                    showLabel={shouldShowWorkspaceLabel({
                        workspaceCount: project.workspaces.length,
                        workspaceName: workspace.name,
                    })}
                    showTopBorder={workspaceIndex > 0}
                    selectedSessionId={selectedSessionId}
                    sessionRowStyle={sessionRowStyle}
                />
            ))}
        </View>
    );
});

const WorkspaceSection = React.memo(({ workspace, showLabel, showTopBorder, selectedSessionId, sessionRowStyle }: {
    workspace: ProjectWorkspaceGroup;
    showLabel: boolean;
    showTopBorder: boolean;
    selectedSessionId?: string;
    sessionRowStyle: DesktopSessionRowStyle;
}) => {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    return (
        <View style={styles.workspace}>
            {showLabel && (
                <View style={styles.workspaceHeader}>
                    <Ionicons
                        name={workspace.name ? 'git-branch-outline' : 'folder-outline'}
                        size={13}
                        color={theme.colors.textSecondary}
                    />
                    <Text style={styles.workspaceTitle} numberOfLines={1}>
                        {workspace.name ?? 'main'}
                    </Text>
                </View>
            )}
            {workspace.sessions.map((session, index) => (
                <CompactSessionRow
                    key={session.id}
                    session={session}
                    selected={session.id === selectedSessionId}
                    showBorder={showTopBorder || index > 0}
                    displayContext="workspace"
                    sessionRowStyle={sessionRowStyle}
                />
            ))}
        </View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 8,
        marginBottom: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    containerUnboxed: {
        backgroundColor: 'transparent',
        marginHorizontal: 0,
        marginBottom: 8,
        borderRadius: 0,
        overflow: 'visible',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
    },
    headerUnboxed: {
        marginHorizontal: 8,
        backgroundColor: 'transparent',
    },
    chevron: {
        width: 16,
    },
    headerText: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        fontSize: 15,
        color: theme.colors.text,
        ...Typography.default('semiBold'),
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 1,
        ...Typography.default(),
    },
    count: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        ...Typography.default(),
    },
    favoriteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
    },
    workspace: {
        paddingLeft: 10,
    },
    workspaceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 4,
    },
    workspaceTitle: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.textSecondary,
        ...Typography.default('semiBold'),
    },
}));
