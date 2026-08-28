export const VISIBLE_SESSION_TAIL_TRIGGER_MESSAGES = 750;
export const VISIBLE_SESSION_TAIL_TRIGGER_BYTES = 20 * 1024 * 1024;
export const VISIBLE_SESSION_TAIL_TARGET_MESSAGES = 500;
export const VISIBLE_SESSION_TAIL_TARGET_BYTES = 10 * 1024 * 1024;
export const VISIBLE_SESSION_TAIL_REBASE_IDLE_MS = 2_000;

export type VisibleSessionTailEligibilityInput = {
    messageCount: number;
    estimatedBytes: number;
    atLiveTail: boolean;
    targetActive: boolean;
    olderHistoryLoading: boolean;
    readingOlderHistory: boolean;
    messageQueueBusy: boolean;
    sendControllerBusy: boolean;
    pendingOutbox: boolean;
    pendingInteraction: boolean;
    mutableToolRunning: boolean;
    sessionThinking: boolean;
    composerBusy: boolean;
    viewportBusy: boolean;
    rebaseInFlight: boolean;
    quietForMs: number;
};

export type VisibleSessionTailBlockReason =
    | 'below-trigger'
    | 'not-live-tail'
    | 'target-active'
    | 'older-history-loading'
    | 'reading-older-history'
    | 'message-queue-busy'
    | 'send-controller-busy'
    | 'pending-outbox'
    | 'pending-interaction'
    | 'mutable-tool-running'
    | 'session-thinking'
    | 'composer-busy'
    | 'viewport-busy'
    | 'rebase-in-flight'
    | 'not-idle';

export type VisibleSessionTailEligibility =
    | { eligible: true }
    | { eligible: false; reason: VisibleSessionTailBlockReason };

export type VisibleSessionTailMessage = {
    id: string;
    kind: string;
};

export type VisibleSessionTailBoundary<T extends VisibleSessionTailMessage> =
    | {
        selected: true;
        messages: readonly T[];
        oldestRetainedMessageId: string;
        retainedCount: number;
        estimatedBytes: number;
        excessMessageCount: number;
        excessEstimatedBytes: number;
    }
    | {
        selected: false;
        reason: 'empty-cache' | 'no-user-boundary' | 'no-reduction';
    };

function estimateMessageBytes(message: unknown): number {
    try {
        return JSON.stringify(message).length * 2;
    } catch {
        return Number.MAX_SAFE_INTEGER;
    }
}

/**
 * Select a newest-first tail without cutting through the oldest retained turn.
 * The first older user message owns every agent/tool/sidechain message above it.
 */
export function selectVisibleSessionTailBoundary<T extends VisibleSessionTailMessage>(
    messages: readonly T[],
    targetMessages = VISIBLE_SESSION_TAIL_TARGET_MESSAGES,
    targetBytes = VISIBLE_SESSION_TAIL_TARGET_BYTES,
): VisibleSessionTailBoundary<T> {
    if (messages.length === 0) {
        return { selected: false, reason: 'empty-cache' };
    }

    let retainedCount = 0;
    let estimatedBytes = 0;
    while (retainedCount < messages.length) {
        const nextBytes = estimateMessageBytes(messages[retainedCount]);
        if (
            retainedCount > 0
            && (retainedCount >= targetMessages || estimatedBytes + nextBytes > targetBytes)
        ) {
            break;
        }
        retainedCount += 1;
        estimatedBytes += nextBytes;
    }

    while (
        retainedCount < messages.length
        && messages[retainedCount - 1]?.kind !== 'user-text'
    ) {
        estimatedBytes += estimateMessageBytes(messages[retainedCount]);
        retainedCount += 1;
    }

    if (messages[retainedCount - 1]?.kind !== 'user-text') {
        return { selected: false, reason: 'no-user-boundary' };
    }
    if (retainedCount >= messages.length) {
        return { selected: false, reason: 'no-reduction' };
    }

    const selectedMessages = messages.slice(0, retainedCount);
    return {
        selected: true,
        messages: selectedMessages,
        oldestRetainedMessageId: selectedMessages[selectedMessages.length - 1].id,
        retainedCount,
        estimatedBytes,
        excessMessageCount: Math.max(0, retainedCount - targetMessages),
        excessEstimatedBytes: Math.max(0, estimatedBytes - targetBytes),
    };
}

/**
 * Pure gate for visible-session tail replacement. The ordered checks make the
 * reported abort reason deterministic when several protections overlap.
 */
export function evaluateVisibleSessionTailRebase(
    input: VisibleSessionTailEligibilityInput,
): VisibleSessionTailEligibility {
    if (
        input.messageCount <= VISIBLE_SESSION_TAIL_TRIGGER_MESSAGES
        && input.estimatedBytes <= VISIBLE_SESSION_TAIL_TRIGGER_BYTES
    ) {
        return { eligible: false, reason: 'below-trigger' };
    }
    if (!input.atLiveTail) return { eligible: false, reason: 'not-live-tail' };
    if (input.targetActive) return { eligible: false, reason: 'target-active' };
    if (input.olderHistoryLoading) return { eligible: false, reason: 'older-history-loading' };
    if (input.readingOlderHistory) return { eligible: false, reason: 'reading-older-history' };
    if (input.messageQueueBusy) return { eligible: false, reason: 'message-queue-busy' };
    if (input.sendControllerBusy) return { eligible: false, reason: 'send-controller-busy' };
    if (input.pendingOutbox) return { eligible: false, reason: 'pending-outbox' };
    if (input.pendingInteraction) return { eligible: false, reason: 'pending-interaction' };
    if (input.mutableToolRunning) return { eligible: false, reason: 'mutable-tool-running' };
    if (input.sessionThinking) return { eligible: false, reason: 'session-thinking' };
    if (input.composerBusy) return { eligible: false, reason: 'composer-busy' };
    if (input.viewportBusy) return { eligible: false, reason: 'viewport-busy' };
    if (input.rebaseInFlight) return { eligible: false, reason: 'rebase-in-flight' };
    if (input.quietForMs < VISIBLE_SESSION_TAIL_REBASE_IDLE_MS) {
        return { eligible: false, reason: 'not-idle' };
    }
    return { eligible: true };
}
