import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        Modal: host('Modal'),
        Platform: { select: (values: any) => values.web ?? values.default },
        Pressable: host('Pressable'),
        ScrollView: host('ScrollView'),
        TextInput: host('TextInput'),
        View: host('View'),
    };
});
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Ionicons', props) };
});
vi.mock('react-native-unistyles', () => ({
    StyleSheet: {
        hairlineWidth: 1,
        create: (styles: any) => styles({
            colors: {
                divider: 'divider',
                input: { background: 'input', text: 'input-text' },
                surface: 'surface',
                surfaceHigh: 'surface-high',
                surfaceSelected: 'surface-selected',
                text: 'text',
                textLink: 'link',
                textSecondary: 'secondary',
            },
        }),
    },
    useUnistyles: () => ({ theme: { colors: { textSecondary: 'secondary', text: 'text', textLink: 'link' } } }),
}));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}) } }));

import { GithubRepositoryPicker } from './GithubRepositoryPicker';

const originalConsoleError = console.error;

beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});

afterAll(() => vi.restoreAllMocks());

describe('GitHub repository picker', () => {
    it('filters locally and selects an accessible repository', async () => {
        const onSelect = vi.fn();
        const onManageAccess = vi.fn();
        let renderer: ReturnType<typeof create>;
        await act(async () => {
            renderer = create(React.createElement(GithubRepositoryPicker, {
                visible: true,
                repositories: [
                    { id: 1, owner: 'myartings', name: 'happy', fullName: 'myartings/happy', private: false, url: '' },
                    { id: 2, owner: 'myartings', name: 'ai-coding-template', fullName: 'myartings/ai-coding-template', private: true, url: '' },
                ],
                selectedRepository: { owner: 'myartings', repo: 'happy' },
                onSelect,
                onClose: vi.fn(),
                onManageAccess,
            }));
        });

        const selected = renderer!.root.findByProps({ accessibilityLabel: 'Select myartings/happy' });
        expect(selected.props.accessibilityState).toEqual({ selected: true });

        await act(async () => {
            renderer!.root.findByType('TextInput' as any).props.onChangeText('template');
        });

        expect(renderer!.root.findAllByProps({ accessibilityLabel: 'Select myartings/happy' })).toHaveLength(0);
        const template = renderer!.root.findByProps({ accessibilityLabel: 'Select myartings/ai-coding-template' });
        await act(async () => template.props.onPress());
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'myartings/ai-coding-template' }));

        await act(async () => {
            renderer!.root.findByProps({ accessibilityLabel: 'Manage repository access on GitHub' }).props.onPress();
        });
        expect(onManageAccess).toHaveBeenCalledOnce();
    });
});
