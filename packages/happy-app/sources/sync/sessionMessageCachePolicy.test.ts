import { describe, expect, it } from 'vitest';
import {
    MAX_BACKGROUND_SESSION_MESSAGE_CACHES,
    MAX_RETAINED_HIDDEN_SESSION_MESSAGE_BYTES,
    MAX_RETAINED_MESSAGES_PER_HIDDEN_SESSION,
    MAX_RETAINED_SESSION_MESSAGE_CACHES,
    shouldEvictHiddenSessionMessageCache,
    advanceSessionMessageCursor,
    selectVisibleSessionIds,
    selectSessionMessageCacheEvictions,
} from './sessionMessageCachePolicy';

describe('advanceSessionMessageCursor', () => {
    it('does not let a slower REST reconciliation rewind a socket-advanced cursor', () => {
        const cursors = new Map([['session-a', 12]]);

        expect(advanceSessionMessageCursor(cursors, 'session-a', 10)).toBe(12);
        expect(cursors.get('session-a')).toBe(12);
        expect(advanceSessionMessageCursor(cursors, 'session-a', 14)).toBe(14);
    });
});

describe('selectSessionMessageCacheEvictions', () => {
    it('keeps only the most recently used session message caches', () => {
        const evictions = selectSessionMessageCacheEvictions({
            cachedSessionIds: ['oldest', 'middle', 'recent', 'current'],
            accessOrder: new Map([
                ['oldest', 1],
                ['middle', 2],
                ['recent', 3],
                ['current', 4],
            ]),
            maxRetained: MAX_RETAINED_SESSION_MESSAGE_CACHES,
        });

        expect(evictions).toEqual(['oldest']);
    });

    it('never evicts the protected current session', () => {
        const evictions = selectSessionMessageCacheEvictions({
            cachedSessionIds: ['current', 'middle', 'recent'],
            accessOrder: new Map([
                ['current', 1],
                ['middle', 2],
                ['recent', 3],
            ]),
            protectedSessionIds: ['current'],
            maxRetained: MAX_BACKGROUND_SESSION_MESSAGE_CACHES,
        });

        expect(evictions).toEqual(['middle', 'recent']);
    });

    it('treats caches that predate access tracking as the oldest', () => {
        const evictions = selectSessionMessageCacheEvictions({
            cachedSessionIds: ['untracked', 'tracked'],
            accessOrder: new Map([['tracked', 1]]),
            maxRetained: 1,
        });

        expect(evictions).toEqual(['untracked']);
    });

    it('keeps protected caches even when they exceed the requested limit', () => {
        const evictions = selectSessionMessageCacheEvictions({
            cachedSessionIds: ['parent', 'side-chat'],
            accessOrder: new Map([
                ['parent', 1],
                ['side-chat', 2],
            ]),
            protectedSessionIds: ['parent', 'side-chat'],
            maxRetained: 1,
        });

        expect(evictions).toEqual([]);
    });
});

describe('selectVisibleSessionIds', () => {
    it('returns only sessions with an active visibility reference', () => {
        expect(selectVisibleSessionIds(new Map([
            ['primary', 1],
            ['side-chat', 2],
            ['hidden', 0],
            ['invalid', -1],
        ]))).toEqual(['primary', 'side-chat']);
    });
});

describe('shouldEvictHiddenSessionMessageCache', () => {
    it('drops an oversized hidden transcript cache instead of retaining it in the LRU', () => {
        expect(shouldEvictHiddenSessionMessageCache(
            MAX_RETAINED_MESSAGES_PER_HIDDEN_SESSION + 1,
        )).toBe(true);
        expect(shouldEvictHiddenSessionMessageCache(
            MAX_RETAINED_MESSAGES_PER_HIDDEN_SESSION,
        )).toBe(false);
        expect(shouldEvictHiddenSessionMessageCache(
            1,
            MAX_RETAINED_HIDDEN_SESSION_MESSAGE_BYTES + 1,
        )).toBe(true);
    });
});
