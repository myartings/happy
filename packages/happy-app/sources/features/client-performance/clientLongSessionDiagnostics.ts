export const CLIENT_LONG_SESSION_COUNTERS = [
    'draftPersistenceWrites',
    'draftSessionReads',
    'sessionRowReprojections',
    'messageQueueBatches',
    'messageSortFallbacks',
    'tailRebaseAttempts',
    'tailRebaseSwaps',
    'tailRebaseAborts',
] as const;

export type ClientLongSessionCounter = typeof CLIENT_LONG_SESSION_COUNTERS[number];

export type ClientLongSessionDiagnosticsSnapshot = {
    counters: Record<ClientLongSessionCounter, number>;
    retainedMessages: {
        currentCount: number;
        currentEstimatedBytes: number;
        peakCount: number;
        peakEstimatedBytes: number;
    };
    tailRebaseAbortReasons: Record<string, number>;
    tailRebaseBoundaryExcess: {
        messageCount: number;
        estimatedBytes: number;
    };
};

type CaptureState = ClientLongSessionDiagnosticsSnapshot;

export type ClientLongSessionDiagnosticsCapture = {
    snapshot: () => ClientLongSessionDiagnosticsSnapshot;
    stop: () => void;
};

let activeCapture: CaptureState | null = null;

function createCounterRecord(): Record<ClientLongSessionCounter, number> {
    return Object.fromEntries(
        CLIENT_LONG_SESSION_COUNTERS.map((counter) => [counter, 0]),
    ) as Record<ClientLongSessionCounter, number>;
}

function cloneSnapshot(state: CaptureState): ClientLongSessionDiagnosticsSnapshot {
    return {
        counters: { ...state.counters },
        retainedMessages: { ...state.retainedMessages },
        tailRebaseAbortReasons: { ...state.tailRebaseAbortReasons },
        tailRebaseBoundaryExcess: { ...state.tailRebaseBoundaryExcess },
    };
}

/**
 * Starts an explicit, in-memory diagnostics capture. Normal app execution keeps
 * no samples because the module has no active capture until this function is
 * called by a test or a bounded diagnostic run.
 */
export function startClientLongSessionDiagnosticsCapture(): ClientLongSessionDiagnosticsCapture {
    if (activeCapture) {
        throw new Error('Client long-session diagnostics capture is already active');
    }

    const state: CaptureState = {
        counters: createCounterRecord(),
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
    };
    activeCapture = state;

    return {
        snapshot: () => cloneSnapshot(state),
        stop: () => {
            if (activeCapture === state) {
                activeCapture = null;
            }
        },
    };
}

export function recordClientLongSessionCounter(
    counter: ClientLongSessionCounter,
    amount = 1,
): void {
    const state = activeCapture;
    if (!state) return;
    if (!Number.isSafeInteger(amount) || amount < 0) {
        throw new Error(`Counter amount must be a non-negative safe integer: ${amount}`);
    }

    state.counters[counter] += amount;
}

export function observeClientLongSessionRetainedMessages(
    count: number,
    estimatedBytes: number,
): void {
    const state = activeCapture;
    if (!state) return;
    if (
        !Number.isSafeInteger(count)
        || count < 0
        || !Number.isSafeInteger(estimatedBytes)
        || estimatedBytes < 0
    ) {
        throw new Error('Retained message count and estimated bytes must be non-negative safe integers');
    }

    state.retainedMessages.currentCount = count;
    state.retainedMessages.currentEstimatedBytes = estimatedBytes;
    state.retainedMessages.peakCount = Math.max(state.retainedMessages.peakCount, count);
    state.retainedMessages.peakEstimatedBytes = Math.max(
        state.retainedMessages.peakEstimatedBytes,
        estimatedBytes,
    );
}

export function recordClientLongSessionTailRebaseAbort(reason: string): void {
    const state = activeCapture;
    if (!state) return;
    state.counters.tailRebaseAborts += 1;
    state.tailRebaseAbortReasons[reason] = (state.tailRebaseAbortReasons[reason] ?? 0) + 1;
}

export function recordClientLongSessionTailRebaseBoundaryExcess(
    messageCount: number,
    estimatedBytes: number,
): void {
    const state = activeCapture;
    if (!state) return;
    if (
        !Number.isSafeInteger(messageCount)
        || messageCount < 0
        || !Number.isSafeInteger(estimatedBytes)
        || estimatedBytes < 0
    ) {
        throw new Error('Tail rebase boundary excess must use non-negative safe integers');
    }
    state.tailRebaseBoundaryExcess.messageCount = messageCount;
    state.tailRebaseBoundaryExcess.estimatedBytes = estimatedBytes;
}
