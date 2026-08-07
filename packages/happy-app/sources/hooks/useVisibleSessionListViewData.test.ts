import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionListViewItem, SessionRowData } from '@/sync/storage';
import { buildVisibleSessionListViewData } from '@/utils/visibleSessionListViewData';

const mocks = vi.hoisted(() => ({
    data: null as SessionListViewItem[] | null,
    hideArchivedSessions: false,
    sortActiveSessionsGlobally: false,
    groupActiveSessionsByDate: false,
}));

vi.mock('react', () => ({
    useMemo: <T,>(factory: () => T) => factory(),
}));

vi.mock('@/sync/storage', () => ({
    useSessionListViewData: () => mocks.data,
    useSetting: (key: string) => {
        switch (key) {
            case 'hideInactiveSessions': return mocks.hideArchivedSessions;
            case 'sortActiveSessionsGlobally': return mocks.sortActiveSessionsGlobally;
            case 'groupActiveSessionsByDate': return mocks.groupActiveSessionsByDate;
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
        lastMessageSentAt?: number;
        state?: SessionRowData['state'];
        hasUnread?: boolean;
    } = {},
): SessionRowData {
    return {
        id,
        name: id,
        active: options.active ?? false,
        archived: options.archived ?? false,
        createdAt: options.createdAt ?? 0,
        lastMessageSentAt: options.lastMessageSentAt,
        state: options.state ?? 'waiting',
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
