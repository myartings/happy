import type { DisplayItem } from '@/hooks/useGroupedMessages';
import type { PromptHistoryItem } from '@/sync/promptHistory';
import type { Message } from '@/sync/typesMessage';

export function mergeSessionPromptHistory(
    sessionId: string,
    fetched: readonly PromptHistoryItem[],
    loadedMessages: readonly Message[],
): PromptHistoryItem[] {
    const byId = new Map<string, PromptHistoryItem>();
    for (const item of fetched) {
        byId.set(item.id, item);
    }
    for (const message of loadedMessages) {
        if (message.kind !== 'user-text') continue;
        const text = (message.displayText ?? message.text).trim();
        if (!text) continue;
        byId.set(message.id, {
            id: message.id,
            localId: message.localId,
            sessionId,
            seq: byId.get(message.id)?.seq ?? null,
            createdAt: message.createdAt,
            text,
        });
    }
    return Array.from(byId.values()).sort((left, right) => (
        left.createdAt - right.createdAt || left.id.localeCompare(right.id)
    ));
}

export function getPromptIndexFromTrackPosition(
    position: number,
    trackLength: number,
    promptCount: number,
): number | null {
    if (promptCount <= 0 || !Number.isFinite(position) || trackLength <= 0) return null;
    if (promptCount === 1) return 0;
    const ratio = Math.max(0, Math.min(1, position / trackLength));
    return Math.round(ratio * (promptCount - 1));
}

export function resolveVisiblePromptId(
    displayItems: readonly DisplayItem[],
    visibleIndices: readonly number[],
): string | null {
    if (visibleIndices.length === 0) return null;
    const sorted = visibleIndices.slice().sort((left, right) => left - right);
    const anchor = sorted[Math.floor(sorted.length / 2)];

    // Data is newest-first. An assistant response appears immediately before
    // the user prompt that started its turn, so first search toward older rows.
    for (let index = anchor; index < displayItems.length; index += 1) {
        const item = displayItems[index];
        if (item.type === 'message' && item.message.kind === 'user-text') {
            return item.message.id;
        }
    }
    for (let index = anchor - 1; index >= 0; index -= 1) {
        const item = displayItems[index];
        if (item.type === 'message' && item.message.kind === 'user-text') {
            return item.message.id;
        }
    }
    return null;
}
