import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClientLongSessionDiagnosticsCapture } from './clientLongSessionDiagnostics';
import { IncrementalOrderedMessageCollection } from './orderedMessageCollection';
import type { AgentState } from '@/sync/storageTypes';
import type { NormalizedMessage } from '@/sync/typesRaw';

vi.mock('react-native-mmkv', () => ({
    MMKV: class {
        getString() {
            return undefined;
        }

        getNumber() {
            return undefined;
        }

        set() {}
        delete() {}
    },
}));

vi.mock('@/sync/sync', () => ({
    sync: {
        applySettings: vi.fn(),
        assumeUsers: vi.fn(),
    },
}));

vi.mock('@/realtime/RealtimeSession', () => ({
    getCurrentRealtimeSessionId: vi.fn(() => null),
    getVoiceSession: vi.fn(() => null),
}));

vi.mock('@/components/tools/knownTools', () => ({
    isMutableTool: vi.fn(() => false),
}));

vi.mock('@/text', () => ({
    t: (key: string) => key,
}));

let storage: typeof import('@/sync/storage').storage;
let startDiagnosticsCapture: typeof import('./clientLongSessionDiagnostics').startClientLongSessionDiagnosticsCapture;
let diagnosticsCapture: ClientLongSessionDiagnosticsCapture | null = null;

function makeLongSessionMessages(count: number): NormalizedMessage[] {
    const messages: NormalizedMessage[] = [];
    for (let index = 0; index < count - 1; index += 1) {
        messages.push({
            id: `user-${index}`,
            localId: `local-${index}`,
            createdAt: index + 1,
            role: 'user',
            content: { type: 'text', text: `Message ${index}` },
            isSidechain: false,
        });
    }
    messages.push({
        id: 'tool-start',
        localId: null,
        createdAt: count,
        role: 'agent',
        content: [{
            type: 'tool-call',
            id: 'streaming-tool',
            name: 'Bash',
            input: { command: 'pnpm test' },
            description: 'Run tests',
            uuid: 'tool-start-uuid',
            parentUUID: null,
        }],
        isSidechain: false,
    });
    return messages;
}

function applySessionWithAgentState(
    id: string,
    agentStateVersion: number,
    agentState: AgentState | null,
): void {
    storage.getState().applySessions([{
        id,
        seq: agentStateVersion,
        createdAt: 1,
        updatedAt: agentStateVersion,
        active: true,
        activeAt: agentStateVersion,
        metadata: null,
        metadataVersion: 1,
        agentState,
        agentStateVersion,
        thinking: false,
        thinkingAt: agentStateVersion,
    }]);
}

beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('__DEV__', false);
    ({ storage } = await import('@/sync/storage'));
    ({ startClientLongSessionDiagnosticsCapture: startDiagnosticsCapture } = await import(
        './clientLongSessionDiagnostics'
    ));
});

afterEach(() => {
    diagnosticsCapture?.stop();
    diagnosticsCapture = null;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

type TestMessage = {
    id: string;
    createdAt: number;
    value: string;
};

function testMessage(id: string, createdAt: number, value = id): TestMessage {
    return { id, createdAt, value };
}

function indexMessages(messages: readonly TestMessage[]): Record<string, TestMessage> {
    return Object.fromEntries(messages.map((message) => [message.id, message]));
}

describe('IncrementalOrderedMessageCollection', () => {
    it('handles replacements, newest inserts, older appends, and a mixed batch deterministically', () => {
        const nine = testMessage('nine', 9);
        const seven = testMessage('seven', 7);
        const five = testMessage('five', 5);
        const previous = [nine, seven, five];
        const previousMap = indexMessages(previous);
        const fallback = vi.fn();
        const collection = new IncrementalOrderedMessageCollection<TestMessage>({
            onFallback: fallback,
        });
        const replacement = testMessage('seven', 7, 'updated');
        const equalFive = testMessage('equal-five', 5);

        const result = collection.apply('session', previous, previousMap, [
            testMessage('oldest', 1),
            replacement,
            testMessage('newest', 10),
            equalFive,
            testMessage('middle', 8),
        ]);

        expect(result.messages.map((message) => message.id)).toEqual([
            'newest',
            'nine',
            'middle',
            'seven',
            'five',
            'equal-five',
            'oldest',
        ]);
        expect(result.messages.map((message) => message.createdAt)).toEqual([10, 9, 8, 7, 5, 5, 1]);
        expect(result.messages[1]).toBe(nine);
        expect(result.messages[3]).toBe(replacement);
        expect(result.messages[4]).toBe(five);
        expect(result.messagesMap.seven).toBe(replacement);
        expect(previous).toEqual([nine, seven, five]);
        expect(previousMap.seven).toBe(seven);
        expect(fallback).not.toHaveBeenCalled();
    });

    it('keeps the published array and lookup stable for an empty or identical replay', () => {
        const messages = [testMessage('new', 2), testMessage('old', 1)];
        const messagesMap = indexMessages(messages);
        const collection = new IncrementalOrderedMessageCollection<TestMessage>();

        const emptyReplay = collection.apply('session', messages, messagesMap, []);
        const identicalReplay = collection.apply('session', messages, messagesMap, [messages[0]]);

        expect(emptyReplay.messages).toBe(messages);
        expect(emptyReplay.messagesMap).toBe(messagesMap);
        expect(identicalReplay.messages).toBe(messages);
        expect(identicalReplay.messagesMap).toBe(messagesMap);
    });

    it('deduplicates repeated update IDs using the final value', () => {
        const existing = testMessage('existing', 2);
        const messages = [existing];
        const messagesMap = indexMessages(messages);
        const collection = new IncrementalOrderedMessageCollection<TestMessage>();
        const first = testMessage('new', 1, 'first');
        const final = testMessage('new', 1, 'final');

        const result = collection.apply('session', messages, messagesMap, [first, final]);

        expect(result.messages).toEqual([existing, final]);
        expect(result.messagesMap.new).toBe(final);
    });

    it('uses the full rebuild only when immutable createdAt is violated', () => {
        const newest = testMessage('newest', 3);
        const target = testMessage('target', 2);
        const oldest = testMessage('oldest', 1);
        const messages = [newest, target, oldest];
        const messagesMap = indexMessages(messages);
        const fallback = vi.fn();
        const collection = new IncrementalOrderedMessageCollection<TestMessage>({
            onFallback: fallback,
        });

        const moved = testMessage('target', 4, 'invalid timestamp update');
        const result = collection.apply('session', messages, messagesMap, [moved]);

        expect(result.messages).toEqual([moved, newest, oldest]);
        expect(result.messages).not.toBe(messages);
        expect(messages).toEqual([newest, target, oldest]);
        expect(messagesMap.target).toBe(target);
        expect(fallback).toHaveBeenCalledOnce();
        expect(fallback).toHaveBeenCalledWith('created-at-changed');
    });

    it('matches the legacy stable full-sort result across deterministic mixed batches', () => {
        let seed = 0x5eed;
        const random = () => {
            seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;
            return seed / 0x1_0000_0000;
        };
        const fallback = vi.fn();
        const collection = new IncrementalOrderedMessageCollection<TestMessage>({
            onFallback: fallback,
        });
        let messages: TestMessage[] = [];
        let messagesMap: Record<string, TestMessage> = {};
        let nextId = 0;

        for (let batchIndex = 0; batchIndex < 100; batchIndex += 1) {
            const updates: TestMessage[] = [];
            const batchSize = 1 + Math.floor(random() * 8);
            for (let updateIndex = 0; updateIndex < batchSize; updateIndex += 1) {
                const replaceExisting = messages.length > 0 && random() < 0.45;
                if (replaceExisting) {
                    const existing = messages[Math.floor(random() * messages.length)];
                    updates.push(testMessage(
                        existing.id,
                        existing.createdAt,
                        `batch-${batchIndex}-update-${updateIndex}`,
                    ));
                } else {
                    updates.push(testMessage(
                        `id-${nextId}`,
                        Math.floor(random() * 31),
                        `batch-${batchIndex}-new-${updateIndex}`,
                    ));
                    nextId += 1;
                }
            }

            const previousMessages = messages;
            const previousMessagesMap = messagesMap;
            const legacyMap = { ...messagesMap };
            for (const update of updates) {
                legacyMap[update.id] = update;
            }
            const legacyMessages = Object.values(legacyMap)
                .sort((a, b) => b.createdAt - a.createdAt);

            const result = collection.apply('property-session', messages, messagesMap, updates);

            expect(result.messages.map((message) => message.id)).toEqual(
                legacyMessages.map((message) => message.id),
            );
            expect(result.messages).toEqual(legacyMessages);
            expect(result.messagesMap).toEqual(legacyMap);
            expect(previousMessages.map((message) => previousMessagesMap[message.id])).toEqual(
                previousMessages,
            );
            messages = result.messages;
            messagesMap = result.messagesMap;
        }

        expect(fallback).not.toHaveBeenCalled();
    });
});

describe('ordered message collection storage integration', () => {
    it('replaces one streaming message in a 5,000-message session without a full sort', () => {
        storage.getState().applyMessages('long-session', makeLongSessionMessages(5_000));
        const before = storage.getState().sessionMessages['long-session'].messages;
        const targetIndex = before.findIndex((message) => (
            message.kind === 'tool-call' && message.tool.callId === 'streaming-tool'
        ));
        expect(targetIndex).toBeGreaterThanOrEqual(0);

        diagnosticsCapture = startDiagnosticsCapture();
        const sortSpy = vi.spyOn(Array.prototype, 'sort');

        storage.getState().applyMessages('long-session', [{
            id: 'tool-result',
            localId: null,
            createdAt: 5_001,
            role: 'agent',
            content: [{
                type: 'tool-result',
                tool_use_id: 'streaming-tool',
                content: 'passed',
                is_error: false,
                uuid: 'tool-result-uuid',
                parentUUID: 'tool-start-uuid',
            }],
            isSidechain: false,
        }]);

        const after = storage.getState().sessionMessages['long-session'].messages;
        expect(sortSpy).not.toHaveBeenCalled();
        expect(after).toHaveLength(before.length);
        expect(after[targetIndex]).not.toBe(before[targetIndex]);
        expect(after[targetIndex]).toMatchObject({
            kind: 'tool-call',
            tool: { state: 'completed', result: 'passed' },
        });
        for (let index = 0; index < after.length; index += 1) {
            if (index !== targetIndex) {
                expect(after[index]).toBe(before[index]);
            }
        }
        expect(diagnosticsCapture.snapshot().counters.messageSortFallbacks).toBe(0);
    });

    it('appends an older page and keeps a duplicate replay identity-stable', () => {
        const newestPage: NormalizedMessage[] = [
            {
                id: 'new-2',
                localId: 'new-local-2',
                createdAt: 102,
                role: 'user',
                content: { type: 'text', text: 'Newest' },
                isSidechain: false,
            },
            {
                id: 'new-1',
                localId: 'new-local-1',
                createdAt: 101,
                role: 'user',
                content: { type: 'text', text: 'Newer' },
                isSidechain: false,
            },
        ];
        const olderPage: NormalizedMessage[] = [
            {
                id: 'old-1',
                localId: 'old-local-1',
                createdAt: 2,
                role: 'user',
                content: { type: 'text', text: 'Older' },
                isSidechain: false,
            },
            {
                id: 'old-2',
                localId: 'old-local-2',
                createdAt: 1,
                role: 'user',
                content: { type: 'text', text: 'Oldest' },
                isSidechain: false,
            },
        ];
        storage.getState().applyMessages('paged-session', newestPage);
        const newestSnapshot = storage.getState().sessionMessages['paged-session'].messages;
        diagnosticsCapture = startDiagnosticsCapture();

        storage.getState().applyMessages('paged-session', olderPage);

        const paged = storage.getState().sessionMessages['paged-session'];
        expect(paged.messages.map((message) => message.createdAt)).toEqual([102, 101, 2, 1]);
        expect(paged.messages[0]).toBe(newestSnapshot[0]);
        expect(paged.messages[1]).toBe(newestSnapshot[1]);
        const messagesBeforeReplay = paged.messages;
        const mapBeforeReplay = paged.messagesMap;

        storage.getState().applyMessages('paged-session', olderPage);

        const replayed = storage.getState().sessionMessages['paged-session'];
        expect(replayed.messages).toBe(messagesBeforeReplay);
        expect(replayed.messagesMap).toBe(mapBeforeReplay);
        expect(diagnosticsCapture.snapshot().counters.messageSortFallbacks).toBe(0);
    });

    it('preserves permission-message identity rules through applySessions updates', () => {
        applySessionWithAgentState('permission-session', 1, null);
        storage.getState().applyMessagesLoaded('permission-session');
        diagnosticsCapture = startDiagnosticsCapture();

        applySessionWithAgentState('permission-session', 2, {
            requests: {
                'tool-1': {
                    tool: 'Bash',
                    arguments: { command: 'ls' },
                    createdAt: 10,
                },
            },
        });
        const pending = storage.getState().sessionMessages['permission-session'].messages;
        expect(pending).toHaveLength(1);
        expect(pending[0]).toMatchObject({
            kind: 'tool-call',
            createdAt: 10,
            tool: { permission: { status: 'pending' } },
        });

        applySessionWithAgentState('permission-session', 3, {
            completedRequests: {
                'tool-1': {
                    tool: 'Bash',
                    arguments: { command: 'ls' },
                    createdAt: 10,
                    completedAt: 11,
                    status: 'approved',
                },
            },
        });

        const approved = storage.getState().sessionMessages['permission-session'].messages;
        expect(approved).toHaveLength(1);
        expect(approved[0].id).toBe(pending[0].id);
        expect(approved[0].createdAt).toBe(pending[0].createdAt);
        expect(approved[0]).not.toBe(pending[0]);
        expect(approved[0]).toMatchObject({
            kind: 'tool-call',
            tool: { permission: { status: 'approved' } },
        });
        expect(diagnosticsCapture.snapshot().counters.messageSortFallbacks).toBe(0);
    });

    it('rebuilds and diagnoses a corrupted published order without mutating that snapshot', () => {
        storage.getState().applyMessages('corrupted-session', makeLongSessionMessages(3));
        const valid = storage.getState().sessionMessages['corrupted-session'];
        const corruptedMessages = [...valid.messages].reverse();
        storage.setState((state) => ({
            sessionMessages: {
                ...state.sessionMessages,
                'corrupted-session': {
                    ...valid,
                    messages: corruptedMessages,
                },
            },
        }));
        diagnosticsCapture = startDiagnosticsCapture();
        vi.stubGlobal('__DEV__', true);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        storage.getState().applyMessages('corrupted-session', []);

        const repaired = storage.getState().sessionMessages['corrupted-session'].messages;
        expect(repaired.map((message) => message.createdAt)).toEqual([3, 2, 1]);
        expect(repaired).not.toBe(corruptedMessages);
        expect(corruptedMessages.map((message) => message.createdAt)).toEqual([1, 2, 3]);
        expect(diagnosticsCapture.snapshot().counters.messageSortFallbacks).toBe(1);
        expect(warn).toHaveBeenCalledWith(
            '[message-order] Rebuilt Session messages after invariant violation: source-order-violation',
        );
    });
});
