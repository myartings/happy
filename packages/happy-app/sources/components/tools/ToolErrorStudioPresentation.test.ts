import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const presentation = vi.hoisted(() => ({ current: {
    error: { backgroundColor: '#FFF8F7', borderColor: '#E9CFCC', borderRadius: 8, marginBottom: 10, padding: 10, textColor: '#973D37' },
} as any }));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return { Text: host('Text'), View: host('View') };
});
vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (factory: any) => factory({ colors: { box: {
        error: { background: '#fee', border: '#fbb', text: '#900' },
        warning: { text: '#a60' },
    } } }) },
    useUnistyles: () => ({ theme: { colors: { box: { warning: { text: '#a60' } } } } }),
}));
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Icon', props) };
});
vi.mock('@/features/studio-tool-presentation/useStudioToolPresentation', () => ({
    useStudioToolPresentation: () => presentation.current,
}));

import { ToolError } from './ToolError';

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

describe('actual ToolError Studio wiring', () => {
    it('keeps parsed tool-use text and warning semantics in the Studio surface', () => {
        const renderer = render(React.createElement(ToolError, {
            message: '<tool_use_error>Read the file before editing it.</tool_use_error>',
        }));
        const container = renderer.root.findByType('View' as any);
        const textNode = renderer.root.findByType('Text' as any);
        const icon = renderer.root.findByType('Icon' as any);

        expect(flattenStyle(container.props.style)).toMatchObject({
            backgroundColor: '#FFF8F7', borderColor: '#E9CFCC', borderRadius: 8, padding: 10,
        });
        expect(textNode.props.children).toBe('Read the file before editing it.');
        expect(flattenStyle(textNode.props.style).color).toBe('#973D37');
        expect(icon.props.name).toBe('warning');
        expect(icon.props.color).toBe('#973D37');
    });

    it('retains the previous theme surface outside Studio', () => {
        presentation.current = null as any;
        const renderer = render(React.createElement(ToolError, { message: 'plain failure' }));
        const container = renderer.root.findByType('View' as any);
        expect(flattenStyle(container.props.style)).toMatchObject({
            backgroundColor: '#fee', borderColor: '#fbb', borderRadius: 6, padding: 12,
        });
    });
});
