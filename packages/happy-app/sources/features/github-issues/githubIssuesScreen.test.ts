import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { openExternalUrl, screenState } = vi.hoisted(() => ({
    openExternalUrl: vi.fn(async () => undefined),
    screenState: {
        authorizationSnapshot: null as any,
        connectionState: null as any,
        repositories: [] as any[],
    },
}));

vi.mock('@/utils/openExternalUrl', () => ({ openExternalUrl }));
vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        AppState: { addEventListener: () => ({ remove: () => undefined }) },
        Linking: { openURL: vi.fn(async () => undefined) },
        Pressable: host('Pressable'),
        Text: host('Text'),
        View: host('View'),
    };
});
vi.mock('expo-clipboard', () => ({ setStringAsync: vi.fn(async () => undefined) }));
vi.mock('expo-router', () => ({
    useLocalSearchParams: () => ({}),
    useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('react-native-unistyles', () => ({
    useUnistyles: () => ({
        theme: { colors: { button: { primary: { tint: 'white' } }, textLink: 'cyan', textSecondary: 'gray' } },
    }),
}));
vi.mock('@/components/Item', async () => {
    const ReactModule = await import('react');
    return { Item: (props: any) => ReactModule.createElement('Item', props) };
});
vi.mock('@/components/ItemGroup', async () => {
    const ReactModule = await import('react');
    return { ItemGroup: (props: any) => ReactModule.createElement('ItemGroup', props, props.children) };
});
vi.mock('@/components/ItemList', async () => {
    const ReactModule = await import('react');
    return { ItemList: (props: any) => ReactModule.createElement('ItemList', props, props.children) };
});
vi.mock('@/sync/storage', () => ({ useLocalSetting: () => true }));
vi.mock('./githubIssuesApi', () => ({
    GithubIssuesError: class GithubIssuesError extends Error {},
    githubIssuesAuthorization: {
        getSnapshot: () => screenState.authorizationSnapshot,
        subscribe: () => () => undefined,
        start: vi.fn(),
        cancel: vi.fn(),
        clear: vi.fn(),
    },
    githubIssuesApi: {
        getConnectionState: vi.fn(async () => screenState.connectionState),
        listRepositories: vi.fn(async () => screenState.repositories),
        listIssues: vi.fn(async () => ({ items: [] })),
        disconnect: vi.fn(async () => undefined),
        installationUrl: undefined,
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
    openExternalUrl.mockClear();
    screenState.authorizationSnapshot = {
        status: 'connecting',
        prompt: {
            userCode: 'ABCD-EFGH',
            verificationUri: 'https://github.com/login/device',
            expiresAt: Date.now() + 60_000,
        },
    };
    screenState.connectionState = { status: 'disconnected' };
    screenState.repositories = [];
});

describe('GitHub Issues screen external links', () => {
    it('opens the Device Flow verification page through the cross-platform external URL adapter', async () => {
        let renderer: ReturnType<typeof create>;
        await act(async () => {
            renderer = create(React.createElement(GithubIssuesScreen));
        });

        const openGithub = renderer!.root.findAllByType('Item' as any)
            .find((item: { props: { title?: string } }) => item.props.title === 'Open GitHub');
        expect(openGithub).toBeDefined();

        await act(async () => {
            await openGithub!.props.onPress();
        });

        expect(openExternalUrl).toHaveBeenCalledWith('https://github.com/login/device');
    });
});

describe('GitHub Issues screen desktop layout', () => {
    it('keeps Issue actions inside the centered content group and uses the visible link color', async () => {
        screenState.authorizationSnapshot = { status: 'idle' };
        screenState.connectionState = { status: 'connected', account: { login: 'myartings' } };
        screenState.repositories = [{
            id: 1,
            owner: 'myartings',
            name: 'happy',
            fullName: 'myartings/happy',
            private: false,
        }];

        let renderer: ReturnType<typeof create>;
        await act(async () => {
            renderer = create(React.createElement(GithubIssuesScreen));
        });

        const newIssue = renderer!.root.findAllByType('Text' as any)
            .find((item: { props: { children?: string } }) => item.props.children === 'New issue');
        expect(newIssue).toBeDefined();

        let ancestor = newIssue!.parent;
        while (ancestor && ancestor.type !== 'ItemGroup') ancestor = ancestor.parent;
        expect(ancestor).not.toBeNull();
        expect(newIssue!.props.style).toMatchObject({ color: 'cyan' });
    });
});
