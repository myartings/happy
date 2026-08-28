import { afterEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
    messageHandlers: new Map<string, (update: unknown) => unknown>(),
    reconnectHandlers: [] as Array<() => void>,
    request: vi.fn(),
    gitVisibleInvalidate: vi.fn(),
    voiceFocus: vi.fn(),
}));

vi.hoisted(() => {
    (globalThis as any).__DEV__ = false;
});

// Keep the focused suite runnable from an isolated worktree before pnpm has
// materialized workspace links; use the real shared-package source.
vi.mock('@slopus/happy-wire', async () => import('../../../happy-wire/src/index'));

vi.mock('react-native', () => ({
    AppState: {
        currentState: 'active',
        addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    },
    Platform: { OS: 'ios' },
    Modal: {},
}));

vi.mock('expo-constants', () => ({
    default: { expoConfig: { version: '1.0.0-test' } },
}));

vi.mock('expo-device', () => ({
    deviceName: 'test-device',
    modelName: 'test-model',
}));

vi.mock('expo-crypto', () => ({
    randomUUID: vi.fn(() => '00000000-0000-4000-8000-000000000000'),
}));

vi.mock('expo-notifications', () => ({
    dismissNotificationAsync: vi.fn(),
    scheduleNotificationAsync: vi.fn(),
}));

vi.mock('expo-updates', () => ({
    channel: null,
    runtimeVersion: null,
}));

vi.mock('expo-file-system', () => ({
    File: class {},
    Paths: {},
}));

vi.mock('expo-file-system/legacy', () => ({}));

vi.mock('expo-modules-core', () => ({
    requireOptionalNativeModule: vi.fn(() => null),
    requireNativeModule: vi.fn(() => ({})),
}));

vi.mock('@/auth/tokenStorage', () => ({
    TokenStorage: { getCredentials: vi.fn() },
}));

vi.mock('@/sync/apiSocket', () => ({
    apiSocket: {
        ensureHealthy: vi.fn(async () => true),
        onMessage: vi.fn((type: string, handler: (update: unknown) => unknown) => {
            harness.messageHandlers.set(type, handler);
        }),
        onReconnected: vi.fn((handler: () => void) => {
            harness.reconnectHandlers.push(handler);
        }),
        request: harness.request,
        sendAppState: vi.fn(),
    },
    getCurrentAppState: vi.fn(() => 'active'),
    getHappyClientId: vi.fn(() => 'test-client'),
    setDesktopWindowFocused: vi.fn(),
}));

vi.mock('@/track', () => ({
    initializeTracking: vi.fn(),
    tracking: null,
    trackGitHubConnected: vi.fn(),
    trackMessageSent: vi.fn(),
    trackPaywallCancelled: vi.fn(),
    trackPaywallError: vi.fn(),
    trackPaywallPresented: vi.fn(),
    trackPaywallPurchased: vi.fn(),
    trackPaywallRestored: vi.fn(),
    trackEvent: vi.fn(),
    trackError: vi.fn(),
}));

vi.mock('@/modal', () => ({
    Modal: { alert: vi.fn() },
}));

vi.mock('@/realtime/hooks/voiceHooks', () => ({
    voiceHooks: {
        onSessionFocus: harness.voiceFocus,
        onSessionOffline: vi.fn(),
        onSessionOnline: vi.fn(),
        onMessages: vi.fn(),
        onPermissionRequested: vi.fn(),
    },
}));

vi.mock('@/realtime/RealtimeSession', () => ({
    getCurrentRealtimeSessionId: vi.fn(() => null),
    getVoiceSession: vi.fn(() => null),
}));

vi.mock('@/components/tools/knownTools', () => ({
    isMutableTool: vi.fn(() => false),
}));

vi.mock('./encryption/encryption', () => ({
    Encryption: class {},
}));

vi.mock('./encryption/encryptionCache', () => ({
    EncryptionCache: class {},
}));

vi.mock('./encryption/artifactEncryption', () => ({
    ArtifactEncryption: class {},
}));

vi.mock('@/encryption/blob', () => ({
    encryptBlob: vi.fn(),
}));

vi.mock('@/utils/platform', () => ({
    Platform: {
        OS: 'ios',
        isDesktop: false,
        isWeb: false,
    },
    isRunningOnMac: vi.fn(() => false),
}));

vi.mock('./pushRegistration', () => ({
    syncCurrentPushToken: vi.fn(),
}));

vi.mock('./gitStatusSync', () => ({
    gitStatusSync: {
        getSync: vi.fn(() => ({ invalidate: harness.gitVisibleInvalidate })),
        invalidate: vi.fn(),
        clearForSession: vi.fn(),
    },
}));

vi.mock('./revenueCat', () => ({
    RevenueCat: class {},
    LogLevel: {},
    PaywallResult: {},
}));

vi.mock('expo-localization', () => ({
    getLocales: () => [{ languageCode: 'en', languageTag: 'en-US' }],
}));

vi.mock('react-native-mmkv', () => ({
    MMKV: class {
        private values = new Map<string, unknown>();
        getString(key: string) { return this.values.get(key) as string | undefined; }
        getBoolean(key: string) { return this.values.get(key) as boolean | undefined; }
        getNumber(key: string) { return this.values.get(key) as number | undefined; }
        set(key: string, value: unknown) { this.values.set(key, value); }
        delete(key: string) { this.values.delete(key); }
    },
}));

import { Sync } from './sync';
import { storage } from './storage';
import {
    startClientLongSessionDiagnosticsCapture,
    type ClientLongSessionDiagnosticsCapture,
} from '@/features/client-performance/clientLongSessionDiagnostics';
import type { NormalizedMessage } from './typesRaw';

let diagnosticsCapture: ClientLongSessionDiagnosticsCapture | null = null;

function response(body: unknown) {
    return {
        ok: true,
        status: 200,
        json: vi.fn(async () => body),
    };
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((resolvePromise) => {
        resolve = resolvePromise;
    });
    return { promise, resolve };
}

async function waitForRequest(path: string, expectedCount = 1) {
    await vi.waitFor(() => {
        const matches = harness.request.mock.calls.filter(([url]) => url === path);
        expect(matches).toHaveLength(expectedCount);
    });
}

function normalizedUserMessage(seq: number): NormalizedMessage {
    return {
        id: `message-${seq}`,
        localId: `local-${seq}`,
        createdAt: seq,
        role: 'user',
        content: { type: 'text', text: `message ${seq}` },
        isSidechain: false,
    };
}

function apiUserMessage(seq: number) {
    return {
        id: `message-${seq}`,
        seq,
        localId: `local-${seq}`,
        content: { t: 'encrypted', c: `ciphertext-${seq}` },
        createdAt: seq,
        updatedAt: seq,
    };
}

function decryptedUserMessage(message: ReturnType<typeof apiUserMessage>) {
    return {
        id: message.id,
        localId: message.localId,
        createdAt: message.createdAt,
        content: {
            role: 'user' as const,
            content: { type: 'text' as const, text: `message ${message.seq}` },
        },
    };
}

function applyTailTestSession(sessionId: string, count: number) {
    storage.getState().applySessions([{
        id: sessionId,
        seq: count,
        createdAt: 1,
        updatedAt: count,
        active: true,
        activeAt: count,
        metadata: null,
        metadataVersion: 1,
        agentState: null,
        agentStateVersion: 1,
        thinking: false,
        thinkingAt: count,
    }]);
    storage.getState().applyMessages(
        sessionId,
        Array.from({ length: count }, (_, index) => normalizedUserMessage(count - index)),
    );
}

afterEach(() => {
    diagnosticsCapture?.stop();
    diagnosticsCapture = null;
    vi.clearAllTimers();
    vi.useRealTimers();
    storage.setState({
        sessions: {},
        sessionMessages: {},
        currentViewingSessionId: null,
    });
});

describe('Sync realtime recovery host', () => {
    it('coalesces one same-window socket burst into one bounded Session-message publication', async () => {
        vi.useFakeTimers();
        harness.messageHandlers.clear();
        harness.reconnectHandlers.length = 0;
        harness.request.mockReset();
        harness.request.mockResolvedValue(response({ messages: [], hasMore: false }));
        storage.setState({
            sessions: {},
            sessionMessages: {},
            currentViewingSessionId: null,
        });

        const instance = new Sync();
        const sessionEncryption = {
            decryptMessages: vi.fn(async () => []),
            decryptMessage: vi.fn(async (message: { id: string; seq: number; createdAt: number }) => ({
                id: message.id,
                localId: null,
                createdAt: message.createdAt,
                content: {
                    role: 'user',
                    content: { type: 'text', text: `message ${message.seq}` },
                },
            })),
        };
        instance.encryption = {
            getSessionEncryption: vi.fn(() => sessionEncryption),
        } as never;
        storage.getState().applySessions([{
            id: 'session-burst',
            seq: 0,
            createdAt: 1,
            updatedAt: 1,
            active: true,
            activeAt: 1,
            metadata: null,
            metadataVersion: 1,
            agentState: null,
            agentStateVersion: 1,
            thinking: true,
            thinkingAt: 1,
        }]);

        instance.subscribeToUpdates();
        instance.onSessionVisible('session-burst');
        await waitForRequest('/v3/sessions/session-burst/messages?before_seq=2147483647&limit=100');
        await vi.waitFor(() => {
            expect(storage.getState().sessionMessages['session-burst']?.isLoaded).toBe(true);
        });
        for (const key of [
            'sessionsSync',
            'machinesSync',
            'artifactsSync',
            'friendsSync',
            'friendRequestsSync',
            'feedSync',
        ]) {
            (instance as any)[key] = { invalidate: vi.fn() };
        }
        expect(harness.reconnectHandlers).toHaveLength(1);
        harness.reconnectHandlers[0]();
        await waitForRequest('/v3/sessions/session-burst/messages?after_seq=0&limit=100');

        const update = harness.messageHandlers.get('update');
        expect(update).toEqual(expect.any(Function));
        diagnosticsCapture = startClientLongSessionDiagnosticsCapture();
        let messagePublications = 0;
        let previousMessages = storage.getState().sessionMessages['session-burst'];
        const unsubscribe = storage.subscribe((state) => {
            const nextMessages = state.sessionMessages['session-burst'];
            if (nextMessages !== previousMessages) {
                previousMessages = nextMessages;
                messagePublications += 1;
            }
        });

        for (let seq = 1; seq <= 100; seq += 1) {
            await update?.({
                id: `update-${seq}`,
                seq,
                createdAt: seq,
                body: {
                    t: 'new-message',
                    sid: 'session-burst',
                    message: {
                        id: `message-${seq}`,
                        seq,
                        localId: null,
                        content: { t: 'encrypted', c: `ciphertext-${seq}` },
                        createdAt: seq,
                        updatedAt: seq,
                    },
                },
            });
        }

        expect(storage.getState().sessionMessages['session-burst']?.messages).toHaveLength(0);
        expect(messagePublications).toBe(0);

        await vi.advanceTimersByTimeAsync(23);
        expect(storage.getState().sessionMessages['session-burst']?.messages).toHaveLength(0);

        await vi.advanceTimersByTimeAsync(1);
        await vi.waitFor(() => {
            expect(storage.getState().sessionMessages['session-burst']?.messages).toHaveLength(100);
        });
        expect(messagePublications).toBe(1);
        expect(diagnosticsCapture.snapshot().counters.messageQueueBatches).toBe(1);

        unsubscribe();
    });

    it('does not apply a queued socket message after the Session is deleted', async () => {
        vi.useFakeTimers();
        harness.messageHandlers.clear();
        harness.reconnectHandlers.length = 0;
        harness.request.mockReset();
        harness.request.mockResolvedValue(response({ messages: [], hasMore: false }));
        storage.setState({
            sessions: {},
            sessionMessages: {},
            currentViewingSessionId: null,
        });

        const instance = new Sync();
        const sessionEncryption = {
            decryptMessages: vi.fn(async () => []),
            decryptMessage: vi.fn(async (message: { id: string; seq: number; createdAt: number }) => ({
                id: message.id,
                localId: null,
                createdAt: message.createdAt,
                content: {
                    role: 'user',
                    content: { type: 'text', text: 'must not reappear' },
                },
            })),
        };
        instance.encryption = {
            getSessionEncryption: vi.fn(() => sessionEncryption),
            removeSessionEncryption: vi.fn(),
        } as never;
        (instance as any).projectsSync = { invalidate: vi.fn() };
        storage.getState().applySessions([{
            id: 'session-deleted',
            seq: 0,
            createdAt: 1,
            updatedAt: 1,
            active: true,
            activeAt: 1,
            metadata: null,
            metadataVersion: 1,
            agentState: null,
            agentStateVersion: 1,
            thinking: true,
            thinkingAt: 1,
        }]);

        instance.subscribeToUpdates();
        instance.onSessionVisible('session-deleted');
        await waitForRequest('/v3/sessions/session-deleted/messages?before_seq=2147483647&limit=100');
        await vi.waitFor(() => {
            expect(storage.getState().sessionMessages['session-deleted']?.isLoaded).toBe(true);
        });
        const update = harness.messageHandlers.get('update');
        expect(update).toEqual(expect.any(Function));
        diagnosticsCapture = startClientLongSessionDiagnosticsCapture();

        await update?.({
            id: 'update-message',
            seq: 1,
            createdAt: 2,
            body: {
                t: 'new-message',
                sid: 'session-deleted',
                message: {
                    id: 'message-stale',
                    seq: 1,
                    localId: null,
                    content: { t: 'encrypted', c: 'ciphertext' },
                    createdAt: 2,
                    updatedAt: 2,
                },
            },
        });
        await update?.({
            id: 'update-delete',
            seq: 2,
            createdAt: 3,
            body: {
                t: 'delete-session',
                sid: 'session-deleted',
            },
        });

        expect(storage.getState().sessions['session-deleted']).toBeUndefined();
        expect(storage.getState().sessionMessages['session-deleted']).toBeUndefined();

        await vi.advanceTimersByTimeAsync(32);

        expect(storage.getState().sessionMessages['session-deleted']).toBeUndefined();
        expect(diagnosticsCapture.snapshot().counters.messageQueueBatches).toBe(0);
    });

    it('does not hold the Session lock while the socket coalescing timer waits', async () => {
        vi.useFakeTimers();
        harness.messageHandlers.clear();
        harness.reconnectHandlers.length = 0;
        harness.request.mockReset();
        harness.request.mockImplementation(async (url: string) => {
            if (url === '/v3/sessions/session-lock/messages?before_seq=2147483647&limit=100') {
                return response({
                    messages: [{
                        id: 'message-10',
                        seq: 10,
                        localId: null,
                        content: { t: 'encrypted', c: 'ciphertext-10' },
                        createdAt: 10,
                        updatedAt: 10,
                    }],
                    hasMore: true,
                });
            }
            if (url === '/v3/sessions/session-lock/messages?before_seq=10&limit=100') {
                return response({ messages: [], hasMore: false });
            }
            return response({ messages: [], hasMore: false });
        });

        const instance = new Sync();
        const toDecryptedMessage = (message: { id: string; seq: number; createdAt: number }) => ({
            id: message.id,
            localId: null,
            createdAt: message.createdAt,
            content: {
                role: 'user',
                content: { type: 'text', text: `message ${message.seq}` },
            },
        });
        const sessionEncryption = {
            decryptMessages: vi.fn(async (messages: Array<{ id: string; seq: number; createdAt: number }>) => (
                messages.map(toDecryptedMessage)
            )),
            decryptMessage: vi.fn(async (message: { id: string; seq: number; createdAt: number }) => (
                toDecryptedMessage(message)
            )),
        };
        instance.encryption = {
            getSessionEncryption: vi.fn(() => sessionEncryption),
        } as never;
        storage.getState().applySessions([{
            id: 'session-lock',
            seq: 10,
            createdAt: 1,
            updatedAt: 1,
            active: true,
            activeAt: 1,
            metadata: null,
            metadataVersion: 1,
            agentState: null,
            agentStateVersion: 1,
            thinking: true,
            thinkingAt: 1,
        }]);

        instance.subscribeToUpdates();
        instance.onSessionVisible('session-lock');
        await waitForRequest('/v3/sessions/session-lock/messages?before_seq=2147483647&limit=100');
        await vi.waitFor(() => {
            expect(storage.getState().sessionMessages['session-lock']?.messages).toHaveLength(1);
        });
        const update = harness.messageHandlers.get('update');
        await update?.({
            id: 'update-11',
            seq: 11,
            createdAt: 11,
            body: {
                t: 'new-message',
                sid: 'session-lock',
                message: {
                    id: 'message-11',
                    seq: 11,
                    localId: null,
                    content: { t: 'encrypted', c: 'ciphertext-11' },
                    createdAt: 11,
                    updatedAt: 11,
                },
            },
        });

        const olderRequest = instance.loadOlderMessages('session-lock');
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(
            harness.request.mock.calls.some(([url]) => (
                url === '/v3/sessions/session-lock/messages?before_seq=10&limit=100'
            )),
        ).toBe(true);
        await olderRequest;
        expect(storage.getState().sessionMessages['session-lock']?.messages).toHaveLength(1);

        await vi.advanceTimersByTimeAsync(24);
        await vi.waitFor(() => {
            expect(storage.getState().sessionMessages['session-lock']?.messages).toHaveLength(2);
        });
    });

    it('reconciles visible sessions through the real cursor and REST path without leaking visibility', async () => {
        vi.useFakeTimers();
        harness.messageHandlers.clear();
        harness.reconnectHandlers.length = 0;
        harness.request.mockReset();
        harness.gitVisibleInvalidate.mockReset();
        harness.voiceFocus.mockReset();
        storage.setState({
            sessions: {},
            sessionMessages: {},
            currentViewingSessionId: null,
        });

        const firstIncremental = deferred<ReturnType<typeof response>>();
        let incrementalCount = 0;
        harness.request.mockImplementation(async (url: string) => {
            if (url === '/v3/sessions/session-visible/messages?before_seq=2147483647&limit=100') {
                return response({ messages: [{ seq: 12 }], hasMore: false });
            }
            if (url.startsWith('/v3/sessions/session-visible/messages?after_seq=')) {
                incrementalCount += 1;
                if (incrementalCount === 1) {
                    return firstIncremental.promise;
                }
                return response({ messages: [], hasMore: false });
            }
            return response({});
        });

        const instance = new Sync();
        const sessionEncryption = {
            decryptMessages: vi.fn(async (messages: unknown[]) => messages.map(() => null)),
            decryptMessage: vi.fn(async () => ({
                id: 'message-13',
                localId: null,
                createdAt: 13,
                content: { role: 'user', content: { type: 'text', text: 'socket advanced' } },
            })),
        };
        instance.encryption = {
            getSessionEncryption: vi.fn(() => sessionEncryption),
        } as never;
        storage.getState().applySessions([{
            id: 'session-visible',
            seq: 1,
            createdAt: 1,
            updatedAt: 1,
            active: true,
            activeAt: 1,
            metadata: null,
            metadataVersion: 1,
            agentState: null,
            agentStateVersion: 1,
            thinking: true,
            thinkingAt: 1,
        }]);

        instance.subscribeToUpdates();
        instance.onSessionVisible('session-visible');
        await waitForRequest('/v3/sessions/session-visible/messages?before_seq=2147483647&limit=100');
        await vi.waitFor(() => {
            expect(storage.getState().sessionMessages['session-visible']?.isLoaded).toBe(true);
        });

        const ephemeral = harness.messageHandlers.get('ephemeral');
        const update = harness.messageHandlers.get('update');
        expect(ephemeral).toEqual(expect.any(Function));
        expect(update).toEqual(expect.any(Function));

        ephemeral?.({
            type: 'activity',
            id: 'session-visible',
            active: true,
            activeAt: 2,
            thinking: false,
        });
        await waitForRequest('/v3/sessions/session-visible/messages?after_seq=12&limit=100');

        await update?.({
            id: 'update-13',
            seq: 13,
            createdAt: 13,
            body: {
                t: 'new-message',
                sid: 'session-visible',
                message: {
                    id: 'message-13',
                    seq: 13,
                    localId: null,
                    content: { t: 'encrypted', c: 'ciphertext' },
                    createdAt: 13,
                    updatedAt: 13,
                },
            },
        });
        firstIncremental.resolve(response({ messages: [{ seq: 12 }], hasMore: false }));
        await vi.waitFor(() => {
            expect(storage.getState().sessionMessages['session-visible']?.messages.length).toBe(1);
        });

        ephemeral?.({
            type: 'session-event',
            sessionId: 'session-visible',
            kind: 'done',
            title: 'done',
            body: 'done',
            timestamp: 14,
        });
        await waitForRequest('/v3/sessions/session-visible/messages?after_seq=13&limit=100');

        for (const key of [
            'sessionsSync',
            'machinesSync',
            'artifactsSync',
            'friendsSync',
            'friendRequestsSync',
            'feedSync',
        ]) {
            (instance as any)[key] = { invalidate: vi.fn() };
        }
        expect(harness.reconnectHandlers).toHaveLength(1);
        harness.reconnectHandlers[0]();
        await waitForRequest('/v3/sessions/session-visible/messages?after_seq=13&limit=100', 2);

        expect(harness.gitVisibleInvalidate).toHaveBeenCalledTimes(1);
        expect(harness.voiceFocus).toHaveBeenCalledTimes(1);

        instance.onSessionHidden('session-visible');
        const requestCountAfterHide = harness.request.mock.calls.length;
        ephemeral?.({
            type: 'session-event',
            sessionId: 'session-visible',
            kind: 'done',
            title: 'done again',
            body: 'done again',
            timestamp: 15,
        });
        await vi.advanceTimersByTimeAsync(2_000);

        expect(harness.request).toHaveBeenCalledTimes(requestCountAfterHide);
        expect(harness.gitVisibleInvalidate).toHaveBeenCalledTimes(1);
        expect(harness.voiceFocus).toHaveBeenCalledTimes(1);

    });

    it('atomically replaces an eligible visible tail and reloads the discarded head', async () => {
        vi.useFakeTimers();
        harness.request.mockReset();
        storage.setState({ sessions: {}, sessionMessages: {}, currentViewingSessionId: null });
        const sessionId = 'session-tail-success';
        const totalMessages = 760;
        const latestPage = Array.from({ length: 500 }, (_, index) => (
            apiUserMessage(totalMessages - index)
        ));
        const olderPage = Array.from({ length: 100 }, (_, index) => apiUserMessage(260 - index));
        harness.request.mockImplementation(async (url: string) => {
            if (url === `/v3/sessions/${sessionId}/messages?after_seq=${totalMessages}&limit=100`) {
                return response({ messages: [], hasMore: false });
            }
            if (url === `/v3/sessions/${sessionId}/messages?before_seq=2147483647&limit=500`) {
                return response({ messages: latestPage, hasMore: true });
            }
            if (url === `/v3/sessions/${sessionId}/messages?before_seq=261&limit=100`) {
                return response({ messages: olderPage, hasMore: true });
            }
            return response({ messages: [], hasMore: false });
        });

        const instance = new Sync();
        instance.encryption = {
            getSessionEncryption: vi.fn(() => ({
                decryptMessages: vi.fn(async (messages: ReturnType<typeof apiUserMessage>[]) => (
                    messages.map(decryptedUserMessage)
                )),
            })),
        } as never;
        applyTailTestSession(sessionId, totalMessages);
        (instance as any).sessionLastSeq.set(sessionId, totalMessages);
        (instance as any).sessionOldestSeq.set(sessionId, 1);
        const before = storage.getState().sessionMessages[sessionId];
        const newestSnapshot = before.messages.slice(0, 10);

        instance.onSessionVisible(sessionId);
        instance.updateVisibleSessionTailState(sessionId, {
            atLiveTail: true,
            readingOlderHistory: false,
            targetActive: false,
            composerBusy: false,
            viewportBusy: false,
        }, 'test-view');
        await waitForRequest(`/v3/sessions/${sessionId}/messages?after_seq=${totalMessages}&limit=100`);
        diagnosticsCapture = startClientLongSessionDiagnosticsCapture();
        const publications: Array<{ entry: unknown; oldestSeq: number | undefined }> = [];
        const unsubscribe = storage.subscribe((state) => publications.push({
            entry: state.sessionMessages[sessionId],
            oldestSeq: (instance as any).sessionOldestSeq.get(sessionId),
        }));

        await vi.advanceTimersByTimeAsync(2_000);
        await vi.waitFor(() => {
            expect(storage.getState().sessionMessages[sessionId]?.messages).toHaveLength(500);
        });
        unsubscribe();

        const rebased = storage.getState().sessionMessages[sessionId];
        expect(publications).toHaveLength(1);
        expect(publications[0].oldestSeq).toBe(261);
        expect(rebased.messages.slice(0, 10)).toEqual(newestSnapshot);
        expect(rebased.hasMoreOlder).toBe(true);
        expect((instance as any).sessionOldestSeq.get(sessionId)).toBe(261);
        expect(diagnosticsCapture.snapshot()).toMatchObject({
            counters: { tailRebaseAttempts: 1, tailRebaseSwaps: 1, tailRebaseAborts: 0 },
            retainedMessages: { currentCount: 500 },
        });

        await instance.loadOlderMessages(sessionId);
        expect(harness.request).toHaveBeenCalledWith(
            `/v3/sessions/${sessionId}/messages?before_seq=261&limit=100`,
        );
        expect(storage.getState().sessionMessages[sessionId].messages).toHaveLength(600);
        expect((instance as any).sessionOldestSeq.get(sessionId)).toBe(161);
        instance.onSessionHidden(sessionId);
    });

    it('discards a staged tail when the highest observed seq moves before commit', async () => {
        vi.useFakeTimers();
        harness.request.mockReset();
        storage.setState({ sessions: {}, sessionMessages: {}, currentViewingSessionId: null });
        const sessionId = 'session-tail-race';
        const totalMessages = 751;
        const latestPage = Array.from({ length: 500 }, (_, index) => (
            apiUserMessage(totalMessages - index)
        ));
        const latestResponse = deferred<ReturnType<typeof response>>();
        harness.request.mockImplementation(async (url: string) => {
            if (url === `/v3/sessions/${sessionId}/messages?after_seq=${totalMessages}&limit=100`) {
                return response({ messages: [], hasMore: false });
            }
            if (url === `/v3/sessions/${sessionId}/messages?before_seq=2147483647&limit=500`) {
                return latestResponse.promise;
            }
            return response({ messages: [], hasMore: false });
        });

        const instance = new Sync();
        instance.encryption = {
            getSessionEncryption: vi.fn(() => ({
                decryptMessages: vi.fn(async (messages: ReturnType<typeof apiUserMessage>[]) => (
                    messages.map(decryptedUserMessage)
                )),
            })),
        } as never;
        applyTailTestSession(sessionId, totalMessages);
        (instance as any).sessionLastSeq.set(sessionId, totalMessages);
        instance.onSessionVisible(sessionId);
        instance.updateVisibleSessionTailState(sessionId, {
            atLiveTail: true,
            readingOlderHistory: false,
            targetActive: false,
            composerBusy: false,
            viewportBusy: false,
        }, 'test-view');
        await waitForRequest(`/v3/sessions/${sessionId}/messages?after_seq=${totalMessages}&limit=100`);
        await vi.waitFor(() => {
            expect(storage.getState().sessionMessages[sessionId]?.isLoaded).toBe(true);
        });
        const before = storage.getState().sessionMessages[sessionId];
        diagnosticsCapture = startClientLongSessionDiagnosticsCapture();

        await vi.advanceTimersByTimeAsync(2_000);
        await waitForRequest(`/v3/sessions/${sessionId}/messages?before_seq=2147483647&limit=500`);
        (instance as any).sessionLastSeq.set(sessionId, totalMessages + 1);
        latestResponse.resolve(response({ messages: latestPage, hasMore: true }));
        await vi.waitFor(() => {
            expect(diagnosticsCapture?.snapshot().counters.tailRebaseAborts).toBe(1);
        });

        expect(storage.getState().sessionMessages[sessionId]).toBe(before);
        expect(diagnosticsCapture.snapshot()).toMatchObject({
            counters: { tailRebaseAttempts: 1, tailRebaseSwaps: 0, tailRebaseAborts: 1 },
            tailRebaseAbortReasons: { 'cursor-changed': 1 },
        });
        instance.onSessionHidden(sessionId);
    });

    it.each(['fetch', 'decrypt'] as const)(
        'retains the live cache when visible-tail %s staging fails',
        async (failure) => {
            vi.useFakeTimers();
            harness.request.mockReset();
            storage.setState({ sessions: {}, sessionMessages: {}, currentViewingSessionId: null });
            const sessionId = `session-tail-${failure}-failure`;
            const totalMessages = 751;
            const latestPage = Array.from({ length: 500 }, (_, index) => (
                apiUserMessage(totalMessages - index)
            ));
            harness.request.mockImplementation(async (url: string) => {
                if (url === `/v3/sessions/${sessionId}/messages?after_seq=${totalMessages}&limit=100`) {
                    return response({ messages: [], hasMore: false });
                }
                if (url === `/v3/sessions/${sessionId}/messages?before_seq=2147483647&limit=500`) {
                    if (failure === 'fetch') {
                        return { ...response({}), ok: false, status: 503 };
                    }
                    return response({ messages: latestPage, hasMore: true });
                }
                return response({ messages: [], hasMore: false });
            });

            const instance = new Sync();
            instance.encryption = {
                getSessionEncryption: vi.fn(() => ({
                    decryptMessages: vi.fn(async (messages: ReturnType<typeof apiUserMessage>[]) => {
                        if (failure === 'decrypt') throw new Error('decrypt failed');
                        return messages.map(decryptedUserMessage);
                    }),
                })),
            } as never;
            applyTailTestSession(sessionId, totalMessages);
            (instance as any).sessionLastSeq.set(sessionId, totalMessages);
            instance.onSessionVisible(sessionId);
            instance.updateVisibleSessionTailState(sessionId, {
                atLiveTail: true,
                readingOlderHistory: false,
                targetActive: false,
                composerBusy: false,
                viewportBusy: false,
            }, 'test-view');
            await waitForRequest(`/v3/sessions/${sessionId}/messages?after_seq=${totalMessages}&limit=100`);
            await vi.waitFor(() => {
                expect(storage.getState().sessionMessages[sessionId]?.isLoaded).toBe(true);
            });
            const before = storage.getState().sessionMessages[sessionId];
            diagnosticsCapture = startClientLongSessionDiagnosticsCapture();

            await vi.advanceTimersByTimeAsync(2_000);
            await vi.waitFor(() => {
                expect(diagnosticsCapture?.snapshot().counters.tailRebaseAborts).toBe(1);
            });

            expect(storage.getState().sessionMessages[sessionId]).toBe(before);
            expect(diagnosticsCapture.snapshot()).toMatchObject({
                counters: { tailRebaseAttempts: 1, tailRebaseSwaps: 0, tailRebaseAborts: 1 },
                tailRebaseAbortReasons: { 'fetch-or-decrypt-failed': 1 },
            });
            instance.onSessionHidden(sessionId);
        },
    );
});
