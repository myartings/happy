import { describe, expect, it, vi } from 'vitest';
import { emitReadyIfIdle } from '../emitReadyIfIdle';

describe('emitReadyIfIdle', () => {
    it('emits ready and notification when queue is idle', async () => {
        const sendReady = vi.fn();
        const notify = vi.fn();

        const emitted = await emitReadyIfIdle({
            pending: null,
            queueSize: () => 0,
            shouldExit: false,
            sendReady,
            notify,
        });

        expect(emitted).toBe(true);
        expect(sendReady).toHaveBeenCalledTimes(1);
        expect(notify).toHaveBeenCalledTimes(1);
    });

    it('skips when a message is still pending', async () => {
        const sendReady = vi.fn();

        const emitted = await emitReadyIfIdle({
            pending: {},
            queueSize: () => 0,
            shouldExit: false,
            sendReady,
        });

        expect(emitted).toBe(false);
        expect(sendReady).not.toHaveBeenCalled();
    });

    it('skips when queue still has items', async () => {
        const sendReady = vi.fn();

        const emitted = await emitReadyIfIdle({
            pending: null,
            queueSize: () => 2,
            shouldExit: false,
            sendReady,
        });

        expect(emitted).toBe(false);
        expect(sendReady).not.toHaveBeenCalled();
    });

    it('skips when shutdown is requested', async () => {
        const sendReady = vi.fn();

        const emitted = await emitReadyIfIdle({
            pending: null,
            queueSize: () => 0,
            shouldExit: true,
            sendReady,
        });

        expect(emitted).toBe(false);
        expect(sendReady).not.toHaveBeenCalled();
    });
});
