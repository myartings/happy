import equal from 'fast-deep-equal';

import { createReducer, reducer, type ReducerState } from '@/sync/reducer/reducer';
import type { AgentState } from '@/sync/storageTypes';
import type { Message } from '@/sync/typesMessage';
import type { NormalizedMessage } from '@/sync/typesRaw';

type InternalReducerMessage = ReducerState['messages'] extends Map<string, infer T> ? T : never;

export type StagedVisibleSessionTail =
    | {
        staged: true;
        messages: Message[];
        messagesMap: Record<string, Message>;
        reducerState: ReducerState;
    }
    | {
        staged: false;
        reason: 'unmatched-reducer-message' | 'message-mismatch';
    };

type StageVisibleSessionTailInput = {
    normalizedMessages: NormalizedMessage[];
    agentState: AgentState | null | undefined;
    liveReducerState: ReducerState;
    expectedMessages: readonly Message[];
};

function reducerMessageIdentity(message: InternalReducerMessage): string {
    const recordIdentity = message.localId
        ? `local:${message.localId}`
        : `real:${message.realID ?? ''}`;
    const kind = message.tool
        ? `tool:${message.tool.callId ?? message.tool.name}`
        : message.event
            ? 'event'
            : 'text';
    return JSON.stringify([
        recordIdentity,
        message.role,
        message.createdAt,
        kind,
    ]);
}

function buildLiveIdQueues(state: ReducerState): Map<string, string[]> {
    const queues = new Map<string, string[]>();
    for (const [id, message] of state.messages) {
        const key = reducerMessageIdentity(message);
        const queue = queues.get(key);
        if (queue) {
            queue.push(id);
        } else {
            queues.set(key, [id]);
        }
    }
    return queues;
}

function remapLookupValues(lookup: Map<string, string>, ids: ReadonlyMap<string, string>) {
    for (const [key, value] of lookup) {
        lookup.set(key, ids.get(value) ?? value);
    }
}

function remapPublicMessage(message: Message, ids: ReadonlyMap<string, string>): void {
    message.id = ids.get(message.id) ?? message.id;
    if (message.kind === 'tool-call') {
        for (const child of message.children) {
            remapPublicMessage(child, ids);
        }
    }
}

function preserveNewerDerivedState(staged: ReducerState, live: ReducerState) {
    if (
        live.latestTodos
        && (!staged.latestTodos || live.latestTodos.timestamp > staged.latestTodos.timestamp)
    ) {
        staged.latestTodos = live.latestTodos;
    }
    if (
        live.latestUsage
        && (!staged.latestUsage || live.latestUsage.timestamp > staged.latestUsage.timestamp)
    ) {
        staged.latestUsage = live.latestUsage;
    }
}

/**
 * Reconstruct a reducer from freshly fetched normalized records without
 * touching Zustand. Random reducer IDs are remapped back to the mounted
 * transcript's stable IDs before the candidate can be published.
 */
export function stageVisibleSessionTail({
    normalizedMessages,
    agentState,
    liveReducerState,
    expectedMessages,
}: StageVisibleSessionTailInput): StagedVisibleSessionTail {
    const stagedReducerState = createReducer();
    const reducerResult = reducer(stagedReducerState, normalizedMessages, agentState);
    preserveNewerDerivedState(stagedReducerState, liveReducerState);

    const liveIdQueues = buildLiveIdQueues(liveReducerState);
    const stagedToLiveIds = new Map<string, string>();
    for (const [stagedId, message] of stagedReducerState.messages) {
        const queue = liveIdQueues.get(reducerMessageIdentity(message));
        const liveId = queue?.shift();
        if (!liveId) {
            return { staged: false, reason: 'unmatched-reducer-message' };
        }
        stagedToLiveIds.set(stagedId, liveId);
    }

    const remappedReducerMessages = new Map<string, InternalReducerMessage>();
    for (const [stagedId, message] of stagedReducerState.messages) {
        const liveId = stagedToLiveIds.get(stagedId)!;
        message.id = liveId;
        remappedReducerMessages.set(liveId, message);
    }
    stagedReducerState.messages = remappedReducerMessages;
    remapLookupValues(stagedReducerState.toolIdToMessageId, stagedToLiveIds);
    remapLookupValues(stagedReducerState.sidechainToolIdToMessageId, stagedToLiveIds);
    remapLookupValues(stagedReducerState.localIds, stagedToLiveIds);
    remapLookupValues(stagedReducerState.messageIds, stagedToLiveIds);

    const messagesMap: Record<string, Message> = {};
    for (const message of reducerResult.messages) {
        remapPublicMessage(message, stagedToLiveIds);
        messagesMap[message.id] = message;
    }

    if (
        Object.keys(messagesMap).length !== expectedMessages.length
        || expectedMessages.some((message) => !messagesMap[message.id])
    ) {
        return { staged: false, reason: 'message-mismatch' };
    }
    const orderedMessages = expectedMessages.map((message) => messagesMap[message.id]);
    if (!equal(orderedMessages, expectedMessages)) {
        return { staged: false, reason: 'message-mismatch' };
    }

    return {
        staged: true,
        messages: orderedMessages,
        messagesMap,
        reducerState: stagedReducerState,
    };
}
