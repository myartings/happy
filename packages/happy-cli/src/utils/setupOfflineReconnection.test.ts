import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    reconnectConfig: null as any,
    handle: {
        cancel: vi.fn(() => mocks.reconnectConfig?.onCancelled?.(
            Object.assign(new Error('cancelled'), { name: 'OfflineReconnectionCancelledError' }),
        )),
        getSession: vi.fn(() => null),
        isReconnected: vi.fn(() => false),
    },
}));

vi.mock('@/utils/serverConnectionErrors', () => ({
    startOfflineReconnection: vi.fn((config: any) => {
        mocks.reconnectConfig = config;
        return mocks.handle;
    }),
}));

vi.mock('@/configuration', () => ({
    configuration: { serverUrl: 'https://server.test' },
}));

import { setupOfflineReconnection } from './setupOfflineReconnection';

describe('setupOfflineReconnection ready Session', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.reconnectConfig = null;
    });

    it('keeps hot reconnection active and resolves only with the real Session response', async () => {
        const response = {
            id: 'session-after-reconnect',
            metadata: {},
        } as any;
        const realSession = { sessionId: response.id } as any;
        const api = {
            getOrCreateSession: vi.fn(async () => response),
            sessionSyncClient: vi.fn(() => realSession),
        } as any;
        const onSessionSwap = vi.fn();
        const result = setupOfflineReconnection({
            api,
            sessionTag: 'offline-launch',
            metadata: {} as any,
            state: {} as any,
            response: null,
            onSessionSwap,
        });
        let ready = false;
        void result.readySession.then(() => { ready = true; });

        expect(result.isOffline).toBe(true);
        expect(result.reconnectionHandle).toBe(mocks.handle);
        expect(ready).toBe(false);

        await mocks.reconnectConfig.onReconnected();
        await expect(result.readySession).resolves.toEqual({ session: realSession, response });
        expect(onSessionSwap).toHaveBeenCalledWith(realSession);
        expect(mocks.handle.cancel).not.toHaveBeenCalled();
    });

    it('rejects readiness when reconnection ends with a terminal error', async () => {
        const result = setupOfflineReconnection({
            api: {} as any,
            sessionTag: 'offline-launch',
            metadata: {} as any,
            state: {} as any,
            response: null,
            onSessionSwap: vi.fn(),
        });
        const terminalError = Object.assign(new Error('auth failed'), {
            name: 'OfflineReconnectionTerminalError',
            reason: 'authentication',
        });

        mocks.reconnectConfig.onTerminalError(terminalError);

        await expect(result.readySession).rejects.toBe(terminalError);
    });

    it('rejects readiness when reconnection is cancelled', async () => {
        const result = setupOfflineReconnection({
            api: {} as any,
            sessionTag: 'offline-launch',
            metadata: {} as any,
            state: {} as any,
            response: null,
            onSessionSwap: vi.fn(),
        });
        result.reconnectionHandle?.cancel();

        await expect(result.readySession).rejects.toMatchObject({
            name: 'OfflineReconnectionCancelledError',
        });
    });
});
