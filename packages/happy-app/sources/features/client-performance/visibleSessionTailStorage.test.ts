import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { NormalizedMessage } from '@/sync/typesRaw';

vi.mock('react-native-mmkv', () => ({
    MMKV: class {
        getString() { return undefined; }
        getNumber() { return undefined; }
        set() {}
        delete() {}
    },
}));

vi.mock('@/sync/sync', () => ({
    sync: { applySettings: vi.fn(), assumeUsers: vi.fn() },
}));

vi.mock('@/realtime/RealtimeSession', () => ({
    getCurrentRealtimeSessionId: vi.fn(() => null),
    getVoiceSession: vi.fn(() => null),
}));

vi.mock('@/components/tools/knownTools', () => ({ isMutableTool: vi.fn(() => false) }));
vi.mock('@/text', () => ({ t: (key: string) => key }));

let storage: typeof import('@/sync/storage').storage;

function userMessage(id: string, createdAt: number): NormalizedMessage {
    return {
        id,
        localId: `local-${id}`,
        createdAt,
        role: 'user',
        content: { type: 'text', text: id },
        isSidechain: false,
    };
}

beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('__DEV__', false);
    ({ storage } = await import('@/sync/storage'));
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('replaceSessionMessageTail', () => {
    it('publishes all tail structures in one store update only for the expected entry', () => {
        storage.getState().applyMessages('session', [
            userMessage('newest', 3),
            userMessage('middle', 2),
            userMessage('oldest', 1),
        ]);
        const staleEntry = storage.getState().sessionMessages.session;

        storage.getState().applyMessages('session', [userMessage('newest', 3)]);
        const liveEntry = storage.getState().sessionMessages.session;
        const candidateMessage = liveEntry.messages[0];
        const candidate = {
            messages: [candidateMessage],
            messagesMap: { [candidateMessage.id]: candidateMessage },
            reducerState: liveEntry.reducerState,
            hasMoreOlder: true,
        };

        expect(storage.getState().replaceSessionMessageTail('session', staleEntry, candidate)).toBe(false);
        expect(storage.getState().sessionMessages.session).toBe(liveEntry);

        const notifications: unknown[] = [];
        const unsubscribe = storage.subscribe((state) => notifications.push(state.sessionMessages.session));
        expect(storage.getState().replaceSessionMessageTail('session', liveEntry, candidate)).toBe(true);
        unsubscribe();

        const replaced = storage.getState().sessionMessages.session;
        expect(notifications).toHaveLength(1);
        expect(replaced).toMatchObject({
            messages: candidate.messages,
            messagesMap: candidate.messagesMap,
            reducerState: candidate.reducerState,
            isLoaded: true,
            hasMoreOlder: true,
            isLoadingOlder: false,
        });
    });
});
