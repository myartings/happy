import * as React from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { t } from '@/text';
import type { GithubRepositoryRef } from './githubRepository';
import { getGithubIssuesErrorMessage, githubIssuesApi, type GithubIssue } from './githubIssuesApi';

export interface GithubIssuesSessionPanelProps {
    visible: boolean;
    repository: GithubRepositoryRef | null;
    onClose(): void;
    onOpenIssue(issueNumber: number): void;
    onNewIssue(): void;
    onViewAll(): void;
}

export function GithubIssuesSessionPanel(props: GithubIssuesSessionPanelProps) {
    const { theme } = useUnistyles();
    const [issues, setIssues] = React.useState<readonly GithubIssue[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const repositoryName = props.repository
        ? `${props.repository.owner}/${props.repository.repo}`
        : t('githubIssues.repository');

    React.useEffect(() => {
        if (!props.visible || !props.repository) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        void githubIssuesApi.listIssues({
            owner: props.repository.owner,
            repo: props.repository.repo,
            state: 'open',
        }).then((result) => {
            if (!cancelled) setIssues(result.items.slice(0, 5));
        }).catch((cause) => {
            if (!cancelled) setError(getGithubIssuesErrorMessage(cause) || t('githubIssues.unableToLoadIssues'));
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, [props.repository, props.visible]);

    return (
        <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
            <Pressable style={styles.backdrop} onPress={props.onClose}>
                <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.title} numberOfLines={1}>{repositoryName}</Text>
                            <Text style={styles.subtitle}>{t('githubIssues.sessionRepository')}</Text>
                        </View>
                        <Pressable accessibilityRole="button" accessibilityLabel="Close Session Issues" hitSlop={10} onPress={props.onClose}>
                            <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
                        </Pressable>
                    </View>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('githubIssues.openIssues')}</Text>
                    </View>
                    {loading ? <ActivityIndicator style={styles.loading} /> : null}
                    {!loading && error ? <Text style={styles.message}>{error}</Text> : null}
                    {!loading && !error && issues.length === 0 ? <Text style={styles.message}>{t('githubIssues.noOpenIssues')}</Text> : null}
                    {!loading && !error && issues.length > 0 ? (
                        <ScrollView style={styles.issueList} contentContainerStyle={styles.issueListContent}>
                            {issues.map((issue) => (
                                <Pressable
                                    key={issue.number}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Issue #${issue.number}: ${issue.title}`}
                                    onPress={() => props.onOpenIssue(issue.number)}
                                    style={styles.issueRow}
                                >
                                    <Text style={styles.issueNumber}>#{issue.number}</Text>
                                    <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
                                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                                </Pressable>
                            ))}
                        </ScrollView>
                    ) : null}
                    <View style={styles.actions}>
                        <Pressable accessibilityRole="button" onPress={props.onNewIssue} style={styles.primaryAction}>
                            <Ionicons name="add" size={18} color={theme.colors.button.primary.tint} />
                            <Text style={styles.primaryActionText}>{t('githubIssues.newIssue')}</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" onPress={props.onViewAll} style={styles.secondaryAction}>
                            <Text style={styles.secondaryActionText}>{t('githubIssues.viewAllIssues')}</Text>
                            <Ionicons name="chevron-forward" size={17} color={theme.colors.textSecondary} />
                        </Pressable>
                    </View>
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
        maxWidth: 460,
        overflow: 'hidden',
        borderRadius: Platform.select({ web: 16, default: 22 }),
        backgroundColor: theme.colors.surface,
    },
    header: {
        minHeight: 68,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.divider,
    },
    headerText: { flex: 1, minWidth: 0 },
    title: { color: theme.colors.text, fontSize: 17, ...Typography.default('semiBold') },
    subtitle: { marginTop: 2, color: theme.colors.textSecondary, fontSize: 12, ...Typography.default() },
    actions: { padding: 14, gap: 8 },
    sectionHeader: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
    sectionTitle: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    loading: { marginVertical: 24 },
    message: { paddingHorizontal: 18, paddingVertical: 22, color: theme.colors.textSecondary, ...Typography.default() },
    issueList: { maxHeight: 280 },
    issueListContent: { paddingHorizontal: 12, gap: 4 },
    issueRow: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        borderRadius: 11,
        backgroundColor: theme.colors.surfaceHigh,
    },
    issueNumber: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.mono() },
    issueTitle: { flex: 1, color: theme.colors.text, fontSize: 14, ...Typography.default('semiBold') },
    primaryAction: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 11,
        backgroundColor: theme.colors.button.primary.background,
    },
    primaryActionText: { color: theme.colors.button.primary.tint, ...Typography.default('semiBold') },
    secondaryAction: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 11,
        backgroundColor: theme.colors.surfaceHigh,
    },
    secondaryActionText: { flex: 1, color: theme.colors.text, ...Typography.default('semiBold') },
}));
