import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const presentationState = vi.hoisted(() => ({
    current: {
        commandPalette: {
            categoryFontSize: 11,
            categoryPaddingBottom: 6,
            categoryPaddingHorizontal: 20,
            categoryPaddingTop: 12,
            emptyPadding: 32,
            inputFontSize: 16,
            inputPaddingHorizontal: 20,
            inputPaddingVertical: 16,
            itemBorderWidth: 1,
            itemIconContainerSize: 28,
            itemIconMarginRight: 10,
            itemIconSize: 18,
            itemMarginVertical: 1,
            itemPaddingHorizontal: 16,
            itemPaddingVertical: 8,
            itemSubtitleFontSize: 12,
            itemTitleFontSize: 14,
            resultsMaxHeightWeb: '38vh',
            resultsPaddingVertical: 6,
            shortcutPaddingHorizontal: 8,
            shortcutPaddingVertical: 3,
        },
        dividerColor: '#E4E4E5',
        focusRingColor: 'focus-ring',
        hoverColor: 'hover',
        inputSurfaceColor: '#FAFAFA',
        isStudio: true,
        pressedColor: 'pressed',
        selectedBorderColor: 'selected-border',
        selectedColor: 'selected',
        textColor: '#1A1C1F',
        textSecondaryColor: '#6F7277',
    },
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        Platform: { OS: 'web' },
        Pressable: host('Pressable'),
        ScrollView: host('ScrollView'),
        StyleSheet: { create: (styles: any) => styles },
        Text: host('Text'),
        TextInput: host('TextInput'),
        View: host('View'),
    };
});

vi.mock('@/features/studio-overlays/useStudioOverlayPresentation', () => ({
    useStudioOverlayPresentation: () => presentationState.current,
}));

vi.mock('@/constants/Typography', () => ({
    Typography: { default: () => ({}), mono: () => ({}) },
}));

vi.mock('@/text', () => ({ t: (key: string) => key }));

vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Ionicons', props) };
});

import { CommandPaletteInput } from './CommandPaletteInput';
import { CommandPaletteItem } from './CommandPaletteItem';
import { CommandPaletteResults } from './CommandPaletteResults';

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

function flattenStyle(style: unknown): Record<string, unknown> {
    if (!Array.isArray(style)) return style && typeof style === 'object' ? style as Record<string, unknown> : {};
    return Object.assign({}, ...style.map(flattenStyle));
}

describe('Studio Command Palette density wiring', () => {
    it('applies the compact Studio search metrics only while Studio is active', () => {
        const studio = render(React.createElement(CommandPaletteInput, {
            value: '',
            onChangeText: vi.fn(),
        }));
        expect(flattenStyle(studio.root.findByType('TextInput' as any).props.style)).toMatchObject({
            fontSize: 16,
            paddingHorizontal: 20,
            paddingVertical: 16,
        });

        presentationState.current.isStudio = false;
        const defaultStyle = flattenStyle(render(React.createElement(CommandPaletteInput, {
            value: '',
            onChangeText: vi.fn(),
        })).root.findByType('TextInput' as any).props.style);
        expect(defaultStyle).toMatchObject({
            fontSize: 20,
            paddingHorizontal: 32,
            paddingVertical: 24,
        });
        presentationState.current.isStudio = true;
    });

    it('wires compact Studio row, icon, text, and shortcut metrics to an actual item', () => {
        const renderer = render(React.createElement(CommandPaletteItem, {
            command: {
                id: 'new',
                title: 'New Session',
                subtitle: 'Start a new chat session',
                icon: 'add-circle-outline',
                shortcut: '⌘N',
                action: vi.fn(),
            },
            isSelected: true,
            onPress: vi.fn(),
        }));

        const pressable = renderer.root.findByType('Pressable' as any);
        expect(flattenStyle(pressable.props.style({ pressed: false }))).toMatchObject({
            backgroundColor: 'selected',
            borderColor: 'selected-border',
            borderWidth: 1,
            marginVertical: 1,
            paddingHorizontal: 16,
            paddingVertical: 8,
        });
        expect(renderer.root.findByType('Ionicons' as any).props.size).toBe(18);

        const views = renderer.root.findAllByType('View' as any).map((node: any) => flattenStyle(node.props.style));
        expect(views).toContainEqual(expect.objectContaining({ height: 28, marginRight: 10, width: 28 }));
        expect(views).toContainEqual(expect.objectContaining({ paddingHorizontal: 8, paddingVertical: 3 }));

        const textStyles = renderer.root.findAllByType('Text' as any).map((node: any) => flattenStyle(node.props.style));
        expect(textStyles).toContainEqual(expect.objectContaining({ fontSize: 14 }));
        expect(textStyles).toContainEqual(expect.objectContaining({ fontSize: 12 }));
    });

    it('wires actual hover and focus events into an item without changing selection callbacks', () => {
        const onHover = vi.fn();
        const renderer = render(React.createElement(CommandPaletteItem, {
            command: { id: 'new', title: 'New Session', action: vi.fn() },
            isSelected: false,
            onHover,
            onPress: vi.fn(),
        }));
        let pressable = renderer.root.findByType('Pressable' as any);

        act(() => pressable.props.onHoverIn());
        pressable = renderer.root.findByType('Pressable' as any);
        expect(flattenStyle(pressable.props.style({ pressed: false }))).toMatchObject({
            backgroundColor: 'hover',
        });

        act(() => pressable.props.onFocus());
        pressable = renderer.root.findByType('Pressable' as any);
        expect(flattenStyle(pressable.props.style({ pressed: false }))).toMatchObject({
            outlineColor: 'focus-ring',
            outlineWidth: 2,
        });

        act(() => pressable.props.onMouseEnter());
        expect(onHover).toHaveBeenCalledOnce();

        act(() => pressable.props.onBlur());
        act(() => pressable.props.onFocus({ target: { matches: () => false } }));
        pressable = renderer.root.findByType('Pressable' as any);
        expect(flattenStyle(pressable.props.style({ pressed: false })).outlineWidth).toBeUndefined();
    });

    it('wires actual input focus to the Studio focus divider', () => {
        const renderer = render(React.createElement(CommandPaletteInput, {
            value: '',
            onChangeText: vi.fn(),
        }));
        const input = renderer.root.findByType('TextInput' as any);
        act(() => input.props.onFocus());

        const container = renderer.root.findAllByType('View' as any)[0];
        expect(flattenStyle(container.props.style)).toMatchObject({
            borderBottomColor: 'focus-ring',
        });
    });

    it('wires compact Studio results and category spacing', () => {
        const renderer = render(React.createElement(CommandPaletteResults, {
            categories: [{
                id: 'sessions',
                title: 'Sessions',
                commands: [{ id: 'new', title: 'New Session', action: vi.fn() }],
            }],
            selectedIndex: 0,
            onSelectCommand: vi.fn(),
            onSelectionChange: vi.fn(),
        }));

        expect(flattenStyle(renderer.root.findByType('ScrollView' as any).props.style)).toMatchObject({
            maxHeight: '38vh',
            paddingVertical: 6,
        });
        const category = renderer.root.findAllByType('Text' as any)
            .find((node: any) => node.children.includes('Sessions'));
        expect(flattenStyle(category?.props.style)).toMatchObject({
            fontSize: 11,
            paddingBottom: 6,
            paddingHorizontal: 20,
            paddingTop: 12,
        });
    });
});
