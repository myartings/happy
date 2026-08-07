import { DecryptedMessage } from './storageTypes';
import { normalizeRawMessage, RawRecord } from './typesRaw';

export type PromptHistoryItem = {
    id: string;
    localId: string | null;
    sessionId: string;
    seq: number | null;
    createdAt: number;
    text: string;
};

export type PromptHistoryPage = {
    items: PromptHistoryItem[];
    hasMore: boolean;
    nextBeforeSeq: number | null;
};

export function extractPromptHistoryItems(
    sessionId: string,
    messages: readonly (DecryptedMessage | null)[],
): PromptHistoryItem[] {
    const items: PromptHistoryItem[] = [];

    for (const message of messages) {
        if (!message?.content) continue;

        const normalized = normalizeRawMessage(
            message.id,
            message.localId,
            message.createdAt,
            message.content as RawRecord,
        );
        if (!normalized || normalized.role !== 'user' || normalized.content.type !== 'text') {
            continue;
        }

        const text = (normalized.meta?.displayText ?? normalized.content.text).trim();
        if (!text) continue;

        items.push({
            id: normalized.id,
            localId: normalized.localId,
            sessionId,
            seq: message.seq,
            createdAt: normalized.createdAt,
            text,
        });
    }

    return items.sort((left, right) => right.createdAt - left.createdAt);
}
