import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const presentation = {
    visualStyle: 'studio',
    options: {
        gap: 6,
        marginVertical: 8,
        minHeight: 40,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 9,
        borderWidth: 1,
        backgroundColor: '#F7F7F6',
        borderColor: '#E5E3DF',
        pressedBackgroundColor: '#EEEDEB',
        hoverBackgroundColor: '#F1F0EE',
        hoverBorderColor: '#DAD8D4',
        focusBorderColor: 'rgba(70, 111, 226, 0.82)',
        textColor: '#2D2D2D',
        fontSize: 14,
        lineHeight: 20,
    },
} as const;

let studioEnabled = true;

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        Image: host('Image'),
        Platform: { OS: 'web', select: (values: Record<string, unknown>) => values.web ?? values.default },
        Pressable: host('Pressable'),
        View: host('View'),
    };
});
vi.mock('react-native-unistyles', () => ({
    StyleSheet: {
        hairlineWidth: 1,
        create: (factory: any) => factory({ colors: {
            divider: '#DDD', surfaceHighest: '#EEE', surfaceHigh: '#E8E8E8',
            surfacePressed: '#DDD', surface: '#FFF', text: '#111', textSecondary: '#666', success: '#090',
        } }),
    },
}));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/constants/Typography', () => ({
    Typography: { default: () => ({}), mono: () => ({ fontFamily: 'monospace' }) },
}));
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('@/features/studio-semantic-text/useStudioSemanticTextPresentation', () => ({
    useStudioSemanticTextPresentation: () => studioEnabled ? presentation : null,
}));
vi.mock('@/sync/storage', () => ({ useLocalSetting: () => false }));
vi.mock('expo-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/sync/persistence', () => ({ storeTempText: vi.fn() }));
vi.mock('@/modal', () => ({ Modal: { alert: vi.fn() } }));
vi.mock('expo-clipboard', () => ({ setStringAsync: vi.fn() }));
vi.mock('expo-web-browser', () => ({}));
vi.mock('@/utils/openExternalUrl', () => ({ openExternalUrl: vi.fn() }));
vi.mock('@/components/HorizontalScrollView', async () => {
    const ReactModule = await import('react');
    return { HorizontalScrollView: (props: any) => ReactModule.createElement('View', props, props.children) };
});
vi.mock('@/components/SimpleSyntaxHighlighter', () => ({ SimpleSyntaxHighlighter: () => null }));
vi.mock('@/components/markdown/MermaidRenderer', () => ({ MermaidRenderer: () => null }));
vi.mock('react-native-gesture-handler', () => ({
    Gesture: { LongPress: () => ({ minDuration() { return this; }, onStart() { return this; }, runOnJS() { return this; } }) },
    GestureDetector: (props: any) => props.children,
}));

vi.stubGlobal('__DEV__', false);
const { MarkdownView } = await import('../../components/markdown/MarkdownView');

const originalConsoleError = console.error;
beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});
afterAll(() => vi.restoreAllMocks());

function renderOptions(onOptionPress = vi.fn()) {
    let renderer!: ReturnType<typeof create>;
    act(() => {
        renderer = create(React.createElement(MarkdownView, {
            markdown: '<options>\n<option>暂时结束（推荐）</option>\n<option>添加 Android 项目生成脚本</option>\n</options>',
            onOptionPress,
        }));
    });
    return { renderer, options: renderer.root.findAllByType('Pressable' as any), onOptionPress };
}

describe('Studio Markdown options', () => {
    it('renders compact Studio geometry and preserves one-shot option payloads', () => {
        studioEnabled = true;
        const { options, onOptionPress } = renderOptions();
        expect(options).toHaveLength(2);
        expect(options[0].props.accessibilityRole).toBe('button');
        expect(options[0].props.style({ pressed: false })).toEqual(expect.arrayContaining([
            expect.objectContaining({ minHeight: 40, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9 }),
            { backgroundColor: '#F7F7F6', borderColor: '#E5E3DF' },
        ]));
        const label = options[0].findByType('Text' as any);
        expect(label.props).toMatchObject({ selectable: true });
        expect(label.props.style).toEqual(expect.arrayContaining([
            expect.objectContaining({ fontSize: 14, lineHeight: 20, color: '#2D2D2D' }),
        ]));
        act(() => options[1].props.onPress());
        expect(onOptionPress).toHaveBeenCalledTimes(1);
        expect(onOptionPress).toHaveBeenCalledWith({ title: '添加 Android 项目生成脚本' });
    });

    it('applies hover, focus-visible, and pressed precedence in mounted Studio options', () => {
        studioEnabled = true;
        const { options } = renderOptions();
        const option = options[0];
        act(() => option.props.onHoverIn());
        expect(option.props.style({ pressed: false })).toContainEqual({
            backgroundColor: '#F1F0EE', borderColor: '#DAD8D4',
        });
        act(() => option.props.onFocus({ target: { matches: () => true } }));
        expect(option.props.style({ pressed: false })).toContainEqual({
            backgroundColor: '#F7F7F6', borderColor: 'rgba(70, 111, 226, 0.82)',
        });
        expect(option.props.style({ pressed: true })).toContainEqual({
            backgroundColor: '#EEEDEB', borderColor: '#DAD8D4',
        });
    });

    it('keeps the existing non-Studio metrics, role, selection, and press callback path', () => {
        studioEnabled = false;
        const { options, onOptionPress } = renderOptions();
        const option = options[0];
        expect(option.props.accessibilityRole).toBeUndefined();
        const styles = option.props.style({ pressed: false });
        expect(styles).not.toEqual(expect.arrayContaining([expect.objectContaining({ minHeight: 40 })]));
        expect(option.findByType('Text' as any).props.selectable).toBe(true);
        act(() => option.props.onPress());
        expect(onOptionPress).toHaveBeenCalledWith({ title: '暂时结束（推荐）' });
    });
});
