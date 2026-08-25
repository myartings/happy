import { parseSpecialCommand } from '@/parsers/specialCommands';
import type { PendingAttachment } from '@/utils/MessageQueue2';

type CodexUserTextQueue<T> = {
    push: (message: string, mode: T, attachments?: PendingAttachment[], clientUserMessageId?: string) => void;
    pushIsolateAndClear: (message: string, mode: T, attachments?: PendingAttachment[], clientUserMessageId?: string) => void;
};

export function isCodexClearText(text: string): boolean {
    return parseSpecialCommand(text).type === 'clear';
}

export function enqueueCodexUserText<T>(opts: {
    text: string;
    mode: T;
    queue: CodexUserTextQueue<T>;
    attachments?: PendingAttachment[];
    clientUserMessageId?: string;
}): 'clear' | 'queued' {
    if (isCodexClearText(opts.text)) {
        if (opts.clientUserMessageId) {
            opts.queue.pushIsolateAndClear(opts.text, opts.mode, opts.attachments, opts.clientUserMessageId);
        } else {
            opts.queue.pushIsolateAndClear(opts.text, opts.mode, opts.attachments);
        }
        return 'clear';
    }

    if (opts.clientUserMessageId) {
        opts.queue.push(opts.text, opts.mode, opts.attachments, opts.clientUserMessageId);
    } else {
        opts.queue.push(opts.text, opts.mode, opts.attachments);
    }
    return 'queued';
}
