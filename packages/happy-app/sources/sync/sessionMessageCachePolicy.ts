export const MAX_RETAINED_SESSION_MESSAGE_CACHES = 3;
export const MAX_BACKGROUND_SESSION_MESSAGE_CACHES = 1;

type SelectSessionMessageCacheEvictionsOptions = {
    cachedSessionIds: Iterable<string>;
    accessOrder: ReadonlyMap<string, number>;
    protectedSessionIds?: Iterable<string>;
    maxRetained: number;
};

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
