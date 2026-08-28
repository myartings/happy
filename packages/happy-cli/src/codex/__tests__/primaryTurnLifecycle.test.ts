import { describe, expect, it, vi } from 'vitest';

import { applyCodexPrimaryTurnLifecycleEvent } from '../primaryTurnLifecycle';

function createEffects() {
    return {
        setKeepAlive: vi.fn(),
        resetDiff: vi.fn(),
    };
}

describe('applyCodexPrimaryTurnLifecycleEvent', () => {
    it('ignores child lifecycle events and applies primary completion exactly once', () => {
        const effects = createEffects();
        let thinking = false;

        thinking = applyCodexPrimaryTurnLifecycleEvent({ type: 'task_started' }, thinking, effects);
        thinking = applyCodexPrimaryTurnLifecycleEvent({
            type: 'task_started',
            agent_thread_id: 'child-1',
        }, thinking, effects);
        thinking = applyCodexPrimaryTurnLifecycleEvent({
            type: 'task_complete',
            agent_thread_id: 'child-1',
        }, thinking, effects);
        thinking = applyCodexPrimaryTurnLifecycleEvent({
            type: 'turn_aborted',
            parent_call_id: 'child-call',
        }, thinking, effects);
        thinking = applyCodexPrimaryTurnLifecycleEvent({ type: 'task_complete' }, thinking, effects);
        thinking = applyCodexPrimaryTurnLifecycleEvent({ type: 'task_complete' }, thinking, effects);

        expect(thinking).toBe(false);
        expect(effects.setKeepAlive.mock.calls).toEqual([[true], [false]]);
        expect(effects.resetDiff).toHaveBeenCalledTimes(1);
    });

    it('applies primary abort cleanup exactly once', () => {
        const effects = createEffects();
        let thinking = false;

        thinking = applyCodexPrimaryTurnLifecycleEvent({ type: 'task_started' }, thinking, effects);
        thinking = applyCodexPrimaryTurnLifecycleEvent({ type: 'turn_aborted' }, thinking, effects);
        thinking = applyCodexPrimaryTurnLifecycleEvent({ type: 'turn_aborted' }, thinking, effects);

        expect(thinking).toBe(false);
        expect(effects.setKeepAlive.mock.calls).toEqual([[true], [false]]);
        expect(effects.resetDiff).toHaveBeenCalledTimes(1);
    });
});
