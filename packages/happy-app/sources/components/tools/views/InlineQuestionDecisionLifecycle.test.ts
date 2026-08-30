import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ToolCall } from '@/sync/typesMessage';

const state = vi.hoisted(() => ({
    allow: vi.fn(),
    answer: vi.fn(),
    communication: null as any,
    presence: 'online' as 'online' | number,
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        Platform: { OS: 'web', select: (values: any) => values.web ?? values.default },
        Text: host('Text'),
        TouchableOpacity: host('TouchableOpacity'),
        View: host('View'),
    };
});
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Icon', props) };
});
vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (factory: any) => factory({ colors: {
        button: { primary: { background: '#111', tint: '#fff' } },
        divider: '#ddd',
        radio: { active: '#111', dot: '#fff', inactive: '#888' },
        surface: '#fff', surfaceHigh: '#eee', surfaceHighest: '#ddd',
        text: '#111', textSecondary: '#666',
    } }) },
    useUnistyles: () => ({ theme: { colors: { button: { primary: { tint: '#fff' } } } } }),
}));
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('@/sync/storage', () => ({
    useSession: () => ({ presence: state.presence }),
    useSessionAgentFormCommunication: () => state.communication,
}));
vi.mock('@/sync/ops', () => ({
    sessionAllow: state.allow,
    sessionAnswerQuestion: state.answer,
}));
vi.mock('../ToolSectionView', async () => {
    const ReactModule = await import('react');
    return { ToolSectionView: (props: any) => ReactModule.createElement('ToolSectionView', props, props.children) };
});

import { AskUserQuestionView } from './AskUserQuestionView';
import { RequestUserInputView } from './RequestUserInputView';

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
    state.allow.mockReset().mockResolvedValue(undefined);
    state.answer.mockReset().mockResolvedValue(undefined);
    state.presence = 'online';
    state.communication = {
        createdAt: 1,
        id: 'communication-1',
        kind: 'form',
        questions: [{
            allowCustom: false,
            header: 'Approach',
            id: 'question-1',
            multiSelect: false,
            options: [{ label: 'Use A', description: 'First path' }, { label: 'Use B' }],
            question: 'Which approach?',
            required: true,
        }],
        status: 'pending',
        toolUseId: 'tool-call-1',
    };
});

function render(element: React.ReactElement): ReactTestRenderer {
    let renderer!: ReactTestRenderer;
    act(() => { renderer = create(element); });
    return renderer;
}

function control(renderer: ReactTestRenderer, label: string) {
    return renderer.root.findAllByType('TouchableOpacity' as any)
        .find((node: { props: { accessibilityLabel?: string } }) => node.props.accessibilityLabel === label)!;
}

async function chooseAndSubmit(renderer: ReactTestRenderer) {
    act(() => control(renderer, 'Use A').props.onPress());
    await act(async () => { await control(renderer, 'tools.askUserQuestion.submit').props.onPress(); });
}

function requestTool(): ToolCall {
    return {
        callId: 'tool-call-1',
        completedAt: null,
        createdAt: 1,
        description: null,
        input: {},
        name: 'request_user_input',
        result: null,
        startedAt: 1,
        state: 'running',
    };
}

describe('inline Agent-question decision lifecycle', () => {
    it('preserves the communication answer payload', async () => {
        const renderer = render(React.createElement(RequestUserInputView, {
            metadata: null,
            messages: [],
            sessionId: 'session-1',
            tool: requestTool(),
        }));
        await chooseAndSubmit(renderer);
        expect(state.answer).toHaveBeenCalledOnce();
        expect(state.answer).toHaveBeenCalledWith(
            'session-1',
            'communication-1',
            { 'question-1': { options: ['Use A'] } },
            'form',
        );
    });

    it('preserves Claude AskUserQuestion updatedInput payload', async () => {
        const tool = requestTool();
        tool.name = 'AskUserQuestion';
        tool.permission = { id: 'permission-1', status: 'pending' };
        tool.input = {
            questions: [{
                header: 'Approach',
                multiSelect: false,
                options: [{ label: 'Use A', description: 'First path' }, { label: 'Use B' }],
                question: 'Which approach?',
            }],
        };
        const renderer = render(React.createElement(AskUserQuestionView, {
            metadata: null,
            messages: [],
            sessionId: 'session-1',
            tool,
        }));
        await chooseAndSubmit(renderer);
        expect(state.allow).toHaveBeenCalledOnce();
        expect(state.allow).toHaveBeenCalledWith(
            'session-1',
            'permission-1',
            undefined,
            undefined,
            'approved',
            { answers: { 'Which approach?': 'Use A' } },
        );
    });

    it('blocks synchronous duplicate answer submissions until authoritative resolution', async () => {
        let release!: () => void;
        state.answer.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
        const renderer = render(React.createElement(RequestUserInputView, {
            metadata: null,
            messages: [],
            sessionId: 'session-1',
            tool: requestTool(),
        }));
        act(() => control(renderer, 'Use A').props.onPress());
        const submit = control(renderer, 'tools.askUserQuestion.submit');
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

    it('projects a disconnected request without interactive choices', () => {
        state.presence = Date.now();
        const renderer = render(React.createElement(RequestUserInputView, {
            metadata: null,
            messages: [],
            sessionId: 'session-1',
            tool: requestTool(),
        }));
        expect(control(renderer, 'Use A').props.disabled).toBe(true);
        const text = renderer.root.findAllByType('Text' as any)
            .flatMap((node: { props: { children?: unknown } }) => node.props.children)
            .join(' ');
        expect(text).toContain('codexFirst.decisionDisconnected');
    });

    it('leaves a choice form with custom answers to the modal fallback', () => {
        state.communication = {
            ...state.communication,
            questions: [{
                ...state.communication.questions[0],
                allowCustom: true,
            }],
        };
        const renderer = render(React.createElement(RequestUserInputView, {
            metadata: null,
            messages: [],
            sessionId: 'session-1',
            tool: requestTool(),
        }));

        expect(renderer.toJSON()).toBeNull();
    });
});
