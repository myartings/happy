export type MessageTargetAction =
    | { type: 'none' }
    | { type: 'wait' }
    | { type: 'load-older' }
    | { type: 'not-found' }
    | { type: 'scroll'; index: number; messageId: string };

export function getMessageTargetNativeId(messageId: string): string {
    return `message-target-${messageId}`;
}

export function resolveMessageTargetAction(
    items: readonly { id: string; localId?: string | null; createdAt?: number | null }[],
    targetMessageId: string | undefined,
    targetLocalId: string | undefined,
    targetCreatedAt: number | undefined,
    hasMoreOlder: boolean,
    isLoadingOlder: boolean,
): MessageTargetAction {
    if (!targetMessageId) return { type: 'none' };

    const index = items.findIndex((item) =>
        item.id === targetMessageId
        || (!!targetLocalId && item.localId === targetLocalId)
        || (targetCreatedAt !== undefined && item.createdAt === targetCreatedAt));
    if (index >= 0) return { type: 'scroll', index, messageId: items[index].id };
    if (isLoadingOlder) return { type: 'wait' };
    if (hasMoreOlder) return { type: 'load-older' };
    return { type: 'not-found' };
}
