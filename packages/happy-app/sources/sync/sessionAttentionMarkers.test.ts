import { describe, expect, it } from 'vitest';
import {
    getUnreadSessionIds,
    didSessionBecomeUnread,
    markSessionAttentionRead,
    markSessionAttentionUnread,
    mergeSessionAttentionMarkers,
} from './sessionAttentionMarkers';

describe('session attention markers', () => {
    it('detects an unattended active-to-idle transition even when already unread', () => {
        const active = { thinking: true, hasPendingRequests: false, presence: 'online' as const };
        const idle = { thinking: false, hasPendingRequests: false, presence: 'online' as const };

        expect(didSessionBecomeUnread(active, idle, false)).toBe(true);
        expect(didSessionBecomeUnread(active, idle, true)).toBe(false);
        expect(didSessionBecomeUnread(idle, idle, false)).toBe(false);
    });

    it('marks a completion unread and clears it at the same sequence', () => {
        const unread = markSessionAttentionUnread({}, 'session-1', 12);
        expect(getUnreadSessionIds(unread)).toEqual(new Set(['session-1']));

        const read = markSessionAttentionRead(unread, 'session-1');
        expect(read['session-1']).toEqual({ unreadSeq: 12, readSeq: 12 });
        expect(getUnreadSessionIds(read)).toEqual(new Set());
    });

    it('merges concurrent device updates monotonically per session', () => {
        expect(mergeSessionAttentionMarkers(
            { 'session-1': { unreadSeq: 12, readSeq: 8 } },
            {
                'session-1': { unreadSeq: 10, readSeq: 12 },
                'session-2': { unreadSeq: 4, readSeq: 0 },
            },
        )).toEqual({
            'session-1': { unreadSeq: 12, readSeq: 12 },
            'session-2': { unreadSeq: 4, readSeq: 0 },
        });
    });

    it('ignores stale duplicate completion updates', () => {
        const current = { 'session-1': { unreadSeq: 12, readSeq: 12 } };
        expect(markSessionAttentionUnread(current, 'session-1', 11)).toBe(current);
    });
});
