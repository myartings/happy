export const MAX_RETAINED_SESSION_MESSAGE_CACHES = 3;
export const MAX_BACKGROUND_SESSION_MESSAGE_CACHES = 1;
export const MAX_RETAINED_MESSAGES_PER_HIDDEN_SESSION = 500;
export const MAX_RETAINED_HIDDEN_SESSION_MESSAGE_BYTES = 10 * 1024 * 1024;

/**
 * Large transcripts are useful only while they are visible. Evicting the whole
 * hidden cache is safer than slicing individual pages because the next open can
 * rebuild its cursors from the server's latest page without creating a gap.
 */
export function shouldEvictHiddenSessionMessageCache(
    messageCount: number,
    estimatedBytes = 0,
): boolean {
    return messageCount > MAX_RETAINED_MESSAGES_PER_HIDDEN_SESSION ||
        estimatedBytes > MAX_RETAINED_HIDDEN_SESSION_MESSAGE_BYTES;
}

/** Conservative UTF-16 estimate used only when a Session becomes hidden. */
export function estimateNormalizedMessageCacheBytes(messages: readonly unknown[]): number {
    let bytes = 0;
    for (const message of messages) {
        bytes += JSON.stringify(message).length * 2;
    }
    return bytes;
}

type SelectSessionMessageCacheEvictionsOptions = {
    cachedSessionIds: Iterable<string>;
    accessOrder: ReadonlyMap<string, number>;
    protectedSessionIds?: Iterable<string>;
    maxRetained: number;
};

/** Return the sessions that are mounted and should be refreshed after a socket reconnect. */
export function selectVisibleSessionIds(
    visibleSessionRefCounts: ReadonlyMap<string, number>,
): string[] {
    return Array.from(visibleSessionRefCounts.entries())
        .filter(([, refCount]) => refCount > 0)
        .map(([sessionId]) => sessionId);
}

/**
 * Select the least-recently-used, unprotected session message caches to evict.
 *
 * Sessions without an access-order entry predate the LRU tracker and are treated
 * as the oldest caches. The caller owns the actual cleanup because Sync also has
 * per-session cursors and queues that must be cleared alongside the Zustand data.
 */
export function selectSessionMessageCacheEvictions({
    cachedSessionIds,
    accessOrder,
    protectedSessionIds = [],
    maxRetained,
}: SelectSessionMessageCacheEvictionsOptions): string[] {
    const cached = Array.from(new Set(cachedSessionIds));
    const protectedIds = new Set(protectedSessionIds);
    const targetSize = Math.max(0, maxRetained);
    let retainedCount = cached.length;

    const candidates = cached
        .filter((sessionId) => !protectedIds.has(sessionId))
        .sort((left, right) => {
            const leftOrder = accessOrder.get(left) ?? Number.NEGATIVE_INFINITY;
            const rightOrder = accessOrder.get(right) ?? Number.NEGATIVE_INFINITY;
            if (leftOrder !== rightOrder) {
                return leftOrder - rightOrder;
            }
            return left.localeCompare(right);
        });

    const evictions: string[] = [];
    for (const sessionId of candidates) {
        if (retainedCount <= targetSize) {
            break;
        }
        evictions.push(sessionId);
        retainedCount -= 1;
    }
    return evictions;
}
