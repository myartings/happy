import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    MAX_SESSION_MESSAGE_COALESCE_MS,
    SessionMessageBatchScheduler,
} from './sessionMessageBatchScheduler';

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((resolvePromise) => {
        resolve = resolvePromise;
    });
    return { promise, resolve };
}

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('SessionMessageBatchScheduler', () => {
    it('waits 24 ms outside the drain owner and preserves FIFO in one batch', async () => {
        vi.useFakeTimers();
        const drained: string[][] = [];
        const scheduler = new SessionMessageBatchScheduler<string>({
            drain: (batch) => {
                drained.push(batch.messages);
            },
        });

        scheduler.enqueue('session-a', 0, ['one']);
        scheduler.enqueue('session-a', 0, ['two', 'three']);

        expect(drained).toEqual([]);
        await vi.advanceTimersByTimeAsync(23);
        expect(drained).toEqual([]);

        await vi.advanceTimersByTimeAsync(1);
        expect(drained).toEqual([['one', 'two', 'three']]);
    });

    it('schedules Sessions independently', async () => {
        vi.useFakeTimers();
        const drained: Array<{ sessionId: string; messages: string[] }> = [];
        const scheduler = new SessionMessageBatchScheduler<string>({
            drain: ({ sessionId, messages }) => {
                drained.push({ sessionId, messages });
            },
        });

        scheduler.enqueue('session-a', 0, ['a']);
        await vi.advanceTimersByTimeAsync(10);
        scheduler.enqueue('session-b', 0, ['b']);
        await vi.advanceTimersByTimeAsync(14);

        expect(drained).toEqual([{ sessionId: 'session-a', messages: ['a'] }]);

        await vi.advanceTimersByTimeAsync(10);
        expect(drained).toEqual([
            { sessionId: 'session-a', messages: ['a'] },
            { sessionId: 'session-b', messages: ['b'] },
        ]);
    });

    it('keeps one processing owner while arrivals form the next FIFO batch', async () => {
        vi.useFakeTimers();
        const firstDrain = deferred();
        const drained: string[][] = [];
        let activeOwners = 0;
        let peakOwners = 0;
        const scheduler = new SessionMessageBatchScheduler<string>({
            drain: async (batch) => {
                activeOwners += 1;
                peakOwners = Math.max(peakOwners, activeOwners);
                drained.push(batch.messages);
                if (drained.length === 1) {
                    await firstDrain.promise;
                }
                activeOwners -= 1;
            },
        });

        scheduler.enqueue('session-a', 0, ['one']);
        vi.advanceTimersByTime(24);
        await Promise.resolve();
        scheduler.enqueue('session-a', 0, ['two', 'three']);
        await vi.advanceTimersByTimeAsync(24);

        expect(drained).toEqual([['one']]);
        firstDrain.resolve();
        await vi.waitFor(() => {
            expect(drained).toEqual([['one'], ['two', 'three']]);
        });
        expect(peakOwners).toBe(1);
    });

    it('drops pending work from an older cache generation', async () => {
        vi.useFakeTimers();
        const drained: string[][] = [];
        const scheduler = new SessionMessageBatchScheduler<string>({
            drain: (batch) => {
                if (batch.isCurrent()) drained.push(batch.messages);
            },
        });

        scheduler.enqueue('session-a', 0, ['stale']);
        scheduler.enqueue('session-a', 1, ['current']);
        await vi.advanceTimersByTimeAsync(24);

        expect(drained).toEqual([['current']]);
    });

    it('invalidates an in-flight batch when the Session is cancelled', async () => {
        vi.useFakeTimers();
        const lockGate = deferred();
        const applied: string[][] = [];
        const scheduler = new SessionMessageBatchScheduler<string>({
            drain: async (batch) => {
                await lockGate.promise;
                if (batch.isCurrent()) applied.push(batch.messages);
            },
        });

        scheduler.enqueue('session-a', 0, ['stale']);
        vi.advanceTimersByTime(24);
        await Promise.resolve();
        scheduler.cancel('session-a');
        lockGate.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(applied).toEqual([]);
        expect(scheduler.isBusy('session-a')).toBe(false);
    });

    it('keeps one owner while a new cache generation replaces in-flight work', async () => {
        vi.useFakeTimers();
        const oldGenerationGate = deferred();
        const started: number[] = [];
        const applied: string[][] = [];
        let activeOwners = 0;
        let peakOwners = 0;
        const scheduler = new SessionMessageBatchScheduler<string>({
            drain: async (batch) => {
                activeOwners += 1;
                peakOwners = Math.max(peakOwners, activeOwners);
                started.push(batch.generation);
                if (batch.generation === 0) {
                    await oldGenerationGate.promise;
                }
                if (batch.isCurrent()) applied.push(batch.messages);
                activeOwners -= 1;
            },
        });

        scheduler.enqueue('session-a', 0, ['stale']);
        vi.advanceTimersByTime(24);
        await Promise.resolve();
        scheduler.enqueue('session-a', 1, ['current']);
        await vi.advanceTimersByTimeAsync(24);

        expect(started).toEqual([0]);
        oldGenerationGate.resolve();
        await vi.waitFor(() => {
            expect(started).toEqual([0, 1]);
            expect(applied).toEqual([['current']]);
        });
        expect(peakOwners).toBe(1);
    });

    it('flushes explicitly without waiting and can cancel all pending Sessions', async () => {
        vi.useFakeTimers();
        const drained: Array<{ sessionId: string; messages: string[] }> = [];
        const scheduler = new SessionMessageBatchScheduler<string>({
            drain: ({ sessionId, messages }) => {
                drained.push({ sessionId, messages });
            },
        });

        scheduler.enqueue('session-local', 0, ['optimistic']);
        scheduler.flush('session-local');
        await Promise.resolve();
        expect(drained).toEqual([
            { sessionId: 'session-local', messages: ['optimistic'] },
        ]);

        scheduler.enqueue('session-a', 0, ['a']);
        scheduler.enqueue('session-b', 0, ['b']);
        scheduler.shutdown();
        await vi.advanceTimersByTimeAsync(32);

        expect(drained).toHaveLength(1);
    });

    it('rejects a presentation window above the 32 ms bound', () => {
        expect(() => new SessionMessageBatchScheduler({
            windowMs: MAX_SESSION_MESSAGE_COALESCE_MS + 1,
            drain: vi.fn(),
        })).toThrow('Session message coalescing window must be within 1-32 ms');
    });

    it('falls back to an immediate FIFO drain when timer scheduling fails', () => {
        const drained: string[][] = [];
        vi.spyOn(globalThis, 'setTimeout').mockImplementationOnce(() => {
            throw new Error('scheduler unavailable');
        });
        const scheduler = new SessionMessageBatchScheduler<string>({
            drain: (batch) => {
                drained.push(batch.messages);
            },
        });

        expect(() => {
            scheduler.enqueue('session-a', 0, ['one', 'two']);
        }).not.toThrow();
        expect(drained).toEqual([['one', 'two']]);
    });
});
