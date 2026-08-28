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

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    storage.setState({
        sessions: {},
        sessionMessages: {},
        currentViewingSessionId: null,
    });
});

describe('Sync realtime recovery host', () => {
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
});
