import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const { issueState } = vi.hoisted(() => ({ issueState: { value: 'open' as 'open' | 'closed' } }));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        Pressable: host('Pressable'),
        ScrollView: host('ScrollView'),
        Text: host('Text'),
        View: host('View'),
    };
});
vi.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ owner: 'myartings', repo: 'happy', number: '1' }),
    useRouter: () => ({ back: vi.fn() }),
}));
vi.mock('react-native-unistyles', () => ({
    useUnistyles: () => ({
        theme: {
            colors: {
                button: { primary: { tint: 'white' } },
                groupped: { background: 'background' },
                text: 'black',
                textDestructive: 'red',
                textLink: 'cyan',
                textSecondary: 'gray',
            },
        },
    }),
}));
vi.mock('@/sync/storage', () => ({ useLocalSetting: () => true }));
vi.mock('@/components/markdown/MarkdownView', async () => {
    const ReactModule = await import('react');
    return { MarkdownView: (props: any) => ReactModule.createElement('MarkdownView', props) };
});
vi.mock('@/modal', () => ({
    Modal: { alert: vi.fn(), confirm: vi.fn(async () => false) },
}));
vi.mock('./githubIssuesApi', () => ({
    githubIssuesApi: {
        getIssue: vi.fn(async () => ({
            number: 1,
            nodeId: 'issue-node',
            title: 'Acceptance issue',
            body: 'Body',
            state: issueState.value,
            url: 'https://github.com/myartings/happy/issues/1',
            updatedAt: '2026-08-10T00:00:00Z',
            comments: 0,
            viewerCanDelete: true,
            author: { login: 'myartings', avatarUrl: '' },
            labels: [],
        })),
        setIssueState: vi.fn(async () => undefined),
        deleteIssue: vi.fn(async () => undefined),
    },
}));

import GithubIssueDetailScreen from '@/app/(app)/github-issues/[number]';

const originalConsoleError = console.error;

beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});

afterAll(() => vi.restoreAllMocks());

describe('GitHub Issue detail state action', () => {
    it.each([
        ['open', 'Close issue'],
        ['closed', 'Reopen issue'],
    ] as const)('renders the %s Issue action with the visible page link color', async (state, label) => {
        issueState.value = state;
        let renderer: ReturnType<typeof create>;
        await act(async () => {
            renderer = create(React.createElement(GithubIssueDetailScreen));
        });

        const action = renderer!.root.findAllByType('Text' as any)
            .find((item: { props: { children?: string } }) => item.props.children === label);
        expect(action).toBeDefined();
        expect(action!.props.style).toMatchObject({ color: 'cyan' });
    });
});
