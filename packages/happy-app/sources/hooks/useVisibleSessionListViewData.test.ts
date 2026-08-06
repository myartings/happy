import { describe, expect, it } from 'vitest';

import type { SessionListViewItem, SessionRowData } from '@/sync/storage';
import { buildVisibleSessionListViewData } from '@/utils/visibleSessionListViewData';

function row(id: string, active: boolean, createdAt: number, lastMessageSentAt?: number): SessionRowData {
    return {
        id,
        active,
        createdAt,
        lastMessageSentAt,
    } as SessionRowData;
}

describe('buildVisibleSessionListViewData', () => {
    it('separates globally sorted active sessions into today and earlier activity groups', () => {
        const now = new Date(2026, 7, 6, 12, 0, 0).getTime();
        const today = new Date(2026, 7, 6, 9, 0, 0).getTime();
        const yesterday = new Date(2026, 7, 5, 18, 0, 0).getTime();
        const data: SessionListViewItem[] = [{
            type: 'active-sessions',
            sessions: [
                row('earlier', true, yesterday, yesterday),
                row('today', true, today, today),
            ],
        }];

        const result = buildVisibleSessionListViewData(data, {
            hideInactiveSessions: false,
            sortActiveSessionsGlobally: true,
            groupActiveSessionsByDate: true,
            now,
        });

        expect(result).toMatchObject([
            { type: 'active-sessions', period: 'today', sessions: [{ id: 'today' }] },
            { type: 'active-sessions', period: 'earlier', sessions: [{ id: 'earlier' }] },
        ]);
    });

    it('shows active sessions from every device and project in one recent-activity list', () => {
        const data: SessionListViewItem[] = [
            {
                type: 'project',
                project: {
                    id: 'project-1',
                    name: 'Happy',
                    machineId: 'machine-a',
                    sessionCount: 2,
                    activeCount: 1,
                    workspaces: [{
                        id: '',
                        name: null,
                        sessions: [
                            row('project-active', true, 10, 300),
                            row('project-inactive', false, 20, 400),
                        ],
                    }],
                },
            },
            {
                type: 'active-sessions',
                sessions: [
                    row('plain-old', true, 30, 100),
                    row('plain-new', true, 40, 500),
                ],
            },
        ];

        const result = buildVisibleSessionListViewData(data, {
            hideInactiveSessions: false,
            sortActiveSessionsGlobally: true,
        });

        expect(result?.[0]).toMatchObject({
            type: 'active-sessions',
            sessions: [
                { id: 'plain-new' },
                { id: 'project-active' },
                { id: 'plain-old' },
            ],
        });
    });

    it('preserves the existing project-first layout when the new setting is off', () => {
        const project: SessionListViewItem = {
            type: 'project',
            project: {
                id: 'project-1',
                name: 'Happy',
                machineId: 'machine-a',
                sessionCount: 1,
                activeCount: 1,
                workspaces: [{ id: '', name: null, sessions: [row('project-active', true, 10)] }],
            },
        };
        const data: SessionListViewItem[] = [
            { type: 'active-sessions', sessions: [row('plain-active', true, 20)] },
            { type: 'projects-header' },
            project,
            { type: 'header', title: 'Today' },
            { type: 'session', session: row('inactive', false, 30) },
        ];

        const result = buildVisibleSessionListViewData(data, {
            hideInactiveSessions: false,
            sortActiveSessionsGlobally: false,
            groupActiveSessionsByDate: true,
        });

        expect(result?.map((item) => item.type)).toEqual([
            'projects-header',
            'project',
            'active-sessions',
            'archive-toggle',
            'header',
            'session',
        ]);
    });

    it('removes an empty projects section after moving its active sessions into the global list', () => {
        const data: SessionListViewItem[] = [
            { type: 'projects-header' },
            {
                type: 'project',
                project: {
                    id: 'project-1',
                    name: 'Happy',
                    machineId: 'machine-a',
                    sessionCount: 1,
                    activeCount: 1,
                    workspaces: [{ id: '', name: null, sessions: [row('project-active', true, 10, 300)] }],
                },
            },
        ];

        const result = buildVisibleSessionListViewData(data, {
            hideInactiveSessions: false,
            sortActiveSessionsGlobally: true,
        });

        expect(result?.map((item) => item.type)).toEqual(['active-sessions']);
    });
});
