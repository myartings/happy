import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    screenOptions: null as any,
    settings: { devGithubIssueDrafts: {} as Record<string, { title: string; body: string }> },
    applyLocalSettings: vi.fn((patch: any) => Object.assign(mocks.settings, patch)),
    createIssue: vi.fn(),
    confirm: vi.fn(async () => false),
    back: vi.fn(),
    replace: vi.fn(),
    theme: { colors: { button: { primary: { background: 'blue', tint: 'white' } }, groupped: { background: 'bg' }, input: { background: 'input', text: 'text' }, text: 'text', textDestructive: 'red', textLink: 'link', textSecondary: 'secondary' } },
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return { Pressable: host('Pressable'), ScrollView: host('ScrollView'), TextInput: host('TextInput'), View: host('View') };
});
vi.mock('expo-router', () => ({
    Stack: { Screen: (props: any) => { mocks.screenOptions = props.options; return null; } },
    useLocalSearchParams: () => ({ owner: 'myartings', repo: 'happy', sourceSessionId: 'session-1' }),
    useRouter: () => ({ back: mocks.back, replace: mocks.replace }),
}));
vi.mock('react-native-unistyles', () => ({ StyleSheet: { create: (factory: any) => factory(mocks.theme) } }));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/components/layout', () => ({ layout: { maxWidth: 800 } }));
vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}) } }));
vi.mock('@/modal', () => ({ Modal: { confirm: mocks.confirm } }));
vi.mock('@/text', async () => {
    const { en } = await import('@/text/_default');
    return { t: (key: string, params?: any) => { let value: any = en; for (const part of key.split('.')) value = value[part]; return typeof value === 'function' ? value(params) : value; } };
});
vi.mock('@/sync/storage', () => ({
    useLocalSetting: () => true,
    storage: { getState: () => ({ localSettings: mocks.settings, applyLocalSettings: mocks.applyLocalSettings }) },
}));
vi.mock('./githubIssuesApi', () => ({ githubIssuesApi: { createIssue: mocks.createIssue } }));

import NewGithubIssueScreen from '@/app/(app)/github-issues/new';

const originalConsoleError = console.error;
beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});
afterAll(() => vi.restoreAllMocks());
beforeEach(() => {
    vi.clearAllMocks();
    mocks.settings.devGithubIssueDrafts = {};
    mocks.createIssue.mockResolvedValue({ number: 5, title: 'Bug', body: '', state: 'open' });
});

async function renderScreen() {
    let renderer: ReturnType<typeof create>;
    await act(async () => { renderer = create(React.createElement(NewGithubIssueScreen)); });
    return renderer!;
}

describe('New GitHub Issue', () => {
    it('persists a repository-scoped draft while editing', async () => {
        const renderer = await renderScreen();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Issue title' }).props.onChangeText('Remember me'); });
        expect(mocks.settings.devGithubIssueDrafts['myartings/happy']).toEqual({ title: 'Remember me', body: '' });
    });

    it('preserves inputs after a failed create', async () => {
        mocks.createIssue.mockRejectedValue(new Error('offline'));
        const renderer = await renderScreen();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Issue title' }).props.onChangeText('Bug'); });
        await act(async () => { await mocks.screenOptions.headerRight().props.onPress(); });
        expect(renderer.root.findByProps({ accessibilityLabel: 'Issue title' }).props.value).toBe('Bug');
        expect(mocks.settings.devGithubIssueDrafts['myartings/happy'].title).toBe('Bug');
    });

    it('creates once and offers work-on-it without dispatching automatically', async () => {
        const renderer = await renderScreen();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Issue title' }).props.onChangeText('Bug'); });
        await act(async () => { await mocks.screenOptions.headerRight().props.onPress(); });
        expect(mocks.createIssue).toHaveBeenCalledTimes(1);
        expect(mocks.replace).not.toHaveBeenCalled();
        const work = renderer.root.findAllByType('Pressable' as any).find((node: any) => node.findAllByType('Text' as any).some((text: any) => text.props.children === 'Work on it'));
        await act(async () => { work!.props.onPress(); });
        expect(mocks.replace).toHaveBeenCalledWith(expect.objectContaining({ params: expect.objectContaining({ number: 5, startWork: '1' }) }));
    });
});
