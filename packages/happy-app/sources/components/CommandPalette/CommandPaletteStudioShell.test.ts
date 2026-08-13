import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const presentationState = vi.hoisted(() => ({
    current: {
        commandPalette: {
            backdropPeakOpacity: 1,
            contentMaxWidth: 640,
            shellMaxHeightWeb: '52vh',
        },
        isStudio: true,
        modal: {
            borderColor: '#DDDDDE',
            borderWidth: 1,
            radius: 16,
            scrimColor: 'rgba(0, 0, 0, 0.10)',
            shadowOffsetY: 18,
            shadowOpacity: 0.16,
            shadowRadius: 42,
            surfaceColor: '#FFFFFF',
        },
    },
}));

const viewportState = vi.hoisted(() => ({ width: 1470 }));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    class Value {
        constructor(public value: number) {}
        interpolate(config: unknown) { return config; }
    }
    const animation = () => ({ start: (callback?: () => void) => callback?.() });
    return {
        Animated: {
            View: host('AnimatedView'),
            Value,
            parallel: () => ({ start: () => undefined }),
            spring: animation,
            timing: animation,
        },
        KeyboardAvoidingView: host('KeyboardAvoidingView'),
        Modal: host('Modal'),
        Platform: { OS: 'web' },
        StyleSheet: {
            absoluteFillObject: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
            create: (styles: any) => styles,
        },
        TouchableWithoutFeedback: host('TouchableWithoutFeedback'),
        useWindowDimensions: () => ({
            fontScale: 1,
            height: 874,
            scale: 2,
            width: viewportState.width,
        }),
        View: host('View'),
    };
});

vi.mock('@/features/studio-overlays/useStudioOverlayPresentation', () => ({
    useStudioOverlayPresentation: () => presentationState.current,
}));

vi.mock('./useCommandPalette', () => ({
    useCommandPalette: () => ({
        filteredCategories: [],
        handleKeyPress: vi.fn(),
        handleSearchChange: vi.fn(),
        handleSelectCommand: vi.fn(),
        inputRef: { current: null },
        searchQuery: '',
        selectedIndex: 0,
        setSelectedIndex: vi.fn(),
    }),
}));

vi.mock('./CommandPaletteInput', async () => {
    const ReactModule = await import('react');
    return { CommandPaletteInput: (props: any) => ReactModule.createElement('CommandPaletteInput', props) };
});

vi.mock('./CommandPaletteResults', async () => {
    const ReactModule = await import('react');
    return { CommandPaletteResults: (props: any) => ReactModule.createElement('CommandPaletteResults', props) };
});

vi.mock('@/components/AnimatedOverlay', () => ({ LocalBlurHalo: () => null }));

import { CommandPalette } from './CommandPalette';
import { CommandPaletteModal } from './CommandPaletteModal';

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
    act(() => {
        renderer = create(element);
    });
    return renderer;
}

function flattenStyle(style: unknown): Record<string, any> {
    if (!Array.isArray(style)) return style && typeof style === 'object' ? style as Record<string, any> : {};
    return Object.assign({}, ...style.map(flattenStyle));
}

describe('Studio Command Palette shell wiring', () => {
    it('applies the narrower Studio width and height to the palette shell', () => {
        const renderer = render(React.createElement(CommandPalette, {
            commands: [],
            onClose: vi.fn(),
        }));

        expect(flattenStyle(renderer.root.findByType('View' as any).props.style)).toMatchObject({
            maxHeight: '52vh',
            maxWidth: 640,
        });
    });

    it('applies the lighter scrim at full animated peak and narrows the modal host', () => {
        viewportState.width = 1470;
        const renderer = render(React.createElement(CommandPaletteModal, {
            visible: true,
            onClose: vi.fn(),
            children: React.createElement('PaletteContent'),
        }));
        const animatedViews = renderer.root.findAllByType('AnimatedView' as any);
        const backdrop = flattenStyle(animatedViews[0].props.style);
        const content = flattenStyle(animatedViews[1].props.style);

        expect(backdrop.backgroundColor).toBe('rgba(0, 0, 0, 0.10)');
        expect(backdrop.opacity.outputRange).toEqual([0, 1]);
        expect(content.maxWidth).toBe(640);
        expect(content.width).toBe(640);
    });

    it('keeps the actual outer modal wrapper responsive below 640', () => {
        viewportState.width = 600;
        const renderer = render(React.createElement(CommandPaletteModal, {
            visible: true,
            onClose: vi.fn(),
            children: React.createElement('PaletteContent'),
        }));
        const content = flattenStyle(renderer.root.findAllByType('AnimatedView' as any)[1].props.style);

        expect(content.width).toBe(540);
        expect(content.maxWidth).toBe(640);
    });

    it('retains the existing percentage width and 800 cap outside Studio', () => {
        viewportState.width = 1470;
        presentationState.current.isStudio = false;
        const renderer = render(React.createElement(CommandPaletteModal, {
            visible: true,
            onClose: vi.fn(),
            children: React.createElement('PaletteContent'),
        }));
        const content = flattenStyle(renderer.root.findAllByType('AnimatedView' as any)[1].props.style);

        expect(content.width).toBe('90%');
        expect(content.maxWidth).toBe(800);
        presentationState.current.isStudio = true;
    });
});
