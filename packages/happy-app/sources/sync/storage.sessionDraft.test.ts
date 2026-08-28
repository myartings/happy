import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Session } from './storageTypes';
import type { SessionListViewItem, SessionRowData } from './storage';

const draftStorageHarness = vi.hoisted(() => ({
    values: new Map<string, string>(),
    mmkvGet: vi.fn(),
    mmkvSet: vi.fn(),
}));

vi.mock('react-native-mmkv', () => ({
    MMKV: class {
        getString(key: string) {
            draftStorageHarness.mmkvGet(key);
            return draftStorageHarness.values.get(key);
        }

        getNumber() {
            return undefined;
        }

        set(key: string, value: string) {
            draftStorageHarness.mmkvSet(key, value);
            draftStorageHarness.values.set(key, value);
        }

        delete(key: string) {
            draftStorageHarness.values.delete(key);
        }
    },
}));

vi.mock('./sync', () => ({
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

let storage: typeof import('./storage').storage;
let diagnosticsCapture: import('@/features/client-performance/clientLongSessionDiagnostics').ClientLongSessionDiagnosticsCapture | null = null;
let startDiagnosticsCapture: typeof import('@/features/client-performance/clientLongSessionDiagnostics').startClientLongSessionDiagnosticsCapture;

function makeSession(id: string, draft: string | null, path?: string): Session {
    return {
        id,
        seq: 1,
        createdAt: 1,
        updatedAt: 1,
        active: true,
        activeAt: 1,
        metadata: path ? { path, host: 'test-host' } : null,
        metadataVersion: 1,
        agentState: null,
        agentStateVersion: 1,
        thinking: false,
        thinkingAt: 1,
        presence: 'online',
        draft,
    };
}

function applySessions(sessions: Session[]): void {
    storage.getState().applySessions(sessions.map((session) => {
        const { presence: _presence, ...wireSession } = session;
        return wireSession;
    }));
}

function collectSessionRows(items: SessionListViewItem[] | null): SessionRowData[] {
    if (!items) return [];
    return items.flatMap((item) => {
        if (item.type === 'session') return [item.session];
        if (item.type === 'attention-sessions' || item.type === 'active-sessions') return item.sessions;
        if (item.type === 'project') {
            return item.project.workspaces.flatMap((workspace) => workspace.sessions);
        }
        return [];
    });
}

beforeEach(async () => {
    vi.resetModules();
    draftStorageHarness.values.clear();
    draftStorageHarness.values.set('session-drafts', JSON.stringify({
        'session-1': 'same draft',
        'not-yet-hydrated': 'keep me',
    }));
    draftStorageHarness.mmkvSet.mockClear();
    ({ storage } = await import('./storage'));
    ({ startClientLongSessionDiagnosticsCapture: startDiagnosticsCapture } = await import(
        '@/features/client-performance/clientLongSessionDiagnostics'
    ));
    draftStorageHarness.mmkvGet.mockClear();
    draftStorageHarness.mmkvSet.mockClear();
});

afterEach(() => {
    diagnosticsCapture?.stop();
    diagnosticsCapture = null;
});

describe('session draft storage', () => {
    it('is a true no-op when the normalized draft is unchanged', () => {
        const session = makeSession('session-1', 'same draft');
        applySessions([session]);
        const stateBefore = storage.getState();
        const storedSession = stateBefore.sessions[session.id];
        const sessionListViewData = stateBefore.sessionListViewData;
        const subscriber = vi.fn();
        const unsubscribe = storage.subscribe(subscriber);
        diagnosticsCapture = startDiagnosticsCapture();

        storage.getState().updateSessionDraft(session.id, 'same draft');

        expect(storage.getState()).toBe(stateBefore);
        expect(storage.getState().sessions[session.id]).toBe(storedSession);
        expect(storage.getState().sessionListViewData).toBe(sessionListViewData);
        expect(draftStorageHarness.mmkvSet).not.toHaveBeenCalled();
        expect(subscriber).not.toHaveBeenCalled();
        expect(diagnosticsCapture.snapshot().counters).toMatchObject({
            draftSessionReads: 1,
            draftPersistenceWrites: 0,
            sessionRowReprojections: 0,
        });
        unsubscribe();
    });

    it('updates the authoritative draft snapshot without dropping an unhydrated Session draft', () => {
        const session = makeSession('session-1', 'same draft');
        applySessions([session]);
        diagnosticsCapture = startDiagnosticsCapture();

        storage.getState().updateSessionDraft(session.id, 'changed draft');

        expect(draftStorageHarness.mmkvSet).toHaveBeenCalledTimes(1);
        expect(JSON.parse(draftStorageHarness.values.get('session-drafts') ?? '{}')).toEqual({
            'session-1': 'changed draft',
            'not-yet-hydrated': 'keep me',
        });
        expect(diagnosticsCapture.snapshot().counters.sessionRowReprojections).toBe(0);
    });

    it('does not advance state or the authoritative snapshot when persistence fails', () => {
        const session = makeSession('session-1', 'same draft');
        applySessions([session]);
        const stateBefore = storage.getState();
        draftStorageHarness.mmkvSet.mockImplementationOnce(() => {
            throw new Error('MMKV unavailable');
        });

        expect(() => {
            storage.getState().updateSessionDraft(session.id, 'retry me');
        }).toThrow('MMKV unavailable');

        expect(storage.getState()).toBe(stateBefore);
        expect(JSON.parse(draftStorageHarness.values.get('session-drafts') ?? '{}')).toEqual({
            'session-1': 'same draft',
            'not-yet-hydrated': 'keep me',
        });

        storage.getState().updateSessionDraft(session.id, 'retry me');

        expect(storage.getState().sessions[session.id].draft).toBe('retry me');
        expect(JSON.parse(draftStorageHarness.values.get('session-drafts') ?? '{}')).toEqual({
            'session-1': 'retry me',
            'not-yet-hydrated': 'keep me',
        });
    });

    it('normalizes whitespace to a cleared draft and makes a repeated clear a true no-op', () => {
        const session = makeSession('session-1', 'same draft');
        applySessions([session]);

        storage.getState().updateSessionDraft(session.id, '   ');

        const stateAfterClear = storage.getState();
        expect(stateAfterClear.sessions[session.id].draft).toBeNull();
        expect(collectSessionRows(stateAfterClear.sessionListViewData)).toMatchObject([
            { id: session.id, hasDraft: false },
        ]);
        expect(JSON.parse(draftStorageHarness.values.get('session-drafts') ?? '{}')).toEqual({
            'not-yet-hydrated': 'keep me',
        });
        expect(draftStorageHarness.mmkvSet).toHaveBeenCalledTimes(1);

        storage.getState().updateSessionDraft(session.id, null);

        expect(storage.getState()).toBe(stateAfterClear);
        expect(draftStorageHarness.mmkvSet).toHaveBeenCalledTimes(1);
    });

    it.each([100, 500, 2_000])(
        'changes one Session row without regrouping or reprojecting %i Sessions',
        (sessionCount) => {
            const sessions = Array.from(
                { length: sessionCount },
                (_, index) => makeSession(
                    `fixture-session-${index}`,
                    null,
                    index < Math.ceil(sessionCount / 2) ? '/project-a' : '/project-b',
                ),
            );
            const target = sessions[Math.floor(sessionCount / 3)];
            const unrelated = sessions.at(-1)!;
            applySessions(sessions);
            const stateBefore = storage.getState();
            const sessionListViewData = stateBefore.sessionListViewData;
            const rowsBefore = collectSessionRows(sessionListViewData);
            const targetBefore = stateBefore.sessions[target.id];
            const unrelatedBefore = stateBefore.sessions[unrelated.id];
            const projectsBefore = sessionListViewData?.filter((item) => item.type === 'project') ?? [];
            const unaffectedProject = projectsBefore.find((item) => (
                item.project.workspaces.every((workspace) => (
                    workspace.sessions.every((row) => row.id !== target.id)
                ))
            ));
            expect(unaffectedProject).toBeDefined();
            diagnosticsCapture = startDiagnosticsCapture();

            storage.getState().updateSessionDraft(target.id, 'new draft');

            const stateAfter = storage.getState();
            const rowsAfter = collectSessionRows(stateAfter.sessionListViewData);
            expect(rowsAfter.map((row) => row.id)).toEqual(rowsBefore.map((row) => row.id));
            for (let index = 0; index < rowsBefore.length; index += 1) {
                if (rowsBefore[index].id === target.id) {
                    expect(rowsAfter[index]).not.toBe(rowsBefore[index]);
                    expect(rowsAfter[index].hasDraft).toBe(true);
                } else {
                    expect(rowsAfter[index]).toBe(rowsBefore[index]);
                }
            }
            expect(stateAfter.sessions[target.id]).not.toBe(targetBefore);
            expect(stateAfter.sessions[unrelated.id]).toBe(unrelatedBefore);
            expect(
                stateAfter.sessionListViewData?.find((item) => (
                    item.type === 'project' && item.project.id === unaffectedProject?.project.id
                )),
            ).toBe(unaffectedProject);
            expect(diagnosticsCapture.snapshot().counters).toMatchObject({
                draftSessionReads: 1,
                draftPersistenceWrites: 1,
                sessionRowReprojections: 1,
            });
        },
    );

    it('patches an archived direct Session row without replacing its date header', () => {
        const session = { ...makeSession('archived-session', null), active: false };
        applySessions([session]);
        const listBefore = storage.getState().sessionListViewData;
        const headerBefore = listBefore?.[0];
        const rowBefore = listBefore?.[1];
        expect(headerBefore?.type).toBe('header');
        expect(rowBefore?.type).toBe('session');

        storage.getState().updateSessionDraft(session.id, 'archived draft');

        const listAfter = storage.getState().sessionListViewData;
        expect(listAfter).not.toBe(listBefore);
        expect(listAfter?.[0]).toBe(headerBefore);
        expect(listAfter?.[1]).not.toBe(rowBefore);
        expect(listAfter?.[1]).toMatchObject({
            type: 'session',
            session: { id: session.id, hasDraft: true },
        });
    });

    it('deletes a Session draft from the authoritative snapshot without reloading it', () => {
        const session = makeSession('session-1', 'same draft');
        applySessions([session]);
        draftStorageHarness.mmkvGet.mockClear();
        draftStorageHarness.mmkvSet.mockClear();

        storage.getState().deleteSession(session.id);

        expect(
            draftStorageHarness.mmkvGet.mock.calls.filter(([key]) => key === 'session-drafts'),
        ).toHaveLength(0);
        expect(JSON.parse(draftStorageHarness.values.get('session-drafts') ?? '{}')).toEqual({
            'not-yet-hydrated': 'keep me',
        });
    });

    it('records one Session read, persistence write, and row reprojection for one changed draft', () => {
        const session = makeSession('counter-session', null);
        applySessions([session]);
        diagnosticsCapture = startDiagnosticsCapture();

        storage.getState().updateSessionDraft(session.id, 'changed draft');

        expect(diagnosticsCapture.snapshot().counters).toMatchObject({
            draftSessionReads: 1,
            draftPersistenceWrites: 1,
            sessionRowReprojections: 1,
        });
    });
});
