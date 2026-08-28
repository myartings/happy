import { afterEach, describe, expect, it, vi } from 'vitest';

import { createReducer, reducer } from '@/sync/reducer/reducer';
import type { NormalizedMessage } from '@/sync/typesRaw';

import { stageVisibleSessionTail } from './visibleSessionTailStaging';

const normalizedMessages: NormalizedMessage[] = [
    {
        id: 'agent-2',
        localId: null,
        createdAt: 3,
        role: 'agent',
        content: [
            { type: 'text', text: 'Done', uuid: 'text-2', parentUUID: null },
            {
                type: 'tool-call',
                id: 'tool-1',
                name: 'Bash',
                input: { command: 'pwd' },
                description: 'Print directory',
                uuid: 'tool-1-uuid',
                parentUUID: null,
            },
            {
                type: 'tool-result',
                tool_use_id: 'tool-1',
                content: '/workspace',
                is_error: false,
                uuid: 'result-1',
                parentUUID: null,
            },
        ],
        isSidechain: false,
    },
    {
        id: 'user-1',
        localId: 'local-user-1',
        createdAt: 2,
        role: 'user',
        content: { type: 'text', text: 'Run pwd' },
        isSidechain: false,
    },
];

function installDistinctIds(prefix: string) {
    let counter = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
        counter += 1;
        return Number(`0.${prefix}${counter.toString().padStart(6, '0')}`);
    });
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('stageVisibleSessionTail', () => {
    it('joins an optimistic user message to its server record by stable localId', () => {
        installDistinctIds('0');
        const liveReducerState = createReducer();
        const optimistic: NormalizedMessage = {
            id: 'optimistic-id',
            localId: 'stable-local-id',
            createdAt: 1,
            role: 'user',
            content: { type: 'text', text: 'hello' },
            isSidechain: false,
        };
        const liveMessages = reducer(liveReducerState, [optimistic]).messages;

        const staged = stageVisibleSessionTail({
            normalizedMessages: [{ ...optimistic, id: 'server-id' }],
            agentState: null,
            liveReducerState,
            expectedMessages: liveMessages,
        });

        expect(staged.staged).toBe(true);
        if (!staged.staged) return;
        expect(staged.messages).toEqual(liveMessages);
        expect(staged.reducerState.localIds.get('stable-local-id')).toBe(liveMessages[0].id);
        expect(staged.reducerState.messageIds.get('server-id')).toBe(liveMessages[0].id);
    });

    it('builds outside the live reducer and remaps every staged ID to the visible snapshot', () => {
        installDistinctIds('1');
        const liveReducerState = createReducer();
        const liveMessages = reducer(liveReducerState, normalizedMessages).messages
            .sort((left, right) => right.createdAt - left.createdAt);
        const liveMessageIds = liveMessages.map((message) => message.id);
        const liveReducerKeys = [...liveReducerState.messages.keys()];

        vi.restoreAllMocks();
        installDistinctIds('2');
        const staged = stageVisibleSessionTail({
            normalizedMessages,
            agentState: null,
            liveReducerState,
            expectedMessages: liveMessages,
        });

        expect(staged.staged).toBe(true);
        if (!staged.staged) return;
        expect(staged.messages).toEqual(liveMessages);
        expect(staged.messages.map((message) => message.id)).toEqual(liveMessageIds);
        expect(Object.keys(staged.messagesMap)).toEqual(expect.arrayContaining(liveMessageIds));
        expect([...staged.reducerState.messages.keys()]).toEqual(liveReducerKeys);
        expect([...liveReducerState.messages.keys()]).toEqual(liveReducerKeys);
    });

    it('rejects a content mismatch and leaves the live snapshot untouched', () => {
        installDistinctIds('3');
        const liveReducerState = createReducer();
        const liveMessages = reducer(liveReducerState, normalizedMessages).messages
            .sort((left, right) => right.createdAt - left.createdAt);
        const snapshot = structuredClone(liveMessages);

        const staged = stageVisibleSessionTail({
            normalizedMessages: normalizedMessages.map((message): NormalizedMessage => (
                message.id === 'user-1' && message.role === 'user'
                ? { ...message, content: { type: 'text', text: 'Different' } }
                : message
            )),
            agentState: null,
            liveReducerState,
            expectedMessages: liveMessages,
        });

        expect(staged).toEqual({ staged: false, reason: 'message-mismatch' });
        expect(liveMessages).toEqual(snapshot);
    });
});
