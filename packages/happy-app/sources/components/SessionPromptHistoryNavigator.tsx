import * as React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    Pressable,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Typography } from '@/constants/Typography';
import type { PromptHistoryItem } from '@/sync/promptHistory';
import { sync } from '@/sync/sync';
import type { Message } from '@/sync/typesMessage';
import { t } from '@/text';
import {
    PROMPT_RAIL_ARROW_HIT_SLOP,
    getPromptIndexFromTrackPosition,
    getPromptRailMetrics,
    getPromptRailTickWidth,
    getSampledPromptIndices,
    mergeSessionPromptHistory,
} from '@/utils/sessionPromptHistory';

type PromptHistoryState = {
    fetched: PromptHistoryItem[];
    hasMore: boolean;
    nextBeforeSeq: number | null;
    started: boolean;
};

export const SessionPromptHistoryNavigator = React.memo(function SessionPromptHistoryNavigator(props: {
    sessionId: string;
    loadedMessages: readonly Message[];
    hasMoreOlder: boolean;
    activePromptId: string | null;
    bottomContentInset?: number;
    onSelectPrompt: (messageId: string, localId?: string | null, createdAt?: number) => void;
}) {
    const { theme } = useUnistyles();
    const safeArea = useSafeAreaInsets();
    const { width: viewportWidth } = useWindowDimensions();
    const [history, setHistory] = React.useState<PromptHistoryState>({
        fetched: [],
        hasMore: false,
        nextBeforeSeq: null,
        started: false,
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadFailed, setLoadFailed] = React.useState(false);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const requestGenerationRef = React.useRef(0);

    React.useEffect(() => {
        const generation = requestGenerationRef.current + 1;
        requestGenerationRef.current = generation;
        setHistory({ fetched: [], hasMore: false, nextBeforeSeq: null, started: false });
        setLoadFailed(false);
        setIsLoading(false);

        return () => {
            if (requestGenerationRef.current === generation) {
                requestGenerationRef.current += 1;
            }
        };
    }, [props.sessionId]);

    const prompts = React.useMemo(() => mergeSessionPromptHistory(
        props.sessionId,
        history.fetched,
        props.loadedMessages,
    ), [history.fetched, props.loadedMessages, props.sessionId]);
    const hasMore = history.started ? history.hasMore : props.hasMoreOlder;

    const loadEarlier = React.useCallback(async () => {
        if (isLoading || !hasMore) return;
        const generation = requestGenerationRef.current;
        setIsLoading(true);
        setLoadFailed(false);
        try {
            let pagination: { cursor: number | null; hasMore: boolean } = {
                cursor: history.started ? history.nextBeforeSeq : null,
                hasMore,
            };
            let canUseDefaultCursor = !history.started;
            const additional: PromptHistoryItem[] = [];

            // Tool-heavy turns can fill a raw-message page without containing
            // a user message. Walk a few pages so one tap usually reveals data.
            for (let pageCount = 0; pageCount < 4; pageCount += 1) {
                if (!pagination.hasMore || (pagination.cursor === null && !canUseDefaultCursor)) break;
                const page = await sync.loadUserPromptsPage(
                    props.sessionId,
                    pagination.cursor ?? undefined,
                );
                canUseDefaultCursor = false;
                additional.push(...page.items);
                pagination = { hasMore: page.hasMore, cursor: page.nextBeforeSeq };
                if (page.items.length > 0) break;
            }
            if (requestGenerationRef.current !== generation) return;
            setHistory((current) => ({
                fetched: [...current.fetched, ...additional],
                hasMore: pagination.hasMore,
                nextBeforeSeq: pagination.cursor,
                started: true,
            }));
        } catch {
            if (requestGenerationRef.current === generation) setLoadFailed(true);
        } finally {
            if (requestGenerationRef.current === generation) setIsLoading(false);
        }
    }, [hasMore, history.nextBeforeSeq, history.started, isLoading, props.sessionId]);

    const retryLoad = React.useCallback(() => {
        void loadEarlier();
    }, [loadEarlier]);

    const selectPrompt = React.useCallback((prompt: PromptHistoryItem) => {
        setMobileOpen(false);
        props.onSelectPrompt(
            prompt.id,
            prompt.localId,
            prompt.createdAt,
        );
    }, [props.onSelectPrompt]);

    if (prompts.length === 0 && !hasMore && !isLoading && !loadFailed) return null;

    if (Platform.OS === 'web' && viewportWidth >= 700) {
        return (
            <DesktopPromptRail
                prompts={prompts}
                activePromptId={props.activePromptId}
                hasMore={hasMore}
                isLoading={isLoading}
                loadFailed={loadFailed}
                onLoadEarlier={loadEarlier}
                onRetry={retryLoad}
                onSelect={selectPrompt}
            />
        );
    }

    const newestFirst = prompts.slice().reverse();
    return (
        <>
            <View style={[
                styles.mobileLauncherContainer,
                { bottom: 16 + (props.bottomContentInset ?? 0) },
            ]}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('promptHistory.title')}
                    onPress={() => setMobileOpen(true)}
                    style={({ pressed }) => [
                        styles.mobileLauncher,
                        pressed && styles.mobileLauncherPressed,
                    ]}
                >
                    <Ionicons name="list-outline" size={17} color={theme.colors.text} />
                    {prompts.length > 0 && (
                        <Text style={styles.mobileLauncherCount}>{prompts.length}</Text>
                    )}
                </Pressable>
            </View>

            <Modal
                visible={mobileOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setMobileOpen(false)}
                statusBarTranslucent
            >
                <View style={styles.modalRoot}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('common.cancel')}
                        style={StyleSheet.absoluteFill}
                        onPress={() => setMobileOpen(false)}
                    />
                    <View style={[styles.mobileSheet, { paddingBottom: Math.max(18, safeArea.bottom) }]}>
                        <View style={styles.mobileSheetHandle} />
                        <View style={styles.mobileSheetHeader}>
                            <Text style={styles.mobileSheetTitle}>{t('promptHistory.title')}</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t('common.cancel')}
                                onPress={() => setMobileOpen(false)}
                                hitSlop={10}
                            >
                                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
                            </Pressable>
                        </View>
                        <FlatList
                            data={newestFirst}
                            keyExtractor={(item) => item.id}
                            style={styles.mobilePromptList}
                            contentContainerStyle={styles.mobilePromptListContent}
                            renderItem={({ item, index }) => (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: item.id === props.activePromptId }}
                                    onPress={() => selectPrompt(item)}
                                    style={({ pressed }) => [
                                        styles.mobilePromptRow,
                                        item.id === props.activePromptId && styles.mobilePromptRowActive,
                                        pressed && styles.mobilePromptRowPressed,
                                    ]}
                                >
                                    <Text style={styles.mobilePromptMeta}>
                                        {prompts.length - index}/{prompts.length} · {formatPromptTime(item.createdAt)}
                                    </Text>
                                    <Text style={styles.mobilePromptText} numberOfLines={3}>{item.text}</Text>
                                </Pressable>
                            )}
                            ListFooterComponent={hasMore || isLoading || loadFailed ? (
                                <Pressable
                                    accessibilityRole="button"
                                    disabled={isLoading}
                                    onPress={loadFailed ? retryLoad : loadEarlier}
                                    style={({ pressed }) => [
                                        styles.loadEarlierButton,
                                        pressed && styles.mobilePromptRowPressed,
                                    ]}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                                    ) : (
                                        <Text style={styles.loadEarlierText}>
                                            {loadFailed ? t('common.retry') : t('promptHistory.loadMore')}
                                        </Text>
                                    )}
                                </Pressable>
                            ) : null}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
});

const DesktopPromptRail = React.memo(function DesktopPromptRail(props: {
    prompts: readonly PromptHistoryItem[];
    activePromptId: string | null;
    hasMore: boolean;
    isLoading: boolean;
    loadFailed: boolean;
    onLoadEarlier: () => void;
    onRetry: () => void;
    onSelect: (prompt: PromptHistoryItem) => void;
}) {
    const { theme } = useUnistyles();
    const [trackHeight, setTrackHeight] = React.useState(1);
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const [isRailHovered, setIsRailHovered] = React.useState(false);
    const activeIndex = props.prompts.findIndex((prompt) => prompt.id === props.activePromptId);
    const effectiveActiveIndex = props.activePromptId && activeIndex >= 0
        ? activeIndex
        : Math.max(0, props.prompts.length - 1);

    const indexFromPointerEvent = React.useCallback((event: any): number | null => {
        const target = event.currentTarget as HTMLElement | undefined;
        const clientY = event.nativeEvent?.clientY ?? event.clientY;
        const rect = target?.getBoundingClientRect?.();
        if (!rect || !Number.isFinite(clientY)) return null;
        return getPromptIndexFromTrackPosition(clientY - rect.top, rect.height, props.prompts.length);
    }, [props.prompts.length]);

    const showActivePreview = React.useCallback(() => {
        if (props.prompts.length > 0) setHoveredIndex(effectiveActiveIndex);
    }, [effectiveActiveIndex, props.prompts.length]);

    const pointerProps = {
        tabIndex: 0,
        onPointerMove: (event: any) => {
            const index = indexFromPointerEvent(event);
            if (index !== null) setHoveredIndex(index);
        },
        onPointerLeave: () => setHoveredIndex(null),
        onClick: (event: any) => {
            const index = indexFromPointerEvent(event);
            if (index !== null) props.onSelect(props.prompts[index]);
        },
        onFocus: showActivePreview,
        onBlur: () => setHoveredIndex(null),
        onKeyDown: (event: any) => {
            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown' && event.key !== 'Enter') return;
            event.preventDefault();
            if (props.prompts.length === 0) {
                if (event.key === 'ArrowUp' && props.hasMore && !props.isLoading) {
                    props.onLoadEarlier();
                }
                return;
            }
            const current = hoveredIndex ?? effectiveActiveIndex;
            if (event.key === 'Enter') {
                props.onSelect(props.prompts[current]);
                return;
            }
            const delta = event.key === 'ArrowUp' ? -1 : 1;
            setHoveredIndex(Math.max(0, Math.min(props.prompts.length - 1, current + delta)));
        },
    } as any;

    const preview = hoveredIndex === null ? null : props.prompts[hoveredIndex];
    const previewTop = hoveredIndex === null || props.prompts.length <= 1
        ? 0
        : Math.max(0, Math.min(trackHeight - 88, (hoveredIndex / (props.prompts.length - 1)) * trackHeight - 34));
    const sampledIndices = getSampledPromptIndices(props.prompts.length);
    const railMetrics = getPromptRailMetrics(props.prompts.length);

    const goOlder = () => {
        if (effectiveActiveIndex > 0) {
            props.onSelect(props.prompts[effectiveActiveIndex - 1]);
        } else if (props.loadFailed && !props.isLoading) {
            props.onRetry();
        } else if (props.hasMore && !props.isLoading) {
            props.onLoadEarlier();
        }
    };
    const goNewer = () => {
        if (effectiveActiveIndex < props.prompts.length - 1) {
            props.onSelect(props.prompts[effectiveActiveIndex + 1]);
        }
    };

    return (
        <View
            style={[
                styles.desktopRailContainer,
                {
                    height: railMetrics.totalHeight,
                    transform: [{ translateY: -railMetrics.totalHeight / 2 }],
                },
            ]}
            onPointerEnter={() => setIsRailHovered(true)}
            onPointerLeave={() => {
                setIsRailHovered(false);
                setHoveredIndex(null);
            }}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={props.loadFailed ? t('common.retry') : t('promptHistory.loadMore')}
                disabled={effectiveActiveIndex === 0 && !props.loadFailed && (!props.hasMore || props.isLoading)}
                onPress={goOlder}
                hitSlop={PROMPT_RAIL_ARROW_HIT_SLOP.older}
                style={[
                    styles.desktopRailArrow,
                    !isRailHovered && styles.desktopRailArrowHidden,
                ]}
            >
                {props.isLoading && effectiveActiveIndex === 0 ? (
                    <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                ) : (
                    <Ionicons
                        name={props.loadFailed && effectiveActiveIndex === 0 ? 'refresh' : 'chevron-up'}
                        size={15}
                        color={theme.colors.textSecondary}
                    />
                )}
            </Pressable>

            <View
                {...pointerProps}
                accessibilityRole="adjustable"
                accessibilityLabel={t('promptHistory.title')}
                onLayout={(event) => setTrackHeight(Math.max(1, event.nativeEvent.layout.height))}
                style={[styles.desktopRailTrack, { height: railMetrics.trackHeight }]}
            >
                {sampledIndices.map((index, sampledIndex) => (
                    <View
                        key={props.prompts[index].id}
                        pointerEvents="none"
                        style={[
                            styles.desktopRailTick,
                            {
                                top: `${props.prompts.length <= 1 ? 50 : (index / (props.prompts.length - 1)) * 100}%` as any,
                                width: getPromptRailTickWidth(
                                    sampledIndex,
                                    sampledIndices.length,
                                    index === effectiveActiveIndex,
                                ),
                            },
                            index === effectiveActiveIndex && styles.desktopRailTickActive,
                        ]}
                    />
                ))}
                {!sampledIndices.includes(effectiveActiveIndex) && (
                    <View
                        pointerEvents="none"
                        style={[
                            styles.desktopRailTick,
                            styles.desktopRailTickActive,
                            {
                                top: `${props.prompts.length <= 1 ? 50 : (effectiveActiveIndex / (props.prompts.length - 1)) * 100}%` as any,
                                width: getPromptRailTickWidth(0, 1, true),
                            },
                        ]}
                    />
                )}
                {preview && (
                    <View pointerEvents="none" style={[styles.desktopPreview, { top: previewTop }]}>
                        <Text style={styles.desktopPreviewMeta}>
                            {hoveredIndex! + 1}/{props.prompts.length} · {formatPromptTime(preview.createdAt)}
                        </Text>
                        <Text style={styles.desktopPreviewText} numberOfLines={3}>{preview.text}</Text>
                    </View>
                )}
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('promptHistory.openSession')}
                disabled={effectiveActiveIndex >= props.prompts.length - 1}
                onPress={goNewer}
                hitSlop={PROMPT_RAIL_ARROW_HIT_SLOP.newer}
                style={[
                    styles.desktopRailArrow,
                    !isRailHovered && styles.desktopRailArrowHidden,
                ]}
            >
                <Ionicons name="chevron-down" size={15} color={theme.colors.textSecondary} />
            </Pressable>
        </View>
    );
});

function formatPromptTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create((theme) => ({
    desktopRailContainer: {
        position: 'absolute',
        right: 8,
        top: '50%',
        width: 48,
        alignItems: 'center',
        zIndex: 20,
    },
    desktopRailArrow: {
        width: 28,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        opacity: 1,
        transitionProperty: 'opacity',
        transitionDuration: '140ms',
    } as any,
    desktopRailArrowHidden: {
        opacity: 0,
    },
    desktopRailTrack: {
        width: 44,
        marginVertical: 3,
        outlineStyle: 'none',
    } as any,
    desktopRailTick: {
        position: 'absolute',
        right: 2,
        height: 1,
        borderRadius: 1,
        backgroundColor: theme.colors.textSecondary,
        opacity: 0.5,
    },
    desktopRailTickActive: {
        height: 2,
        backgroundColor: theme.colors.text,
        opacity: 1,
    },
    desktopPreview: {
        position: 'absolute',
        right: 48,
        width: 300,
        minHeight: 72,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 13,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surfaceHigh,
        shadowColor: '#000000',
        shadowOpacity: 0.12,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 6 },
    },
    desktopPreviewMeta: {
        color: theme.colors.textSecondary,
        fontSize: 11,
        marginBottom: 5,
        ...Typography.default('semiBold'),
    },
    desktopPreviewText: {
        color: theme.colors.text,
        fontSize: 14,
        lineHeight: 20,
        ...Typography.default(),
    },
    mobileLauncherContainer: {
        position: 'absolute',
        right: 12,
        zIndex: 19,
    },
    mobileLauncher: {
        minWidth: 40,
        height: 38,
        paddingHorizontal: 10,
        borderRadius: 19,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surfaceHigh,
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    mobileLauncherPressed: {
        backgroundColor: theme.colors.surfacePressed,
    },
    mobileLauncherCount: {
        color: theme.colors.textSecondary,
        fontSize: 11,
        ...Typography.default('semiBold'),
    },
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    mobileSheet: {
        maxHeight: '78%',
        paddingTop: 8,
        paddingHorizontal: 14,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: theme.colors.surface,
    },
    mobileSheetHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 10,
        backgroundColor: theme.colors.divider,
    },
    mobileSheetHeader: {
        minHeight: 42,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingBottom: 8,
    },
    mobileSheetTitle: {
        color: theme.colors.text,
        fontSize: 18,
        ...Typography.default('semiBold'),
    },
    mobilePromptList: {
        flexGrow: 0,
    },
    mobilePromptListContent: {
        paddingBottom: 6,
        gap: 8,
    },
    mobilePromptRow: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surfaceHigh,
    },
    mobilePromptRowActive: {
        borderColor: theme.colors.textSecondary,
        backgroundColor: theme.colors.surfaceSelected,
    },
    mobilePromptRowPressed: {
        backgroundColor: theme.colors.surfacePressed,
    },
    mobilePromptMeta: {
        color: theme.colors.textSecondary,
        fontSize: 11,
        marginBottom: 5,
        ...Typography.default('semiBold'),
    },
    mobilePromptText: {
        color: theme.colors.text,
        fontSize: 14,
        lineHeight: 20,
        ...Typography.default(),
    },
    loadEarlierButton: {
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        borderRadius: 10,
    },
    loadEarlierText: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        ...Typography.default('semiBold'),
    },
}));
