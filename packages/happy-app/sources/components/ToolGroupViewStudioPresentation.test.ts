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
vi.mock('@/text', () => ({ t: (key: string, values?: { count?: number }) => values?.count ? `${key}:${values.count}` : key }));
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
