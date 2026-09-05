import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ToolCall } from '@/sync/typesMessage';

const state = vi.hoisted(() => ({
    clipboardSetString: vi.fn(),
    compact: false,
    routerPush: vi.fn(),
    scrollToEnd: vi.fn(),
    viewportHeight: 900,
    viewportWidth: 1200,
}));
const presentation = vi.hoisted(() => ({
    current: {
        compactRow: { fontSize: 14, gap: 8, lineHeight: 20, minHeight: 26, paddingHorizontal: 4, paddingVertical: 2 },
        disclosureRow: { fontSize: 13, lineHeight: 18, minHeight: 30, paddingHorizontal: 12, paddingVertical: 4 },
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
    const ScrollView = ReactModule.forwardRef((_props: any, ref) => {
        ReactModule.useImperativeHandle(ref, () => ({ scrollToEnd: state.scrollToEnd }));
        return ReactModule.createElement('ScrollView', _props, _props.children);
    });
    return {
        ActivityIndicator: host('ActivityIndicator'),
        Platform: { OS: 'web', select: (values: any) => values.default ?? values.web },
        Pressable: host('Pressable'),
        ScrollView,
        Text: host('Text'),
        TouchableOpacity: host('TouchableOpacity'),
        useWindowDimensions: () => ({ width: state.viewportWidth, height: state.viewportHeight, scale: 1, fontScale: 1 }),
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
vi.mock('expo-clipboard', () => ({ setStringAsync: state.clipboardSetString }));
vi.mock('expo-router', () => ({ useRouter: () => ({ push: state.routerPush }) }));
vi.mock('@/sync/storage', () => ({ useSetting: () => state.compact }));
vi.mock('@/hooks/useElapsedTime', () => ({ useElapsedTime: () => 1.2 }));
vi.mock('@/text', () => ({
    t: (key: string, params?: Record<string, unknown>) => params ? `${key}:${JSON.stringify(params)}` : key,
}));
vi.mock('@/utils/toolErrorParser', () => ({ parseToolUseError: () => ({ isToolUseError: false }) }));
vi.mock('@/components/tools/knownTools', () => ({
    knownTools: {},
    getToolCategoryIcon: () => null,
}));
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
        expect(flattenStyle(root.props.style)).toMatchObject({ backgroundColor: 'transparent', marginVertical: 2 });
        const views = renderer.root.findAllByType('View' as any);
        expect(views.some((node: { props: { style?: unknown } }) => flattenStyle(node.props.style).minHeight === 26)).toBe(true);
        expect(renderer.root.findAllByType('SpecificToolView' as any)).toHaveLength(0);
    });

    it('mounts a successful Studio terminal tool as a summary without its output body', () => {
        state.compact = true;
        const terminal = tool('Bash');
        terminal.input = { command: 'pnpm typecheck', cwd: '/tmp/happy' };
        terminal.result = { stdout: '\u001B[32msuccess output sentinel\u001B[0m', stderr: '' };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        expect(renderer.root.findAllByType('SpecificToolView' as any)).toHaveLength(0);
        const text = renderer.root.findAllByType('Text' as any).map((node: { props: { children?: unknown } }) => node.props.children).flat(Infinity).join('');
        expect(text).toContain('pnpm typecheck');
        expect(text).not.toContain('success output sentinel');
        const root = renderer.root.findAllByType('View' as any)[0];
        expect(flattenStyle(root.props.style)).toMatchObject({
            backgroundColor: 'transparent', marginVertical: 2,
        });
    });

    it('renders command, state, duration, non-zero exit, line count, and truncation in one summary line', () => {
        state.compact = false;
        const terminal = tool('CodexBash');
        terminal.state = 'error';
        terminal.input = { command: 'pnpm test\n-- --run' };
        terminal.startedAt = 100;
        terminal.completedAt = 1350;
        terminal.result = { stderr: 'first\nsecond\nthird', exitCode: 2, truncated: true };

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        const summary = renderer.root.findByProps({ testID: 'studio-tool-output-summary' });
        const summaryText = summary.findByType('Text' as any);
        const text = String(summaryText.props.children);

        expect(summaryText.props.numberOfLines).toBe(1);
        expect(text).toContain('pnpm test -- --run');
        expect(text).toContain('tools.fullView.error');
        expect(text).toContain('1.3s');
        expect(text).toContain('tools.outputDisclosure.exitCode:{"code":2}');
        expect(text).toContain('tools.outputDisclosure.lines:{"count":3}');
        expect(text).toContain('tools.outputDisclosure.truncated');
    });

    it('does not mount an output panel when a completed command has no output', () => {
        state.compact = false;
        const terminal = tool('Bash');
        terminal.input = { command: 'true' };
        terminal.result = { stdout: '', stderr: '' };

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));

        expect(renderer.root.findByProps({ testID: 'studio-tool-output-summary' })).toBeDefined();
        expect(renderer.root.findAllByProps({ testID: 'studio-tool-output-preview' })).toHaveLength(0);
        expect(renderer.root.findAllByProps({ testID: 'studio-tool-output-expanded' })).toHaveLength(0);
    });

    it('mounts only the last five bounded output lines while a Studio terminal tool is running', () => {
        state.compact = true;
        const terminal = tool('Bash');
        terminal.state = 'running';
        terminal.completedAt = null;
        terminal.input = { command: 'pnpm test --watch' };
        terminal.result = { stdout: Array.from({ length: 9 }, (_, index) => `running ${index + 1}`).join('\n') };

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        const preview = renderer.root.findByProps({ testID: 'studio-tool-output-preview' });
        const previewText = preview.findByType('Text' as any);

        expect(String(previewText.props.children)).toBe('running 5\nrunning 6\nrunning 7\nrunning 8\nrunning 9');
        expect(previewText.props.numberOfLines).toBeUndefined();
        expect(flattenStyle(preview.props.style).maxHeight).toBe(95);
    });

    it('bottom-aligns an unbroken running line inside the five-line clip instead of clamping its beginning', () => {
        const terminal = tool('Bash');
        terminal.state = 'running';
        terminal.completedAt = null;
        terminal.input = { command: 'generate-output' };
        terminal.result = { stdout: '界👩🏽‍💻é'.repeat(500) };

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        const preview = renderer.root.findByProps({ testID: 'studio-tool-output-preview' });
        const previewText = preview.findByType('Text' as any);

        expect(flattenStyle(preview.props.style)).toMatchObject({
            height: 95,
            maxHeight: 95,
            justifyContent: 'flex-end',
            overflow: 'hidden',
        });
        expect(flattenStyle(previewText.props.style).flexShrink).toBe(0);
        expect(previewText.props.numberOfLines).toBeUndefined();
    });

    it('mounts a bounded two-plus-eight failure preview with an omission marker', () => {
        const terminal = tool('Bash');
        terminal.state = 'error';
        terminal.input = { command: 'pnpm test' };
        terminal.result = { stderr: Array.from({ length: 15 }, (_, index) => `failure ${index + 1}`).join('\n') };

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        const preview = renderer.root.findByProps({ testID: 'studio-tool-output-preview' });
        const previewTexts = preview.findAllByType('Text' as any)
            .filter((node: { props: { testID?: string } }) => node.props.testID !== 'studio-tool-output-preview-measure');

        expect(previewTexts.map((node: { props: { children?: unknown } }) => node.props.children).join('\n')).toBe([
            'failure 1', 'failure 2', 'tools.outputDisclosure.omitted',
            'failure 8', 'failure 9', 'failure 10', 'failure 11',
            'failure 12', 'failure 13', 'failure 14', 'failure 15',
        ].join('\n'));
        expect(previewTexts[0]?.props.numberOfLines).toBe(2);
        expect(flattenStyle(renderer.root.findByProps({ testID: 'studio-tool-output-preview-head' }).props.style)).toMatchObject({ height: 38, overflow: 'hidden' });
        expect(flattenStyle(renderer.root.findByProps({ testID: 'studio-tool-output-preview-tail' }).props.style)).toMatchObject({ height: 152, justifyContent: 'flex-end', overflow: 'hidden' });
        expect(flattenStyle(preview.props.style).maxHeight).toBe(209);
    });

    it('copies complete sanitized failure output instead of the visible head-tail preview', async () => {
        state.clipboardSetString.mockResolvedValue(undefined);
        const terminal = tool('Bash');
        terminal.state = 'error';
        terminal.input = { command: 'pnpm test' };
        terminal.result = {
            stderr: `\u001B[31m${Array.from({ length: 15 }, (_, index) => `failure ${index + 1}`).join('\n')}\u001B[0m`,
        };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));

        const copyOutput = renderer.root.findByProps({ testID: 'studio-tool-copy-output' });
        expect(copyOutput.props.accessibilityRole).toBe('button');
        expect(copyOutput.props.accessibilityLabel).toBe('tools.outputDisclosure.copyOutput');
        await act(async () => {
            await copyOutput.props.onPress();
        });

        expect(state.clipboardSetString).toHaveBeenLastCalledWith(
            Array.from({ length: 15 }, (_, index) => `failure ${index + 1}`).join('\n'),
        );
        expect(state.clipboardSetString.mock.calls.at(-1)?.[0]).not.toContain('tools.outputDisclosure.omitted');
    });

    it('copies the complete sanitized multiline command while output stays collapsed', async () => {
        state.clipboardSetString.mockResolvedValue(undefined);
        const terminal = tool('Bash');
        terminal.input = { command: '\u001B[32mpython - <<\'PY\'\nprint("通过")\nPY\u001B[0m\u0007' };
        terminal.result = { stdout: 'done' };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));

        await act(async () => {
            await renderer.root.findByProps({ testID: 'studio-tool-copy-command' }).props.onPress();
        });

        expect(state.clipboardSetString).toHaveBeenLastCalledWith('python - <<\'PY\'\nprint("通过")\nPY');
        expect(renderer.root.findAllByProps({ testID: 'studio-tool-output-expanded' })).toHaveLength(0);
    });

    it('opens the existing full-transcript route from collapsed, preview, and expanded states', () => {
        state.routerPush.mockClear();
        const completed = tool('Bash');
        completed.input = { command: 'completed-command' };
        completed.result = { stdout: 'complete output' };
        const running = { ...completed, state: 'running' as const, completedAt: null };
        const failed = { ...completed, state: 'error' as const, result: { stderr: 'failure output' } };

        for (const [index, terminal] of [completed, running, failed].entries()) {
            const renderer = render(React.createElement(ToolView, {
                messageId: `message-${index}`,
                metadata: null,
                sessionId: 'session-1',
                tool: terminal,
            }));
            if (index === 2) {
                act(() => renderer.root.findByProps({ testID: 'studio-tool-output-summary' }).props.onPress());
            }
            const openFullTranscript = renderer.root.findByProps({ testID: 'studio-tool-open-full-transcript' });
            expect(openFullTranscript.props.accessibilityRole).toBe('button');
            expect(openFullTranscript.props.accessibilityLabel).toBe('tools.outputDisclosure.openFullTranscript');
            act(() => openFullTranscript.props.onPress());
            expect(state.routerPush).toHaveBeenLastCalledWith(`/session/session-1/message/message-${index}`);
        }
    });

    it('exposes a concise disclosure button name and its current expanded state', () => {
        const terminal = tool('Bash');
        terminal.input = { command: 'pnpm typecheck' };
        terminal.result = { stdout: 'verbose output must not become the accessible name' };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));

        const summary = renderer.root.findByProps({ testID: 'studio-tool-output-summary' });
        expect(summary.props.accessibilityRole).toBe('button');
        expect(summary.props.accessibilityLabel).toContain('pnpm typecheck');
        expect(summary.props.accessibilityLabel).toContain('tools.fullView.completed');
        expect(summary.props.accessibilityLabel).not.toContain('verbose output');
        expect(summary.props.accessibilityState).toEqual({ expanded: false });

        act(() => summary.props.onPress());
        expect(renderer.root.findByProps({ testID: 'studio-tool-output-summary' }).props.accessibilityState).toEqual({ expanded: true });
    });

    it('keeps streaming previews quiet and excludes hidden measurement text from the accessibility tree', () => {
        const terminal = tool('Bash');
        terminal.state = 'error';
        terminal.input = { command: 'failing-command' };
        terminal.result = { stderr: 'hidden full diagnostic '.repeat(500) };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));

        const preview = renderer.root.findByProps({ testID: 'studio-tool-output-preview' });
        const measurement = renderer.root.findByProps({ testID: 'studio-tool-output-preview-measure' });
        expect(preview.props.accessibilityLiveRegion).toBe('none');
        expect(measurement.props.accessible).toBe(false);
        expect(measurement.props.accessibilityElementsHidden).toBe(true);
        expect(measurement.props.importantForAccessibility).toBe('no-hide-descendants');
        expect(measurement.props.selectable).toBe(false);
        expect(renderer.root.findByProps({ testID: 'studio-tool-output-summary' }).props.accessibilityLabel).toContain('tools.fullView.error');
    });

    it('keeps the disclosure control mounted across automatic stream and terminal-state updates', () => {
        const running = tool('Bash');
        running.state = 'running';
        running.completedAt = null;
        running.input = { command: 'pnpm test --watch' };
        running.result = { stdout: 'streaming output' };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: running }));
        const focusedControl = renderer.root.findByProps({ testID: 'studio-tool-output-summary' });

        const completed = { ...running, state: 'completed' as const, completedAt: 1000, result: { stdout: 'streaming output\nfinished' } };
        act(() => renderer.update(React.createElement(ToolView, { metadata: null, tool: completed })));

        expect(renderer.root.findByProps({ testID: 'studio-tool-output-summary' })).toBe(focusedControl);
        expect(focusedControl.props.accessibilityState).toEqual({ expanded: false });
    });

    it('recomputes a single wrapped failure line into first-two and last-eight visual clips', () => {
        const terminal = tool('Bash');
        terminal.state = 'error';
        terminal.input = { command: 'failing-command' };
        terminal.result = { stderr: '失败👩🏽‍💻é'.repeat(500) };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));

        const measure = renderer.root.findByProps({ testID: 'studio-tool-output-preview-measure' });
        act(() => measure.props.onLayout({ nativeEvent: { layout: { height: 285 } } }));

        const head = renderer.root.findByProps({ testID: 'studio-tool-output-preview-head' });
        const tail = renderer.root.findByProps({ testID: 'studio-tool-output-preview-tail' });
        expect(flattenStyle(head.props.style)).toMatchObject({ height: 38, overflow: 'hidden' });
        expect(flattenStyle(tail.props.style)).toMatchObject({ height: 152, justifyContent: 'flex-end', overflow: 'hidden' });
        const visibleText = renderer.root.findByProps({ testID: 'studio-tool-output-preview' })
            .findAllByType('Text' as any)
            .filter((node: { props: { testID?: string } }) => node.props.testID !== 'studio-tool-output-preview-measure')
            .map((node: { props: { children?: unknown } }) => node.props.children)
            .flat(Infinity)
            .join('');
        expect(visibleText).toContain('tools.outputDisclosure.omitted');
    });

    it('toggles complete inline output inside the smaller viewport-bound height', () => {
        const terminal = tool('Bash');
        terminal.input = { command: 'pnpm typecheck' };
        terminal.result = { stdout: 'complete output sentinel' };

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        const summary = renderer.root.findByProps({ testID: 'studio-tool-output-summary' });

        act(() => summary.props.onPress());
        const expanded = renderer.root.findByProps({ testID: 'studio-tool-output-expanded' });
        const expandedText = expanded.findAllByType('Text' as any)
            .map((node: { props: { children?: unknown } }) => node.props.children)
            .flat(Infinity)
            .join('');
        expect(expandedText).toContain('complete output sentinel');
        expect(flattenStyle(expanded.props.style).maxHeight).toBe(360);

        act(() => renderer.root.findByProps({ testID: 'studio-tool-output-summary' }).props.onPress());
        expect(renderer.root.findAllByProps({ testID: 'studio-tool-output-expanded' })).toHaveLength(0);
    });

    it('caps complete inline output at 480 pixels on a tall viewport', () => {
        state.viewportHeight = 2000;
        const terminal = tool('Bash');
        terminal.input = { command: 'pnpm typecheck' };
        terminal.result = { stdout: 'complete output sentinel' };

        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        act(() => renderer.root.findByProps({ testID: 'studio-tool-output-summary' }).props.onPress());

        expect(flattenStyle(renderer.root.findByProps({ testID: 'studio-tool-output-expanded' }).props.style).maxHeight).toBe(480);
        state.viewportHeight = 900;
    });

    it('keeps the mounted manual disclosure state authoritative across output and terminal-state updates', () => {
        const running = tool('Bash');
        running.state = 'running';
        running.completedAt = null;
        running.input = { command: 'pnpm test --watch' };
        running.result = { stdout: 'streaming 1' };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: running }));

        act(() => renderer.root.findByProps({ testID: 'studio-tool-output-summary' }).props.onPress());
        expect(renderer.root.findAllByProps({ testID: 'studio-tool-output-expanded' }).length).toBeGreaterThan(0);

        const completed = { ...running, state: 'completed' as const, completedAt: 1000, result: { stdout: 'streaming 1\nfinished' } };
        act(() => renderer.update(React.createElement(ToolView, { metadata: null, tool: completed })));
        expect(renderer.root.findAllByProps({ testID: 'studio-tool-output-expanded' }).length).toBeGreaterThan(0);

        act(() => renderer.root.findByProps({ testID: 'studio-tool-output-summary' }).props.onPress());
        const failed = { ...completed, state: 'error' as const, result: { stderr: 'failure diagnostic' } };
        act(() => renderer.update(React.createElement(ToolView, { metadata: null, tool: failed })));
        expect(renderer.root.findAllByProps({ testID: 'studio-tool-output-preview' })).toHaveLength(0);
        expect(renderer.root.findAllByProps({ testID: 'studio-tool-output-expanded' })).toHaveLength(0);
    });

    it('follows expanded streaming output only while its internal viewport is at the end', () => {
        state.scrollToEnd.mockClear();
        const running = tool('Bash');
        running.state = 'running';
        running.completedAt = null;
        running.input = { command: 'stream-output' };
        running.result = { stdout: 'line 1' };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: running }));
        act(() => renderer.root.findByProps({ testID: 'studio-tool-output-summary' }).props.onPress());
        const expanded = renderer.root.findByProps({ testID: 'studio-tool-output-expanded' });

        act(() => expanded.props.onContentSizeChange(500, 900));
        expect(state.scrollToEnd).toHaveBeenLastCalledWith({ animated: false });

        act(() => expanded.props.onScroll({
            nativeEvent: {
                contentOffset: { y: 200 },
                contentSize: { height: 900 },
                layoutMeasurement: { height: 400 },
            },
        }));
        state.scrollToEnd.mockClear();
        act(() => expanded.props.onContentSizeChange(500, 950));
        expect(state.scrollToEnd).not.toHaveBeenCalled();
    });

    it('keeps preview height and component identity bounded across large streaming updates', () => {
        const running = tool('Bash');
        running.state = 'running';
        running.completedAt = null;
        running.input = { command: 'stream-output' };
        running.result = { stdout: Array.from({ length: 20 }, (_, index) => `line ${index}`).join('\n') };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: running }));
        const preview = renderer.root.findByProps({ testID: 'studio-tool-output-preview' });

        const updated = {
            ...running,
            result: { stdout: Array.from({ length: 2000 }, (_, index) => `line ${index}`).join('\n') },
        };
        act(() => renderer.update(React.createElement(ToolView, { metadata: null, tool: updated })));

        expect(renderer.root.findByProps({ testID: 'studio-tool-output-preview' })).toBe(preview);
        expect(flattenStyle(preview.props.style)).toMatchObject({ height: 95, maxHeight: 95, overflow: 'hidden' });
    });

    it('recomputes expanded height on viewport resize without losing mounted manual state', () => {
        state.viewportHeight = 900;
        const terminal = tool('Bash');
        terminal.input = { command: 'resize-output' };
        terminal.result = { stdout: 'complete output' };
        const renderer = render(React.createElement(ToolView, { metadata: null, tool: terminal }));
        const summary = renderer.root.findByProps({ testID: 'studio-tool-output-summary' });
        act(() => summary.props.onPress());
        expect(flattenStyle(renderer.root.findByProps({ testID: 'studio-tool-output-expanded' }).props.style).maxHeight).toBe(360);

        state.viewportHeight = 600;
        const resizedTool = { ...terminal, result: { stdout: 'complete output after resize' } };
        act(() => renderer.update(React.createElement(ToolView, { metadata: null, tool: resizedTool })));

        expect(renderer.root.findByProps({ testID: 'studio-tool-output-summary' })).toBe(summary);
        expect(summary.props.accessibilityState).toEqual({ expanded: true });
        expect(flattenStyle(renderer.root.findByProps({ testID: 'studio-tool-output-expanded' }).props.style).maxHeight).toBe(240);
        state.viewportHeight = 900;
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
        expect(flattenStyle(root.props.style)).toMatchObject({ backgroundColor: 'transparent', marginVertical: 2 });
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
            disclosureRow: { fontSize: 13, lineHeight: 18, minHeight: 30, paddingHorizontal: 12, paddingVertical: 4 },
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
        expect(flattenStyle(root.props.style)).toMatchObject({ backgroundColor: 'transparent', marginVertical: 2 });
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
        expect(flattenStyle(root.props.style)).toMatchObject({ backgroundColor: 'transparent', marginVertical: 2 });
    });
});
