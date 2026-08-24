import { groupMessagesForDisplay } from '@/hooks/useGroupedMessages';
import type { SessionListViewItem, SessionRowData } from '@/sync/storage';
import type { Message } from '@/sync/typesMessage';
import { buildVisibleSessionListViewData } from '@/utils/visibleSessionListViewData';
import { SessionRowProjectionCache } from './sessionRowProjectionCache';
import { TurnProjectionCache } from './turnProjectionCache';

export type ClientPerformanceBaselineOptions = {
    sessionCount: number;
    messageCount: number;
};

export type ClientPerformanceBaselineResult = {
    fixture: ClientPerformanceBaselineOptions;
    sessionProjection: {
        projectedRows: number;
        indexReads: number;
        outputItems: number;
    };
    messageDerivation: {
        inputItems: number;
        indexReads: number;
        outputItems: number;
    };
    incrementalUpdate: {
        projectedSessionRows: number;
        retainedSessionRows: number;
        projectedTurnSegments: number;
        retainedTurnSegments: number;
    };
};

function makeSession(index: number): SessionRowData {
    const timestamp = 1_700_000_000_000 + index;
    return {
        id: `benchmark-session-${index}`,
        createdAt: timestamp,
        lastActivityAt: timestamp,
        active: index % 10 === 0,
        archived: false,
        state: 'waiting',
        hasUnread: false,
    } as SessionRowData;
}

function makeMessage(index: number): Extract<Message, { kind: 'user-text' }> {
    return {
        kind: 'user-text',
        id: `benchmark-message-${index}`,
        localId: null,
        createdAt: 1_700_000_000_000 - index,
        text: `Generated benchmark message ${index}`,
    };
}

function numericIndex(property: PropertyKey): boolean {
    return typeof property === 'string' && /^(0|[1-9]\d*)$/.test(property);
}

/**
 * Exercise the current production derivation paths with generated, non-sensitive
 * fixtures. Counters describe deterministic collection work; callers may record
 * wall-clock timing separately, but timing is intentionally not a test gate.
 */
export function runClientPerformanceBaseline(
    options: ClientPerformanceBaselineOptions,
): ClientPerformanceBaselineResult {
    const sessionSources = Array.from(
        { length: options.sessionCount },
        (_, index) => makeSession(index),
    );
    const sessionRows: SessionListViewItem[] = sessionSources.map((session) => ({
        type: 'session',
        session,
    }));
    let sessionIndexReads = 0;
    const observedSessionRows = new Proxy(sessionRows, {
        get(target, property, receiver) {
            if (numericIndex(property)) {
                sessionIndexReads += 1;
            }
            return Reflect.get(target, property, receiver);
        },
    });
    const sessionItems = buildVisibleSessionListViewData(observedSessionRows, {
        hideArchivedSessions: false,
        sortActiveSessionsGlobally: true,
        groupActiveSessionsByDate: false,
        needsAttentionSessionsEnabled: true,
        pinnedSessionIds: [],
        favoriteProjectIds: [],
        now: 1_700_000_000_000,
    }) ?? [];

    const messages = Array.from({ length: options.messageCount }, (_, index) => makeMessage(index));
    let indexReads = 0;
    const observedMessages = new Proxy(messages, {
        get(target, property, receiver) {
            if (numericIndex(property)) {
                indexReads += 1;
            }
            return Reflect.get(target, property, receiver);
        },
    });
    const displayItems = groupMessagesForDisplay(observedMessages, true);

    const sessionCache = new SessionRowProjectionCache<SessionRowData, never, SessionRowData>();
    let projectedSessionRows = 0;
    const projectSessionRows = (sources: readonly SessionRowData[]) => sources.map((source) => sessionCache.project({
        id: source.id,
        source,
        unread: false,
        machine: undefined,
        build: () => {
            projectedSessionRows += 1;
            return source;
        },
    }));
    projectSessionRows(sessionSources);
    projectedSessionRows = 0;
    if (sessionSources.length > 0) {
        const updatedSessionSources = [...sessionSources];
        updatedSessionSources[0] = { ...updatedSessionSources[0], active: !updatedSessionSources[0].active };
        projectSessionRows(updatedSessionSources);
    }

    const turnCache = new TurnProjectionCache<Message, number>();
    let projectedTurnSegments = 0;
    const projectTurns = (items: readonly Message[]) => turnCache.project({
        items,
        getId: (item) => item.id,
        isBoundary: (item) => item.kind === 'user-text',
        variantForSegment: () => 'completed',
        projectSegment: (segment) => {
            projectedTurnSegments += 1;
            return segment.length;
        },
    });
    projectTurns(messages);
    projectedTurnSegments = 0;
    if (messages.length > 0) {
        const updatedMessages = [...messages];
        updatedMessages[0] = { ...updatedMessages[0], text: `${updatedMessages[0].text} updated` };
        projectTurns(updatedMessages);
    }

    return {
        fixture: options,
        sessionProjection: {
            projectedRows: sessionRows.length,
            indexReads: sessionIndexReads,
            outputItems: sessionItems.length,
        },
        messageDerivation: {
            inputItems: messages.length,
            indexReads,
            outputItems: displayItems.length,
        },
        incrementalUpdate: {
            projectedSessionRows,
            retainedSessionRows: sessionCache.size,
            projectedTurnSegments,
            retainedTurnSegments: turnCache.size,
        },
    };
}
