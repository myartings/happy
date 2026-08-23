import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { ToolCallMessage } from '@/sync/typesMessage';

const presentation = vi.hoisted(() => ({
    current: {
        activity: {
            terminalColor: '#327078', exploreColor: '#3F6B8F', editColor: '#2E6A4F',
            taskColor: '#76558B', neutralColor: '#707070', runningColor: '#327078',
            errorColor: '#A23D3D',
        },
        visualStyle: 'studio',
    } as any,
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        Pressable: host('Pressable'),
        Text: host('Text'),
        View: host('View'),
    };
});

vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (factory: any) => typeof factory === 'function' ? factory({ colors: { textSecondary: '#666' } }) : factory },
    useUnistyles: () => ({ theme: { colors: { textSecondary: '#666' } } }),
}));
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    const icon = (props: any) => ReactModule.createElement('Icon', props);
    return { Ionicons: icon, Octicons: icon };
});
vi.mock('expo-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/hooks/useElapsedTime', () => ({ useElapsedTime: () => 1 }));
vi.mock('@/text', () => ({
    t: (key: string, values?: { count?: number; duration?: string }) => values?.count
        ? `${key}:${values.count}`
        : values?.duration
            ? `${key}:${values.duration}`
            : key,
}));
vi.mock('./layout', () => ({ layout: { maxWidth: 800 } }));
vi.mock('@/components/tools/knownTools', () => ({ knownTools: {} }));
vi.mock('./MessageView', async () => {
    const ReactModule = await import('react');
    return { MessageView: (props: any) => ReactModule.createElement('MessageView', props) };
});
vi.mock('@/features/studio-tool-presentation/useStudioToolPresentation', () => ({
    useStudioToolPresentation: () => presentation.current,
}));

import { ToolGroupView } from './ToolGroupView';
import { resolveStudioToolOutputDisclosure } from '@/features/studio-tool-output-disclosure/studioToolOutputDisclosure';

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

function message(name: string, state: 'running' | 'completed' | 'error' = 'completed'): ToolCallMessage {
    return {
        kind: 'tool-call', id: `${name}-${state}`, localId: null, createdAt: 1, children: [],
        tool: {
            name, state, input: name === 'Read' ? { file_path: '/repo/app.tsx' } : { changes: { '/repo/app.tsx': {} } },
            createdAt: 1, startedAt: 1, completedAt: state === 'running' ? null : 2, description: null,
        },
    };
}

describe('actual ToolGroupView Studio activity wiring', () => {
    it('opens a completed terminal group as child disclosure summaries without eager output', () => {
        const first = message('Bash');
        first.tool.input = { command: 'first-command' };
        first.tool.result = { stdout: 'first eager-output sentinel' };
        const second = message('CodexBash');
        second.tool.input = { command: 'second-command' };
        second.tool.result = { stdout: 'second eager-output sentinel' };

        const renderer = render(React.createElement(ToolGroupView, {
            group: { type: 'tool-group', id: 'group-terminal', messages: [first, second], hasRunning: false, hasPendingPermission: false },
            metadata: null, sessionId: 'session-1', expanded: true, onToggle: vi.fn(),
        }));

        const childDisclosures = renderer.root.findAllByType('MessageView' as any);
        expect(childDisclosures).toHaveLength(2);
        expect(childDisclosures.map((node: any) => node.props.message.id)).toEqual([first.id, second.id]);
        const text = renderer.root.findAllByType('Text' as any)
            .map((node: any) => node.props.children)
            .flat(Infinity)
            .join('');
        expect(text).not.toContain('eager-output sentinel');
    });

    it('adds available duration and non-zero failure count to the Studio group summary', () => {
        const completed = message('Bash');
        completed.tool.startedAt = 1000;
        completed.tool.completedAt = 2000;
        const failed = message('CodexBash', 'error');
        failed.tool.startedAt = 1500;
        failed.tool.completedAt = 3500;
        const renderer = render(React.createElement(ToolGroupView, {
            group: { type: 'tool-group', id: 'group-summary', messages: [completed, failed], hasRunning: false, hasPendingPermission: false },
            metadata: null, sessionId: 'session-1', expanded: false, onToggle: vi.fn(),
        }));

        const text = renderer.root.findAllByType('Text' as any)
            .map((node: any) => node.props.children)
            .flat(Infinity)
            .join('');
        expect(text).toContain('toolGroup.ranCommands:2');
        expect(text).toContain('toolGroup.workedFor:2s');
        expect(text).toContain('toolGroup.failedTools:1');
    });

    it('keeps Studio disclosure children mounted while their group is collapsed', () => {
        const terminal = message('Bash');
        terminal.tool.input = { command: 'long-running-command' };
        terminal.tool.result = { stdout: 'output' };
        const props = {
            group: { type: 'tool-group' as const, id: 'group-state', messages: [terminal], hasRunning: false, hasPendingPermission: false },
            metadata: null, sessionId: 'session-1', onToggle: vi.fn(),
        };
        const renderer = render(React.createElement(ToolGroupView, { ...props, expanded: true }));
        const childBeforeCollapse = renderer.root.findByType('MessageView' as any);

        act(() => renderer.update(React.createElement(ToolGroupView, { ...props, expanded: false })));

        const childWhileCollapsed = renderer.root.findByType('MessageView' as any);
        expect(childWhileCollapsed).toBe(childBeforeCollapse);
        expect(renderer.root.findAllByType('View' as any).some(
            (node: any) => node.props.accessibilityElementsHidden === true,
        )).toBe(true);

        act(() => renderer.update(React.createElement(ToolGroupView, { ...props, expanded: true })));
        expect(renderer.root.findByType('MessageView' as any)).toBe(childBeforeCollapse);
    });

    it('composes completed, running, failed, and pending terminal children through disclosure views', () => {
        const completed = message('Bash');
        completed.tool.input = { command: 'completed-command' };
        completed.tool.result = { stdout: 'completed output' };
        const running = message('CodexBash', 'running');
        running.tool.input = { command: 'running-command' };
        running.tool.result = { stdout: 'running output' };
        const failed = message('Bash', 'error');
        failed.id = 'Bash-error-2';
        failed.tool.input = { command: 'failed-command' };
        failed.tool.result = { stderr: 'failed output' };
        const pending = message('CodexBash', 'running');
        pending.id = 'CodexBash-pending';
        pending.tool.input = { command: 'pending-command' };
        pending.tool.permission = { status: 'pending' } as any;
        const messages = [completed, running, failed, pending];

        const renderer = render(React.createElement(ToolGroupView, {
            group: { type: 'tool-group', id: 'group-mixed', messages, hasRunning: true, hasPendingPermission: true },
            metadata: null, sessionId: 'session-1', expanded: true, onToggle: vi.fn(),
        }));

        expect(renderer.root.findAllByType('MessageView' as any).map((node: any) => node.props.message.id))
            .toEqual(messages.map((item) => item.id));
        expect(messages.map((item) => resolveStudioToolOutputDisclosure(item.tool)?.presentation))
            .toEqual(['collapsed', 'preview', 'preview', 'collapsed']);
        expect(resolveStudioToolOutputDisclosure(pending.tool)?.summary.status).toBe('pending-permission');
    });

    it('colors completed explore activity using the Studio semantic role', () => {
        const read = message('Read');
        const renderer = render(React.createElement(ToolGroupView, {
            group: { type: 'tool-group', id: 'group-read', messages: [read], hasRunning: false, hasPendingPermission: false },
            metadata: null, sessionId: 'session-1', expanded: true, onToggle: vi.fn(),
        }));

        const icons = renderer.root.findAllByType('Icon' as any);
        expect(icons.filter((node: any) => node.props.color === '#3F6B8F').length).toBeGreaterThanOrEqual(2);
        const labels = renderer.root.findAllByType('Text' as any)
            .filter((node: any) => flattenStyle(node.props.style).color === '#3F6B8F');
        expect(labels.length).toBeGreaterThanOrEqual(2);
    });

    it('lets failure state override the edit category and preserves Default colors', () => {
        const edit = message('CodexPatch', 'error');
        const studio = render(React.createElement(ToolGroupView, {
            group: { type: 'tool-group', id: 'group-edit', messages: [edit], hasRunning: false, hasPendingPermission: false },
            metadata: null, sessionId: 'session-1', expanded: true, onToggle: vi.fn(),
        }));
        expect(studio.root.findAllByType('Icon' as any).some((node: any) => node.props.color === '#A23D3D')).toBe(true);

        presentation.current = null as any;
        const fallback = render(React.createElement(ToolGroupView, {
            group: { type: 'tool-group', id: 'group-default', messages: [edit], hasRunning: false, hasPendingPermission: false },
            metadata: null, sessionId: 'session-1', expanded: true, onToggle: vi.fn(),
        }));
        expect(fallback.root.findAllByType('Icon' as any).every((node: any) => node.props.color === '#666')).toBe(true);
        expect(fallback.root.findAllByType('Text' as any).some((node: any) => flattenStyle(node.props.style).color === '#A23D3D')).toBe(false);
        presentation.current = {
            activity: {
                terminalColor: '#327078', exploreColor: '#3F6B8F', editColor: '#2E6A4F',
                taskColor: '#76558B', neutralColor: '#707070', runningColor: '#327078',
                errorColor: '#A23D3D',
            },
            visualStyle: 'studio',
        } as any;
    });
});
