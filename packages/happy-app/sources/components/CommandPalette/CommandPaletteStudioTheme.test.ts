import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

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
        useWindowDimensions: () => ({ width: 1470 }),
        View: host('View'),
    };
});

vi.mock('@/components/AnimatedOverlay', () => ({ LocalBlurHalo: () => null }));
vi.mock('@/sync/storage', () => ({
    useLocalSetting: (name: string) => name === 'visualStyle' ? 'studio' : 'light',
}));
vi.mock('@/utils/isTauri', () => ({ isTauri: () => true }));
vi.mock('react-native-unistyles', () => ({
    useUnistyles: () => ({ theme: { dark: false } }),
}));

import { useStudioOverlayPresentation } from '@/features/studio-overlays/useStudioOverlayPresentation';
import { resolveStudioOverlayPresentation } from '@/features/studio-overlays/studioOverlayPresentation';
import { CommandPalette } from './CommandPalette';
import { CommandPaletteModal } from './CommandPaletteModal';

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
    return { CommandPaletteInput: () => ReactModule.createElement(ThemeProbe) };
});

vi.mock('./CommandPaletteResults', () => ({ CommandPaletteResults: () => null }));

const originalConsoleError = console.error;

beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});

afterAll(() => vi.restoreAllMocks());

function ThemeProbe() {
    const presentation = useStudioOverlayPresentation();
    return React.createElement('ThemeProbe', {
        inputSurfaceColor: presentation.inputSurfaceColor,
        surfaceColor: presentation.modal.surfaceColor,
        textColor: presentation.textColor,
    });
}

function render(isDark: boolean): ReactTestRenderer {
    let renderer!: ReactTestRenderer;
    act(() => {
        renderer = create(React.createElement(CommandPaletteModal, {
            studioIsDark: isDark,
            visible: true,
            children: React.createElement(ThemeProbe),
        }));
    });
    return renderer;
}

describe('Studio Command Palette modal theme snapshot', () => {
    it('provides the explicit dark snapshot inside the modal content tree', () => {
        expect(render(true).root.findByType('ThemeProbe' as any).props).toMatchObject({
            inputSurfaceColor: '#292A2D',
            surfaceColor: '#232426',
            textColor: '#F5F5F5',
        });
    });

    it('provides the explicit light snapshot inside the modal content tree', () => {
        expect(render(false).root.findByType('ThemeProbe' as any).props).toMatchObject({
            inputSurfaceColor: '#FAFAFA',
            surfaceColor: '#FFFFFF',
            textColor: '#1A1C1F',
        });
    });

    it('provides the explicit snapshot at the palette content boundary', () => {
        const studioPresentation = resolveStudioOverlayPresentation({
            isDark: true,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });
        let renderer!: ReactTestRenderer;
        act(() => {
            renderer = create(React.createElement(CommandPalette, {
                commands: [],
                onClose: () => undefined,
                studioIsDark: true,
                studioPresentation,
            }));
        });

        expect(renderer.root.findByType('ThemeProbe' as any).props).toMatchObject({
            inputSurfaceColor: '#292A2D',
            surfaceColor: '#232426',
            textColor: '#F5F5F5',
        });
    });
});
