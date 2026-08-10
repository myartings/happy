import * as React from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { t } from '@/text';
import type { GithubRepositoryRef } from './githubRepository';
import {
    getGithubIssueRelativeTime,
    getGithubIssuesErrorMessage,
    githubIssuesApi,
    type GithubIssue,
    type GithubIssueState,
} from './githubIssuesApi';

export type GithubIssuesPopoverAnchor = { x: number; y: number; width: number; height: number };

export interface GithubIssuesSessionPanelProps {
    visible: boolean;
    repository: GithubRepositoryRef | null;
    anchor?: GithubIssuesPopoverAnchor | null;
    onClose(): void;
    onOpenIssue(issueNumber: number): void;
    onNewIssue(): void;
    onViewAll(): void;
}

function relativeTime(updatedAt: string): string {
    const value = getGithubIssueRelativeTime(updatedAt);
    if (!value || value.unit === 'now') return t('githubIssues.updatedNow');
    if (value.unit === 'minute') return t('githubIssues.updatedMinutes', { count: value.value });
    if (value.unit === 'hour') return t('githubIssues.updatedHours', { count: value.value });
    return t('githubIssues.updatedDays', { count: value.value });
}

/**
 * Session-owned quick browser. It deliberately owns only browse/select/create
 * entry behavior; durable Issue work belongs to the right workspace panel.
 */
export function GithubIssuesQuickPopover(props: GithubIssuesSessionPanelProps) {
    const { theme } = useUnistyles();
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const [state, setState] = React.useState<GithubIssueState>('open');
    const [items, setItems] = React.useState<Record<GithubIssueState, GithubIssue[]>>({ open: [], closed: [] });
    const [nextPages, setNextPages] = React.useState<Record<GithubIssueState, number | null>>({ open: null, closed: null });
    const [loading, setLoading] = React.useState(false);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const load = React.useCallback(async (requestedState: GithubIssueState, page = 1) => {
        if (!props.repository) return;
        page === 1 ? setLoading(true) : setLoadingMore(true);
        setError(null);
        try {
            const result = await githubIssuesApi.listIssues({
                owner: props.repository.owner,
                repo: props.repository.repo,
                state: requestedState,
                page,
            });
            setItems((current) => ({
                ...current,
                [requestedState]: page === 1 ? result.items : [...current[requestedState], ...result.items],
            }));
            setNextPages((current) => ({ ...current, [requestedState]: result.nextPage }));
        } catch (cause) {
            setError(getGithubIssuesErrorMessage(cause) || t('githubIssues.unableToLoadIssues'));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [props.repository]);

    React.useEffect(() => {
        if (!props.visible || !props.repository) return;
        void load(state);
    }, [load, props.repository, props.visible, state]);

    const popoverWidth = Math.min(380, windowWidth - 24);
    const preferredLeft = props.anchor
        ? props.anchor.x + props.anchor.width - popoverWidth
        : windowWidth - popoverWidth - 12;
    const left = Math.max(12, Math.min(windowWidth - popoverWidth - 12, preferredLeft));
    const top = Math.max(12, Math.min(windowHeight - 260, (props.anchor?.y ?? 44) + (props.anchor?.height ?? 0) + 8));
    const currentItems = items[state];
    const compact = Platform.OS !== 'web' && windowWidth < 700;
    const positionStyle = compact
        ? { left: 0, bottom: 0, width: windowWidth, maxHeight: Math.floor(windowHeight * 0.78) }
        : { left, top, width: popoverWidth, maxHeight: Math.max(260, windowHeight - top - 16) };

    return (
        <Modal visible={props.visible} transparent animationType="none" onRequestClose={props.onClose}>
            <View style={styles.modalRoot}>
                <Pressable accessibilityLabel={t('githubIssues.closeQuickPopover')} onPress={props.onClose} style={StyleSheet.absoluteFill} />
                <View
                    accessibilityLabel={t('githubIssues.quickPopover')}
                    style={[styles.popover, compact && styles.compactSheet, positionStyle]}
                >
                    <View style={styles.header}>
                        <View style={styles.headerTitle}>
                            <Ionicons name="logo-github" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.title} numberOfLines={1}>
                                {props.repository ? props.repository.repo : t('githubIssues.repository')}
                            </Text>
                        </View>
                        <Pressable accessibilityRole="button" accessibilityLabel={t('githubIssues.newIssue')} onPress={props.onNewIssue} style={styles.iconButton}>
                            <Ionicons name="add" size={19} color={theme.colors.textSecondary} />
                        </Pressable>
                    </View>
                    <View style={styles.filters}>
                        {(['open', 'closed'] as const).map((value) => (
                            <Pressable
                                key={value}
                                accessibilityRole="button"
                                accessibilityState={{ selected: state === value }}
                                onPress={() => setState(value)}
                                style={[styles.filter, state === value && styles.filterSelected]}
                            >
                                <Text style={[styles.filterText, state === value && styles.filterTextSelected]}>
                                    {t(value === 'open' ? 'githubIssues.open' : 'githubIssues.closed')}
                                </Text>
                            </Pressable>
                        ))}
                        <View style={styles.filterSpacer} />
                        <Pressable accessibilityRole="button" accessibilityLabel={t('githubIssues.refresh')} onPress={() => void load(state)} style={styles.iconButton}>
                            <Ionicons name="refresh" size={16} color={theme.colors.textSecondary} />
                        </Pressable>
                    </View>
                    {loading && currentItems.length === 0 ? <ActivityIndicator style={styles.loading} /> : null}
                    {!loading && error ? (
                        <Pressable accessibilityRole="button" onPress={() => void load(state)} style={styles.messageRow}>
                            <Text style={styles.errorText}>{error} · {t('githubIssues.retry')}</Text>
                        </Pressable>
                    ) : null}
                    {!loading && !error && currentItems.length === 0 ? (
                        <View style={styles.messageRow}>
                            <Text style={styles.message}>{t(state === 'open' ? 'githubIssues.noOpenIssues' : 'githubIssues.noClosedIssues')}</Text>
                        </View>
                    ) : null}
                    {currentItems.length > 0 ? (
                        <ScrollView style={styles.issueList} contentContainerStyle={styles.issueListContent} keyboardShouldPersistTaps="handled">
                            {currentItems.map((issue) => (
                                <Pressable
                                    key={issue.number}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Issue #${issue.number}: ${issue.title}`}
                                    onPress={() => props.onOpenIssue(issue.number)}
                                    style={({ pressed, hovered }: any) => [styles.issueRow, (pressed || hovered) && styles.issueRowHovered]}
                                >
                                    <View style={styles.issueHeading}>
                                        <Text style={styles.issueNumber}>#{issue.number}</Text>
                                        <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
                                    </View>
                                    <View style={styles.metadata}>
                                        {issue.labels.slice(0, 2).map((label) => <Text key={label.name} style={styles.label}>{label.name}</Text>)}
                                        <Text style={styles.metaText}>{relativeTime(issue.updatedAt)}</Text>
                                        {issue.comments > 0 ? <Text style={styles.metaText}>◯ {issue.comments}</Text> : null}
                                    </View>
                                </Pressable>
                            ))}
                            {nextPages[state] ? (
                                <Pressable accessibilityRole="button" disabled={loadingMore} onPress={() => void load(state, nextPages[state]!)} style={styles.loadMore}>
                                    {loadingMore ? <ActivityIndicator size="small" /> : <Text style={styles.loadMoreText}>{t('githubIssues.loadMore')}</Text>}
                                </Pressable>
                            ) : null}
                        </ScrollView>
                    ) : null}
                    <Pressable accessibilityRole="button" onPress={props.onViewAll} style={styles.footer}>
                        <Text style={styles.footerText}>{t('githubIssues.viewAllIssues')}</Text>
                        <Ionicons name="chevron-forward" size={15} color={theme.colors.textSecondary} />
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

// Compatibility export while callers migrate from the temporary centered panel.
export const GithubIssuesSessionPanel = GithubIssuesQuickPopover;

const styles = StyleSheet.create((theme) => ({
    modalRoot: { flex: 1 },
    popover: {
        position: 'absolute',
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        borderRadius: 18,
        backgroundColor: theme.colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 28,
        elevation: 12,
    },
    compactSheet: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    headerTitle: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { flex: 1, color: theme.colors.text, fontSize: 14, ...Typography.default('semiBold') },
    iconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
    filters: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingBottom: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider },
    filter: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
    filterSelected: { backgroundColor: theme.colors.surfaceSelected },
    filterText: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    filterTextSelected: { color: theme.colors.text },
    filterSpacer: { flex: 1 },
    loading: { marginVertical: 28 },
    messageRow: { minHeight: 96, alignItems: 'center', justifyContent: 'center', padding: 16 },
    message: { color: theme.colors.textSecondary, textAlign: 'center', ...Typography.default() },
    errorText: { color: theme.colors.textDestructive, textAlign: 'center', ...Typography.default() },
    issueList: { flexShrink: 1 },
    issueListContent: { padding: 7 },
    issueRow: { minHeight: 72, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 11 },
    issueRowHovered: { backgroundColor: theme.colors.surfaceHigh },
    issueHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    issueNumber: { paddingTop: 1, color: theme.colors.textSecondary, fontSize: 11, ...Typography.mono() },
    issueTitle: { flex: 1, color: theme.colors.text, fontSize: 13, lineHeight: 18, ...Typography.default('semiBold') },
    metadata: { marginTop: 7, paddingLeft: 40, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    label: { color: theme.colors.textSecondary, fontSize: 10, ...Typography.default('semiBold') },
    metaText: { color: theme.colors.textSecondary, fontSize: 10, ...Typography.default() },
    loadMore: { minHeight: 38, alignItems: 'center', justifyContent: 'center' },
    loadMoreText: { color: theme.colors.textLink, fontSize: 12, ...Typography.default('semiBold') },
    footer: { minHeight: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.divider },
    footerText: { flex: 1, color: theme.colors.text, fontSize: 12, ...Typography.default('semiBold') },
}));
