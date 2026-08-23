import React from 'react';
import { Platform, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { t } from '@/text';
import { ProjectGroupData, ProjectWorkspaceGroup, useAllMachines, useLocalSettingMutable, useSettingMutable } from '@/sync/storage';
import { CompactSessionRow } from './ActiveSessionsGroupCompact';
import { ProjectTodoButton } from './ProjectTodoButton';
import { shouldShowWorkspaceLabel } from '@/utils/sessionRowDisplayContext';
import type { DesktopSessionRowStyle } from '@/features/studio-visual-style/studioVisualStyle';
import { resolveStudioSidebarGroupPresentation } from '@/features/studio-visual-style/studioSidebarGroupPresentation';
import { resolveStudioSidebarInteractionPresentation } from '@/features/studio-visual-style/studioSidebarInteractionPresentation';
import { useStudioInteractionState } from '@/features/studio-visual-style/useStudioInteractionState';
import { requestHomeDockFocus } from './homeDockFocus';
import { useNewSessionDraft } from '@/hooks/useNewSessionDraft';
import { formatPathRelativeToHome } from '@/utils/sessionUtils';
import { getRepoPath, isWorktreePath } from '@/utils/worktreePaths';

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
    const primaryWorkspace = project.workspaces.find((workspace) => workspace.id === '') ?? project.workspaces[0];
    const startProjectSession = useStartSessionFromWorkspace(primaryWorkspace);

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

    const handleNewSession = React.useCallback((event: { stopPropagation?: () => void }) => {
        event.stopPropagation?.();
        startProjectSession();
    }, [startProjectSession]);

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
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        gap: 4,
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
                    <Text style={[
                        styles.title,
                        isStudio && {
                            fontSize: 13,
                            fontWeight: '400',
                            ...Typography.default(),
                        },
                    ]} numberOfLines={1}>
                        {project.name}
                    </Text>
                    {machineName && (
                        <Text style={[styles.subtitle, isStudio && { fontSize: 11, marginTop: 0 }]} numberOfLines={1}>
                            {machineName}
                        </Text>
                    )}
                </View>
                <Pressable
                    onPress={handleNewSession}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('sidebar.newSession')}
                    style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                >
                    <Ionicons name="add" size={18} color={theme.colors.textSecondary} />
                </Pressable>
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
    const startSession = useStartSessionFromWorkspace(workspace);
    return (
        <View style={[styles.workspace, sessionRowStyle.visualStyle === 'studio' && { paddingLeft: 0 }]}>
            {showLabel && (
                <View style={[
                    styles.workspaceHeader,
                    sessionRowStyle.visualStyle === 'studio' && {
                        paddingHorizontal: 18,
                        paddingTop: 4,
                        paddingBottom: 2,
                    },
                ]}>
                    <Ionicons
                        name={workspace.name ? 'git-branch-outline' : 'folder-outline'}
                        size={13}
                        color={theme.colors.textSecondary}
                    />
                    <Text style={[
                        styles.workspaceTitle,
                        sessionRowStyle.visualStyle === 'studio' && {
                            fontSize: 11,
                            ...Typography.default(),
                        },
                    ]} numberOfLines={1}>
                        {workspace.name ?? 'main'}
                    </Text>
                    <Pressable
                        onPress={startSession}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('sidebar.newSession')}
                        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                    >
                        <Ionicons name="add" size={16} color={theme.colors.textSecondary} />
                    </Pressable>
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

function useStartSessionFromWorkspace(workspace: ProjectWorkspaceGroup | undefined): () => void {
    const router = useRouter();
    const firstSession = workspace?.sessions[0];

    return React.useCallback(() => {
        const draft = useNewSessionDraft.getState();
        const sessionPath = firstSession?.path ?? '';
        const worktree = isWorktreePath(sessionPath);
        const repoPath = worktree ? getRepoPath(sessionPath) : sessionPath;

        if (firstSession?.machineId) draft.setMachineId(firstSession.machineId);
        if (repoPath) {
            draft.setPath(formatPathRelativeToHome(repoPath, firstSession?.homeDir ?? undefined));
        }
        draft.setSessionType(worktree ? 'worktree' : 'simple');
        draft.setWorktreeKey(worktree ? sessionPath : null);

        if (!requestHomeDockFocus()) router.navigate('/new');
    }, [firstSession, router]);
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: 'transparent',
        marginBottom: 4,
    },
    section: {
        backgroundColor: 'transparent',
    },
    containerUnboxed: {
        backgroundColor: 'transparent',
        marginHorizontal: 0,
        marginBottom: 4,
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
        marginHorizontal: 12,
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
        color: theme.colors.groupped.sectionTitle,
        fontSize: Platform.select({ ios: 13, default: 14 }),
        lineHeight: Platform.select({ ios: 18, default: 20 }),
        letterSpacing: Platform.select({ ios: -0.08, default: 0.1 }),
        fontWeight: Platform.select({ ios: 'normal', default: '500' }),
        ...Typography.default('regular'),
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
    addButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonPressed: {
        opacity: 0.5,
    },
}));
