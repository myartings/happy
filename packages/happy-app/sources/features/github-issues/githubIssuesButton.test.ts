import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { push, remember, resolve } = vi.hoisted(() => ({
    push: vi.fn(),
    remember: vi.fn(),
    resolve: vi.fn(async () => ({
        status: 'resolved' as const,
        repository: { owner: 'myartings', name: 'happy' },
    })),
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        Platform: { OS: 'web' },
        Pressable: host('Pressable'),
    };
});
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Ionicons', props) };
});
vi.mock('expo-router', () => ({ useRouter: () => ({ push }) }));
vi.mock('react-native-unistyles', () => ({
    StyleSheet: { create: (styles: any) => styles({ colors: { divider: 'divider', surface: 'surface', surfacePressed: 'pressed' } }) },
    useUnistyles: () => ({ theme: { colors: { textSecondary: 'gray' } } }),
}));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}) } }));
vi.mock('@/sync/storage', () => ({ useLocalSetting: () => true }));
vi.mock('@/sync/ops', () => ({
    sessionBash: vi.fn(async () => ({ success: false, stdout: '' })),
}));
vi.mock('@/utils/isTauri', () => ({ isTauri: () => true }));
vi.mock('./GithubRepositoryPicker', async () => {
    const ReactModule = await import('react');
    return { GithubRepositoryPicker: (props: any) => ReactModule.createElement('GithubRepositoryPicker', props) };
});
vi.mock('./githubIssuesApi', () => ({
    githubIssuesApi: { installationUrl: undefined },
    githubIssuesRepositoryResolver: { remember, resolve },
}));

import { GithubIssuesButton } from '@/components/GithubIssuesButton';

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
    push.mockClear();
    remember.mockClear();
    resolve.mockClear();
});

describe('GitHub Issues Session entry', () => {
    it('delegates repository discovery to the feature resolver', async () => {
        let renderer: ReturnType<typeof create>;
        await act(async () => {
            renderer = create(React.createElement(GithubIssuesButton, {
                sessionId: 'session-a',
                cwd: '/work/happy',
            }));
        });

        await act(async () => {
            await renderer!.root.findByType('Pressable' as any).props.onPress();
        });

        expect(resolve).toHaveBeenCalledWith({ sessionId: 'session-a', path: '/work/happy' });
        expect(push).toHaveBeenCalledWith({
            pathname: '/github-issues',
            params: { owner: 'myartings', repo: 'happy', sourceSessionId: 'session-a' },
        });
    });

    it('opens the repository picker instead of navigating when resolution is ambiguous', async () => {
        resolve.mockResolvedValueOnce({
            status: 'picker',
            reason: 'ambiguous',
            suggestedRepository: null,
            repositories: [],
            selectionRemoteFingerprint: null,
            association: null,
        } as any);
        let renderer: ReturnType<typeof create>;
        await act(async () => {
            renderer = create(React.createElement(GithubIssuesButton, {
                sessionId: 'session-a',
                cwd: '/work/happy',
            }));
        });

        await act(async () => {
            await renderer!.root.findByType('Pressable' as any).props.onPress();
        });

        expect(push).not.toHaveBeenCalled();
        expect(renderer!.root.findByType('GithubRepositoryPicker' as any).props).toMatchObject({
            visible: true,
            reason: 'ambiguous',
        });
    });

    it('remembers a picker choice and opens that repository', async () => {
        const repository = {
            id: 1,
            owner: 'myartings',
            name: 'happy',
            fullName: 'myartings/happy',
            private: false,
            url: '',
        };
        resolve.mockResolvedValueOnce({
            status: 'picker',
            reason: 'no-remote',
            suggestedRepository: null,
            repositories: [repository],
            selectionRemoteFingerprint: '',
            association: null,
        } as any);
        let renderer: ReturnType<typeof create>;
        await act(async () => {
            renderer = create(React.createElement(GithubIssuesButton));
        });
        await act(async () => {
            await renderer!.root.findByType('Pressable' as any).props.onPress();
        });

        await act(async () => {
            renderer!.root.findByType('GithubRepositoryPicker' as any).props.onSelect(repository);
        });

        expect(remember).toHaveBeenCalledWith(repository, {
            identity: { sessionId: undefined, path: undefined },
            remoteFingerprint: '',
        });
        expect(push).toHaveBeenCalledWith({
            pathname: '/github-issues',
            params: { owner: 'myartings', repo: 'happy' },
        });
    });
});
