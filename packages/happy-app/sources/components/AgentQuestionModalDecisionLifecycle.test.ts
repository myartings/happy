import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    answer: vi.fn(),
    cancel: vi.fn(),
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        Modal: host('Modal'),
        Platform: { OS: 'web' },
        Pressable: host('Pressable'),
        ScrollView: host('ScrollView'),
        TextInput: host('TextInput'),
        View: host('View'),
    };
});
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Icon', props) };
});
vi.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }) }));
vi.mock('react-native-unistyles', () => ({
    StyleSheet: {
        create: (factory: any) => factory({ colors: {
            divider: '#ddd', groupped: { background: '#fafafa' }, surface: '#fff', surfaceHighest: '#eee',
            text: '#111', textLink: '#1677ff', textSecondary: '#666',
        } }),
        hairlineWidth: 1,
    },
    useUnistyles: () => ({ theme: { colors: { textSecondary: '#666' } } }),
}));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}) } }));
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('@/sync/ops', () => ({
    sessionAnswerQuestion: state.answer,
    sessionCancelCommunication: state.cancel,
}));

import { AgentQuestionModal } from './AgentQuestionModal';

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
    state.answer.mockReset().mockResolvedValue(undefined);
    state.cancel.mockReset().mockResolvedValue(undefined);
});

const pending = {
    createdAt: 1,
    id: 'communication-1',
    kind: 'form' as const,
    questions: [{
        allowCustom: true,
        header: 'Details',
        id: 'question-1',
        multiSelect: false,
        options: [],
        question: 'What should change?',
        required: true,
    }],
};

function renderModal(overrides: Partial<React.ComponentProps<typeof AgentQuestionModal>> = {}) {
    const onClose = vi.fn();
    let renderer!: ReactTestRenderer;
    act(() => {
        renderer = create(React.createElement(AgentQuestionModal, {
            connected: true,
            onClose,
            pending,
            sessionId: 'session-1',
            visible: true,
            ...overrides,
        }));
    });
    return { onClose, renderer };
}

function pressable(renderer: ReactTestRenderer, label: string) {
    return renderer.root.findAllByType('Pressable' as any)
        .find((node: { props: { accessibilityLabel?: string } }) => node.props.accessibilityLabel === label)!;
}

describe('AgentQuestionModal decision lifecycle', () => {
    it('preserves custom-answer payload and closes after success', async () => {
        const { onClose, renderer } = renderModal();
        act(() => renderer.root.findByType('TextInput' as any).props.onChangeText('  Keep Happy features  '));
        await act(async () => { await pressable(renderer, 'agentQuestion.submit').props.onPress(); });
        expect(state.answer).toHaveBeenCalledOnce();
        expect(state.answer).toHaveBeenCalledWith(
            'session-1',
            'communication-1',
            { 'question-1': { options: [], custom: 'Keep Happy features' } },
            'form',
        );
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('submits once under synchronous duplicate presses', async () => {
        let release!: () => void;
        state.answer.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
        const { renderer } = renderModal();
        act(() => renderer.root.findByType('TextInput' as any).props.onChangeText('Answer'));
        const submit = pressable(renderer, 'agentQuestion.submit');
        let first!: Promise<void>;
        let duplicate!: Promise<void>;
        act(() => {
            first = submit.props.onPress();
            duplicate = submit.props.onPress();
        });
        expect(state.answer).toHaveBeenCalledOnce();
        release();
        await act(async () => { await Promise.all([first, duplicate]); });
        expect(state.answer).toHaveBeenCalledOnce();
    });

    it('keeps the draft and permits retry after a rejected answer', async () => {
        state.answer.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
        const { onClose, renderer } = renderModal();
        act(() => renderer.root.findByType('TextInput' as any).props.onChangeText('Keep this draft'));

        await act(async () => { await pressable(renderer, 'agentQuestion.submit').props.onPress(); });
        expect(onClose).not.toHaveBeenCalled();
        expect(renderer.root.findByType('TextInput' as any).props.value).toBe('Keep this draft');
        expect(renderer.root.findAllByType('Text' as any)
            .flatMap((node: { props: { children?: unknown } }) => node.props.children)
            .join(' ')).toContain('offline');

        await act(async () => { await pressable(renderer, 'agentQuestion.submit').props.onPress(); });
        expect(state.answer).toHaveBeenCalledTimes(2);
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('keeps a resolved request disabled when the same request is reopened', async () => {
        const { renderer } = renderModal();
        act(() => renderer.root.findByType('TextInput' as any).props.onChangeText('Keep this answer'));
        await act(async () => { await pressable(renderer, 'agentQuestion.submit').props.onPress(); });

        act(() => {
            renderer.update(React.createElement(AgentQuestionModal, {
                connected: true,
                onClose: vi.fn(),
                pending,
                sessionId: 'session-1',
                visible: false,
            }));
        });
        act(() => {
            renderer.update(React.createElement(AgentQuestionModal, {
                connected: true,
                onClose: vi.fn(),
                pending,
                sessionId: 'session-1',
                visible: true,
            }));
        });

        expect(renderer.root.findByType('TextInput' as any).props.value).toBe('Keep this answer');
        const submit = pressable(renderer, 'agentQuestion.submit');
        expect(submit.props.disabled).toBe(true);
        await act(async () => { await submit.props.onPress(); });
        expect(state.answer).toHaveBeenCalledOnce();
    });

    it('keeps a same-request reopen visibly disabled while cancellation is in flight', async () => {
        let release!: () => void;
        state.cancel.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
        const { onClose, renderer } = renderModal();
        let cancellation!: Promise<void>;
        act(() => { cancellation = pressable(renderer, 'common.cancel').props.onPress(); });
        expect(onClose).toHaveBeenCalledOnce();

        act(() => {
            renderer.update(React.createElement(AgentQuestionModal, {
                connected: true,
                onClose,
                pending,
                sessionId: 'session-1',
                visible: false,
            }));
        });
        act(() => {
            renderer.update(React.createElement(AgentQuestionModal, {
                connected: true,
                onClose,
                pending,
                sessionId: 'session-1',
                visible: true,
            }));
        });

        expect(pressable(renderer, 'common.cancel').props.disabled).toBe(true);
        expect(state.cancel).toHaveBeenCalledOnce();
        release();
        await act(async () => { await cancellation; });
    });

    it('keeps answers disabled while disconnected but still permits local close', async () => {
        const { onClose, renderer } = renderModal({ connected: false });
        expect(renderer.root.findByType('TextInput' as any).props.editable).toBe(false);
        const submit = pressable(renderer, 'agentQuestion.submit');
        expect(submit.props.disabled).toBe(true);
        await act(async () => { await pressable(renderer, 'common.cancel').props.onPress(); });
        expect(onClose).toHaveBeenCalledOnce();
        expect(state.cancel).not.toHaveBeenCalled();
    });
});
