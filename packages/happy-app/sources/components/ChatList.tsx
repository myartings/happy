import * as React from 'react';
import { useLocalSetting, useSession, useSessionMessages, useSetting } from "@/sync/storage";
import { sync } from '@/sync/sync';
import { ActivityIndicator, AppState, FlatList, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, View, ViewToken } from 'react-native';
import { useCallback } from 'react';
import { useHeaderHeight } from '@/utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageView } from './MessageView';
import { AgentWorkGroupView, ToolGroupView } from './ToolGroupView';
import { Metadata, Session } from '@/sync/storageTypes';
import { ChatFooter } from './ChatFooter';
import { Message } from '@/sync/typesMessage';
import { DisplayItem, ToolGroupItem, useGroupedMessages } from '@/hooks/useGroupedMessages';
import { Octicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { resolveControlMode } from '@/sync/controlHandoff';
import { usesControlledSessionUi } from '@/sync/rig';
import { createMessageTargetRequest, getMessageTargetNativeId, getNextMessageTargetScrollRetry, resolveMessageTargetAction, type MessageTargetRequest } from '@/utils/messageTarget';
import { SessionPromptHistoryNavigator } from './SessionPromptHistoryNavigator';
import { resolveVisiblePromptId } from '@/utils/sessionPromptHistory';
import { revealWebMessage } from '@/utils/webMessageReveal';
import { isTauri } from '@/utils/isTauri';
import { resolveDesktopVisualStyle } from '@/features/studio-visual-style/studioVisualStyle';
import { resolveStudioConversationLayout } from '@/features/studio-conversation-layout/studioConversationLayout';
import { useAgentTurnCopyResolvers } from '@/features/client-performance/agentTurnCopyResolver';

const SCROLL_THRESHOLD = 300;
const DOCK_DETAILS_SHOW_OFFSET = 16;
const DOCK_DETAILS_HIDE_OFFSET = 48;
const SCROLL_BUTTON_DOCK_GAP = 8;

export const ChatList = React.memo((props: {
    session: Session;
    targetMessageId?: string;
    targetMessageLocalId?: string;
    targetMessageCreatedAt?: number;
    topContentInset?: number;
    bottomContentInset?: number;
    /** Distance from the screen bottom to the composer. Independent of status-chrome fade. */
    scrollButtonInset?: number;
    headerOverlayHeight?: number;
    onHeaderBackdropVisibilityChange?: (visible: boolean) => void;
    onBottomDockVisibilityChange?: (visible: boolean) => void;
}) => {
    const { messages, hasMoreOlder, isLoadingOlder } = useSessionMessages(props.session.id);
    return (
        <ChatListInternal
            metadata={props.session.metadata}
            sessionId={props.session.id}
            messages={messages}
            targetMessageId={props.targetMessageId}
            targetMessageLocalId={props.targetMessageLocalId}
            targetMessageCreatedAt={props.targetMessageCreatedAt}
            hasMoreOlder={hasMoreOlder}
            isLoadingOlder={isLoadingOlder}
            topContentInset={props.topContentInset}
            bottomContentInset={props.bottomContentInset}
            scrollButtonInset={props.scrollButtonInset}
            headerOverlayHeight={props.headerOverlayHeight}
            onHeaderBackdropVisibilityChange={props.onHeaderBackdropVisibilityChange}
            onBottomDockVisibilityChange={props.onBottomDockVisibilityChange}
        />
    )
});

const ListHeader = React.memo((props: {
    isLoadingOlder: boolean;
    topContentInset?: number;
    desktopHeaderHeight?: number | null;
    messageTopGap?: number | null;
}) => {
    const headerHeight = useHeaderHeight();
    const safeArea = useSafeAreaInsets();
    // ListFooterComponent on an inverted FlatList renders at the visual top
    // — that is exactly where the spinner for "loading older messages"
    // belongs. The spacer below keeps the header bar from clipping the
    // oldest message.
    return (
        <View>
            {props.isLoadingOlder && (
                <View style={{ paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="small" />
                </View>
            )}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: props.topContentInset
                        ?? (props.desktopHeaderHeight ?? headerHeight) + safeArea.top + (props.messageTopGap ?? 32),
                }}
            />
        </View>
    );
});

const ListFooter = React.memo((props: { sessionId: string }) => {
    const session = useSession(props.sessionId)!;
    return (
        <ChatFooter controlledByUser={usesControlledSessionUi(session.metadata) && (session.agentState?.controlledByUser || false)} />
    )
});

const ChatListInternal = React.memo((props: {
    metadata: Metadata | null,
    sessionId: string,
    messages: Message[],
    targetMessageId?: string,
    targetMessageLocalId?: string,
    targetMessageCreatedAt?: number,
    hasMoreOlder: boolean,
    isLoadingOlder: boolean,
    topContentInset?: number,
    bottomContentInset?: number,
    scrollButtonInset?: number,
    headerOverlayHeight?: number,
    onHeaderBackdropVisibilityChange?: (visible: boolean) => void,
    onBottomDockVisibilityChange?: (visible: boolean) => void,
}) => {
    const { theme } = useUnistyles();
    const requestedVisualStyle = useLocalSetting('visualStyle');
    const desktopVisualStyle = resolveDesktopVisualStyle({
        isTauriRuntime: isTauri(),
        requestedStyle: requestedVisualStyle,
        previewStyle: process.env.EXPO_PUBLIC_HAPPY_VISUAL_STYLE,
    });
    const conversationLayout = resolveStudioConversationLayout({
        isTauriRuntime: isTauri(),
        visualStyle: desktopVisualStyle,
    });
    const autoExpandRunningGroups = desktopVisualStyle === 'studio';
    const promptHistoryNavigatorEnabled = useLocalSetting('devPromptHistoryNavigatorEnabled');
    const flatListRef = React.useRef<FlatList>(null);
    const handledTargetRequestRef = React.useRef<string | null>(null);
    const targetIndexRef = React.useRef<number | null>(null);
    const targetMessageIdRef = React.useRef<string | null>(null);
    const targetRequestKeyRef = React.useRef<string | null>(null);
    const targetScrollRetryAttemptsRef = React.useRef(0);
    const targetScrollRetryTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const webRevealCleanupRef = React.useRef<(() => void) | null>(null);
    const [highlightedMessageId, setHighlightedMessageId] = React.useState<string | null>(null);
    const [localMessageTarget, setLocalMessageTarget] = React.useState<MessageTargetRequest | null>(null);
    const [activePromptId, setActivePromptId] = React.useState<string | null>(null);
    const [showScrollButton, setShowScrollButton] = React.useState(false);
    const [handoffListRevision, setHandoffListRevision] = React.useState(0);
    // Tracks whether the scroll-button is currently shown, so we only call
    // setShowScrollButton when the threshold is actually crossed instead of
    // on every scroll frame (60Hz). Without this guard, the entire list
    // parent re-renders on every wheel tick.
    const showScrollButtonRef = React.useRef(false);
    const headerBackdropVisibleRef = React.useRef(false);
    const bottomDockVisibleRef = React.useRef(true);
    const scrollMetricsRef = React.useRef({
        offsetY: 0,
        contentHeight: 0,
        viewportHeight: 0,
    });
    const session = useSession(props.sessionId);
    const controlMode = resolveControlMode(usesControlledSessionUi(session?.metadata) ? session?.agentState?.controlledByUser : false);
    const previousControlModeRef = React.useRef(controlMode);

    React.useEffect(() => {
        if (previousControlModeRef.current === controlMode) {
            return;
        }
        previousControlModeRef.current = controlMode;
        if (Platform.OS !== 'web') {
            return;
        }
        if (showScrollButtonRef.current) {
            showScrollButtonRef.current = false;
            setShowScrollButton(false);
        }
        setHandoffListRevision((revision) => revision + 1);
    }, [controlMode]);

    // Collapse agent work between a user prompt and the final answer.
    // Nested tool groups remain expandable inside the work block.
    const groupToolCalls = useSetting('groupToolCalls');
    const hasPendingPermission = Boolean(
        session?.agentState?.requests && Object.keys(session.agentState.requests).length > 0,
    );
    const collapseCurrentTurn = session?.thinking !== true && !hasPendingPermission;
    const groupingOptions = React.useMemo(
        () => ({ collapseCurrentTurn }),
        [collapseCurrentTurn],
    );
    const displayItems = useGroupedMessages(props.messages, groupToolCalls, groupingOptions);
    const targetMessageId = localMessageTarget ? localMessageTarget.messageId : props.targetMessageId;
    const targetMessageLocalId = localMessageTarget ? localMessageTarget.localId : props.targetMessageLocalId;
    const targetMessageCreatedAt = localMessageTarget ? localMessageTarget.createdAt : props.targetMessageCreatedAt;
    const routeTargetKey = props.targetMessageId
        ? `route:${props.targetMessageId}:${props.targetMessageLocalId ?? ''}:${props.targetMessageCreatedAt ?? ''}`
        : null;
    const targetRequestKey = localMessageTarget?.requestKey ?? routeTargetKey;
    const targetAction = React.useMemo(
        () => {
            if (!targetMessageId) return { type: 'none' } as const;
            return resolveMessageTargetAction(
                displayItems.map((item) => ({
                id: item.id,
                localId: item.type === 'message' && 'localId' in item.message ? item.message.localId : null,
                createdAt: item.type === 'message' ? item.message.createdAt : null,
                })),
                targetMessageId,
                targetMessageLocalId,
                targetMessageCreatedAt,
                props.hasMoreOlder,
                props.isLoadingOlder,
            );
        },
        [displayItems, props.hasMoreOlder, props.isLoadingOlder, targetMessageId, targetMessageLocalId, targetMessageCreatedAt],
    );
    targetIndexRef.current = targetAction.type === 'scroll' ? targetAction.index : null;
    targetMessageIdRef.current = targetAction.type === 'scroll' ? targetAction.messageId : null;
    targetRequestKeyRef.current = targetRequestKey;
    const agentCopyResolversByMessageId = useAgentTurnCopyResolvers(
        props.messages,
        collapseCurrentTurn,
    );

    // Completed groups start collapsed. In Studio, active groups start open so
    // bounded previews stay visible; permission-bearing groups open everywhere.
    const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(() => {
        const initial = new Set<string>();
        for (const item of displayItems) {
            if (isCollapsibleDisplayItem(item) && !shouldAutoExpandGroup(item, autoExpandRunningGroups)) {
                initial.add(item.id);
            }
        }
        return initial;
    });

    // Automatic running/completed/permission transitions never override a
    // manual open or collapse while this conversation view remains mounted.
    const manuallyToggledGroupsRef = React.useRef<Set<string>>(new Set());

    React.useEffect(() => {
        setCollapsedGroups((prev) => {
            let changed = false;
            const next = new Set(prev);
            for (const item of displayItems) {
                if (!isCollapsibleDisplayItem(item)) {
                    continue;
                }
                if (manuallyToggledGroupsRef.current.has(item.id)) {
                    continue;
                }
                if (shouldAutoExpandGroup(item, autoExpandRunningGroups) && next.has(item.id)) {
                    next.delete(item.id);
                    changed = true;
                } else if (!shouldAutoExpandGroup(item, autoExpandRunningGroups) && !next.has(item.id)) {
                    next.add(item.id);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [autoExpandRunningGroups, displayItems]);

    // Ref so AppState handler reads fresh items without re-subscribing
    const displayItemsRef = React.useRef(displayItems);
    displayItemsRef.current = displayItems;

    // Auto-collapse completed groups when app goes to background / tab hidden
    React.useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state !== 'active') {
                setCollapsedGroups((prev) => {
                    const next = new Set(prev);
                    for (const item of displayItemsRef.current) {
                        if (isCollapsibleDisplayItem(item) && !item.hasRunning) {
                            next.add(item.id);
                        }
                    }
                    return next;
                });
            }
        });
        return () => sub.remove();
    }, []);

    // Auto-collapse all previous groups when user sends a new message
    const latestUserMsgId = React.useMemo(() => {
        for (const msg of props.messages) {
            if (msg.kind === 'user-text') return msg.id;
        }
        return null;
    }, [props.messages]);

    const prevUserMsgIdRef = React.useRef(latestUserMsgId);
    React.useEffect(() => {
        if (latestUserMsgId) setActivePromptId(latestUserMsgId);
    }, [latestUserMsgId, props.sessionId]);
    React.useEffect(() => {
        if (latestUserMsgId && latestUserMsgId !== prevUserMsgIdRef.current) {
            prevUserMsgIdRef.current = latestUserMsgId;
            manuallyToggledGroupsRef.current.clear();
            setCollapsedGroups((prev) => {
                const next = new Set(prev);
                for (const item of displayItemsRef.current) {
                    if (isCollapsibleDisplayItem(item)) {
                        if (shouldAutoExpandGroup(item, autoExpandRunningGroups)) {
                            next.delete(item.id);
                        } else {
                            next.add(item.id);
                        }
                    }
                }
                return next;
            });
        }
    }, [autoExpandRunningGroups, latestUserMsgId]);

    const handleToggleGroup = useCallback((groupId: string) => {
        setCollapsedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            manuallyToggledGroupsRef.current.add(groupId);
            return next;
        });
    }, []);

    const keyExtractor = useCallback((item: DisplayItem) => item.id, []);
    const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 15 }).current;
    const handleViewableItemsChanged = React.useRef((info: { viewableItems: ViewToken[] }) => {
        const visibleIndices = info.viewableItems.flatMap((token) => (
            typeof token.index === 'number' ? [token.index] : []
        ));
        const promptId = resolveVisiblePromptId(displayItemsRef.current, visibleIndices);
        if (promptId) {
            setActivePromptId((current) => current === promptId ? current : promptId);
        }
    }).current;

    const updateHeaderBackdropVisibility = useCallback(() => {
        if (!props.onHeaderBackdropVisibilityChange || !props.headerOverlayHeight) {
            return;
        }
        const { offsetY, contentHeight, viewportHeight } = scrollMetricsRef.current;
        const topSpacerHeight = props.topContentInset ?? 0;
        const nonSpacerContentHeight = Math.max(
            0,
            contentHeight - topSpacerHeight - (props.bottomContentInset ?? 0),
        );
        const nextVisible = viewportHeight > 0
            && nonSpacerContentHeight > offsetY + viewportHeight - props.headerOverlayHeight;
        if (nextVisible === headerBackdropVisibleRef.current) {
            return;
        }
        headerBackdropVisibleRef.current = nextVisible;
        props.onHeaderBackdropVisibilityChange(nextVisible);
    }, [props.bottomContentInset, props.headerOverlayHeight, props.onHeaderBackdropVisibilityChange, props.topContentInset]);

    const setBottomDockVisibility = useCallback((visible: boolean) => {
        if (!props.onBottomDockVisibilityChange) {
            return;
        }
        if (visible === bottomDockVisibleRef.current) {
            return;
        }
        bottomDockVisibleRef.current = visible;
        props.onBottomDockVisibilityChange(visible);
    }, [props.onBottomDockVisibilityChange]);

    const handleSelectPrompt = useCallback((messageId: string, localId?: string | null, createdAt?: number) => {
        setLocalMessageTarget((current) => createMessageTargetRequest(
            messageId,
            localId,
            createdAt,
            current?.revision ?? 0,
        ));
    }, []);

    React.useEffect(() => {
        setLocalMessageTarget(null);
        handledTargetRequestRef.current = null;
    }, [props.sessionId]);

    const previousRouteTargetKeyRef = React.useRef(routeTargetKey);
    React.useEffect(() => {
        if (previousRouteTargetKeyRef.current === routeTargetKey) return;
        previousRouteTargetKeyRef.current = routeTargetKey;
        setLocalMessageTarget(null);
        handledTargetRequestRef.current = null;
    }, [routeTargetKey]);

    const cancelTargetScrollRetry = React.useCallback(() => {
        if (targetScrollRetryTimerRef.current !== null) {
            clearTimeout(targetScrollRetryTimerRef.current);
            targetScrollRetryTimerRef.current = null;
        }
        webRevealCleanupRef.current?.();
        webRevealCleanupRef.current = null;
        targetScrollRetryAttemptsRef.current = 0;
    }, []);

    React.useEffect(() => {
        cancelTargetScrollRetry();
        return cancelTargetScrollRetry;
    }, [cancelTargetScrollRetry, props.sessionId, targetRequestKey]);

    React.useEffect(() => {
        if (!targetMessageId || !targetRequestKey || handledTargetRequestRef.current === targetRequestKey) return;

        if (targetAction.type === 'load-older') {
            void sync.loadOlderMessages(props.sessionId);
            return;
        }
        if (targetAction.type === 'not-found' && targetRequestKey.startsWith('prompt:')) {
            handledTargetRequestRef.current = targetRequestKey;
            return;
        }
        if (targetAction.type !== 'scroll') {
            return;
        }

        handledTargetRequestRef.current = targetRequestKey;
        setHighlightedMessageId(targetAction.messageId);
        setBottomDockVisibility(false);
        let cancelWebReveal: (() => void) | null = null;
        const scrollTimer = setTimeout(() => {
            // Rendering the entire history made the target DOM node available on web,
            // but defeated virtualization. Drive the virtual list to the target on every
            // platform first; the web reveal loop then performs the final centering once
            // React Native Web mounts the requested row.
            flatListRef.current?.scrollToIndex({
                index: targetAction.index,
                animated: true,
                viewPosition: 0.5,
            });
            if (Platform.OS === 'web') {
                cancelWebReveal = revealWebMessage(getMessageTargetNativeId(targetAction.messageId));
                webRevealCleanupRef.current = cancelWebReveal;
            }
        }, 50);
        const highlightTimer = setTimeout(() => {
            setHighlightedMessageId((current) => current === targetAction.messageId ? null : current);
        }, 3000);
        return () => {
            clearTimeout(scrollTimer);
            clearTimeout(highlightTimer);
            cancelWebReveal?.();
            if (webRevealCleanupRef.current === cancelWebReveal) {
                webRevealCleanupRef.current = null;
            }
        };
    }, [props.sessionId, setBottomDockVisibility, targetAction, targetMessageId, targetRequestKey]);

    const updateBottomDockVisibility = useCallback((offsetY: number) => {
        // Hysteresis avoids toggling while the list is resting or bouncing
        // very near the newest message.
        const nextVisible = bottomDockVisibleRef.current
            ? offsetY <= DOCK_DETAILS_HIDE_OFFSET
            : offsetY <= DOCK_DETAILS_SHOW_OFFSET;
        setBottomDockVisibility(nextVisible);
    }, [setBottomDockVisibility]);

    React.useEffect(() => {
        setBottomDockVisibility(true);
    }, [props.sessionId, setBottomDockVisibility]);

    React.useEffect(() => () => {
        if (headerBackdropVisibleRef.current) {
            props.onHeaderBackdropVisibilityChange?.(false);
        }
        setBottomDockVisibility(true);
    }, [props.onHeaderBackdropVisibilityChange, setBottomDockVisibility]);

    const renderItem = useCallback(({ item }: { item: DisplayItem }) => {
        if (item.type === 'tool-group') {
            return (
                <ToolGroupView
                    group={item}
                    metadata={props.metadata}
                    sessionId={props.sessionId}
                    expanded={!collapsedGroups.has(item.id)}
                    onToggle={() => handleToggleGroup(item.id)}
                />
            );
        }
        if (item.type === 'agent-work-group') {
            return (
                <AgentWorkGroupView
                    group={item}
                    metadata={props.metadata}
                    sessionId={props.sessionId}
                    expanded={!collapsedGroups.has(item.id)}
                    onToggle={() => handleToggleGroup(item.id)}
                />
            );
        }
        return (
            <MessageView
                message={item.message}
                metadata={props.metadata}
                sessionId={props.sessionId}
                highlighted={item.message.id === highlightedMessageId}
                copyTextResolver={agentCopyResolversByMessageId.get(item.message.id)}
            />
        );
    }, [agentCopyResolversByMessageId, props.metadata, props.sessionId, collapsedGroups, handleToggleGroup, highlightedMessageId]);

    // In inverted FlatList, offset 0 = latest messages (visual bottom).
    // Offset increases as user scrolls up to see older messages.
    // Auto-stick-to-bottom on new messages is handled natively by FlatList's
    // maintainVisibleContentPosition.autoscrollToBottomThreshold — no JS-side
    // scrollToOffset is needed (and running both produces a fight that drags
    // the user's viewport when reading older messages mid-stream).
    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        scrollMetricsRef.current.offsetY = offsetY;
        updateHeaderBackdropVisibility();
        updateBottomDockVisibility(offsetY);
        const next = offsetY > SCROLL_THRESHOLD;
        if (next !== showScrollButtonRef.current) {
            showScrollButtonRef.current = next;
            setShowScrollButton(next);
        }
    }, [updateBottomDockVisibility, updateHeaderBackdropVisibility]);

    const scrollToBottom = useCallback(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);

    // In an inverted FlatList, `onEndReached` fires when the user scrolls
    // past the visual top — i.e. when they want to see older history.
    // Initial fetch only loads the latest 100 messages (see
    // sync.fetchInitialLatestPage), so we lazy-load earlier pages here.
    const sessionId = props.sessionId;
    const hasMoreOlder = props.hasMoreOlder;
    const isLoadingOlder = props.isLoadingOlder;
    const handleLoadOlder = useCallback(() => {
        if (!hasMoreOlder || isLoadingOlder) return;
        void sync.loadOlderMessages(sessionId);
    }, [sessionId, hasMoreOlder, isLoadingOlder]);

    // On macOS/web, Shift+wheel swaps deltaX/deltaY — restore vertical scrolling
    React.useEffect(() => {
        if (Platform.OS !== 'web') return;
        const node = (flatListRef.current as any)?.getScrollableNode?.() as HTMLElement | undefined;
        if (!node) return;
        const handler = (e: WheelEvent) => {
            if (e.shiftKey && Math.abs(e.deltaX) > 0 && Math.abs(e.deltaY) < 1) {
                node.scrollTop += e.deltaX;
                e.preventDefault();
            }
        };
        node.addEventListener('wheel', handler, { passive: false });
        return () => node.removeEventListener('wheel', handler);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                key={`${props.sessionId}:${handoffListRevision}`}
                ref={flatListRef}
                data={displayItems}
                inverted={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                windowSize={9}
                keyExtractor={keyExtractor}
                maintainVisibleContentPosition={{
                    // Anchor on the second-newest message (index 1), not the
                    // newest. The newest slot (index 0) gets a brand-new item
                    // each agent token, which would otherwise destabilise the
                    // anchor and drag the viewport up.
                    //
                    // autoscrollToTopThreshold: for INVERTED lists this is
                    // actually the auto-stick-to-visual-bottom threshold —
                    // contentOffset 0 is at the visual bottom in an inverted
                    // list, and this prop sticks the viewport to offset 0
                    // when the user is within N units of it.
                    minIndexForVisible: 1,
                    autoscrollToTopThreshold: 50,
                }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
                // Inverted list: paddingTop renders at the visual bottom.
                // The measured dock inset lets the newest message scroll above
                // the floating composer instead of stopping underneath it.
                contentContainerStyle={{
                    paddingTop: (conversationLayout.messageBottomGap ?? 8) + (props.bottomContentInset ?? 0),
                    ...(conversationLayout.messageViewportMaxWidth !== null ? {
                        width: '100%',
                        maxWidth: conversationLayout.messageViewportMaxWidth,
                        alignSelf: 'center',
                    } : {}),
                }}
                renderItem={renderItem}
                onScroll={handleScroll}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={32}
                onLayout={(event) => {
                    scrollMetricsRef.current.viewportHeight = event.nativeEvent.layout.height;
                    updateHeaderBackdropVisibility();
                }}
                onContentSizeChange={(_width, height) => {
                    scrollMetricsRef.current.contentHeight = height;
                    updateHeaderBackdropVisibility();
                }}
                ListHeaderComponent={<ListFooter sessionId={props.sessionId} />}
                ListFooterComponent={(
                    <ListHeader
                        isLoadingOlder={props.isLoadingOlder}
                        topContentInset={props.topContentInset}
                        desktopHeaderHeight={conversationLayout.headerHeight}
                        messageTopGap={conversationLayout.messageTopGap}
                    />
                )}
                onEndReached={handleLoadOlder}
                onEndReachedThreshold={0.5}
                onScrollToIndexFailed={(info) => {
                    const targetIndex = targetIndexRef.current;
                    const failedRequestKey = targetRequestKeyRef.current;
                    const nextAttempt = getNextMessageTargetScrollRetry(
                        targetRequestKeyRef.current,
                        failedRequestKey,
                        targetScrollRetryAttemptsRef.current,
                    );
                    if (targetIndex === null || nextAttempt === null) return;
                    targetScrollRetryAttemptsRef.current = nextAttempt;
                    flatListRef.current?.scrollToOffset({
                        offset: Math.max(0, info.averageItemLength * targetIndex),
                        animated: false,
                    });
                    if (targetScrollRetryTimerRef.current !== null) {
                        clearTimeout(targetScrollRetryTimerRef.current);
                    }
                    targetScrollRetryTimerRef.current = setTimeout(() => {
                        targetScrollRetryTimerRef.current = null;
                        if (targetRequestKeyRef.current !== failedRequestKey) return;
                        flatListRef.current?.scrollToIndex({
                            index: targetIndex,
                            animated: true,
                            viewPosition: 0.5,
                        });
                        const targetMessageId = targetMessageIdRef.current;
                        if (targetMessageId && Platform.OS === 'web') {
                            webRevealCleanupRef.current?.();
                            webRevealCleanupRef.current = revealWebMessage(getMessageTargetNativeId(targetMessageId));
                        }
                    }, 100);
                }}
            />
            {promptHistoryNavigatorEnabled ? (
                <SessionPromptHistoryNavigator
                    sessionId={props.sessionId}
                    loadedMessages={props.messages}
                    hasMoreOlder={props.hasMoreOlder}
                    activePromptId={activePromptId}
                    bottomContentInset={props.bottomContentInset}
                    onSelectPrompt={handleSelectPrompt}
                />
            ) : null}
            {showScrollButton && (
                <View style={[
                    styles.scrollButtonContainer,
                    { bottom: SCROLL_BUTTON_DOCK_GAP + (props.scrollButtonInset ?? props.bottomContentInset ?? 0) },
                ]}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.scrollButton,
                            pressed ? styles.scrollButtonPressed : styles.scrollButtonDefault
                        ]}
                        onPress={scrollToBottom}
                    >
                        <Octicons name="arrow-down" size={14} color={theme.colors.text} />
                    </Pressable>
                </View>
            )}
        </View>
    )
});

function isCollapsibleDisplayItem(item: DisplayItem): item is ToolGroupItem | Extract<DisplayItem, { type: 'agent-work-group' }> {
    return item.type === 'tool-group' || item.type === 'agent-work-group';
}

function shouldAutoExpandGroup(
    item: ToolGroupItem | Extract<DisplayItem, { type: 'agent-work-group' }>,
    autoExpandRunningGroups: boolean,
): boolean {
    return item.hasPendingPermission || (autoExpandRunningGroups && item.hasRunning);
}

const styles = StyleSheet.create((theme) => ({
    scrollButtonContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: SCROLL_BUTTON_DOCK_GAP,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'box-none',
    },
    scrollButton: {
        borderRadius: 16,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.divider,
        shadowColor: theme.colors.shadow.color,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: theme.colors.shadow.opacity * 0.5,
        elevation: 2,
    },
    scrollButtonDefault: {
        backgroundColor: theme.colors.surface,
        opacity: 0.9,
    },
    scrollButtonPressed: {
        backgroundColor: theme.colors.surface,
        opacity: 0.7,
    },
}));
