import * as z from 'zod';

export const SessionAttentionMarkerSchema = z.object({
    unreadSeq: z.number().int().nonnegative(),
    readSeq: z.number().int().nonnegative(),
});

export const SessionAttentionMarkersSchema = z.record(z.string(), SessionAttentionMarkerSchema);

export type SessionAttentionMarker = z.infer<typeof SessionAttentionMarkerSchema>;
export type SessionAttentionMarkers = z.infer<typeof SessionAttentionMarkersSchema>;

export type SessionAttentionLifecycle = {
    thinking: boolean;
    hasPendingRequests: boolean;
    presence: 'online' | number;
};

export function didSessionBecomeUnread(
    previous: SessionAttentionLifecycle | null,
    next: SessionAttentionLifecycle,
    isCurrentlyViewing: boolean,
): boolean {
    if (!previous || isCurrentlyViewing) return false;
    const wasActive = previous.thinking || previous.hasPendingRequests;
    const isNowIdle = !next.thinking && next.presence === 'online' && !next.hasPendingRequests;
    return wasActive && isNowIdle;
}

export function mergeSessionAttentionMarkers(
    current: SessionAttentionMarkers,
    incoming: SessionAttentionMarkers,
): SessionAttentionMarkers {
    let changed = false;
    const merged: SessionAttentionMarkers = { ...current };
    for (const [sessionId, marker] of Object.entries(incoming)) {
        const existing = merged[sessionId];
        const next = existing
            ? {
                unreadSeq: Math.max(existing.unreadSeq, marker.unreadSeq),
                readSeq: Math.max(existing.readSeq, marker.readSeq),
            }
            : marker;
        if (!existing || next.unreadSeq !== existing.unreadSeq || next.readSeq !== existing.readSeq) {
            merged[sessionId] = next;
            changed = true;
        }
    }
    return changed ? merged : current;
}

export function markSessionAttentionUnread(
    markers: SessionAttentionMarkers,
    sessionId: string,
    sessionSeq: number,
): SessionAttentionMarkers {
    const existing = markers[sessionId] ?? { unreadSeq: 0, readSeq: 0 };
    if (sessionSeq <= existing.unreadSeq) return markers;
    return {
        ...markers,
        [sessionId]: { ...existing, unreadSeq: sessionSeq },
    };
}

export function markSessionAttentionRead(
    markers: SessionAttentionMarkers,
    sessionId: string,
): SessionAttentionMarkers {
    const existing = markers[sessionId];
    if (!existing || existing.readSeq >= existing.unreadSeq) return markers;
    return {
        ...markers,
        [sessionId]: { ...existing, readSeq: existing.unreadSeq },
    };
}

export function getUnreadSessionIds(markers: SessionAttentionMarkers): Set<string> {
    return new Set(Object.entries(markers)
        .filter(([, marker]) => marker.unreadSeq > marker.readSeq)
        .map(([sessionId]) => sessionId));
}
