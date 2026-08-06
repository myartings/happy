import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { ProjectGroupData, ProjectWorkspaceGroup, useAllMachines, useLocalSettingMutable, useSessionGitStatus } from '@/sync/storage';
import { CompactSessionRow } from './ActiveSessionsGroupCompact';
import { ProjectTodoButton } from './ProjectTodoButton';

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
    const collapsed = !!collapsedProjects[project.id];

    const toggleCollapsed = React.useCallback(() => {
        setCollapsedProjects({ ...collapsedProjects, [project.id]: !collapsed });
    }, [collapsed, collapsedProjects, project.id, setCollapsedProjects]);

    const machineName = React.useMemo(() => {
        if (!project.machineId) return null;
        const machine = machines.find(m => m.id === project.machineId);
        return machine?.metadata?.displayName || machine?.metadata?.host || null;
    }, [machines, project.machineId]);

    const showPrimaryWorkspaceLabel = project.workspaces.length > 1;

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
                <ProjectTodoButton
                    projectKey={`project:${project.id}`}
                    showLabel
                />
                <Text style={styles.count}>
                    {project.activeCount > 0 ? `${project.activeCount}/${project.sessionCount}` : project.sessionCount}
                </Text>
            </Pressable>

            {!collapsed && project.workspaces.map(workspace => (
                <WorkspaceSection
                    key={workspace.id || 'primary'}
                    workspace={workspace}
                    showPrimaryLabel={showPrimaryWorkspaceLabel}
                    selectedSessionId={selectedSessionId}
                />
            ))}
        </View>
    );
});

const WorkspaceSection = React.memo(({ workspace, showPrimaryLabel, selectedSessionId }: {
    workspace: ProjectWorkspaceGroup;
    showPrimaryLabel: boolean;
    selectedSessionId?: string;
}) => {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const firstSessionId = workspace.sessions[0]?.id ?? '';
    const reportedBranchName = workspace.sessions[0]?.gitBranch?.trim() || null;
    const gitStatus = useSessionGitStatus(firstSessionId);
    const branchName = gitStatus && gitStatus.lastUpdatedAt > 0
        ? gitStatus.branch?.trim() || null
        : reportedBranchName;
    const showHeader = !!workspace.name || !!branchName || showPrimaryLabel;

    return (
        <View style={styles.workspace}>
            {showHeader && (
                <View style={styles.workspaceHeader}>
                    {workspace.name ? (
                        <>
                            <MaterialCommunityIcons name="tree" size={13} color={theme.colors.textSecondary} />
                            <Text style={styles.workspaceTitle} numberOfLines={1}>{workspace.name}</Text>
                        </>
                    ) : showPrimaryLabel ? (
                        <>
                            <Ionicons name="folder-outline" size={13} color={theme.colors.textSecondary} />
                            <Text style={styles.workspaceTitle} numberOfLines={1}>main</Text>
                        </>
                    ) : null}
                    {branchName && (
                        <View style={styles.branchLabel}>
                            <Ionicons name="git-branch-outline" size={13} color={theme.colors.textSecondary} />
                            <Text style={styles.branchTitle} numberOfLines={1}>{branchName}</Text>
                        </View>
                    )}
                </View>
            )}
            {workspace.sessions.map((session, index) => (
                <CompactSessionRow
                    key={session.id}
                    session={session}
                    selected={session.id === selectedSessionId}
                    showBorder={index > 0}
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
        flexShrink: 1,
        fontSize: 12,
        color: theme.colors.textSecondary,
        ...Typography.default('semiBold'),
    },
    branchLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        gap: 3,
        marginLeft: 4,
    },
    branchTitle: {
        flexShrink: 1,
        fontSize: 12,
        color: theme.colors.textSecondary,
        ...Typography.default(),
    },
}));
