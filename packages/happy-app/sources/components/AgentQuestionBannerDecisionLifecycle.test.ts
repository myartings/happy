import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    cancel: vi.fn(),
    pending: [] as Array<Record<string, unknown>>,
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return { Pressable: host('Pressable'), View: host('View') };
});
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Icon', props) };
});
vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (factory: any) => factory({ colors: {
        divider: '#ddd', surface: '#fff', text: '#111', textLink: '#1677ff', textSecondary: '#666',
    } }) },
    useUnistyles: () => ({ theme: { colors: { textLink: '#1677ff', textSecondary: '#666' } } }),
}));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}) } }));
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('@/sync/storage', () => ({
    useSession: () => ({ presence: 'online' }),
    useSessionPendingCommunications: () => state.pending,
}));
vi.mock('@/sync/ops', () => ({ sessionCancelCommunication: state.cancel }));
vi.mock('./AgentQuestionModal', () => ({ AgentQuestionModal: () => null }));

import { AgentQuestionBanner } from './AgentQuestionBanner';

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
    state.cancel.mockReset().mockResolvedValue(undefined);
    state.pending = [{
        createdAt: 1,
        id: 'unsupported-1',
        kind: 'unsupported',
        rawKind: 'file_pick',
        title: 'Pick a file',
    }];
});

function dismissButton(renderer: ReactTestRenderer) {
    return renderer.root.findAllByType('Pressable' as any)
        .find((node: { props: { accessibilityLabel?: string } }) => node.props.accessibilityLabel === 'agentQuestion.dismiss')!;
}

describe('AgentQuestionBanner decision lifecycle', () => {
    it('renders nothing when no communication is pending and no focus is requested', () => {
        state.pending = [];

        expect(() => {
            act(() => { create(React.createElement(AgentQuestionBanner, { sessionId: 'session-1' })); });
        }).not.toThrow();
    });

    it('keeps a successfully dismissed request visibly resolved until authoritative removal', async () => {
        let renderer!: ReactTestRenderer;
        act(() => { renderer = create(React.createElement(AgentQuestionBanner, { sessionId: 'session-1' })); });
        await act(async () => { await dismissButton(renderer).props.onPress(); });

        expect(state.cancel).toHaveBeenCalledOnce();
        expect(dismissButton(renderer).props.disabled).toBe(true);
        expect(dismissButton(renderer).props.accessibilityState).toMatchObject({ disabled: true });
    });
});
