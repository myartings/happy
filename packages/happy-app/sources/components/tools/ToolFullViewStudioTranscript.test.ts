import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
    (globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = false;
});

const presentation = vi.hoisted(() => ({
    transcript: {
        dark: false,
        commandColor: '#2D2D2D',
        errorColor: '#A23D3D',
        metadataColor: '#707070',
        promptColor: '#327078',
        stderrColor: '#A23D3D',
        stdoutColor: '#424242',
    },
    shell: { backgroundColor: '#FAFAF9' },
} as any));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        Platform: { OS: 'web', select: (values: any) => values.default ?? values.web },
        ScrollView: host('ScrollView'),
        Text: host('Text'),
        View: host('View'),
        useWindowDimensions: () => ({ width: 1200, height: 900, scale: 1, fontScale: 1 }),
    };
});
vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (factory: any) => typeof factory === 'function' ? factory({ colors: {
        box: { error: { background: '#fee', border: '#fbb', text: '#900' } },
        groupped: { background: '#fff' }, text: '#111', textSecondary: '#666',
    } }) : factory },
    useUnistyles: () => ({ theme: { colors: { text: '#111', textSecondary: '#666' } } }),
}));
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Icon', props), Octicons: (props: any) => ReactModule.createElement('Icon', props) };
});
vi.mock('@/sync/storage', () => ({ useLocalSetting: () => false }));
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('@/features/studio-tool-presentation/useStudioToolPresentation', () => ({ useStudioToolPresentation: () => presentation }));
vi.mock('../layout', () => ({ layout: { maxWidth: 800 } }));
vi.mock('./views/_all', async () => {
    const ReactModule = await import('react');
    return {
        getToolFullViewComponent: () => () => ReactModule.createElement('LegacySpecializedFullView'),
    };
});

import { ToolFullView } from './ToolFullView';

function render(element: React.ReactElement): ReactTestRenderer {
    let renderer!: ReactTestRenderer;
    act(() => { renderer = create(element); });
    return renderer;
}

describe('ToolFullView Studio transcript wiring', () => {
    it('uses the complete Studio transcript for a Codex command with successful output', () => {
        const renderer = render(React.createElement(ToolFullView, {
            tool: {
                name: 'CodexBash',
                state: 'completed',
                input: { command: 'pnpm test' },
                result: { stdout: 'complete Codex success sentinel' },
                createdAt: 1,
                startedAt: 1,
                completedAt: 2,
                description: null,
            },
        }));

        const transcript = renderer.root.findByProps({ testID: 'studio-tool-full-transcript' });
        const text = transcript.findAllByType('Text' as any)
            .map((node: { props: { children?: unknown } }) => node.props.children)
            .flat(Infinity)
            .join('');
        expect(text).toContain('complete Codex success sentinel');
    });
});
