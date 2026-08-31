import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionListViewItem, SessionRowData } from '@/sync/storage';
import { buildVisibleSessionListViewData } from '@/utils/visibleSessionListViewData';

const mocks = vi.hoisted(() => ({
    data: null as SessionListViewItem[] | null,
    hideArchivedSessions: false,
    sortActiveSessionsGlobally: false,
    groupActiveSessionsByDate: false,
    needsAttentionSessionsEnabled: true,
    pinnedSessionIds: [] as string[],
    favoriteProjectIds: [] as string[],
}));

vi.mock('react', () => ({
    useMemo: <T,>(factory: () => T) => factory(),
}));

vi.mock('@/sync/storage', () => ({
    useSessionListViewData: () => mocks.data,
    useSetting: (key: string) => {
        switch (key) {
            case 'hideInactiveSessions': return mocks.hideArchivedSessions;
            case 'needsAttentionSessionsEnabled': return mocks.needsAttentionSessionsEnabled;
            case 'sortActiveSessionsGlobally': return mocks.sortActiveSessionsGlobally;
            case 'groupActiveSessionsByDate': return mocks.groupActiveSessionsByDate;
            case 'pinnedSessionIds': return mocks.pinnedSessionIds;
            case 'favoriteProjectIds': return mocks.favoriteProjectIds;
            default: throw new Error(`Unexpected setting read: ${key}`);
        }
    },
}));

import { useHasArchivedSessions, useVisibleSessionListViewData } from './useVisibleSessionListViewData';

function row(
    id: string,
    options: {
        active?: boolean;
        archived?: boolean;
        createdAt?: number;
        lastActivityAt?: number;
        lastMessageSentAt?: number;
        state?: SessionRowData['state'];
        hasUnread?: boolean;
        attention?: SessionRowData['attention'];
    } = {},
): SessionRowData {
    return {
        id,
        name: id,
        active: options.active ?? false,
        archived: options.archived ?? false,
        createdAt: options.createdAt ?? 0,
        lastActivityAt: options.lastActivityAt
            ?? options.lastMessageSentAt
            ?? options.createdAt
            ?? 0,
        lastMessageSentAt: options.lastMessageSentAt,
        state: options.state ?? 'waiting',
        attention: options.attention ?? null,
        hasUnread: options.hasUnread ?? false,
    } as SessionRowData;
}

function project(
    id: string,
    sessions: SessionRowData[],
    source: 'rig' | 'happy' = 'rig',
): Extract<SessionListViewItem, { type: 'project' }> {
    return {
        type: 'project',
        source,
        project: {
            id,
            name: id,
            machineId: 'machine-1',
            sessionCount: sessions.length,
            activeCount: sessions.filter((session) => session.active).length,
            workspaces: [{ id: '', name: null, sessions }],
        },
    };
}

function projectSessionIds(items: SessionListViewItem[]): string[] {
    return items.flatMap((item) => item.type === 'project'
        ? item.project.workspaces.flatMap((workspace) => workspace.sessions.map((session) => session.id))
        : []);
}

function flatSessionIds(items: SessionListViewItem[]): string[] {
    return items.flatMap((item) => item.type === 'session' ? [item.session.id] : []);
}

beforeEach(() => {
    mocks.data = null;
    mocks.hideArchivedSessions = false;
    mocks.sortActiveSessionsGlobally = false;
    mocks.groupActiveSessionsByDate = false;
    mocks.needsAttentionSessionsEnabled = true;
    mocks.pinnedSessionIds = [];
    mocks.favoriteProjectIds = [];
});

describe('buildVisibleSessionListViewData', () => {
    it('separates globally sorted active sessions into today and earlier groups', () => {
        const now = new Date(2026, 7, 6, 12, 0, 0).getTime();
        const today = new Date(2026, 7, 6, 9, 0, 0).getTime();
        const yesterday = new Date(2026, 7, 5, 18, 0, 0).getTime();
        const data: SessionListViewItem[] = [{
            type: 'active-sessions',
            sessions: [
                row('earlier', { active: true, createdAt: yesterday, lastMessageSentAt: yesterday }),
                row('today', { active: true, createdAt: today, lastMessageSentAt: today }),
            ],
        }];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: true,
            groupActiveSessionsByDate: true,
            now,
        });

        expect(result).toMatchObject([
            { type: 'active-sessions', period: 'today', sessions: [{ id: 'today' }] },
            { type: 'active-sessions', period: 'earlier', sessions: [{ id: 'earlier' }] },
        ]);
    });

    it('groups active sessions by canonical activity when device-local activity differs', () => {
        const now = new Date(2026, 7, 6, 12, 0, 0).getTime();
        const today = new Date(2026, 7, 6, 9, 0, 0).getTime();
        const yesterday = new Date(2026, 7, 5, 18, 0, 0).getTime();
        const data: SessionListViewItem[] = [{
            type: 'active-sessions',
            sessions: [
                row('stale-local', {
                    active: true,
                    createdAt: yesterday,
                    lastActivityAt: yesterday,
                    lastMessageSentAt: today,
                }),
                row('synced-today', {
                    active: true,
                    createdAt: yesterday,
                    lastActivityAt: today,
                }),
            ],
        }];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: true,
            groupActiveSessionsByDate: true,
            now,
        });

        expect(result).toMatchObject([
            { type: 'active-sessions', period: 'today', sessions: [{ id: 'synced-today' }] },
            { type: 'active-sessions', period: 'earlier', sessions: [{ id: 'stale-local' }] },
        ]);
    });

    it('collects active sessions from every project into recent-activity order', () => {
        const data: SessionListViewItem[] = [
            { type: 'projects-header', source: 'rig' },
            project('project-1', [
                row('project-active', { active: true, lastMessageSentAt: 300 }),
                row('project-inactive', { lastMessageSentAt: 400 }),
            ]),
            {
                type: 'active-sessions',
                sessions: [
                    row('plain-old', { active: true, lastMessageSentAt: 100 }),
                    row('plain-new', { active: true, lastMessageSentAt: 500 }),
                ],
            },
        ];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: true,
        })!;

        expect(result[0]).toMatchObject({
            type: 'active-sessions',
            sessions: [
                { id: 'plain-new' },
                { id: 'project-active' },
                { id: 'plain-old' },
            ],
        });
        expect(projectSessionIds(result)).toEqual(['project-inactive']);
    });

    it('preserves the official project-card order when global sorting is off', () => {
        const data: SessionListViewItem[] = [
            { type: 'projects-header', source: 'rig' },
            project('project-1', [row('project-active', { active: true })]),
            { type: 'active-sessions', sessions: [row('plain-active', { active: true })] },
            { type: 'header', title: 'Today' },
            { type: 'session', session: row('inactive') },
        ];

        expect(buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
        })).toEqual(data);
    });

    it('ignores date grouping while global sorting is off', () => {
        const data: SessionListViewItem[] = [
            project('project-1', [row('project-active', { active: true })]),
            { type: 'active-sessions', sessions: [row('plain-active', { active: true })] },
        ];

        expect(buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
            groupActiveSessionsByDate: true,
            needsAttentionSessionsEnabled: false,
        })).toEqual(data);
    });

    it('removes a source header after moving its only active project session', () => {
        const data: SessionListViewItem[] = [
            { type: 'projects-header', source: 'rig' },
            project('project-1', [row('project-active', { active: true, lastMessageSentAt: 300 })]),
        ];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: true,
        });

        expect(result?.map((item) => item.type)).toEqual(['active-sessions']);
    });

    it('hides archived rows but keeps disconnected live work in both list shapes', () => {
        const data: SessionListViewItem[] = [
            { type: 'projects-header', source: 'rig' },
            project('p1', [row('project-disconnected'), row('project-archived', { archived: true })]),
            { type: 'header', title: 'Today' },
            { type: 'session', session: row('flat-disconnected') },
            { type: 'session', session: row('flat-archived', { archived: true }) },
        ];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: true,
            sortActiveSessionsGlobally: false,
        })!;

        expect(projectSessionIds(result)).toEqual(['project-disconnected']);
        expect(flatSessionIds(result)).toEqual(['flat-disconnected']);
    });

    it('drops empty date and project headers after archive filtering', () => {
        const data: SessionListViewItem[] = [
            { type: 'projects-header', source: 'rig' },
            project('p1', [row('project-archived', { archived: true })]),
            { type: 'header', title: 'Today' },
            { type: 'session', session: row('flat-archived', { archived: true }) },
            { type: 'header', title: 'Yesterday' },
            { type: 'session', session: row('flat-disconnected') },
        ];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: true,
            sortActiveSessionsGlobally: false,
        })!;

        expect(result.map((item) => item.type === 'header' ? item.title : item.type))
            .toEqual(['Yesterday', 'session']);
    });

    it('moves sessions that need attention to one leading section without duplicates', () => {
        const data: SessionListViewItem[] = [
            { type: 'projects-header', source: 'rig' },
            project('p1', [
                row('ordinary-project', { active: true, lastMessageSentAt: 500 }),
                row('unread-project', { active: true, hasUnread: true, lastMessageSentAt: 300 }),
            ]),
            {
                type: 'active-sessions',
                sessions: [
                    row('permission', { active: true, state: 'permission_required', lastMessageSentAt: 100 }),
                    row('ordinary-active', { active: true, lastMessageSentAt: 400 }),
                ],
            },
            { type: 'header', title: 'Today' },
            { type: 'session', session: row('unread-flat', { hasUnread: true, lastMessageSentAt: 200 }) },
            { type: 'session', session: row('ordinary-flat') },
        ];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
        })!;

        expect(result[0]).toMatchObject({
            type: 'attention-sessions',
            sessions: [
                { id: 'permission' },
                { id: 'unread-project' },
                { id: 'unread-flat' },
            ],
        });
        expect(projectSessionIds(result)).toEqual(['ordinary-project']);
        expect(result.flatMap((item) => item.type === 'active-sessions'
            ? item.sessions.map((session) => session.id)
            : [])).toEqual(['ordinary-active']);
        expect(flatSessionIds(result)).toEqual(['ordinary-flat']);
    });

    it('does not promote archived sessions with unread results', () => {
        const archived = row('archived-unread', { archived: true, hasUnread: true });
        const result = buildVisibleSessionListViewData([
            { type: 'header', title: 'Earlier' },
            { type: 'session', session: archived },
        ], {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
        });

        expect(result).toEqual([
            { type: 'header', title: 'Earlier' },
            { type: 'session', session: archived },
        ]);
    });

    it('restores the official list when needs-attention promotion is disabled', () => {
        const data: SessionListViewItem[] = [
            { type: 'active-sessions', sessions: [row('permission', { active: true, state: 'permission_required' })] },
            { type: 'session', session: row('unread', { hasUnread: true }) },
        ];

        expect(buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
            needsAttentionSessionsEnabled: false,
        })).toEqual(data);
    });

    it('promotes an offline answer-required session once across duplicate list inputs', () => {
        const answer = row('offline-answer', {
            state: 'disconnected',
            attention: {
                primaryReason: {
                    kind: 'answer_required',
                    sourceId: 'question-1',
                    observedAgentStateVersion: 4,
                    detailKind: 'form',
                },
                reasons: [{
                    kind: 'answer_required',
                    sourceId: 'question-1',
                    observedAgentStateVersion: 4,
                    detailKind: 'form',
                }],
            },
        });
        const data: SessionListViewItem[] = [
            { type: 'active-sessions', sessions: [answer] },
            project('project-1', [answer]),
        ];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
            needsAttentionSessionsEnabled: true,
        })!;

        expect(result[0]).toMatchObject({
            type: 'attention-sessions',
            sessions: [{ id: 'offline-answer' }],
        });
        expect(result.flatMap((item) => item.type === 'attention-sessions'
            ? item.sessions.map((session) => session.id)
            : [])).toEqual(['offline-answer']);
        expect(projectSessionIds(result)).not.toContain('offline-answer');
    });

    it('orders permission, answer, and legacy unread without pinning changing severity', () => {
        const permissionReason = {
            kind: 'permission_required' as const,
            sourceId: 'permission-1',
            observedAgentStateVersion: 1,
        };
        const answerReason = {
            kind: 'answer_required' as const,
            sourceId: 'answer-1',
            observedAgentStateVersion: 1,
            detailKind: 'form' as const,
        };
        const data: SessionListViewItem[] = [{
            type: 'active-sessions',
            sessions: [
                row('pinned-unread', { hasUnread: true, lastActivityAt: 300 }),
                row('answer', {
                    state: 'disconnected',
                    lastActivityAt: 200,
                    attention: { primaryReason: answerReason, reasons: [answerReason] },
                }),
                row('permission', {
                    state: 'disconnected',
                    lastActivityAt: 100,
                    attention: { primaryReason: permissionReason, reasons: [permissionReason] },
                }),
            ],
        }];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
            needsAttentionSessionsEnabled: true,
            pinnedSessionIds: ['pinned-unread'],
        })!;

        expect(result[0]).toMatchObject({
            type: 'attention-sessions',
            sessions: [{ id: 'permission' }, { id: 'answer' }, { id: 'pinned-unread' }],
        });
    });

    it('does not let legacy permission state override an answer-only projection', () => {
        const answerReason = {
            kind: 'answer_required' as const,
            sourceId: 'answer-after-completed-permission',
            observedAgentStateVersion: 2,
            detailKind: 'form' as const,
        };
        const permissionReason = {
            kind: 'permission_required' as const,
            sourceId: 'pending-permission',
            observedAgentStateVersion: 3,
        };
        const data: SessionListViewItem[] = [{
            type: 'active-sessions',
            sessions: [
                row('answer-with-stale-permission-state', {
                    state: 'permission_required',
                    lastActivityAt: 300,
                    attention: { primaryReason: answerReason, reasons: [answerReason] },
                }),
                row('current-permission', {
                    state: 'disconnected',
                    lastActivityAt: 100,
                    attention: { primaryReason: permissionReason, reasons: [permissionReason] },
                }),
            ],
        }];

        const result = buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
            needsAttentionSessionsEnabled: true,
        })!;

        expect(result[0]).toMatchObject({
            type: 'attention-sessions',
            sessions: [
                { id: 'current-permission' },
                { id: 'answer-with-stale-permission-state' },
            ],
        });
    });

    it('leaves an answer-required row in its ordinary position when the feature is disabled', () => {
        const answerReason = {
            kind: 'answer_required' as const,
            sourceId: 'answer-1',
            observedAgentStateVersion: 1,
            detailKind: 'unsupported' as const,
        };
        const data: SessionListViewItem[] = [{
            type: 'session',
            session: row('answer', {
                state: 'disconnected',
                attention: { primaryReason: answerReason, reasons: [answerReason] },
            }),
        }];

        expect(buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
            needsAttentionSessionsEnabled: false,
        })).toEqual(data);
    });

    it('always preserves repository project identity for managed worktrees', () => {
        const worktreeSession = row('worktree');
        const data: SessionListViewItem[] = [{
            type: 'project',
            source: 'happy',
            project: {
                id: 'repo',
                name: 'happy',
                machineId: 'machine-1',
                sessionCount: 1,
                activeCount: 0,
                workspaces: [{ id: '/happy/.dev/worktree/eager-cloud', name: 'eager-cloud', sessions: [worktreeSession] }],
            },
        }];

        expect(buildVisibleSessionListViewData(data, {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
        })).toMatchObject([{
            type: 'project',
            project: {
                name: 'happy',
                workspaces: [{ name: 'eager-cloud', sessions: [{ id: 'worktree' }] }],
            },
        }]);
    });

    it('orders favorite projects first within their source section', () => {
        const result = buildVisibleSessionListViewData([
            { type: 'projects-header', source: 'rig' },
            project('ordinary-rig', [row('ordinary-rig-session')], 'rig'),
            project('favorite-rig', [row('favorite-rig-session')], 'rig'),
            { type: 'projects-header', source: 'happy' },
            project('ordinary-happy', [row('ordinary-happy-session')], 'happy'),
            project('favorite-happy', [row('favorite-happy-session')], 'happy'),
        ], {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
            favoriteProjectIds: ['favorite-rig', 'favorite-happy'],
        })!;

        expect(result.filter((item) => item.type === 'project').map((item) => item.project.id))
            .toEqual(['favorite-rig', 'ordinary-rig', 'favorite-happy', 'ordinary-happy']);
        expect(result.filter((item) => item.type === 'projects-header').map((item) => item.source))
            .toEqual(['rig', 'happy']);
    });

    it('orders pinned sessions first inside project workspaces and active sections', () => {
        const result = buildVisibleSessionListViewData([
            project('p1', [row('ordinary-project'), row('pinned-project')]),
            { type: 'active-sessions', sessions: [
                row('ordinary-active', { active: true }),
                row('pinned-active', { active: true }),
            ] },
        ], {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
            needsAttentionSessionsEnabled: false,
            pinnedSessionIds: ['pinned-project', 'pinned-active'],
        })!;

        expect(projectSessionIds(result)).toEqual(['pinned-project', 'ordinary-project']);
        expect(result.flatMap((item) => item.type === 'active-sessions'
            ? item.sessions.map((session) => session.id)
            : [])).toEqual(['pinned-active', 'ordinary-active']);
    });

    it('keeps permission-required attention ahead of ordinary pinned attention', () => {
        const result = buildVisibleSessionListViewData([{
            type: 'active-sessions',
            sessions: [
                row('pinned-unread', { active: true, hasUnread: true, lastMessageSentAt: 300 }),
                row('permission', { active: true, state: 'permission_required', lastMessageSentAt: 100 }),
            ],
        }], {
            hideArchivedSessions: false,
            sortActiveSessionsGlobally: false,
            pinnedSessionIds: ['pinned-unread'],
        })!;

        expect(result[0]).toMatchObject({
            type: 'attention-sessions',
            sessions: [{ id: 'permission' }, { id: 'pinned-unread' }],
        });
    });
});

describe('useVisibleSessionListViewData', () => {
    it('passes through a list that has not loaded yet', () => {
        expect(useVisibleSessionListViewData()).toBeNull();
    });

    it('combines archive filtering with global active-session grouping', () => {
        const now = Date.now();
        mocks.data = [project('p1', [
            row('live', { active: true, lastMessageSentAt: now }),
            row('archived', { archived: true }),
        ])];
        mocks.hideArchivedSessions = true;
        mocks.sortActiveSessionsGlobally = true;
        mocks.groupActiveSessionsByDate = true;
        mocks.pinnedSessionIds = ['live'];

        expect(useVisibleSessionListViewData()).toMatchObject([
            { type: 'active-sessions', period: 'today', sessions: [{ id: 'live' }] },
        ]);
    });
});
describe('useHasArchivedSessions', () => {
    it('is false when only disconnected sessions exist', () => {
        mocks.data = [project('p1', [row('project-disconnected')])];
        expect(useHasArchivedSessions()).toBe(false);
    });

    it('finds archived sessions in project, active, and flat list shapes', () => {
        for (const data of [
            [project('p1', [row('archived', { archived: true })])],
            [{ type: 'active-sessions' as const, sessions: [row('archived', { archived: true })] }],
            [{ type: 'session' as const, session: row('archived', { archived: true }) }],
        ]) {
            mocks.data = data;
            expect(useHasArchivedSessions()).toBe(true);
        }
    });
});
