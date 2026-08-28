import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    displayItems: [] as any[],
    messages: [] as any[],
    scrollToIndex: vi.fn(),
    scrollToOffset: vi.fn(),
    updateVisibleSessionTailState: vi.fn(),
    removeVisibleSessionTailState: vi.fn(),
    visualStyle: 'studio',
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    const FlatList = ReactModule.forwardRef((props: any, ref) => {
        ReactModule.useImperativeHandle(ref, () => ({
            scrollToIndex: state.scrollToIndex,
            scrollToOffset: state.scrollToOffset,
        }));
        return ReactModule.createElement(
            'FlatList',
            props,
            props.data.map((item: any, index: number) => ReactModule.createElement(
                ReactModule.Fragment,
                { key: props.keyExtractor(item) },
                props.renderItem({ item, index }),
            )),
        );
    });
    return {
        ActivityIndicator: host('ActivityIndicator'),
        AppState: { addEventListener: () => ({ remove: vi.fn() }) },
        FlatList,
        Platform: { OS: 'web' },
        Pressable: host('Pressable'),
        View: host('View'),
    };
});
vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (factory: any) => typeof factory === 'function' ? factory({ colors: {
        divider: '#ddd', shadow: { color: '#000', opacity: 0.2 }, surface: '#fff', text: '#111', surfaceHighest: '#eee',
    } }) : factory },
    useUnistyles: () => ({ theme: { colors: { text: '#111' } } }),
}));
vi.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0 }) }));
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Octicons: (props: any) => ReactModule.createElement('Icon', props) };
});
vi.mock('@/sync/storage', () => ({
    useLocalSetting: (key: string) => key === 'visualStyle' ? state.visualStyle : false,
    useSession: () => ({ metadata: null, thinking: false, agentState: { controlledByUser: false, requests: {} } }),
    useSessionMessages: () => ({ messages: state.messages, hasMoreOlder: false, isLoadingOlder: false }),
    useSetting: () => true,
}));
vi.mock('@/sync/sync', () => ({ sync: {
    loadOlderMessages: vi.fn(),
    updateVisibleSessionTailState: state.updateVisibleSessionTailState,
    removeVisibleSessionTailState: state.removeVisibleSessionTailState,
} }));
vi.mock('@/utils/responsive', () => ({ useHeaderHeight: () => 0 }));
vi.mock('./MessageView', async () => {
    const ReactModule = await import('react');
    return { MessageView: (props: any) => ReactModule.createElement('MessageView', props) };
});
vi.mock('./ToolGroupView', async () => {
    const ReactModule = await import('react');
    return {
        AgentWorkGroupView: (props: any) => ReactModule.createElement('AgentWorkGroupView', props),
        ToolGroupView: (props: any) => ReactModule.createElement('ToolGroupView', props),
    };
});
vi.mock('./ChatFooter', () => ({ ChatFooter: () => null }));
vi.mock('@/hooks/useGroupedMessages', () => ({ useGroupedMessages: () => state.displayItems }));
vi.mock('@/sync/controlHandoff', () => ({ resolveControlMode: () => 'user' }));
vi.mock('@/sync/rig', () => ({ usesControlledSessionUi: () => false }));
vi.mock('@/utils/messageTarget', () => ({
    createMessageTargetRequest: vi.fn(),
    getMessageTargetNativeId: (id: string) => id,
    getNextMessageTargetScrollRetry: () => null,
    resolveMessageTargetAction: () => ({ type: 'none' }),
}));
vi.mock('./SessionPromptHistoryNavigator', () => ({ SessionPromptHistoryNavigator: () => null }));
vi.mock('@/utils/sessionPromptHistory', () => ({ resolveVisiblePromptId: () => null }));
vi.mock('@/utils/webMessageReveal', () => ({ revealWebMessage: () => vi.fn() }));
vi.mock('@/utils/isTauri', () => ({ isTauri: () => true }));
vi.mock('@/features/studio-visual-style/studioVisualStyle', () => ({
    resolveDesktopVisualStyle: ({ requestedStyle }: { requestedStyle: string }) => requestedStyle,
}));
vi.mock('@/features/studio-conversation-layout/studioConversationLayout', () => ({
    resolveStudioConversationLayout: () => ({
        headerHeight: 0,
        messageBottomGap: 8,
        messageTopGap: 0,
        messageViewportMaxWidth: 800,
    }),
}));

import { ChatList } from './ChatList';

const originalConsoleError = console.error;
beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});
afterAll(() => vi.restoreAllMocks());
beforeEach(() => {
    state.visualStyle = 'studio';
    state.updateVisibleSessionTailState.mockClear();
    state.removeVisibleSessionTailState.mockClear();
});

function render(element: React.ReactElement): ReactTestRenderer {
    let renderer!: ReactTestRenderer;
    act(() => { renderer = create(element); });
    return renderer;
}

describe('ChatList Studio disclosure scroll wiring', () => {
    it('reports live-tail, older-reading, target, and mounted-source lifecycle state', () => {
        state.messages = [{ kind: 'user-text', id: 'message', localId: null, createdAt: 1, text: 'hello' }];
        state.displayItems = [{ type: 'message', id: 'message', message: state.messages[0] }];
        const session = { id: 'session-signals', metadata: null } as any;
        const renderer = render(React.createElement(ChatList, { session }));
        const list = renderer.root.findByType('FlatList' as any);

        expect(state.updateVisibleSessionTailState).toHaveBeenCalledWith(
            'session-signals',
            expect.objectContaining({ atLiveTail: true, readingOlderHistory: false, viewportBusy: false }),
            expect.any(String),
        );

        act(() => list.props.onScroll({ nativeEvent: { contentOffset: { y: 400 } } }));
        expect(state.updateVisibleSessionTailState).toHaveBeenCalledWith(
            'session-signals',
            { atLiveTail: false, readingOlderHistory: true, viewportBusy: true },
            expect.any(String),
        );

        act(() => renderer.update(React.createElement(ChatList, {
            session,
            targetMessageId: 'missing-target',
        })));
        expect(state.updateVisibleSessionTailState).toHaveBeenCalledWith(
            'session-signals',
            { targetActive: true },
            expect.any(String),
        );

        act(() => renderer.unmount());
        expect(state.removeVisibleSessionTailState).toHaveBeenCalledWith(
            'session-signals',
            expect.any(String),
        );
    });

    it('anchors older reading while native bottom-follow remains limited to the bottom threshold', () => {
        state.scrollToIndex.mockClear();
        state.scrollToOffset.mockClear();
        state.messages = [{ kind: 'assistant-text', id: 'answer', localId: null, createdAt: 1, text: 'answer' }];
        state.displayItems = [{
            type: 'tool-group', id: 'group-1', messages: [], hasRunning: false, hasPendingPermission: false,
        }];
        const session = { id: 'session-1', metadata: null } as any;
        const renderer = render(React.createElement(ChatList, { session }));
        const list = renderer.root.findByType('FlatList' as any);

        expect(list.props.inverted).toBe(true);
        expect(list.props.maintainVisibleContentPosition).toEqual({
            minIndexForVisible: 1,
            autoscrollToTopThreshold: 50,
        });
        expect(list.props.windowSize).toBe(9);
        expect(list.props.scrollEventThrottle).toBe(32);
        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(false);

        act(() => list.props.onScroll({ nativeEvent: { contentOffset: { y: 400 } } }));
        act(() => renderer.root.findByType('ToolGroupView' as any).props.onToggle());
        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(true);

        state.messages = [{ ...state.messages[0], text: 'answer plus streamed output' }];
        state.displayItems = [{
            type: 'tool-group', id: 'group-1', messages: [], hasRunning: true, hasPendingPermission: false,
        }];
        act(() => renderer.update(React.createElement(ChatList, { session })));
        act(() => list.props.onLayout({ nativeEvent: { layout: { height: 700 } } }));
        act(() => list.props.onContentSizeChange(800, 1400));

        expect(state.scrollToOffset).not.toHaveBeenCalled();
        expect(state.scrollToIndex).not.toHaveBeenCalled();
    });

    it('opens active groups by default and preserves an explicit manual collapse', () => {
        state.messages = [];
        state.displayItems = [{
            type: 'tool-group', id: 'group-active', messages: [], hasRunning: true, hasPendingPermission: false,
        }];
        const session = { id: 'session-active', metadata: null } as any;
        const renderer = render(React.createElement(ChatList, { session }));

        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(true);
        act(() => renderer.root.findByType('ToolGroupView' as any).props.onToggle());
        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(false);

        state.displayItems = [{
            type: 'tool-group', id: 'group-active', messages: [], hasRunning: false, hasPendingPermission: true,
        }];
        state.messages = [];
        act(() => renderer.update(React.createElement(ChatList, { session: { ...session } })));
        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(false);
    });

    it('automatically collapses an untouched group when its active work completes', () => {
        state.messages = [];
        state.displayItems = [{
            type: 'tool-group', id: 'group-transition', messages: [], hasRunning: true, hasPendingPermission: false,
        }];
        const session = { id: 'session-transition', metadata: null } as any;
        const renderer = render(React.createElement(ChatList, { session }));
        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(true);

        state.displayItems = [{
            type: 'tool-group', id: 'group-transition', messages: [], hasRunning: false, hasPendingPermission: false,
        }];
        state.messages = [];
        act(() => renderer.update(React.createElement(ChatList, { session: { ...session } })));

        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(false);
    });

    it('preserves the existing collapsed running-group default outside Studio', () => {
        state.visualStyle = 'default';
        state.messages = [];
        state.displayItems = [{
            type: 'tool-group', id: 'group-default', messages: [], hasRunning: true, hasPendingPermission: false,
        }];
        const session = { id: 'session-default', metadata: null } as any;
        const renderer = render(React.createElement(ChatList, { session }));

        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(false);
    });
});
