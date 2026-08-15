import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ToolCall } from '@/sync/typesMessage';

const state = vi.hoisted(() => ({ compact: false }));
const presentation = vi.hoisted(() => ({
    current: {
        compactRow: { fontSize: 14, gap: 8, lineHeight: 20, minHeight: 26, paddingHorizontal: 4, paddingVertical: 2 },
        error: { backgroundColor: '#FFF8F7', borderColor: '#E9CFCC', borderRadius: 8, marginBottom: 10, padding: 10, textColor: '#973D37' },
        header: { backgroundColor: '#FAFAF9', borderColor: '#E7E6E3', descriptionFontSize: 12, minHeight: 42, paddingHorizontal: 12, paddingVertical: 9, titleFontSize: 13 },
        section: { marginBottom: 10, titleFontSize: 11, titleLetterSpacing: 0.55, titleLineHeight: 16 },
        shell: { backgroundColor: '#F7F7F6', borderColor: '#E7E6E3', borderRadius: 12, borderWidth: 1, marginVertical: 6 },
        transcript: { dark: false, backgroundColor: '#FAFAF9', borderColor: '#E7E6E3', borderRadius: 8, commandColor: '#2D2D2D', errorColor: '#A23D3D', fontSize: 13, lineHeight: 19, metadataColor: '#707070', paddingHorizontal: 12, paddingVertical: 10, promptColor: '#327078', runningColor: '#327078', stderrColor: '#A23D3D', stdoutColor: '#424242', successColor: '#2E6A4F' },
        visualStyle: 'studio',
    } as any,
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        Platform: { OS: 'web', select: (values: any) => values.default ?? values.web },
        Text: host('Text'),
        TouchableOpacity: host('TouchableOpacity'),
        View: host('View'),
    };
});

vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (factory: any) => typeof factory === 'function' ? factory({ colors: {
        box: { error: { background: '#fee', border: '#fbb', text: '#900' }, warning: { text: '#a60' } },
        surfaceHigh: '#eee', surfaceHighest: '#ddd', text: '#111', textSecondary: '#666', warning: '#a60',
    } }) : factory },
    useUnistyles: () => ({ theme: { colors: { text: '#111', textSecondary: '#666', warning: '#a60' } } }),
}));

vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    const icon = (props: any) => ReactModule.createElement('Icon', props);
    return { Ionicons: icon, Octicons: icon };
});
vi.mock('expo-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/sync/storage', () => ({ useSetting: () => state.compact }));
vi.mock('@/hooks/useElapsedTime', () => ({ useElapsedTime: () => 1.2 }));
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('@/utils/toolErrorParser', () => ({ parseToolUseError: () => ({ isToolUseError: false }) }));
vi.mock('@/components/tools/knownTools', () => ({ knownTools: {} }));
vi.mock('@/components/CodeView', async () => {
    const ReactModule = await import('react');
    return { CodeView: (props: any) => ReactModule.createElement('CodeView', props) };
});
vi.mock('./views/_all', async () => {
    const ReactModule = await import('react');
    return { getToolViewComponent: () => (props: any) => ReactModule.createElement('SpecificToolView', props) };
});
vi.mock('./PermissionFooter', () => ({ PermissionFooter: () => null }));
vi.mock('@/features/studio-tool-presentation/useStudioToolPresentation', () => ({
    useStudioToolPresentation: () => presentation.current,
}));

import { ToolView } from './ToolView';

const originalConsoleError = console.error;
beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});
afterAll(() => vi.restoreAllMocks());

function render(element: React.ReactElement): ReactTestRenderer {
    let renderer!: ReactTestRenderer;
    act(() => { renderer = create(element); });
    return renderer;
}

function flattenStyle(style: unknown): Record<string, any> {
    if (!Array.isArray(style)) return style && typeof style === 'object' ? style as Record<string, any> : {};
    return Object.assign({}, ...style.map(flattenStyle));
}

function tool(name = 'Example'): ToolCall {
    return {
        name,
        state: 'completed',
        input: { value: 1 },
        result: 'done',
        createdAt: 1,
        startedAt: 1,
        completedAt: 2,
        description: null,
    };
}

describe('actual ToolView Studio wiring', () => {
    it('uses the Studio contained shell and retains header press/content behavior', () => {
        state.compact = false;
        const onPress = vi.fn();
        const renderer = render(React.createElement(ToolView, { metadata: null, onPress, tool: tool() }));
        const root = renderer.root.findAllByType('View' as any)[0];
        expect(flattenStyle(root.props.style)).toMatchObject({
            backgroundColor: '#F7F7F6', borderColor: '#E7E6E3', borderRadius: 12, borderWidth: 1, marginVertical: 6,
        });
        const header = renderer.root.findByType('TouchableOpacity' as any);
        expect(flattenStyle(header.props.style)).toMatchObject({ minHeight: 42, paddingHorizontal: 12, paddingVertical: 9 });
        act(() => header.props.onPress());
        expect(onPress).toHaveBeenCalledOnce();
        expect(renderer.root.findAllByType('SpecificToolView' as any)).toHaveLength(1);
    });

    it('keeps compact activities unboxed and suppresses expanded content', () => {
        state.compact = true;
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: tool('Read') }));
        const root = renderer.root.findAllByType('View' as any)[0];
        expect(flattenStyle(root.props.style)).toMatchObject({ backgroundColor: 'transparent', marginVertical: 1 });
        const views = renderer.root.findAllByType('View' as any);
        expect(views.some((node: { props: { style?: unknown } }) => flattenStyle(node.props.style).minHeight === 26)).toBe(true);
        expect(renderer.root.findAllByType('SpecificToolView' as any)).toHaveLength(0);
    });

    it('renders real Studio terminal tools as structured transcripts even when compact mode is enabled', () => {
        state.compact = true;
        const terminal = tool('Bash');
        terminal.input = { command: 'pnpm typecheck', cwd: '/tmp/happy' };
        terminal.result = { stdout: '\u001B[32m通过\u001B[0m', stderr: '' };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        expect(renderer.root.findAllByType('SpecificToolView' as any)).toHaveLength(0);
        const text = renderer.root.findAllByType('Text' as any).map((node: { props: { children?: unknown } }) => node.props.children).flat(Infinity).join('');
        expect(text).toContain('pnpm typecheck');
        expect(text).toContain('/tmp/happy');
        expect(text).toContain('通过');
        expect(text).not.toContain('\u001B');
        const selectableText = renderer.root.findAllByType('Text' as any)
            .filter((node: { props: { selectable?: boolean } }) => node.props.selectable === true);
        expect(selectableText.length).toBeGreaterThanOrEqual(4);
        const root = renderer.root.findAllByType('View' as any)[0];
        expect(flattenStyle(root.props.style)).toMatchObject({
            backgroundColor: '#F7F7F6', borderColor: '#E7E6E3', borderRadius: 12,
        });
    });

    it('renders structured Studio Codex patches even when compact mode is enabled', () => {
        state.compact = true;
        const patch = tool('CodexPatch');
        patch.input = {
            changes: {
                'src/app.ts': {
                    kind: { type: 'update', move_path: null },
                    modify: { old_content: 'const value = 1;', new_content: 'const value = 2;' },
                },
            },
        };

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: patch }));

        expect(renderer.root.findAllByType('SpecificToolView' as any)).toHaveLength(1);
    });

    it.each([
        ['missing changes', { value: 1 }],
        ['empty changes', { changes: {} }],
        ['malformed entry', { changes: { 'src/app.ts': null } }],
        ['empty patch', { changes: { 'src/app.ts': { diff: '', kind: { type: 'update' } } } }],
        ['empty content pair', { changes: { 'src/app.ts': { modify: { old_content: '', new_content: '' } } } }],
        ['malformed object modify content', { changes: { 'src/app.ts': { modify: { old_content: 5, new_content: 'new' } } } }],
        ['malformed array modify content', { changes: [{ path: 'src/app.ts', type: 'update', modify: { old_content: 5, new_content: 'new' } }] }],
        ['malformed add content', { changes: { 'src/app.ts': { add: { content: 5 } } } }],
        ['malformed delete content', { changes: { 'src/app.ts': { delete: { content: 5 } } } }],
    ])('keeps Studio Codex patches with %s on the safe compact fallback', (_label, input) => {
        state.compact = true;
        const patch = tool('CodexPatch');
        patch.input = input;

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: patch }));

        expect(renderer.root.findAllByType('SpecificToolView' as any)).toHaveLength(0);
        const root = renderer.root.findAllByType('View' as any)[0];
        expect(flattenStyle(root.props.style)).toMatchObject({ backgroundColor: 'transparent', marginVertical: 1 });
    });

    it('retains the existing shell when Studio is inactive', () => {
        state.compact = false;
        presentation.current = null as any;
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: tool() }));
        const root = renderer.root.findAllByType('View' as any)[0];
        expect(flattenStyle(root.props.style)).toMatchObject({ backgroundColor: '#eee', borderRadius: 8, marginVertical: 8 });
        expect(flattenStyle(root.props.style).borderWidth).toBeUndefined();
        presentation.current = {
            compactRow: { fontSize: 14, gap: 8, lineHeight: 20, minHeight: 26, paddingHorizontal: 4, paddingVertical: 2 },
            header: { backgroundColor: '#FAFAF9', borderColor: '#E7E6E3', descriptionFontSize: 12, minHeight: 42, paddingHorizontal: 12, paddingVertical: 9, titleFontSize: 13 },
            shell: { backgroundColor: '#F7F7F6', borderColor: '#E7E6E3', borderRadius: 12, borderWidth: 1, marginVertical: 6 },
            transcript: { dark: false, backgroundColor: '#FAFAF9', borderColor: '#E7E6E3', borderRadius: 8, commandColor: '#2D2D2D', errorColor: '#A23D3D', fontSize: 13, lineHeight: 19, metadataColor: '#707070', paddingHorizontal: 12, paddingVertical: 10, promptColor: '#327078', runningColor: '#327078', stderrColor: '#A23D3D', stdoutColor: '#424242', successColor: '#2E6A4F' },
        } as any;
    });

    it('keeps non-Studio terminal tools on the existing compact path', () => {
        state.compact = true;
        presentation.current = null as any;
        const terminal = tool('Bash');
        terminal.input = { command: 'pnpm typecheck' };
        terminal.result = { stdout: 'done', stderr: '' };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        expect(renderer.root.findAllByType('SpecificToolView' as any)).toHaveLength(0);
        const root = renderer.root.findAllByType('View' as any)[0];
        expect(flattenStyle(root.props.style)).toMatchObject({ backgroundColor: 'transparent', marginVertical: 1 });
    });

    it('keeps non-Studio Codex patches on the existing compact path', () => {
        state.compact = true;
        presentation.current = null as any;
        const patch = tool('CodexPatch');
        patch.input = {
            changes: {
                'src/app.ts': {
                    kind: { type: 'update', move_path: null },
                    modify: { old_content: 'old', new_content: 'new' },
                },
            },
        };

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: patch }));

        expect(renderer.root.findAllByType('SpecificToolView' as any)).toHaveLength(0);
        const root = renderer.root.findAllByType('View' as any)[0];
        expect(flattenStyle(root.props.style)).toMatchObject({ backgroundColor: 'transparent', marginVertical: 1 });
    });
});
