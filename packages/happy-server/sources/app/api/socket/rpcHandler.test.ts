import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/log', () => ({ log: vi.fn() }));

vi.mock('prom-client', () => {
    class Metric {
        inc = vi.fn();
        observe = vi.fn();
    }
    return {
        Counter: Metric,
        Histogram: Metric,
        register: {},
    };
});

import { rpcHandler } from './rpcHandler';

type RpcCall = (data: unknown, callback: (response: unknown) => void) => Promise<void>;

function callerSocket() {
    const handlers = new Map<string, (...args: any[]) => any>();
    return {
        id: 'caller',
        on: vi.fn((event: string, handler: (...args: any[]) => any) => handlers.set(event, handler)),
        emit: vi.fn(),
        join: vi.fn(),
        leave: vi.fn(),
        rpcCall: () => handlers.get('rpc-call') as RpcCall,
    };
}

function targetSocket(ack: Promise<string>) {
    return {
        id: 'target',
        timeout: vi.fn(() => ({
            emitWithAck: vi.fn(() => ack),
        })),
    };
}

function ioWithLookup(lookup: () => Promise<any[]>) {
    const fetchSockets = vi.fn(lookup);
    return {
        in: vi.fn(() => ({
            timeout: vi.fn(() => ({ fetchSockets })),
        })),
        fetchSockets,
    };
}

async function settleWithTimers(promise: Promise<unknown>, milliseconds: number) {
    await vi.advanceTimersByTimeAsync(milliseconds);
    await promise;
}

describe('rpcHandler fault recovery', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('returns unavailable after the bounded reconnect grace when no target appears', async () => {
        const socket = callerSocket();
        const io = ioWithLookup(async () => []);
        rpcHandler('user-1', socket as any, io as any);
        const callback = vi.fn();

        const call = socket.rpcCall()({ method: 'machine:bash', params: 'encrypted' }, callback);
        await settleWithTimers(call, 16_000);

        expect(callback).toHaveBeenCalledWith({ ok: false, error: 'RPC method not available' });
    });

    it('accepts a target that reconnects inside the grace window', async () => {
        let resolveAck!: (value: string) => void;
        const ack = new Promise<string>((resolve) => { resolveAck = resolve; });
        const target = targetSocket(ack);
        let lookupCount = 0;
        const io = ioWithLookup(async () => (++lookupCount >= 2 ? [target] : []));
        const socket = callerSocket();
        rpcHandler('user-1', socket as any, io as any);
        const callback = vi.fn();

        const call = socket.rpcCall()({ method: 'machine:bash', params: 'encrypted' }, callback);
        await vi.advanceTimersByTimeAsync(250);
        resolveAck('result');
        await call;

        expect(callback).toHaveBeenCalledWith({ ok: true, result: 'result' });
    });

    it('returns promptly when the selected target dies without acknowledging', async () => {
        const never = new Promise<string>(() => {});
        const target = targetSocket(never);
        let lookupCount = 0;
        const io = ioWithLookup(async () => (lookupCount++ === 0 ? [target] : []));
        const socket = callerSocket();
        rpcHandler('user-1', socket as any, io as any);
        const callback = vi.fn();

        const call = socket.rpcCall()({ method: 'machine:bash', params: 'encrypted' }, callback);
        await settleWithTimers(call, 5_500);

        expect(callback).toHaveBeenCalledWith({ ok: false, error: 'RPC target disconnected' });
    });

    it('times out a connected target that never acknowledges', async () => {
        let rejectAck!: (reason: Error) => void;
        const ack = new Promise<string>((_resolve, reject) => { rejectAck = reject; });
        const target = targetSocket(ack);
        const io = ioWithLookup(async () => [target]);
        const socket = callerSocket();
        rpcHandler('user-1', socket as any, io as any);
        const callback = vi.fn();

        const call = socket.rpcCall()({ method: 'machine:bash', params: 'encrypted' }, callback);
        await vi.advanceTimersByTimeAsync(30_000);
        rejectAck(new Error('operation has timed out'));
        await call;

        expect(target.timeout).toHaveBeenCalledWith(30_000);
        expect(callback).toHaveBeenCalledWith({ ok: false, error: 'operation has timed out' });
    });
});
