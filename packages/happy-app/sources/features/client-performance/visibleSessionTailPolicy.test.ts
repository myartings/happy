import { describe, expect, it } from 'vitest';

import {
    VISIBLE_SESSION_TAIL_REBASE_IDLE_MS,
    VISIBLE_SESSION_TAIL_TARGET_MESSAGES,
    VISIBLE_SESSION_TAIL_TRIGGER_BYTES,
    VISIBLE_SESSION_TAIL_TRIGGER_MESSAGES,
    evaluateVisibleSessionTailRebase,
    selectVisibleSessionTailBoundary,
    type VisibleSessionTailEligibilityInput,
} from './visibleSessionTailPolicy';

function eligibleInput(): VisibleSessionTailEligibilityInput {
    return {
        messageCount: VISIBLE_SESSION_TAIL_TRIGGER_MESSAGES + 1,
        estimatedBytes: 0,
        atLiveTail: true,
        targetActive: false,
        olderHistoryLoading: false,
        readingOlderHistory: false,
        messageQueueBusy: false,
        sendControllerBusy: false,
        pendingOutbox: false,
        pendingInteraction: false,
        mutableToolRunning: false,
        sessionThinking: false,
        composerBusy: false,
        viewportBusy: false,
        rebaseInFlight: false,
        quietForMs: VISIBLE_SESSION_TAIL_REBASE_IDLE_MS,
    };
}

describe('evaluateVisibleSessionTailRebase', () => {
    it('uses strict count and byte trigger hysteresis', () => {
        expect(evaluateVisibleSessionTailRebase({
            ...eligibleInput(),
            messageCount: VISIBLE_SESSION_TAIL_TRIGGER_MESSAGES,
            estimatedBytes: VISIBLE_SESSION_TAIL_TRIGGER_BYTES,
        })).toEqual({ eligible: false, reason: 'below-trigger' });
        expect(evaluateVisibleSessionTailRebase({
            ...eligibleInput(),
            messageCount: 0,
            estimatedBytes: VISIBLE_SESSION_TAIL_TRIGGER_BYTES + 1,
        })).toEqual({ eligible: true });
    });

    it('rejects every protected, busy, reading, target, and composition state', () => {
        const cases: Array<{
            patch: Partial<VisibleSessionTailEligibilityInput>;
            reason: string;
        }> = [
            { patch: { atLiveTail: false }, reason: 'not-live-tail' },
            { patch: { targetActive: true }, reason: 'target-active' },
            { patch: { olderHistoryLoading: true }, reason: 'older-history-loading' },
            { patch: { readingOlderHistory: true }, reason: 'reading-older-history' },
            { patch: { messageQueueBusy: true }, reason: 'message-queue-busy' },
            { patch: { sendControllerBusy: true }, reason: 'send-controller-busy' },
            { patch: { pendingOutbox: true }, reason: 'pending-outbox' },
            { patch: { pendingInteraction: true }, reason: 'pending-interaction' },
            { patch: { mutableToolRunning: true }, reason: 'mutable-tool-running' },
            { patch: { sessionThinking: true }, reason: 'session-thinking' },
            { patch: { composerBusy: true }, reason: 'composer-busy' },
            { patch: { viewportBusy: true }, reason: 'viewport-busy' },
            { patch: { rebaseInFlight: true }, reason: 'rebase-in-flight' },
            {
                patch: { quietForMs: VISIBLE_SESSION_TAIL_REBASE_IDLE_MS - 1 },
                reason: 'not-idle',
            },
        ];

        for (const testCase of cases) {
            expect(evaluateVisibleSessionTailRebase({
                ...eligibleInput(),
                ...testCase.patch,
            })).toEqual({ eligible: false, reason: testCase.reason });
        }
        expect(evaluateVisibleSessionTailRebase(eligibleInput())).toEqual({ eligible: true });
    });
});

describe('selectVisibleSessionTailBoundary', () => {
    it('extends the target to the user message that begins the retained turn', () => {
        const messages = Array.from({ length: 760 }, (_, index) => ({
            id: `message-${index}`,
            kind: index === VISIBLE_SESSION_TAIL_TARGET_MESSAGES + 4
                ? 'user-text' as const
                : index % 7 === 0
                    ? 'tool-call' as const
                    : 'agent-text' as const,
            createdAt: 10_000 - index,
            text: `message ${index}`,
        }));

        const result = selectVisibleSessionTailBoundary(messages);

        expect(result).toMatchObject({
            selected: true,
            oldestRetainedMessageId: `message-${VISIBLE_SESSION_TAIL_TARGET_MESSAGES + 4}`,
            retainedCount: VISIBLE_SESSION_TAIL_TARGET_MESSAGES + 5,
            excessMessageCount: 5,
        });
        if (result.selected) {
            expect(result.messages[0]).toBe(messages[0]);
            expect(result.messages.at(-1)).toBe(messages[VISIBLE_SESSION_TAIL_TARGET_MESSAGES + 4]);
        }
    });

    it('extends a byte cutoff and fails closed without a reducible user boundary', () => {
        const messages = [
            { id: 'agent', kind: 'agent-text', text: 'large output' },
            { id: 'user', kind: 'user-text', text: 'prompt' },
            { id: 'older', kind: 'user-text', text: 'older prompt' },
        ];
        const selected = selectVisibleSessionTailBoundary(messages, 10, 1);
        expect(selected).toMatchObject({
            selected: true,
            oldestRetainedMessageId: 'user',
            retainedCount: 2,
        });
        if (selected.selected) {
            expect(selected.excessEstimatedBytes).toBeGreaterThan(0);
        }

        expect(selectVisibleSessionTailBoundary([
            { id: 'agent-1', kind: 'agent-text' },
            { id: 'agent-2', kind: 'tool-call' },
        ], 1, Number.MAX_SAFE_INTEGER)).toEqual({
            selected: false,
            reason: 'no-user-boundary',
        });
        expect(selectVisibleSessionTailBoundary([
            { id: 'only-user', kind: 'user-text' },
        ], 1, Number.MAX_SAFE_INTEGER)).toEqual({
            selected: false,
            reason: 'no-reduction',
        });
    });
});
