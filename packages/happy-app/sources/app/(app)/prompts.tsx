import * as React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useAllSessions } from '@/sync/storage';
import { sync } from '@/sync/sync';
import type { PromptHistoryItem } from '@/sync/promptHistory';
import type { Session } from '@/sync/storageTypes';
import { NativeOptionsPicker } from '@/components/NativeOptionsPicker';
import { layout } from '@/components/layout';
import { Typography } from '@/constants/Typography';
import { getCurrentLanguage, t } from '@/text';
import { useNavigateToSessionMessage } from '@/hooks/useNavigateToSession';
import {
    enrichPromptHistoryItems,
    filterPromptHistoryEntries,
    groupPromptHistoryEntries,
    PromptHistoryEntry,
    PromptHistoryGroup,
} from '@/utils/promptHistoryViewData';

const INITIAL_SESSION_COUNT = 12;
const SESSION_BATCH_SIZE = 12;
const LOAD_CONCURRENCY = 4;

type ViewMode = 'timeline' | 'all';
type HistoryRow =
    | { type: 'date'; id: string; dateKey: string }
    | { type: 'group'; id: string; group: PromptHistoryGroup }
    | { type: 'prompt'; id: string; prompt: PromptHistoryEntry };

const stylesheet = StyleSheet.create((theme) => ({
    page: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    content: {
        width: '100%',
        maxWidth: layout.maxWidth,
        alignSelf: 'center',
        paddingHorizontal: Platform.select({ web: 28, default: 16 }),
        paddingBottom: 48,
    },
    header: {
        paddingTop: Platform.select({ web: 34, default: 18 }),
        paddingBottom: 20,
        gap: 16,
    },
    title: {
        color: theme.colors.text,
        fontSize: Platform.select({ web: 32, default: 28 }),
        lineHeight: Platform.select({ web: 40, default: 34 }),
        ...Typography.default('semiBold'),
    },
    toolbar: {
        flexDirection: Platform.select({ web: 'row', default: 'column' }),
        gap: 12,
        alignItems: Platform.select({ web: 'center', default: 'stretch' }),
    },
    search: {
        minHeight: 44,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        borderRadius: 11,
        backgroundColor: theme.colors.surfaceHigh,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.input.text,
        fontSize: 15,
        paddingVertical: 10,
        ...Typography.default(),
    },
    controls: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    segmented: {
        minHeight: 42,
        flexDirection: 'row',
        padding: 3,
        borderRadius: 10,
        backgroundColor: theme.colors.surfaceHigh,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
    },
    segment: {
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderRadius: 7,
    },
    segmentActive: {
        backgroundColor: '#7C6CF2',
    },
    segmentText: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        ...Typography.default('semiBold'),
    },
    segmentTextActive: {
        color: '#FFFFFF',
    },
    filterWrap: {
        minWidth: 136,
    },
    filter: {
        minHeight: 42,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surfaceHigh,
    },
    filterText: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        ...Typography.default(),
    },
    progressRow: {
        minHeight: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        ...Typography.default(),
    },
    dateHeader: {
        paddingTop: 20,
        paddingBottom: 10,
    },
    dateHeaderText: {
        color: theme.colors.text,
        fontSize: 16,
        ...Typography.default('semiBold'),
    },
    timelineRow: {
        flexDirection: 'row',
    },
    timelineRail: {
        width: 82,
        alignItems: 'center',
    },
    timelineTime: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginTop: 18,
        ...Typography.default(),
    },
    timelineDot: {
        position: 'absolute',
        right: 2,
        top: 23,
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#8B7CFF',
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    timelineLine: {
        position: 'absolute',
        right: 6,
        top: 31,
        bottom: -12,
        width: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.divider,
    },
    card: {
        flex: 1,
        marginLeft: 12,
        marginBottom: 12,
        padding: 18,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surfaceHigh,
    },
    cardPressed: {
        backgroundColor: theme.colors.surfacePressed,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    cardMain: {
        flex: 1,
        minWidth: 0,
    },
    promptText: {
        color: theme.colors.text,
        fontSize: 16,
        lineHeight: 24,
        ...Typography.default('semiBold'),
    },
    metadata: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 7,
    },
    metadataText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        ...Typography.default(),
    },
    agentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: '#342D63',
    },
    agentText: {
        color: '#DED8FF',
        fontSize: 11,
        ...Typography.default('semiBold'),
    },
    status: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingTop: 2,
    },
    statusText: {
        fontSize: 12,
        ...Typography.default('semiBold'),
    },
    followUpToggle: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.divider,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    followUpToggleText: {
        color: '#A99EFF',
        fontSize: 12,
        ...Typography.default('semiBold'),
    },
    followUps: {
        marginTop: 10,
        gap: 8,
    },
    followUp: {
        flexDirection: 'row',
        gap: 12,
        padding: 12,
        borderRadius: 9,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surface,
    },
    followUpTime: {
        width: 42,
        color: theme.colors.textSecondary,
        fontSize: 12,
        ...Typography.default(),
    },
    followUpText: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 13,
        lineHeight: 19,
        ...Typography.default(),
    },
    promptRowCard: {
        marginBottom: 10,
        padding: 16,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surfaceHigh,
    },
    promptRowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
    },
    promptRowTime: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        ...Typography.default(),
    },
    empty: {
        minHeight: 320,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 32,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        ...Typography.default(),
    },
    footer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    loadMore: {
        minHeight: 42,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surfaceHigh,
    },
    loadMoreText: {
        color: theme.colors.text,
        fontSize: 13,
        ...Typography.default('semiBold'),
    },
}));

function formatDate(dateKey: string): string {
    const date = new Date(dateKey);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86_400_000);
    if (date.getTime() === today.getTime()) return t('promptHistory.today');
    if (date.getTime() === yesterday.getTime()) return t('promptHistory.yesterday');
    return new Intl.DateTimeFormat(getCurrentLanguage(), { month: 'long', day: 'numeric', weekday: 'short' }).format(date);
}

function formatTime(timestamp: number): string {
    return new Intl.DateTimeFormat(getCurrentLanguage(), { hour: '2-digit', minute: '2-digit' }).format(timestamp);
}

function rowsForTimeline(groups: readonly PromptHistoryGroup[]): HistoryRow[] {
    const rows: HistoryRow[] = [];
    let previousDate: string | null = null;
    for (const group of groups) {
        if (group.dateKey !== previousDate) {
            rows.push({ type: 'date', id: `date:${group.dateKey}`, dateKey: group.dateKey });
            previousDate = group.dateKey;
        }
        rows.push({ type: 'group', id: `group:${group.id}`, group });
    }
    return rows;
}

function rowsForPrompts(entries: readonly PromptHistoryEntry[]): HistoryRow[] {
    const rows: HistoryRow[] = [];
    let previousDate: string | null = null;
    for (const prompt of entries) {
        const dateKey = new Date(prompt.createdAt).toDateString();
        if (dateKey !== previousDate) {
            rows.push({ type: 'date', id: `date:${dateKey}`, dateKey });
            previousDate = dateKey;
        }
        rows.push({ type: 'prompt', id: `prompt:${prompt.sessionId}:${prompt.id}`, prompt });
    }
    return rows;
}

export default function PromptHistoryScreen() {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const navigateToSessionMessage = useNavigateToSessionMessage();
    const allSessions = useAllSessions();
    const [items, setItems] = React.useState<PromptHistoryItem[]>([]);
    const [sessionLimit, setSessionLimit] = React.useState(INITIAL_SESSION_COUNT);
    const [pendingCount, setPendingCount] = React.useState(0);
    const [errorCount, setErrorCount] = React.useState(0);
    const [query, setQuery] = React.useState('');
    const [mode, setMode] = React.useState<ViewMode>('timeline');
    const [project, setProject] = React.useState<string | null>(null);
    const [agent, setAgent] = React.useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(() => new Set());
    const loadedSessionIds = React.useRef(new Set<string>());
    const loadGeneration = React.useRef(0);

    const sortedSessions = React.useMemo(
        () => allSessions.slice().sort((left, right) =>
            (right.lastMessageSentAt ?? right.updatedAt) - (left.lastMessageSentAt ?? left.updatedAt)),
        [allSessions],
    );
    const sessionsById = React.useMemo(
        () => Object.fromEntries(allSessions.map((session) => [session.id, session])) as Record<string, Session>,
        [allSessions],
    );

    React.useEffect(() => {
        const sessionIds = sortedSessions
            .slice(0, sessionLimit)
            .map((session) => session.id)
            .filter((sessionId) => !loadedSessionIds.current.has(sessionId));
        if (sessionIds.length === 0) return;

        const generation = loadGeneration.current;
        sessionIds.forEach((sessionId) => loadedSessionIds.current.add(sessionId));
        setPendingCount((count) => count + sessionIds.length);

        let cursor = 0;
        const worker = async () => {
            while (cursor < sessionIds.length) {
                const sessionId = sessionIds[cursor++];
                try {
                    const prompts = await sync.loadRecentUserPrompts(sessionId);
                    if (loadGeneration.current !== generation) return;
                    setItems((current) => {
                        const next = new Map(current.map((item) => [`${item.sessionId}:${item.id}`, item]));
                        prompts.forEach((item) => next.set(`${item.sessionId}:${item.id}`, item));
                        return Array.from(next.values()).sort((left, right) => right.createdAt - left.createdAt);
                    });
                } catch {
                    if (loadGeneration.current === generation) setErrorCount((count) => count + 1);
                } finally {
                    if (loadGeneration.current === generation) setPendingCount((count) => Math.max(0, count - 1));
                }
            }
        };
        void Promise.all(Array.from({ length: Math.min(LOAD_CONCURRENCY, sessionIds.length) }, worker));
    }, [sessionLimit, sortedSessions]);

    const entries = React.useMemo(
        () => enrichPromptHistoryItems(items, sessionsById),
        [items, sessionsById],
    );
    const projects = React.useMemo(
        () => Array.from(new Set(entries.map((entry) => entry.project))).sort(),
        [entries],
    );
    const agents = React.useMemo(
        () => Array.from(new Set(entries.map((entry) => entry.agent))).sort(),
        [entries],
    );
    const filtered = React.useMemo(
        () => filterPromptHistoryEntries(entries, query, project, agent),
        [agent, entries, project, query],
    );
    const groups = React.useMemo(() => groupPromptHistoryEntries(filtered), [filtered]);
    const rows = React.useMemo(
        () => mode === 'timeline' ? rowsForTimeline(groups) : rowsForPrompts(filtered),
        [filtered, groups, mode],
    );
    const hasMoreSessions = sessionLimit < sortedSessions.length;

    const toggleGroup = React.useCallback((id: string) => {
        setExpandedGroups((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const renderGroup = React.useCallback((group: PromptHistoryGroup) => {
        const primary = group.prompts[0];
        const followUps = group.prompts.slice(1);
        const expanded = expandedGroups.has(group.id);
        const inProgress = group.session.thinking;
        const statusColor = inProgress ? '#F5A623' : theme.colors.success;
        return (
            <View style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                    <Text style={styles.timelineTime}>{formatTime(primary.createdAt)}</Text>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineLine} />
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${primary.text}. ${t('promptHistory.openSession')}`}
                    onPress={() => navigateToSessionMessage(group.session.id, primary.id, primary.localId, primary.createdAt)}
                    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                    <View style={styles.cardTop}>
                        <View style={styles.cardMain}>
                            <Text style={styles.promptText} numberOfLines={4}>{primary.text}</Text>
                            <View style={styles.metadata}>
                                <Ionicons name="folder-outline" size={13} color={theme.colors.textSecondary} />
                                <Text style={styles.metadataText}>{group.project}</Text>
                                <Text style={styles.metadataText}>·</Text>
                                <Text style={styles.metadataText} numberOfLines={1}>{group.sessionName}</Text>
                                <View style={styles.agentBadge}><Text style={styles.agentText}>{group.agent}</Text></View>
                            </View>
                        </View>
                        <View style={styles.status}>
                            <Ionicons
                                name={inProgress ? 'time-outline' : 'checkmark-circle-outline'}
                                size={16}
                                color={statusColor}
                            />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {inProgress ? t('promptHistory.inProgress') : t('promptHistory.completed')}
                            </Text>
                        </View>
                    </View>
                    {followUps.length > 0 ? (
                        <>
                            <Pressable
                                accessibilityRole="button"
                                onPress={(event) => {
                                    event.stopPropagation();
                                    toggleGroup(group.id);
                                }}
                                style={styles.followUpToggle}
                            >
                                <Text style={styles.followUpToggleText}>
                                    {t('promptHistory.followUps', { count: followUps.length })}
                                </Text>
                                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#A99EFF" />
                            </Pressable>
                            {expanded ? (
                                <View style={styles.followUps}>
                                    {followUps.map((prompt) => (
                                        <Pressable
                                            key={`${prompt.sessionId}:${prompt.id}`}
                                            accessibilityRole="button"
                                            accessibilityLabel={`${prompt.text}. ${t('promptHistory.openSession')}`}
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                navigateToSessionMessage(prompt.sessionId, prompt.id, prompt.localId, prompt.createdAt);
                                            }}
                                            style={({ pressed }) => [styles.followUp, pressed && styles.cardPressed]}
                                        >
                                            <Text style={styles.followUpTime}>{formatTime(prompt.createdAt)}</Text>
                                            <Text style={styles.followUpText}>{prompt.text}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </>
                    ) : null}
                </Pressable>
            </View>
        );
    }, [expandedGroups, navigateToSessionMessage, styles, theme.colors, toggleGroup]);

    const renderPrompt = React.useCallback((prompt: PromptHistoryEntry) => (
        <Pressable
            accessibilityRole="button"
            onPress={() => navigateToSessionMessage(prompt.session.id, prompt.id, prompt.localId, prompt.createdAt)}
            style={({ pressed }) => [styles.promptRowCard, pressed && styles.cardPressed]}
        >
            <View style={styles.promptRowHeader}>
                <Text style={styles.promptRowTime}>{formatTime(prompt.createdAt)}</Text>
                <Text style={styles.metadataText}>{prompt.project} · {prompt.agent}</Text>
            </View>
            <Text style={styles.promptText}>{prompt.text}</Text>
            <View style={styles.metadata}>
                <Ionicons name="chatbubble-outline" size={13} color={theme.colors.textSecondary} />
                <Text style={styles.metadataText}>{prompt.sessionName}</Text>
                <Text style={[styles.metadataText, { color: '#A99EFF' }]}>{t('promptHistory.openSession')}</Text>
            </View>
        </Pressable>
    ), [navigateToSessionMessage, styles, theme.colors]);

    const renderItem = React.useCallback(({ item }: { item: HistoryRow }) => {
        if (item.type === 'date') {
            return <View style={styles.dateHeader}><Text style={styles.dateHeaderText}>{formatDate(item.dateKey)}</Text></View>;
        }
        if (item.type === 'group') return renderGroup(item.group);
        return renderPrompt(item.prompt);
    }, [renderGroup, renderPrompt, styles]);

    const header = (
        <View style={styles.header}>
            <Text style={styles.title}>{t('promptHistory.title')}</Text>
            <View style={styles.toolbar}>
                <View style={styles.search}>
                    <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder={t('promptHistory.searchPlaceholder')}
                        placeholderTextColor={theme.colors.input.placeholder}
                        style={styles.searchInput}
                    />
                    {query ? (
                        <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
                            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                        </Pressable>
                    ) : null}
                </View>
                <View style={styles.controls}>
                    <View style={styles.segmented}>
                        {(['timeline', 'all'] as const).map((value) => (
                            <Pressable
                                key={value}
                                onPress={() => setMode(value)}
                                style={[styles.segment, mode === value && styles.segmentActive]}
                            >
                                <Text style={[styles.segmentText, mode === value && styles.segmentTextActive]}>
                                    {value === 'timeline' ? t('promptHistory.timeline') : t('promptHistory.allInputs')}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <View style={styles.filterWrap}>
                        <NativeOptionsPicker
                            title={t('promptHistory.allProjects')}
                            triggerLabel={project ?? t('promptHistory.allProjects')}
                            options={[
                                { key: 'all', label: t('promptHistory.allProjects') },
                                ...projects.map((value) => ({ key: value, label: value })),
                            ]}
                            selectedKey={project ?? 'all'}
                            onSelect={(value) => setProject(value === 'all' ? null : value)}
                        >
                            <View style={styles.filter}>
                                <Text style={styles.filterText} numberOfLines={1}>{project ?? t('promptHistory.allProjects')}</Text>
                                <Ionicons name="chevron-down" size={15} color={theme.colors.textSecondary} />
                            </View>
                        </NativeOptionsPicker>
                    </View>
                    <View style={styles.filterWrap}>
                        <NativeOptionsPicker
                            title={t('promptHistory.allAgents')}
                            triggerLabel={agent ?? t('promptHistory.allAgents')}
                            options={[
                                { key: 'all', label: t('promptHistory.allAgents') },
                                ...agents.map((value) => ({ key: value, label: value })),
                            ]}
                            selectedKey={agent ?? 'all'}
                            onSelect={(value) => setAgent(value === 'all' ? null : value)}
                        >
                            <View style={styles.filter}>
                                <Text style={styles.filterText} numberOfLines={1}>{agent ?? t('promptHistory.allAgents')}</Text>
                                <Ionicons name="chevron-down" size={15} color={theme.colors.textSecondary} />
                            </View>
                        </NativeOptionsPicker>
                    </View>
                </View>
            </View>
            <View style={styles.progressRow}>
                {pendingCount > 0 ? <ActivityIndicator size="small" color="#8B7CFF" /> : null}
                <Text style={styles.progressText}>
                    {pendingCount > 0
                        ? t('promptHistory.loading')
                        : t('promptHistory.scannedProgress', {
                            count: Math.min(sessionLimit, sortedSessions.length),
                            total: sortedSessions.length,
                        })}
                    {errorCount > 0 ? ` · ${t('promptHistory.loadError', { count: errorCount })}` : ''}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.page}>
            <FlatList
                data={rows}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.content}
                ListHeaderComponent={header}
                ListEmptyComponent={pendingCount === 0 ? (
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={34} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>{t('promptHistory.empty')}</Text>
                    </View>
                ) : null}
                ListFooterComponent={hasMoreSessions ? (
                    <View style={styles.footer}>
                        <Pressable
                            disabled={pendingCount > 0}
                            onPress={() => setSessionLimit((count) => count + SESSION_BATCH_SIZE)}
                            style={({ pressed }) => [styles.loadMore, pressed && styles.cardPressed]}
                        >
                            {pendingCount > 0 ? <ActivityIndicator size="small" color={theme.colors.text} /> : null}
                            <Text style={styles.loadMoreText}>{t('promptHistory.loadMore')}</Text>
                        </Pressable>
                    </View>
                ) : <View style={styles.footer} />}
            />
        </View>
    );
}
