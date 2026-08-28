import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockIo } = vi.hoisted(() => ({
    mockIo: vi.fn(),
}));

vi.mock('socket.io-client', () => ({
    io: mockIo,
}));

vi.mock('react-native', () => ({
    AppState: { currentState: 'active' },
    Platform: { OS: 'ios' },
}));

vi.mock('expo-constants', () => ({
    default: { expoConfig: { version: '1.0.0-test' } },
}));

vi.mock('@/auth/tokenStorage', () => ({
    TokenStorage: { getCredentials: vi.fn() },
}));

vi.mock('./encryption/encryption', () => ({
    Encryption: class {},
}));

vi.mock('./storage', () => ({
    storage: {
        getState: () => ({ localSettings: { verboseLogging: false } }),
    },
}));

type SocketHandler = (...args: any[]) => void;

function createSocketDouble() {
    const handlers = new Map<string, SocketHandler>();
    const emitWithAck = vi.fn().mockResolvedValue({});
    const socket: any = {
        connected: true,
        recovered: false,
        id: 'socket-test',
        io: { on: vi.fn() },
        on: vi.fn((event: string, handler: SocketHandler) => {
            handlers.set(event, handler);
            return socket;
        }),
        onAny: vi.fn(),
        emit: vi.fn(),
        emitWithAck,
        timeout: vi.fn(() => ({ emitWithAck })),
        connect: vi.fn(() => {
            socket.connected = true;
            handlers.get('connect')?.();
        }),
        disconnect: vi.fn(() => {
            socket.connected = false;
            handlers.get('disconnect')?.('io client disconnect');
        }),
    };
    return { socket, handlers, emitWithAck };
}

describe('ApiSocket health monitoring', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.resetModules();
        mockIo.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('periodically verifies a connected socket with the acknowledged server ping', async () => {
        const { socket, handlers, emitWithAck } = createSocketDouble();
        mockIo.mockReturnValue(socket);
        const { apiSocket } = await import('./apiSocket');

        apiSocket.initialize({ endpoint: 'https://example.test', token: 'token' }, {} as any);
        handlers.get('connect')?.();

        await vi.advanceTimersByTimeAsync(15_000);

        expect(socket.timeout).toHaveBeenCalledWith(5_000);
        expect(emitWithAck).toHaveBeenCalledWith('ping');
        expect(socket.disconnect).not.toHaveBeenCalled();
        expect(apiSocket.getHealthDiagnostics()).toEqual(expect.objectContaining({
            consecutiveFailures: 0,
            lastHealthAckAt: expect.any(Number),
        }));

        apiSocket.disconnect();
    });

    it('restarts one health monitor after reconnect and permits a later recovery cycle', async () => {
        const { socket, handlers, emitWithAck } = createSocketDouble();
        emitWithAck
            .mockRejectedValueOnce(new Error('first ack timeout'))
            .mockRejectedValueOnce(new Error('second ack timeout'))
            .mockResolvedValueOnce({});
        mockIo.mockReturnValue(socket);
        const { apiSocket } = await import('./apiSocket');

        apiSocket.initialize({ endpoint: 'https://example.test', token: 'token' }, {} as any);
        handlers.get('connect')?.();

        await vi.advanceTimersByTimeAsync(15_000);
        expect(socket.disconnect).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(15_000);
        expect(socket.disconnect).toHaveBeenCalledTimes(1);
        expect(socket.connect).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(15_000);
        expect(emitWithAck).toHaveBeenCalledTimes(3);
        expect(apiSocket.getHealthDiagnostics()).toEqual(expect.objectContaining({
            status: 'connected',
            consecutiveFailures: 0,
        }));

        emitWithAck
            .mockRejectedValueOnce(new Error('later first timeout'))
            .mockRejectedValueOnce(new Error('later second timeout'));
        await vi.advanceTimersByTimeAsync(30_000);

        expect(socket.disconnect).toHaveBeenCalledTimes(2);
        expect(socket.connect).toHaveBeenCalledTimes(2);

        apiSocket.disconnect();
    });

    it('replaces reconnect timers and stops probing after explicit disconnect', async () => {
        const { socket, handlers, emitWithAck } = createSocketDouble();
        mockIo.mockReturnValue(socket);
        const { apiSocket } = await import('./apiSocket');

        apiSocket.initialize({ endpoint: 'https://example.test', token: 'token' }, {} as any);
        handlers.get('connect')?.();
        handlers.get('connect')?.();

        await vi.advanceTimersByTimeAsync(15_000);
        expect(emitWithAck).toHaveBeenCalledTimes(1);

        apiSocket.disconnect();
        emitWithAck.mockClear();
        await vi.advanceTimersByTimeAsync(30_000);
        expect(emitWithAck).not.toHaveBeenCalled();
    });

    it('ignores a stale health timeout after the same socket reconnects', async () => {
        let rejectOldProbe: ((error: Error) => void) | undefined;
        const { socket, handlers, emitWithAck } = createSocketDouble();
        emitWithAck.mockReturnValue(new Promise((_, reject) => {
            rejectOldProbe = reject;
        }));
        mockIo.mockReturnValue(socket);
        const { apiSocket } = await import('./apiSocket');

        apiSocket.initialize({ endpoint: 'https://example.test', token: 'token' }, {} as any);
        handlers.get('connect')?.();
        const staleProbe = apiSocket.ensureHealthy();

        handlers.get('disconnect')?.('transport close');
        handlers.get('connect')?.();
        rejectOldProbe?.(new Error('old socket timed out'));
        await staleProbe;

        expect(apiSocket.getHealthDiagnostics().consecutiveFailures).toBe(0);
        expect(socket.disconnect).not.toHaveBeenCalled();

        apiSocket.disconnect();
    });

    it('ignores delayed events from a socket object that has been replaced', async () => {
        const oldSocket = createSocketDouble();
        const replacementSocket = createSocketDouble();
        mockIo
            .mockReturnValueOnce(oldSocket.socket)
            .mockReturnValueOnce(replacementSocket.socket);
        const { apiSocket } = await import('./apiSocket');
        const reconnected = vi.fn();
        apiSocket.onReconnected(reconnected);

        apiSocket.initialize({ endpoint: 'https://example.test', token: 'old-token' }, {} as any);
        oldSocket.handlers.get('connect')?.();
        apiSocket.disconnect();
        apiSocket.initialize({ endpoint: 'https://example.test', token: 'new-token' }, {} as any);
        replacementSocket.handlers.get('connect')?.();
        reconnected.mockClear();

        oldSocket.handlers.get('disconnect')?.('late old disconnect');
        oldSocket.handlers.get('connect')?.();
        await vi.advanceTimersByTimeAsync(15_000);

        expect(reconnected).not.toHaveBeenCalled();
        expect(replacementSocket.emitWithAck).toHaveBeenCalledWith('ping');
        expect(apiSocket.getHealthDiagnostics().status).toBe('connected');

        apiSocket.disconnect();
    });
});
