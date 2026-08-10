import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { ProjectGroupData, ProjectWorkspaceGroup, useAllMachines, useLocalSettingMutable, useSettingMutable } from '@/sync/storage';
import { CompactSessionRow } from './ActiveSessionsGroupCompact';
import { ProjectTodoButton } from './ProjectTodoButton';
import { shouldShowWorkspaceLabel } from '@/utils/sessionRowDisplayContext';

interface ProjectGroupProps {
    project: ProjectGroupData;
    selectedSessionId?: string;
}

/**
 * One project and its sessions. Rig supplies native workspace identity; Happy
 * CLI sessions derive primary/worktree workspaces from their managed paths.
 */
export const ProjectGroup = React.memo(({ project, selectedSessionId }: ProjectGroupProps) => {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const machines = useAllMachines();
    const [collapsedProjects, setCollapsedProjects] = useLocalSettingMutable('collapsedProjects');
    const [favoriteProjectIds, setFavoriteProjectIds] = useSettingMutable('favoriteProjectIds');
    const collapsed = !!collapsedProjects[project.id];
    const isFavorite = favoriteProjectIds.includes(project.id);

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
        <View style={styles.container}>
            <Pressable style={styles.header} onPress={toggleCollapsed} hitSlop={8}>
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
                    style={styles.favoriteButton}
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
                />
            ))}
        </View>
    );
});

const WorkspaceSection = React.memo(({ workspace, showLabel, showTopBorder, selectedSessionId }: {
    workspace: ProjectWorkspaceGroup;
    showLabel: boolean;
    showTopBorder: boolean;
    selectedSessionId?: string;
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
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
