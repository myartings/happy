import * as React from 'react';
import { Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import type { GithubRepository } from './githubIssuesClient';
import { isSameGithubRepository, type GithubRepositoryRef } from './githubRepository';

export interface GithubRepositoryPickerProps {
    visible: boolean;
    repositories: readonly GithubRepository[];
    selectedRepository: GithubRepositoryRef | null;
    reason?: 'lookup-failed' | 'ambiguous' | 'inaccessible' | 'no-remote';
    onSelect(repository: GithubRepository): void;
    onClose(): void;
    onManageAccess?: () => void;
}

export function filterGithubRepositories(
    repositories: readonly GithubRepository[],
    query: string,
): readonly GithubRepository[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return repositories;
    return repositories.filter((repository) => repository.fullName.toLowerCase().includes(normalizedQuery));
}

export function GithubRepositoryPicker(props: GithubRepositoryPickerProps) {
    const { theme } = useUnistyles();
    const [query, setQuery] = React.useState('');
    const repositories = React.useMemo(
        () => filterGithubRepositories(props.repositories, query),
        [props.repositories, query],
    );

    React.useEffect(() => {
        if (!props.visible) setQuery('');
    }, [props.visible]);

    return (
        <Modal
            visible={props.visible}
            transparent
            animationType="fade"
            onRequestClose={props.onClose}
        >
            <Pressable style={styles.backdrop} onPress={props.onClose}>
                <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select repository</Text>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Close repository picker"
                            hitSlop={10}
                            onPress={props.onClose}
                        >
                            <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
                        </Pressable>
                    </View>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={17} color={theme.colors.textSecondary} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search repositories…"
                            placeholderTextColor={theme.colors.textSecondary}
                            accessibilityLabel="Search repositories"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.searchInput}
                        />
                    </View>
                    {props.reason && (
                        <Text style={styles.reason}>
                            {{
                                'lookup-failed': 'Could not detect this Session repository. Choose one to continue.',
                                ambiguous: 'Multiple GitHub remotes were found. Choose the repository to use.',
                                inaccessible: 'The detected repository is not available to the GitHub App. Choose another or manage access.',
                                'no-remote': 'Choose a repository to continue.',
                            }[props.reason]}
                        </Text>
                    )}
                    <ScrollView style={styles.list} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
                        {repositories.map((repository) => {
                            const selected = isSameGithubRepository(
                                { owner: repository.owner, repo: repository.name },
                                props.selectedRepository,
                            );
                            return (
                                <Pressable
                                    key={repository.id}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Select ${repository.fullName}`}
                                    accessibilityState={{ selected }}
                                    onPress={() => props.onSelect(repository)}
                                    style={[styles.row, selected && styles.rowSelected]}
                                >
                                    <View style={styles.check}>
                                        {selected && <Ionicons name="checkmark" size={18} color={theme.colors.textLink} />}
                                    </View>
                                    <Text style={styles.repositoryName} numberOfLines={1}>{repository.fullName}</Text>
                                    {repository.private && <Ionicons name="lock-closed-outline" size={15} color={theme.colors.textSecondary} />}
                                </Pressable>
                            );
                        })}
                        {repositories.length === 0 && (
                            <Text style={styles.empty}>No matching repositories</Text>
                        )}
                    </ScrollView>
                    {props.onManageAccess && (
                        <Pressable
                            accessibilityRole="link"
                            accessibilityLabel="Manage repository access on GitHub"
                            onPress={props.onManageAccess}
                            style={styles.manageRow}
                        >
                            <Text style={styles.manageText}>Manage access on GitHub</Text>
                            <Ionicons name="open-outline" size={17} color={theme.colors.textSecondary} />
                        </Pressable>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create((theme) => ({
    backdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.42)',
    },
    sheet: {
        width: '100%',
        maxWidth: 520,
        maxHeight: '78%',
        overflow: 'hidden',
        borderRadius: Platform.select({ web: 16, default: 22 }),
        backgroundColor: theme.colors.surface,
    },
    header: {
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.divider,
    },
    title: { flex: 1, color: theme.colors.text, fontSize: 18, ...Typography.default('semiBold') },
    searchContainer: {
        minHeight: 42,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        margin: 12,
        paddingHorizontal: 12,
        borderRadius: 11,
        backgroundColor: theme.colors.input.background,
    },
    searchInput: { flex: 1, color: theme.colors.input.text, ...Typography.default() },
    reason: { paddingHorizontal: 16, paddingBottom: 10, color: theme.colors.textSecondary, fontSize: 12, ...Typography.default() },
    list: { flexGrow: 0 },
    listContent: { paddingHorizontal: 12, paddingBottom: 10, gap: 4 },
    row: {
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 11,
        backgroundColor: theme.colors.surfaceHigh,
    },
    rowSelected: { backgroundColor: theme.colors.surfaceSelected },
    check: { width: 26, alignItems: 'flex-start' },
    repositoryName: { flex: 1, color: theme.colors.text, fontSize: 14, ...Typography.default('semiBold') },
    empty: { padding: 24, color: theme.colors.textSecondary, textAlign: 'center', ...Typography.default() },
    manageRow: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.divider,
    },
    manageText: { flex: 1, color: theme.colors.textLink, ...Typography.default('semiBold') },
}));
