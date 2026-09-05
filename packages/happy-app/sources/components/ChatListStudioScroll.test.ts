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
    resolveMessageTargetAction: vi.fn((..._args: any[]): any => ({ type: 'none' })),
    createMessageTargetRequest: vi.fn((messageId: string, localId: string | null | undefined, createdAt: number | undefined, revision: number) => ({
        messageId,
        localId: localId ?? null,
        createdAt,
        revision: revision + 1,
        requestKey: `local:${messageId}:${revision + 1}`,
    })),
    visualStyle: 'studio',
    promptHistoryEnabled: false,
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        AppState: { addEventListener: () => ({ remove: vi.fn() }) },
        Platform: { OS: 'web' },
        Pressable: host('Pressable'),
        View: host('View'),
    };
});
vi.mock('@shopify/flash-list', async () => {
    const ReactModule = await import('react');
    const FlashList = ReactModule.forwardRef((props: any, ref) => {
        ReactModule.useImperativeHandle(ref, () => ({
            scrollToIndex: state.scrollToIndex,
            scrollToOffset: state.scrollToOffset,
            getScrollableNode: () => undefined,
        }));
        return ReactModule.createElement(
            'FlashList',
            props,
            props.data.map((item: any, index: number) => ReactModule.createElement(
                ReactModule.Fragment,
                { key: props.keyExtractor(item) },
                props.renderItem({ item, index }),
            )),
        );
    });
    return { FlashList };
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
    useLocalSetting: (key: string) => key === 'visualStyle'
        ? state.visualStyle
        : key === 'devPromptHistoryNavigatorEnabled' && state.promptHistoryEnabled,
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
vi.mock('./AgentWorkGroupHeader', async () => {
    const ReactModule = await import('react');
    return { AgentWorkGroupHeader: (props: any) => ReactModule.createElement('AgentWorkGroupHeader', props) };
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
    createMessageTargetRequest: (messageId: string, localId?: string | null, createdAt?: number, revision = 0) => (
        state.createMessageTargetRequest(messageId, localId, createdAt, revision)
    ),
    getMessageTargetNativeId: (id: string) => id,
    getNextMessageTargetScrollRetry: () => null,
    resolveMessageTargetAction: (...args: any[]) => state.resolveMessageTargetAction(...args),
}));
vi.mock('./SessionPromptHistoryNavigator', async () => {
    const ReactModule = await import('react');
    return { SessionPromptHistoryNavigator: (props: any) => ReactModule.createElement('SessionPromptHistoryNavigator', props) };
});
vi.mock('@/utils/sessionPromptHistory', () => ({
    resolveVisiblePromptId: (items: any[], indices: number[]) => {
        const anchor = indices[0];
        if (anchor === undefined) return null;
        for (let index = anchor; index < items.length; index += 1) {
            const item = items[index];
            if (item.type === 'message' && item.message.kind === 'user-text') return item.message.id;
        }
        return null;
    },
}));
vi.mock('@/utils/webMessageReveal', () => ({ revealWebMessage: () => vi.fn() }));
vi.mock('@/utils/perfLog', () => ({ perfSince: vi.fn(), useCommitPerf: vi.fn() }));
vi.mock('@/features/client-performance/agentTurnCopyResolver', () => ({
    useAgentTurnCopyResolvers: () => new Map(),
}));
vi.mock('@/features/codex-first-shell/resolveCurrentCodexFirstDesktopRuntime', () => ({
    resolveCurrentCodexFirstDesktopRuntime: (visualStyle: string) => ({
        enabled: visualStyle === 'studio',
        presentation: { usesStudioPrimitives: true, visualStyle },
    }),
}));
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
    state.promptHistoryEnabled = false;
    state.resolveMessageTargetAction.mockReset();
    state.resolveMessageTargetAction.mockReturnValue({ type: 'none' });
    state.updateVisibleSessionTailState.mockClear();
    state.removeVisibleSessionTailState.mockClear();
});

function render(element: React.ReactElement): ReactTestRenderer {
    let renderer!: ReactTestRenderer;
    act(() => { renderer = create(element); });
    return renderer;
}

describe('ChatList Studio disclosure scroll wiring', () => {
    it('lets a new route target replace a prompt-history target in the same session', () => {
        state.promptHistoryEnabled = true;
        state.messages = [
            { kind: 'user-text', id: 'route-new', localId: null, createdAt: 3, text: 'route' },
            { kind: 'user-text', id: 'prompt-old', localId: null, createdAt: 1, text: 'prompt' },
        ];
        state.displayItems = state.messages.map((message) => ({ type: 'message', id: message.id, message }));
        const session = { id: 'session-route-target', metadata: null } as any;
        const renderer = render(React.createElement(ChatList, { session }));

        act(() => renderer.root.findByType('SessionPromptHistoryNavigator' as any).props.onSelectPrompt('prompt-old', null, 1));
        expect(state.resolveMessageTargetAction.mock.calls.at(-1)?.[1]).toBe('prompt-old');

        act(() => renderer.update(React.createElement(ChatList, {
            session,
            targetMessageId: 'route-new',
            targetMessageCreatedAt: 3,
        })));
        expect(state.resolveMessageTargetAction.mock.calls.at(-1)?.[1]).toBe('route-new');
    });

    it('expands a collapsed work group before resolving a target inside it', () => {
        const target = { kind: 'agent-text', id: 'target', localId: null, createdAt: 2, text: 'target' };
        state.messages = [target];
        state.displayItems = [{
            type: 'agent-work-group', id: 'work-target', messages: [target],
            hasRunning: false, hasPendingPermission: false, startedAt: 1, completedAt: 2,
        }];
        state.resolveMessageTargetAction.mockImplementation((items: any[]) => {
            const index = items.findIndex((item) => item.id === 'target');
            return index >= 0 ? { type: 'scroll', index, messageId: 'target' } : { type: 'not-found' };
        });

        const renderer = render(React.createElement(ChatList, {
            session: { id: 'session-target', metadata: null } as any,
            targetMessageId: 'target',
        }));

        expect(renderer.root.findAllByType('AgentWorkGroupHeader' as any).some((node: any) => node.props.expanded)).toBe(true);
        expect(state.resolveMessageTargetAction.mock.calls.at(-1)?.[0]).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: 'target' }),
        ]));
    });

    it('passes a tool-group child target through for message highlighting', () => {
        const target = { kind: 'tool-call', id: 'tool-target', localId: null, createdAt: 2, tool: { name: 'Read', state: 'completed', input: {} } };
        state.messages = [target];
        state.displayItems = [{
            type: 'tool-group', id: 'tool-group-target', messages: [target],
            hasRunning: false, hasPendingPermission: false,
        }];
        state.resolveMessageTargetAction.mockReturnValue({ type: 'scroll', index: 0, messageId: 'tool-target' });

        const renderer = render(React.createElement(ChatList, {
            session: { id: 'session-tool-target', metadata: null } as any,
            targetMessageId: 'tool-target',
        }));

        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(true);
        expect(renderer.root.findByType('ToolGroupView' as any).props.highlightedMessageId).toBe('tool-target');
    });

    it('updates the prompt-history selection from visible FlashList rows', () => {
        state.promptHistoryEnabled = true;
        state.messages = [
            { kind: 'user-text', id: 'newer', localId: null, createdAt: 2, text: 'newer' },
            { kind: 'user-text', id: 'older', localId: null, createdAt: 1, text: 'older' },
        ];
        state.displayItems = state.messages.map((message) => ({ type: 'message', id: message.id, message }));
        const renderer = render(React.createElement(ChatList, {
            session: { id: 'session-prompts', metadata: null } as any,
        }));
        const list = renderer.root.findByType('FlashList' as any);

        act(() => list.props.onViewableItemsChanged({ viewableItems: [{ index: 1 }] }));

        expect(renderer.root.findByType('SessionPromptHistoryNavigator' as any).props.activePromptId).toBe('older');
    });

    it('reports live-tail, older-reading, target, and mounted-source lifecycle state', () => {
        state.messages = [{ kind: 'user-text', id: 'message', localId: null, createdAt: 1, text: 'hello' }];
        state.displayItems = [{ type: 'message', id: 'message', message: state.messages[0] }];
        const session = { id: 'session-signals', metadata: null } as any;
        const renderer = render(React.createElement(ChatList, { session }));
        const list = renderer.root.findByType('FlashList' as any);

        expect(state.updateVisibleSessionTailState).toHaveBeenCalledWith(
            'session-signals',
            expect.objectContaining({ atLiveTail: true, readingOlderHistory: false, viewportBusy: false }),
            expect.any(String),
        );

        act(() => list.props.onScroll({ nativeEvent: {
            contentOffset: { y: 400 }, contentSize: { height: 1400 }, layoutMeasurement: { height: 700 },
        } }));
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
        const list = renderer.root.findByType('FlashList' as any);

        expect(list.props.inverted).toBe(true);
        expect(list.props.maintainVisibleContentPosition).toEqual({
            autoscrollToTopThreshold: 200,
        });
        expect(list.props.scrollEventThrottle).toBe(16);
        expect(renderer.root.findByType('ToolGroupView' as any).props.expanded).toBe(false);

        act(() => list.props.onScroll({ nativeEvent: {
            contentOffset: { y: 400 }, contentSize: { height: 1400 }, layoutMeasurement: { height: 700 },
        } }));
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
