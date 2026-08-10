import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { listIssues, push, remember, resolve } = vi.hoisted(() => ({
    listIssues: vi.fn(async () => ({
        items: [{
            number: 42,
            title: 'Keep Session context visible',
            labels: [],
            updatedAt: '2026-08-10T12:00:00.000Z',
            comments: 0,
        }],
        nextPage: null,
    })),
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
        Modal: host('Modal'),
        Platform: { OS: 'web', select: (values: any) => values.web ?? values.default },
        Pressable: host('Pressable'),
        ScrollView: host('ScrollView'),
        View: host('View'),
    };
});
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Ionicons', props) };
});
vi.mock('expo-router', () => ({ useRouter: () => ({ push }) }));
vi.mock('react-native-unistyles', () => ({
    StyleSheet: {
        hairlineWidth: 1,
        create: (styles: any) => styles({
            colors: {
                button: { primary: { background: 'primary', tint: 'primary-text' } },
                divider: 'divider',
                surface: 'surface',
                surfaceHigh: 'surface-high',
                surfacePressed: 'pressed',
                text: 'text',
                textSecondary: 'gray',
            },
        }),
    },
    useUnistyles: () => ({
        theme: {
            colors: {
                button: { primary: { background: 'primary', tint: 'primary-text' } },
                textSecondary: 'gray',
            },
        },
    }),
}));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}), mono: () => ({}) } }));
vi.mock('@/sync/storage', () => ({ useLocalSetting: () => true }));
vi.mock('@/text', () => ({
    t: (key: string) => ({
        'githubIssues.newIssue': 'New issue',
        'githubIssues.noOpenIssues': 'No open issues',
        'githubIssues.openIssues': 'Open issues',
        'githubIssues.repository': 'Repository',
        'githubIssues.sessionRepository': 'Session repository',
        'githubIssues.unableToLoadIssues': 'Unable to load issues',
        'githubIssues.viewAllIssues': 'View all issues',
    } as Record<string, string>)[key] ?? key,
}));
vi.mock('@/sync/ops', () => ({
    sessionBash: vi.fn(async () => ({ success: false, stdout: '' })),
}));
vi.mock('@/utils/isTauri', () => ({ isTauri: () => true }));
vi.mock('./GithubRepositoryPicker', async () => {
    const ReactModule = await import('react');
    return { GithubRepositoryPicker: (props: any) => ReactModule.createElement('GithubRepositoryPicker', props) };
});
vi.mock('./githubIssuesApi', () => ({
    githubIssuesApi: { installationUrl: undefined, listIssues },
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
    listIssues.mockClear();
    remember.mockClear();
    resolve.mockClear();
});

function findIssuesEntry(renderer: ReturnType<typeof create>) {
    return renderer.root.findAllByType('Pressable' as any).find(
        (node: any) => node.props.accessibilityLabel === 'GitHub Issues',
    )!;
}

describe('GitHub Issues Session entry', () => {
    it('opens a Session context panel without leaving the Session', async () => {
        let renderer: ReturnType<typeof create>;
        await act(async () => {
            renderer = create(React.createElement(GithubIssuesButton, {
                showLabel: true,
                sessionId: 'session-a',
                cwd: '/work/happy',
            }));
        });

        expect(findIssuesEntry(renderer!).findByType('Text' as any).props.children).toBe('happy');

        await act(async () => {
            await findIssuesEntry(renderer!).props.onPress();
        });

        expect(resolve).toHaveBeenCalledWith({ sessionId: 'session-a', path: '/work/happy' });
        expect(push).not.toHaveBeenCalled();
        expect(renderer!.root.findByType('Modal' as any).props.visible).toBe(true);
        expect(listIssues).toHaveBeenCalledWith({ owner: 'myartings', repo: 'happy', state: 'open' });
        expect(renderer!.root.findAllByType('Text' as any).some(
            (node: any) => node.props.children === 'Keep Session context visible',
        )).toBe(true);

        const issueRow = renderer!.root.findAllByType('Pressable' as any).find(
            (node: any) => node.props.accessibilityLabel === 'Issue #42: Keep Session context visible',
        );
        await act(async () => {
            issueRow!.props.onPress();
        });
        expect(push).toHaveBeenCalledWith({
            pathname: '/github-issues/[number]',
            params: {
                owner: 'myartings',
                repo: 'happy',
                number: 42,
                sourceSessionId: 'session-a',
            },
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
            await findIssuesEntry(renderer!).props.onPress();
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
            await findIssuesEntry(renderer!).props.onPress();
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
