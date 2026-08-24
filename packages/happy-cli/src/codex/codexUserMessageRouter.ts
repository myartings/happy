import { logger } from '@/ui/logger';
import type { PendingAttachment } from '@/utils/MessageQueue2';

import { enqueueCodexUserText, isCodexClearText } from './codexClearCommand';

type CodexUserTextQueue<T> = {
    push: (message: string, mode: T, attachments?: PendingAttachment[]) => void;
    pushIsolateAndClear: (message: string, mode: T, attachments?: PendingAttachment[]) => void;
};

export type SteerCodexUserText = (input: {
    text: string;
    attachments?: PendingAttachment[];
    expectedTurnId: string;
}) => Promise<void>;

export async function routeCodexUserText<T>(opts: {
    text: string;
    mode: T;
    attachments?: PendingAttachment[];
    activeTurnId: string | null;
    forceQueue?: boolean;
    queue: CodexUserTextQueue<T>;
    steer: SteerCodexUserText;
}): Promise<'clear' | 'queued' | 'steered'> {
    if (opts.forceQueue || !opts.activeTurnId || isCodexClearText(opts.text)) {
        return enqueueCodexUserText(opts);
    }

    try {
        await opts.steer({
            text: opts.text,
            attachments: opts.attachments,
            expectedTurnId: opts.activeTurnId,
        });
        return 'steered';
    } catch (error) {
        logger.warn('[Codex] Active-turn steering failed; queueing for the next turn', {
            errorName: error instanceof Error ? error.name : typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
        });
        return enqueueCodexUserText(opts);
    }
}
