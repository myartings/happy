import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ToolCall } from '@/sync/typesMessage';

const presentation = vi.hoisted(() => ({ current: {
    compactRow: { fontSize: 14, lineHeight: 20, minHeight: 26, paddingHorizontal: 4, paddingVertical: 2 },
    disclosureRow: { fontSize: 13, lineHeight: 18, minHeight: 30, paddingHorizontal: 12, paddingVertical: 4 },
    diff: {
        addedColor: '#2E6A4F', backgroundColor: '#FAFAF9', borderColor: '#E7E6E3', borderRadius: 10,
        metadataColor: '#707070', pathColor: '#2D2D2D', removedColor: '#A23D3D',
    },
} as any }));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return { Pressable: host('Pressable'), Text: host('Text'), View: host('View') };
});
vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (factory: any) => factory({ colors: {
        divider: '#ddd', surface: '#fff', surfaceHigh: '#eee', text: '#111', textSecondary: '#666',
    } }) },
    useUnistyles: () => ({ theme: { colors: { textSecondary: '#666' } } }),
}));
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    const icon = (props: any) => ReactModule.createElement('Icon', props);
    return { Ionicons: icon, Octicons: icon };
});
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('@/utils/pathUtils', () => ({ resolvePath: (path: string) => `/repo/${path}` }));
vi.mock('../ToolSectionView', async () => {
    const ReactModule = await import('react');
    return { ToolSectionView: (props: any) => ReactModule.createElement('ToolSectionView', props, props.children) };
});
vi.mock('@/components/tools/ToolDiffView', async () => {
    const ReactModule = await import('react');
    return { ToolDiffView: (props: any) => ReactModule.createElement('ToolDiffView', props) };
});
vi.mock('@/features/studio-tool-presentation/useStudioToolPresentation', () => ({
    useStudioToolPresentation: () => presentation.current,
}));

import { CodexPatchView } from './CodexPatchView';

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

const patchTool: ToolCall = {
    name: 'CodexPatch',
    state: 'completed',
    input: {
        changes: {
            'src/app.ts': {
                kind: { type: 'update', move_path: null },
                modify: { old_content: 'const value = 1;', new_content: 'const value = 2;' },
            },
        },
    },
    result: 'done',
    createdAt: 1,
    startedAt: 1,
    completedAt: 2,
    description: null,
};

describe('actual CodexPatch disclosure wiring', () => {
    it('keeps the collapsed default and reveals the existing diff/footer hierarchy on press', () => {
        const footer = React.createElement('PermissionFooterMarker');
        const renderer = render(React.createElement(CodexPatchView, {
            metadata: null,
            permissionFooter: footer,
            tool: patchTool,
        }));

        expect(renderer.root.findAllByType('ToolDiffView' as any)).toHaveLength(0);
        const toggle = renderer.root.findByType('Pressable' as any);
        expect(flattenStyle(toggle.props.style({ pressed: false }))).toMatchObject({
            minHeight: 30, paddingHorizontal: 12, paddingVertical: 4,
        });

        act(() => toggle.props.onPress());

        expect(renderer.root.findAllByType('ToolDiffView' as any)).toHaveLength(1);
        expect(renderer.root.findAllByType('PermissionFooterMarker' as any)).toHaveLength(1);
        const patchSurface = renderer.root.findAllByType('View' as any).find((node: { props: { style?: unknown } }) => (
            flattenStyle(node.props.style).borderRadius === 10
        ));
        expect(flattenStyle(patchSurface?.props.style)).toMatchObject({
            backgroundColor: '#FAFAF9', borderColor: '#E7E6E3', borderRadius: 10,
        });
        const text = renderer.root.findAllByType('Text' as any).map((node: { props: { children?: unknown } }) => node.props.children);
        expect(text).toContain('/repo/src/app.ts');
        expect(text).toContain('edit');
    });
});
