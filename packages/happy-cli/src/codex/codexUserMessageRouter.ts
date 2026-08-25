import { logger } from '@/ui/logger';
import type { PendingAttachment } from '@/utils/MessageQueue2';

import { enqueueCodexUserText, isCodexClearText } from './codexClearCommand';

type CodexUserTextQueue<T> = {
    push: (message: string, mode: T, attachments?: PendingAttachment[], clientUserMessageId?: string) => void;
    pushUncertain?: (message: string, mode: T, attachments: PendingAttachment[] | undefined, clientUserMessageId: string) => void;
    pushIsolateAndClear: (message: string, mode: T, attachments?: PendingAttachment[], clientUserMessageId?: string) => void;
};

export type SteerCodexUserText = (input: {
    text: string;
    attachments?: PendingAttachment[];
    expectedTurnId: string;
    clientUserMessageId?: string;
}) => Promise<void>;

export type ReconcileCodexSteerFailure = (input: {
    error: unknown;
    clientUserMessageId?: string;
}) => Promise<'delivered' | 'queue' | 'unknown'>;

export async function resolveCodexUncertainDelivery(opts: {
    clientUserMessageId: string;
    canCorrelate?: boolean;
    reconcile: (clientUserMessageId: string) => Promise<{ messageDelivery: 'delivered' | 'absent' | 'unknown' }>;
    recover: () => Promise<unknown>;
}): Promise<'delivered' | 'absent' | 'unknown'> {
    if (opts.canCorrelate === false) {
        return 'unknown';
    }
    let reconciliation = await opts.reconcile(opts.clientUserMessageId);
    if (reconciliation.messageDelivery !== 'unknown') {
        return reconciliation.messageDelivery;
    }

    try {
        await opts.recover();
        reconciliation = await opts.reconcile(opts.clientUserMessageId);
        return reconciliation.messageDelivery;
    } catch (error) {
        logger.warn('[Codex] Recovery failed while resolving uncertain message delivery', error);
        return 'unknown';
    }
}

export async function routeCodexUserText<T>(opts: {
    text: string;
    mode: T;
    attachments?: PendingAttachment[];
    clientUserMessageId?: string;
    activeTurnId: string | null;
    forceQueue?: boolean;
    queue: CodexUserTextQueue<T>;
    steer: SteerCodexUserText;
    reconcileSteerFailure?: ReconcileCodexSteerFailure;
}): Promise<'clear' | 'pending' | 'queued' | 'steered'> {
    if (opts.forceQueue || !opts.activeTurnId || isCodexClearText(opts.text)) {
        return enqueueCodexUserText(opts);
    }

    try {
        await opts.steer({
            text: opts.text,
            attachments: opts.attachments,
            expectedTurnId: opts.activeTurnId,
            ...(opts.clientUserMessageId ? { clientUserMessageId: opts.clientUserMessageId } : {}),
        });
        return 'steered';
    } catch (error) {
        let reconciliation: 'delivered' | 'queue' | 'unknown' = 'queue';
        try {
            reconciliation = await opts.reconcileSteerFailure?.({
                error,
                clientUserMessageId: opts.clientUserMessageId,
            }) ?? 'queue';
        } catch (reconciliationError) {
            logger.warn('[Codex] Failed to reconcile steering acknowledgement; preserving input', reconciliationError);
            reconciliation = 'unknown';
        }
        if (reconciliation === 'delivered') {
            logger.warn('[Codex] Steering acknowledgement was uncertain, but the message exists in Codex history');
            return 'steered';
        }
        if (reconciliation === 'unknown' && opts.clientUserMessageId && opts.queue.pushUncertain) {
            logger.warn('[Codex] Steering delivery remains unknown; preserving input for later reconciliation');
            opts.queue.pushUncertain(
                opts.text,
                opts.mode,
                opts.attachments,
                opts.clientUserMessageId,
            );
            return 'pending';
        }
        logger.warn('[Codex] Active-turn steering failed; queueing for the next turn', {
            errorName: error instanceof Error ? error.name : typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
        });
        return enqueueCodexUserText(opts);
    }
}
