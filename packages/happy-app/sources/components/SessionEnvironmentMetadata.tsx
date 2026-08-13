import React from 'react';
import { View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import type { SessionEnvironmentDisplay } from '@/utils/sessionEnvironmentDisplay';

export function SessionEnvironmentMetadata({ environment, contentInset }: {
    environment: SessionEnvironmentDisplay;
    contentInset?: number;
}) {
    const { theme } = useUnistyles();

    return (
        <View
            style={[styles.row, contentInset !== undefined && { marginLeft: contentInset }]}
            accessible
            accessibilityLabel={[
                environment.worktreeName ? `Worktree ${environment.worktreeName}` : null,
                environment.branchName ? `Branch ${environment.branchName}` : null,
            ].filter(Boolean).join(', ')}
        >
            {environment.worktreeName ? (
                <View style={styles.item}>
                    <MaterialCommunityIcons name="tree" size={11} color={theme.colors.textSecondary} />
                    <Text style={styles.text} numberOfLines={1}>{environment.worktreeName}</Text>
                </View>
            ) : null}
            {environment.worktreeName && environment.branchName ? (
                <Text style={styles.separator}>·</Text>
            ) : null}
            {environment.branchName ? (
                <View style={styles.item}>
                    <Ionicons name="git-branch-outline" size={11} color={theme.colors.textSecondary} />
                    <Text style={styles.text} numberOfLines={1}>{environment.branchName}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    row: {
        marginLeft: 24,
        marginTop: 2,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    item: {
        minWidth: 0,
        flexShrink: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    text: {
        minWidth: 0,
        flexShrink: 1,
        fontSize: 11,
        color: theme.colors.textSecondary,
        ...Typography.default('regular'),
    },
    separator: {
        flexShrink: 0,
        fontSize: 11,
        color: theme.colors.textSecondary,
        ...Typography.default('regular'),
    },
}));
