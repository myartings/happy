import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    state: 'open' as 'open' | 'closed',
    params: { owner: 'myartings', repo: 'happy', number: '1', sourceSessionId: 'session-1' },
    confirm: vi.fn(async () => false),
    updateSessionDraft: vi.fn(),
    navigateToSession: vi.fn(),
    routerBack: vi.fn(),
    screenOptions: null as any,
    theme: {
        colors: {
            button: { primary: { background: 'blue', tint: 'white' } },
            groupped: { background: 'background' }, header: { tint: 'black' }, input: { background: 'white', text: 'black' },
            surface: 'white', surfaceHigh: 'gray', surfaceHighest: 'gray', text: 'black', textDestructive: 'red', textLink: 'cyan', textSecondary: 'gray',
        },
    },
}));
vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return { ActivityIndicator: host('ActivityIndicator'), Modal: host('Modal'), Pressable: host('Pressable'), ScrollView: host('ScrollView'), View: host('View') };
});
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Ionicons', props) };
});
vi.mock('expo-router', () => ({
    Stack: { Screen: (props: any) => { mocks.screenOptions = props.options; return null; } },
    useLocalSearchParams: () => mocks.params,
    useRouter: () => ({ back: mocks.routerBack, navigate: vi.fn() }),
}));
vi.mock('react-native-unistyles', () => ({ StyleSheet: { create: (factory: any) => factory(mocks.theme) }, useUnistyles: () => ({ theme: mocks.theme }) }));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/components/layout', () => ({ layout: { maxWidth: 800 } }));
vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}) } }));
vi.mock('@/components/markdown/MarkdownView', async () => {
    const ReactModule = await import('react');
    return { MarkdownView: (props: any) => ReactModule.createElement('MarkdownView', props) };
});
vi.mock('@/hooks/useNewSessionDraft', () => ({ useNewSessionDraft: () => ({ setMachineId: vi.fn(), setPath: vi.fn(), setInput: vi.fn() }) }));
vi.mock('@/hooks/useNavigateToSession', () => ({ useNavigateToSession: () => mocks.navigateToSession }));
vi.mock('@/modal', () => ({ Modal: { alert: vi.fn(), confirm: mocks.confirm } }));
vi.mock('@/sync/storage', () => ({
    useLocalSetting: () => true,
    useAllSessions: () => [{ id: 'session-1', active: true, draft: 'Keep these notes', metadata: { path: '/repo', machineId: 'machine-1' } }],
    storage: { getState: () => ({
        sessions: { 'session-1': { draft: 'Keep these notes', metadata: { path: '/repo', machineId: 'machine-1' } } },
        updateSessionDraft: mocks.updateSessionDraft,
    }) },
}));
vi.mock('@/sync/ops', () => ({ sessionBash: vi.fn(async () => ({ success: true })) }));
vi.mock('@/utils/openExternalUrl', () => ({ openExternalUrl: vi.fn(async () => undefined) }));
vi.mock('@/utils/sessionUtils', () => ({ getSessionName: () => 'Current session', getSessionSubtitle: () => '/repo' }));
vi.mock('@/text', async () => {
    const { en } = await import('@/text/_default');
    return { t: (key: string, params?: any) => { let value: any = en; for (const part of key.split('.')) value = value[part]; return typeof value === 'function' ? value(params) : value; } };
});
vi.mock('./githubIssuesApi', () => ({
    getGithubIssueRelativeTime: () => ({ value: 1, unit: 'day' }),
    buildGithubIssueDispatchTask: () => ({ prompt: 'Triage and implement issue #1.' }),
    prepareGithubIssueSessionDraft: (draft: string, task: { prompt: string }) => `${draft}\n\n${task.prompt}`,
    githubIssuesApi: {
        getIssue: vi.fn(async () => ({
            number: 1, nodeId: 'node', title: 'Acceptance issue', body: 'Body', state: mocks.state,
            url: 'https://github.com/myartings/happy/issues/1', updatedAt: '2026-08-10T00:00:00Z', comments: 2,
            viewerCanDelete: true, author: { login: 'myartings', avatarUrl: '' }, labels: [{ name: 'bug', color: 'red' }],
        })),
        setIssueState: vi.fn(async () => ({ state: mocks.state === 'open' ? 'closed' : 'open' })),
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
beforeEach(() => { vi.clearAllMocks(); mocks.state = 'open'; mocks.confirm.mockResolvedValue(false); });

async function renderScreen() {
    let renderer: ReturnType<typeof create>;
    await act(async () => { renderer = create(React.createElement(GithubIssueDetailScreen)); });
    return renderer!;
}
function findText(renderer: ReturnType<typeof create>, value: string) {
    return renderer.root.findAllByType('Text' as any).find((node: any) => node.props.children === value);
}
function pressForText(renderer: ReturnType<typeof create>, value: string) {
    let node: any = findText(renderer, value);
    while (node && typeof node.props.onPress !== 'function') node = node.parent;
    if (!node) throw new Error(`No press target for ${value}`);
    return node.props.onPress();
}

describe('GitHub Issue detail', () => {
    it.each([['open', 'Close issue'], ['closed', 'Reopen issue']] as const)('shows the visible %s lifecycle action', async (state, label) => {
        mocks.state = state;
        const renderer = await renderScreen();
        expect(findText(renderer, 'Acceptance issue')).toBeDefined();
        expect(findText(renderer, 'Work on this issue')).toBeDefined();
        expect(findText(renderer, label)).toBeDefined();
    });

    it('requires a precise irreversible confirmation before permanent deletion', async () => {
        const renderer = await renderScreen();
        await act(async () => { mocks.screenOptions.headerRight().props.onPress(); });
        await act(async () => { pressForText(renderer, 'Delete permanently'); });
        expect(mocks.confirm).toHaveBeenCalledWith('Delete permanently?', 'myartings/happy #1 will be deleted from GitHub and cannot be recovered.', expect.objectContaining({ destructive: true }));
    });

    it('confirms before appending work to an existing current-session draft', async () => {
        mocks.confirm.mockResolvedValue(true);
        const renderer = await renderScreen();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });
        await act(async () => { pressForText(renderer, 'Add to current session'); });
        expect(mocks.confirm).toHaveBeenCalledWith('Add to existing draft?', expect.any(String), expect.objectContaining({ confirmText: 'Add to draft' }));
        expect(mocks.updateSessionDraft).toHaveBeenCalledWith('session-1', 'Keep these notes\n\nTriage and implement issue #1.');
        expect(mocks.navigateToSession).toHaveBeenCalledWith('session-1');
    });
});
