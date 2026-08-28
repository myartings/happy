import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionRealtimeRecovery } from './sessionRealtimeRecovery';

describe('SessionRealtimeRecovery', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('reconciles a visible session immediately and after terminal outbox settling', async () => {
        const reconcile = vi.fn();
        const visibleSessionIds = ['session-visible'];
        const recovery = new SessionRealtimeRecovery({
            isActive: () => true,
            getVisibleSessionIds: () => visibleSessionIds,
            reconcile,
            ensureSocketHealthy: vi.fn().mockResolvedValue(true),
        });

        recovery.onThinkingTransition('session-visible', true, false);

        expect(reconcile).toHaveBeenCalledTimes(1);
        expect(reconcile).toHaveBeenCalledWith('session-visible', 'thinking-idle');
        expect(visibleSessionIds).toEqual(['session-visible']);

        await vi.advanceTimersByTimeAsync(2_000);

        expect(reconcile).toHaveBeenCalledTimes(2);
        expect(reconcile).toHaveBeenLastCalledWith('session-visible', 'thinking-idle-trailing');
        expect(visibleSessionIds).toEqual(['session-visible']);

        recovery.stop();
    });

    it('periodically reconciles only foreground visible sessions', async () => {
        let active = true;
        const reconcile = vi.fn();
        const recovery = new SessionRealtimeRecovery({
            isActive: () => active,
            getVisibleSessionIds: () => ['session-a', 'session-b'],
            reconcile,
            ensureSocketHealthy: vi.fn().mockResolvedValue(true),
        });

        recovery.start();
        await vi.advanceTimersByTimeAsync(30_000);

        expect(reconcile.mock.calls).toEqual([
            ['session-a', 'foreground-interval'],
            ['session-b', 'foreground-interval'],
        ]);

        active = false;
        await vi.advanceTimersByTimeAsync(60_000);
        expect(reconcile).toHaveBeenCalledTimes(2);

        recovery.stop();
    });

    it('probes socket health and reconciles visible sessions on foreground recovery', async () => {
        const reconcile = vi.fn();
        const ensureSocketHealthy = vi.fn().mockResolvedValue(true);
        const recovery = new SessionRealtimeRecovery({
            isActive: () => true,
            getVisibleSessionIds: () => ['session-visible'],
            reconcile,
            ensureSocketHealthy,
        });

        await recovery.onForeground();

        expect(ensureSocketHealthy).toHaveBeenCalledTimes(1);
        expect(reconcile).toHaveBeenCalledWith('session-visible', 'foreground');
        recovery.stop();
    });

    it('reconciles visible sessions on reconnect and done lifecycle signals', async () => {
        const reconcile = vi.fn();
        const recovery = new SessionRealtimeRecovery({
            isActive: () => true,
            getVisibleSessionIds: () => ['session-visible'],
            reconcile,
            ensureSocketHealthy: vi.fn().mockResolvedValue(true),
        });

        recovery.onSocketReconnected();
        recovery.onSessionDone('session-visible');

        expect(reconcile).toHaveBeenNthCalledWith(1, 'session-visible', 'socket-reconnected');
        expect(reconcile).toHaveBeenNthCalledWith(2, 'session-visible', 'session-done');

        await vi.advanceTimersByTimeAsync(2_000);
        expect(reconcile).toHaveBeenLastCalledWith('session-visible', 'session-done-trailing');
        recovery.stop();
    });
});
