import { afterEach, describe, expect, it } from 'vitest';

import {
    CLIENT_LONG_SESSION_COUNTERS,
    observeClientLongSessionRetainedMessages,
    recordClientLongSessionCounter,
    recordClientLongSessionTailRebaseAbort,
    recordClientLongSessionTailRebaseBoundaryExcess,
    startClientLongSessionDiagnosticsCapture,
    type ClientLongSessionDiagnosticsCapture,
} from './clientLongSessionDiagnostics';

let capture: ClientLongSessionDiagnosticsCapture | null = null;

afterEach(() => {
    capture?.stop();
    capture = null;
});

describe('client long-session diagnostics', () => {
    it('retains nothing until an explicit capture starts', () => {
        recordClientLongSessionCounter('draftPersistenceWrites', 5);
        observeClientLongSessionRetainedMessages(5_000, 20 * 1024 * 1024);

        capture = startClientLongSessionDiagnosticsCapture();

        expect(capture.snapshot()).toEqual({
            counters: Object.fromEntries(
                CLIENT_LONG_SESSION_COUNTERS.map((counter) => [counter, 0]),
            ),
            retainedMessages: {
                currentCount: 0,
                currentEstimatedBytes: 0,
                peakCount: 0,
                peakEstimatedBytes: 0,
            },
            tailRebaseAbortReasons: {},
            tailRebaseBoundaryExcess: {
                messageCount: 0,
                estimatedBytes: 0,
            },
        });
    });

    it.each([
        { sessionCount: 100, messageCount: 100 },
        { sessionCount: 500, messageCount: 1_000 },
        { sessionCount: 2_000, messageCount: 5_000 },
    ])('records deterministic residual work for $sessionCount sessions and $messageCount messages', ({
        sessionCount,
        messageCount,
    }) => {
        capture = startClientLongSessionDiagnosticsCapture();

        recordClientLongSessionCounter('draftPersistenceWrites');
        recordClientLongSessionCounter('draftSessionReads', sessionCount);
        recordClientLongSessionCounter('sessionRowReprojections', sessionCount);
        recordClientLongSessionCounter('messageQueueBatches', messageCount);
        recordClientLongSessionCounter('messageSortFallbacks');
        recordClientLongSessionCounter('tailRebaseAttempts');
        recordClientLongSessionCounter('tailRebaseSwaps');
        recordClientLongSessionCounter('tailRebaseAborts', 0);
        recordClientLongSessionTailRebaseAbort('cursor-changed');
        recordClientLongSessionTailRebaseAbort('cursor-changed');
        recordClientLongSessionTailRebaseBoundaryExcess(7, 4_096);
        observeClientLongSessionRetainedMessages(messageCount, messageCount * 256);
        observeClientLongSessionRetainedMessages(Math.floor(messageCount / 2), messageCount * 128);

        expect(capture.snapshot()).toEqual({
            counters: {
                draftPersistenceWrites: 1,
                draftSessionReads: sessionCount,
                sessionRowReprojections: sessionCount,
                messageQueueBatches: messageCount,
                messageSortFallbacks: 1,
                tailRebaseAttempts: 1,
                tailRebaseSwaps: 1,
                tailRebaseAborts: 2,
            },
            retainedMessages: {
                currentCount: Math.floor(messageCount / 2),
                currentEstimatedBytes: messageCount * 128,
                peakCount: messageCount,
                peakEstimatedBytes: messageCount * 256,
            },
            tailRebaseAbortReasons: { 'cursor-changed': 2 },
            tailRebaseBoundaryExcess: {
                messageCount: 7,
                estimatedBytes: 4_096,
            },
        });
    });
});
