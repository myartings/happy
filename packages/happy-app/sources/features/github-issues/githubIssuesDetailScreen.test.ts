import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    state: 'open' as 'open' | 'closed',
    params: { owner: 'myartings', repo: 'happy', number: '1', sourceSessionId: 'session-1' },
    confirm: vi.fn(async () => false),
    alert: vi.fn(),
    updateSessionDraft: vi.fn(),
    navigateToSession: vi.fn(),
    routerBack: vi.fn(),
    routerPush: vi.fn(),
    screenOptions: null as any,
    claimBinding: vi.fn(),
    replaceBinding: vi.fn(),
    resolveBinding: vi.fn(),
    validateBindingIntentAccount: vi.fn(),
    bindingResolution: { kind: 'unbound' } as any,
    currentSessionProjection: null as any,
    sessionDraft: 'Keep these notes' as string | null,
    sessionIsSideChat: false,
    resolvedRepositoryId: 79,
    restoreResult: { outcome: 'restored', sessionId: 'archived-session' } as any,
    newSessionDraftInput: 'Keep this new-session draft',
    setNewSessionInput: vi.fn(),
    setNewSessionBindingIntent: vi.fn(),
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
    return { ActivityIndicator: host('ActivityIndicator'), Modal: host('Modal'), Pressable: host('Pressable'), ScrollView: host('ScrollView'), TextInput: host('TextInput'), View: host('View') };
});
vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    return { Ionicons: (props: any) => ReactModule.createElement('Ionicons', props) };
});
vi.mock('expo-router', () => ({
    Stack: { Screen: (props: any) => { mocks.screenOptions = props.options; return null; } },
    useLocalSearchParams: () => mocks.params,
    useRouter: () => ({ back: mocks.routerBack, navigate: vi.fn(), push: mocks.routerPush }),
}));
vi.mock('react-native-unistyles', () => ({ StyleSheet: { create: (factory: any) => factory(mocks.theme) }, useUnistyles: () => ({ theme: mocks.theme }) }));
vi.mock('@/components/StyledText', async () => {
    const ReactModule = await import('react');
    return { Text: (props: any) => ReactModule.createElement('Text', props, props.children) };
});
vi.mock('@/components/layout', () => ({ layout: { maxWidth: 800 } }));
vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}), mono: () => ({}) } }));
vi.mock('@/components/markdown/MarkdownView', async () => {
    const ReactModule = await import('react');
    return { MarkdownView: (props: any) => ReactModule.createElement('MarkdownView', props) };
});
vi.mock('@/hooks/useNewSessionDraft', () => ({ useNewSessionDraft: () => ({
    input: mocks.newSessionDraftInput,
    setMachineId: vi.fn(),
    setPath: vi.fn(),
    setInput: mocks.setNewSessionInput,
    setGithubIssueBindingIntent: mocks.setNewSessionBindingIntent,
}) }));
vi.mock('@/hooks/useNavigateToSession', () => ({ useNavigateToSession: () => mocks.navigateToSession }));
vi.mock('@/modal', () => ({ Modal: { alert: mocks.alert, confirm: mocks.confirm } }));
vi.mock('@/sync/storage', () => ({
    useLocalSetting: () => true,
    useAllSessions: () => [{ id: 'session-1', active: true, draft: mocks.sessionDraft, metadata: { path: '/repo', machineId: 'machine-1', isSideChat: mocks.sessionIsSideChat } }],
    storage: { getState: () => ({
        sessions: { 'session-1': { id: 'session-1', active: true, draft: mocks.sessionDraft, metadata: { path: '/repo', machineId: 'machine-1', isSideChat: mocks.sessionIsSideChat } } },
        updateSessionDraft: mocks.updateSessionDraft,
    }) },
}));
vi.mock('@/sync/ops', () => ({ sessionBash: vi.fn(async () => ({ success: true })) }));
vi.mock('@/utils/openExternalUrl', () => ({ openExternalUrl: vi.fn(async () => undefined) }));
vi.mock('@/utils/sessionUtils', () => ({ getSessionName: () => 'Current session', getSessionSubtitle: () => '/repo' }));
vi.mock('@/features/github-issues/githubIssueBindingIntent', () => ({
    prepareGithubIssueBindingIntent: vi.fn(async () => ({ accountScope: 'f'.repeat(64), issueKey: 'a'.repeat(64), encryptedPayload: 'ciphertext', requestId: 'request-id-00001' })),
    validateGithubIssueBindingIntentAccount: mocks.validateBindingIntentAccount,
}));
vi.mock('@/features/github-issues/githubIssueBindingApi', () => ({
    githubIssueBindingApi: { resolve: mocks.resolveBinding, claim: mocks.claimBinding, replace: mocks.replaceBinding },
}));
vi.mock('@/features/github-issues/githubIssueBindingStore', () => ({
    getGithubIssueCanonicalProjectionByIssueKey: vi.fn(() => null),
    getGithubIssueCanonicalIssueKeyForSession: vi.fn(() => mocks.currentSessionProjection?.status === 'bound'
        ? mocks.currentSessionProjection.issueKey
        : null),
    refreshGithubIssueSessionProjections: vi.fn(async () => undefined),
    validateGithubIssueBindingEvidence: vi.fn(async () => true),
}));
vi.mock('@/features/github-issues/githubIssueBindingRestore', () => ({
    restoreGithubIssueCanonicalSession: vi.fn(async () => mocks.restoreResult),
}));
vi.mock('@/features/github-issues/githubIssueBindingDispatch', () => ({
    resolveGithubIssueBindingDispatch: vi.fn(async () => mocks.bindingResolution),
    getGithubIssueBindingDispatchActionKey: (resolution: { kind: string }) => ({
        loading: 'githubIssues.checkingSession', binding: 'githubIssues.bindingSession',
        continue: 'githubIssues.continueSession', restore: 'githubIssues.restoreSession',
        offline: 'githubIssues.openCachedSession', 'repair-required': 'githubIssues.repairSession',
        conflict: 'githubIssues.bindingConflict', unavailable: 'githubIssues.bindingOffline',
    } as Record<string, string>)[resolution.kind] ?? 'githubIssues.workOnIssue',
}));
vi.mock('@/text', async () => {
    const { en } = await import('@/text/_default');
    return { t: (key: string, params?: any) => { let value: any = en; for (const part of key.split('.')) value = value[part]; return typeof value === 'function' ? value(params) : value; } };
});
vi.mock('./githubIssuesApi', () => ({
    getGithubIssueRelativeTime: () => ({ value: 1, unit: 'day' }),
    buildGithubIssueDispatchTask: () => ({ prompt: 'Triage and implement issue #1.' }),
    prepareGithubIssueSessionDraft: (draft: string, task: { prompt: string }) => `${draft}\n\n${task.prompt}`,
    githubIssuesRepositoryResolver: {
        resolve: vi.fn(async () => ({
            status: 'resolved',
            repository: { id: mocks.resolvedRepositoryId, owner: 'myartings', name: 'happy' },
        })),
    },
    githubIssuesApi: {
        getIssue: vi.fn(async () => ({
            number: 1, nodeId: 'node', title: 'Acceptance issue', body: 'Body', state: mocks.state,
            url: 'https://github.com/myartings/happy/issues/1', updatedAt: '2026-08-10T00:00:00Z', comments: 2,
            viewerCanDelete: true, author: { login: 'myartings', avatarUrl: '' }, labels: [{ name: 'bug', color: 'red' }],
        })),
        setIssueState: vi.fn(async () => ({ state: mocks.state === 'open' ? 'closed' : 'open' })),
        deleteIssue: vi.fn(async () => undefined),
        listRepositories: vi.fn(async () => [{ id: 79, owner: 'myartings', name: 'happy', fullName: 'myartings/happy', private: true, url: '' }]),
    },
}));

import GithubIssueDetailScreen from '@/app/(app)/github-issues/[number]';
import { GithubIssuesWorkspacePanel } from './GithubIssuesWorkspacePanel';

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
    mocks.state = 'open';
    mocks.confirm.mockResolvedValue(false);
    mocks.bindingResolution = { kind: 'unbound' };
    mocks.currentSessionProjection = null;
    mocks.sessionDraft = 'Keep these notes';
    mocks.sessionIsSideChat = false;
    mocks.validateBindingIntentAccount.mockResolvedValue(true);
    mocks.resolvedRepositoryId = 79;
    mocks.restoreResult = { outcome: 'restored', sessionId: 'archived-session' };
    mocks.newSessionDraftInput = 'Keep this new-session draft';
    mocks.claimBinding.mockResolvedValue({ outcome: 'claimed', binding: { sessionId: 'session-1' } });
    mocks.replaceBinding.mockResolvedValue({ outcome: 'replaced', binding: { sessionId: 'session-1' } });
    mocks.resolveBinding.mockResolvedValue({
        outcome: 'bound',
        binding: { sessionId: 'former-session', revision: 4 },
    });
});
vi.mock('expo-crypto', () => ({ randomUUID: () => 'repair-request-id-00001' }));

async function renderScreen() {
    let renderer: ReturnType<typeof create>;
    await act(async () => { renderer = create(React.createElement(GithubIssueDetailScreen)); });
    return renderer!;
}
async function renderWorkspacePanel() {
    let renderer: ReturnType<typeof create>;
    await act(async () => {
        renderer = create(React.createElement(GithubIssuesWorkspacePanel, {
            parentSessionId: 'session-1',
            selection: { mode: 'detail', repository: { owner: 'myartings', repo: 'happy' }, issueNumber: 1 },
            onSelectionChange: vi.fn(),
        }));
    });
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
        expect(mocks.confirm).toHaveBeenCalledWith(
            'Make this the canonical Session?',
            expect.stringContaining("myartings/happy#1\nSession: session-1\nThis Session will become the Issue's sole Happy continuation point."),
            expect.objectContaining({ confirmText: 'Make canonical' }),
        );
        expect(mocks.claimBinding).toHaveBeenCalledWith({
            accountScope: 'f'.repeat(64),
            issueKey: 'a'.repeat(64),
            encryptedPayload: 'ciphertext',
            requestId: 'request-id-00001',
            candidateSessionId: 'session-1',
        });
        expect(mocks.claimBinding.mock.invocationCallOrder[0])
            .toBeLessThan(mocks.updateSessionDraft.mock.invocationCallOrder[0]);
        expect(mocks.updateSessionDraft).toHaveBeenCalledWith('session-1', 'Keep these notes\n\nTriage and implement issue #1.');
        expect(mocks.navigateToSession).toHaveBeenCalledWith('session-1');
    });

    it.each([
        ['standalone', renderScreen],
        ['workspace panel', renderWorkspacePanel],
    ] as const)('requires canonical-adoption confirmation without an existing draft on the %s surface', async (_surface, render) => {
        mocks.sessionDraft = null;
        mocks.confirm.mockResolvedValue(false);
        const renderer = await render();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });
        await act(async () => { pressForText(renderer, 'Add to current session'); });

        expect(mocks.confirm).toHaveBeenCalledWith(
            'Make this the canonical Session?',
            expect.stringContaining("This Session will become the Issue's sole Happy continuation point."),
            expect.objectContaining({ confirmText: 'Make canonical' }),
        );
        expect(mocks.claimBinding).not.toHaveBeenCalled();
        expect(mocks.updateSessionDraft).not.toHaveBeenCalled();
    });

    it.each([
        ['standalone', renderScreen],
        ['workspace panel', renderWorkspacePanel],
    ] as const)('preserves the existing draft when the account changes before adoption on the %s surface', async (_surface, render) => {
        mocks.confirm.mockResolvedValue(true);
        const renderer = await render();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });
        mocks.validateBindingIntentAccount.mockResolvedValue(false);
        await act(async () => { pressForText(renderer, 'Add to current session'); });

        expect(mocks.claimBinding).not.toHaveBeenCalled();
        expect(mocks.updateSessionDraft).not.toHaveBeenCalled();
        expect(mocks.navigateToSession).not.toHaveBeenCalled();
        expect(mocks.setNewSessionBindingIntent).toHaveBeenCalledWith(null);
        expect(mocks.alert).toHaveBeenCalledWith(
            'Error',
            'myartings/happy#1: This Issue binding belongs to another account. Reopen the Issue and retry.',
        );
        mocks.setNewSessionInput.mockClear();
        mocks.setNewSessionBindingIntent.mockClear();
        await act(async () => { pressForText(renderer, 'Start a new session'); });
        expect(mocks.setNewSessionInput).not.toHaveBeenCalled();
        expect(mocks.setNewSessionBindingIntent).not.toHaveBeenCalled();
    });

    it('does not offer the current Session when its resolved repository differs', async () => {
        mocks.resolvedRepositoryId = 80;
        const renderer = await renderScreen();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });
        expect(findText(renderer, 'Add to current session')).toBeUndefined();
        expect(findText(renderer, 'Start a new session')).toBeDefined();
    });

    it.each([
        ['standalone', renderScreen],
        ['workspace panel', renderWorkspacePanel],
    ] as const)('preserves an existing New Session composer draft on the %s surface', async (_surface, render) => {
        const renderer = await render();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });
        await act(async () => { pressForText(renderer, 'Start a new session'); });

        expect(mocks.setNewSessionInput).toHaveBeenCalledWith(
            'Keep this new-session draft\n\nTriage and implement issue #1.',
        );
    });

    it.each([
        ['standalone', renderScreen],
        ['workspace panel', renderWorkspacePanel],
    ] as const)('does not offer a Session already bound to another Issue on the %s surface', async (_surface, render) => {
        mocks.currentSessionProjection = {
            issueKey: 'b'.repeat(64),
            sessionId: 'session-1',
            revision: 2,
            status: 'bound',
        };
        const renderer = await render();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });

        expect(findText(renderer, 'Add to current session')).toBeUndefined();
        expect(findText(renderer, 'Start a new session')).toBeDefined();
    });

    it.each([
        ['standalone', renderScreen],
        ['workspace panel', renderWorkspacePanel],
    ] as const)('does not offer a side chat as the canonical Session on the %s surface', async (_surface, render) => {
        mocks.sessionIsSideChat = true;
        const renderer = await render();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });

        expect(findText(renderer, 'Add to current session')).toBeUndefined();
        expect(findText(renderer, 'Start a new session')).toBeDefined();
    });

    it('requires exact old/new/Issue confirmation for repair replacement', async () => {
        mocks.bindingResolution = { kind: 'repair-required', expectedRevision: 4, formerSessionId: 'deleted-session' };
        mocks.confirm.mockResolvedValue(true);
        const renderer = await renderScreen();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Repair Session' }).props.onPress(); });
        await act(async () => { pressForText(renderer, 'Add to current session'); });

        expect(mocks.confirm).toHaveBeenCalledWith(
            'Replace canonical Session?',
            'myartings/happy#1\nFormer Session: deleted-session\nReplacement Session: session-1',
            expect.objectContaining({ confirmText: 'Replace Session' }),
        );
        expect(mocks.replaceBinding).toHaveBeenCalledWith(expect.objectContaining({
            expectedRevision: 4,
            replacementSessionId: 'session-1',
        }));
    });

    it.each([
        ['standalone', renderScreen, async (renderer: ReturnType<typeof create>) => {
            await act(async () => { mocks.screenOptions.headerRight().props.onPress(); });
        }],
        ['workspace panel', renderWorkspacePanel, async (renderer: ReturnType<typeof create>) => {
            await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Issue actions' }).props.onPress(); });
        }],
    ] as const)('offers revision-safe exceptional replacement for an intact canonical Session on the %s surface', async (_surface, render, openActions) => {
        mocks.bindingResolution = { kind: 'continue', sessionId: 'former-session' };
        mocks.confirm.mockResolvedValue(true);
        const renderer = await render();
        await openActions(renderer);
        await act(async () => { pressForText(renderer, 'Replace canonical Session…'); });
        await act(async () => { pressForText(renderer, 'Add to current session'); });

        expect(mocks.confirm).toHaveBeenCalledWith(
            'Replace canonical Session?',
            'myartings/happy#1\nFormer Session: former-session\nReplacement Session: session-1',
            expect.objectContaining({ confirmText: 'Replace Session' }),
        );
        expect(mocks.replaceBinding).toHaveBeenCalledWith(expect.objectContaining({
            expectedRevision: 4,
            replacementSessionId: 'session-1',
        }));
    });

    it.each([
        ['standalone', renderScreen, async (renderer: ReturnType<typeof create>) => {
            await act(async () => { mocks.screenOptions.headerRight().props.onPress(); });
        }],
        ['workspace panel', renderWorkspacePanel, async (renderer: ReturnType<typeof create>) => {
            await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Issue actions' }).props.onPress(); });
        }],
    ] as const)('does not offer the current canonical Session as its own replacement on the %s surface', async (_surface, render, openActions) => {
        mocks.bindingResolution = { kind: 'continue', sessionId: 'session-1' };
        mocks.resolveBinding.mockResolvedValue({
            outcome: 'bound',
            binding: { sessionId: 'session-1', revision: 4 },
        });
        const renderer = await render();
        await openActions(renderer);
        await act(async () => { pressForText(renderer, 'Replace canonical Session…'); });

        expect(findText(renderer, 'Add to current session')).toBeUndefined();
        expect(findText(renderer, 'Start a new session')).toBeDefined();
    });

    it.each([
        ['standalone', renderScreen],
        ['workspace panel', renderWorkspacePanel],
    ] as const)('keeps repair open when current-session claim races with repair on the %s surface', async (_surface, render) => {
        mocks.confirm.mockResolvedValue(true);
        mocks.claimBinding.mockResolvedValue({
            outcome: 'repair-required',
            binding: { sessionId: null, lastSessionId: 'former-session', revision: 6 },
        });
        const renderer = await render();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });
        await act(async () => { pressForText(renderer, 'Add to current session'); });

        expect(mocks.updateSessionDraft).not.toHaveBeenCalled();
        expect(mocks.navigateToSession).not.toHaveBeenCalled();
        expect(findText(renderer, 'Repair Session')).toBeDefined();
    });

    it('shows Restore, resumes the archived canonical Session, and opens it', async () => {
        mocks.bindingResolution = { kind: 'restore', sessionId: 'archived-session' };
        const renderer = await renderScreen();

        expect(findText(renderer, 'Restore Session')).toBeDefined();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Restore Session' }).props.onPress(); });

        expect(mocks.navigateToSession).toHaveBeenCalledWith('archived-session');
        expect(mocks.claimBinding).not.toHaveBeenCalled();
    });

    it.each([
        ['standalone', renderScreen],
        ['workspace panel', renderWorkspacePanel],
    ] as const)('localizes Restore failure without exposing daemon text on the %s surface', async (_surface, render) => {
        mocks.bindingResolution = { kind: 'restore', sessionId: 'archived-session' };
        mocks.restoreResult = { outcome: 'unavailable', message: 'daemon secret detail' };
        const renderer = await render();

        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Restore Session' }).props.onPress(); });

        expect(mocks.alert).toHaveBeenCalledWith(
            'Error',
            'myartings/happy#1: The canonical Session could not be restored. Open Session Info to repair or retry.',
        );
        expect(mocks.alert).not.toHaveBeenCalledWith('Error', expect.stringContaining('daemon secret detail'));
    });

    it('opens the synchronized canonical Session from the offline action', async () => {
        mocks.bindingResolution = { kind: 'offline', sessionId: 'cached-session' };
        const renderer = await renderScreen();

        expect(findText(renderer, 'Open cached Session · Offline')).toBeDefined();
        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Open cached Session · Offline' }).props.onPress(); });

        expect(mocks.navigateToSession).toHaveBeenCalledWith('cached-session');
        expect(mocks.claimBinding).not.toHaveBeenCalled();
    });

    it('preserves the existing draft and offers retry when authority adoption fails', async () => {
        mocks.confirm.mockResolvedValue(true);
        mocks.claimBinding.mockRejectedValue(new Error('offline'));
        const renderer = await renderScreen();

        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });
        await act(async () => { pressForText(renderer, 'Add to current session'); });

        expect(mocks.updateSessionDraft).not.toHaveBeenCalled();
        expect(mocks.navigateToSession).not.toHaveBeenCalled();
        expect(mocks.alert).toHaveBeenCalledWith(
            'Error',
            'myartings/happy#1: The canonical Session authority is unavailable. Your draft is preserved; reconnect and retry.',
        );
    });

    it('preserves the existing draft when workspace-panel authority adoption fails', async () => {
        mocks.confirm.mockResolvedValue(true);
        mocks.claimBinding.mockRejectedValue(new Error('offline'));
        const renderer = await renderWorkspacePanel();

        await act(async () => { renderer.root.findByProps({ accessibilityLabel: 'Work on this issue' }).props.onPress(); });
        await act(async () => { pressForText(renderer, 'Add to current session'); });

        expect(mocks.updateSessionDraft).not.toHaveBeenCalled();
        expect(mocks.alert).toHaveBeenCalledWith(
            'Error',
            'myartings/happy#1: The canonical Session authority is unavailable. Your draft is preserved; reconnect and retry.',
        );
    });
});
