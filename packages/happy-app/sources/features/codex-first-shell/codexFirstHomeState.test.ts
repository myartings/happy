import { describe, expect, it } from 'vitest';
import {
    collectCodexFirstRecentProjects,
    countCodexFirstVisibleSessions,
    resolveCodexFirstHomeState,
} from './codexFirstHomeState';

describe('Codex-first home state', () => {
    it.each([
        [{ dataLoaded: false, machineCount: 0, onlineMachineCount: 0, connectionStatus: 'connecting', visibleSessionCount: 0, hasArchivedSessions: false }, 'loading'],
        [{ dataLoaded: true, machineCount: 0, onlineMachineCount: 0, connectionStatus: 'connected', visibleSessionCount: 0, hasArchivedSessions: false }, 'no-machines'],
        [{ dataLoaded: true, machineCount: 1, onlineMachineCount: 1, connectionStatus: 'connecting', visibleSessionCount: 0, hasArchivedSessions: false }, 'reconnecting'],
        [{ dataLoaded: true, machineCount: 2, onlineMachineCount: 0, connectionStatus: 'connected', visibleSessionCount: 0, hasArchivedSessions: false }, 'all-offline'],
        [{ dataLoaded: true, machineCount: 1, onlineMachineCount: 1, connectionStatus: 'error', visibleSessionCount: 1, hasArchivedSessions: false }, 'connection-error'],
        [{ dataLoaded: true, machineCount: 1, onlineMachineCount: 1, connectionStatus: 'connected', visibleSessionCount: 0, hasArchivedSessions: true }, 'archived-only'],
        [{ dataLoaded: true, machineCount: 1, onlineMachineCount: 1, connectionStatus: 'connected', visibleSessionCount: 0, hasArchivedSessions: false }, 'no-sessions'],
        [{ dataLoaded: true, machineCount: 1, onlineMachineCount: 1, connectionStatus: 'connected', visibleSessionCount: 2, hasArchivedSessions: false }, 'ready'],
    ] as const)('resolves %o to %s', (input, expected) => {
        expect(resolveCodexFirstHomeState(input)).toBe(expected);
    });

    it('counts unique visible Sessions and selects recent project targets', () => {
        const data = [
            {
                type: 'project',
                source: 'happy',
                project: {
                    id: 'happy',
                    name: 'happy',
                    machineId: 'mac',
                    sessionCount: 2,
                    activeCount: 2,
                    workspaces: [{
                        id: '',
                        name: null,
                        sessions: [
                            { id: 'old', lastActivityAt: 10 },
                            { id: 'new', lastActivityAt: 30 },
                        ],
                    }],
                },
            },
            {
                type: 'active-sessions',
                sessions: [
                    { id: 'new', lastActivityAt: 30 },
                    { id: 'other', lastActivityAt: 20 },
                ],
            },
        ] as any;

        expect(countCodexFirstVisibleSessions(data)).toBe(3);
        expect(collectCodexFirstRecentProjects(data)).toEqual([
            { id: 'happy', name: 'happy', sessionId: 'new', updatedAt: 30 },
        ]);
    });

    it('adds Machine identity only when recent project names collide', () => {
        const project = (id: string, machineId: string, sessionId: string, updatedAt: number) => ({
            type: 'project',
            source: 'happy',
            project: {
                id,
                name: 'happy',
                machineId,
                sessionCount: 1,
                activeCount: 1,
                workspaces: [{
                    id: '',
                    name: null,
                    sessions: [{ id: sessionId, lastActivityAt: updatedAt }],
                }],
            },
        });
        const data = [
            project('happy-windows', 'windows', 'windows-session', 40),
            project('happy-mac', 'mac', 'mac-session', 30),
            {
                ...project('notes', 'windows', 'notes-session', 20),
                project: {
                    ...project('notes', 'windows', 'notes-session', 20).project,
                    name: 'notes',
                },
            },
        ] as any;

        expect(collectCodexFirstRecentProjects(data, 3, [
            { id: 'windows', machineIds: ['windows'], name: 'Windows workstation' },
            { id: 'mac', machineIds: ['mac'], name: 'Mac Studio' },
        ])).toEqual([
            {
                id: 'happy-windows',
                machineLabel: 'Windows workstation',
                name: 'happy',
                sessionId: 'windows-session',
                updatedAt: 40,
            },
            {
                id: 'happy-mac',
                machineLabel: 'Mac Studio',
                name: 'happy',
                sessionId: 'mac-session',
                updatedAt: 30,
            },
            { id: 'notes', name: 'notes', sessionId: 'notes-session', updatedAt: 20 },
        ]);
    });

    it('uses caller-localized copy when a duplicate project has no Machine id', () => {
        const project = (id: string, machineId: string | null, sessionId: string, updatedAt: number) => ({
            type: 'project',
            source: 'happy',
            project: {
                id,
                name: 'happy',
                machineId,
                sessionCount: 1,
                activeCount: 1,
                workspaces: [{ id: '', name: null, sessions: [{ id: sessionId, lastActivityAt: updatedAt }] }],
            },
        });
        expect(collectCodexFirstRecentProjects([
            project('unknown', null, 'unknown-session', 40),
            project('windows', 'windows', 'windows-session', 30),
        ] as any, 3, [], '未知机器')[0]).toMatchObject({ machineLabel: '未知机器' });
    });
});
