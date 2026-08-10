import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { openExternalUrl, screenState } = vi.hoisted(() => ({
    openExternalUrl: vi.fn(async () => undefined),
    screenState: {
        authorizationSnapshot: { status: 'idle' } as any,
        connectionState: { status: 'connected', account: { login: 'myartings' } } as any,
        repositories: [] as any[],
        listError: null as Error | null,
        issues: { open: [] as any[], closed: [] as any[] },
        params: { owner: 'myartings', repo: 'happy' } as Record<string, string>,
    },
}));

vi.mock('@/utils/openExternalUrl', () => ({ openExternalUrl }));
vi.mock('@/modal', () => ({ Modal: { confirm: vi.fn(async () => false) } }));
vi.mock('@/text', async () => {
    const { en } = await import('@/text/_default');
    return { t: (key: string, params?: any) => { let value: any = en; for (const part of key.split('.')) value = value[part]; return typeof value === 'function' ? value(params) : value; } };
});
vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        AppState: { addEventListener: () => ({ remove: () => undefined }) },
        Pressable: host('Pressable'),
        RefreshControl: host('RefreshControl'),
        ScrollView: host('ScrollView'),
        View: host('View'),
    };
});
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Ionicons', props) };
});
vi.mock('expo-clipboard', () => ({ setStringAsync: vi.fn(async () => undefined) }));
vi.mock('expo-router', async () => {
    const ReactModule = await import('react');
    return {
        Stack: { Screen: (props: any) => ReactModule.createElement('StackScreen', props) },
        useLocalSearchParams: () => screenState.params,
        useRouter: () => ({ push: vi.fn() }),
    };
});
vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (styles: any) => styles({ colors: {
        button: { primary: { background: 'blue', tint: 'white' } },
        groupped: { background: 'background' }, header: { tint: 'header' }, input: { background: 'input', text: 'text' },
        surface: 'surface', surfaceHigh: 'high', surfaceSelected: 'selected', text: 'text', textDestructive: 'red', textLink: 'link', textSecondary: 'secondary',
    } }) },
    useUnistyles: () => ({ theme: { colors: { header: { tint: 'header' }, textSecondary: 'secondary' } } }),
}));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/components/layout', () => ({ layout: { maxWidth: 960 } }));
vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}) } }));
vi.mock('./GithubRepositoryPicker', async () => {
    const ReactModule = await import('react');
    return { GithubRepositoryPicker: (props: any) => ReactModule.createElement('GithubRepositoryPicker', props) };
});
vi.mock('@/sync/storage', () => ({ useLocalSetting: () => true }));
vi.mock('./githubIssuesApi', () => ({
    GithubIssuesError: class GithubIssuesError extends Error { code = 'github_error'; },
    getGithubIssueRelativeTime: () => ({ unit: 'hour', value: 2 }),
    getGithubIssuesErrorMessage: (error: Error) => error.message,
    githubIssuesAuthorization: {
        getSnapshot: () => screenState.authorizationSnapshot,
        subscribe: () => () => undefined,
        start: vi.fn(), cancel: vi.fn(), clear: vi.fn(),
    },
    githubIssuesRepositoryResolver: { remember: vi.fn() },
    githubIssuesApi: {
        getConnectionState: vi.fn(async () => screenState.connectionState),
        listRepositories: vi.fn(async () => screenState.repositories),
        listIssues: vi.fn(async ({ state }: { state: 'open' | 'closed' }) => {
            if (screenState.listError) throw screenState.listError;
            return { items: screenState.issues[state] };
        }),
        disconnect: vi.fn(async () => undefined),
        installationUrl: 'https://github.com/settings/installations/1',
    },
}));

import GithubIssuesScreen from '@/app/(app)/github-issues/index';

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
    screenState.authorizationSnapshot = { status: 'idle' };
    screenState.connectionState = { status: 'connected', account: { login: 'myartings' } };
    screenState.repositories = [{ id: 1, owner: 'myartings', name: 'happy', fullName: 'myartings/happy', private: false, url: '' }];
    screenState.listError = null;
    screenState.issues = {
        open: [{ number: 241, title: 'Add GitHub Issues page', updatedAt: '', comments: 3, labels: [{ name: 'enhancement', color: 'blue' }] }],
        closed: [],
    };
    screenState.params = { owner: 'myartings', repo: 'happy' };
});

describe('GitHub Issues native list', () => {
    it('keeps connection management in the Settings-specific mode', async () => {
        screenState.params = { mode: 'settings' };
        let renderer: ReturnType<typeof create>;
        await act(async () => { renderer = create(React.createElement(GithubIssuesScreen)); });
        await act(async () => undefined);
        const text = renderer!.root.findAllByType('Text' as any).map((node: any) => node.props.children).flat().join(' ');
        expect(text).toContain('Connected as @myartings');
        expect(text).toContain('Remove from this device');
        expect(text).not.toContain('Add GitHub Issues page');
    });
    it('shows task metadata without a persistent account-management card', async () => {
        let renderer: ReturnType<typeof create>;
        await act(async () => { renderer = create(React.createElement(GithubIssuesScreen)); });
        await act(async () => undefined);
        const text = renderer!.root.findAllByType('Text' as any).map((node: any) => node.props.children).flat().join(' ');
        expect(renderer!.root.findByProps({ accessibilityLabel: 'Issue #241: Add GitHub Issues page' })).toBeDefined();
        expect(text).toContain('Add GitHub Issues page');
        expect(text).toContain('enhancement');
        expect(text).not.toContain('Connected as');
    });

    it('preserves loaded Issues when pull-to-refresh fails', async () => {
        let renderer: ReturnType<typeof create>;
        await act(async () => { renderer = create(React.createElement(GithubIssuesScreen)); });
        await act(async () => undefined);
        screenState.listError = new Error('offline');
        const refreshControl = renderer!.root.findByType('ScrollView' as any).props.refreshControl;
        await act(async () => { await refreshControl.props.onRefresh(); });
        const text = renderer!.root.findAllByType('Text' as any).map((node: any) => node.props.children).flat().join(' ');
        expect(renderer!.root.findByProps({ accessibilityLabel: 'Issue #241: Add GitHub Issues page' })).toBeDefined();
        expect(text).toContain('offline');
        expect(text).toContain('Retry');
    });

    it('opens the Device Flow verification page through the external URL adapter', async () => {
        screenState.connectionState = { status: 'disconnected' };
        screenState.authorizationSnapshot = { status: 'connecting', prompt: { userCode: 'ABCD-EFGH', verificationUri: 'https://github.com/login/device', expiresAt: Date.now() + 60_000 } };
        let renderer: ReturnType<typeof create>;
        await act(async () => { renderer = create(React.createElement(GithubIssuesScreen)); });
        const open = renderer!.root.findByProps({ accessibilityLabel: 'Open GitHub verification' });
        await act(async () => open.props.onPress());
        expect(openExternalUrl).toHaveBeenCalledWith('https://github.com/login/device');
    });
});
