import { describe, expect, it } from 'vitest';
import { buildCodexFirstSearchEntries } from './codexFirstSearchIndex';

describe('Codex-first local search index', () => {
    it('indexes destinations, every Session, projects, paths, and Machines locally', () => {
        const entries = buildCodexFirstSearchEntries({
            categories: {
                destinations: 'Navigation',
                machines: 'Machines',
                projects: 'Projects',
                sessions: 'Sessions',
            },
            destinations: [
                { id: 'tasks', icon: 'checkbox-outline', route: '/project-todos', title: 'Todo' },
            ],
            machines: [
                { id: 'mac-1', name: 'Mac Studio', platform: 'darwin' },
            ],
            sessions: [
                {
                    id: 'older',
                    machineId: 'mac-1',
                    machineName: 'Mac Studio',
                    path: '/workspace/happy',
                    projectName: 'happy',
                    title: '修复侧栏',
                    updatedAt: 10,
                },
                {
                    id: 'newer',
                    machineId: 'mac-1',
                    machineName: 'Mac Studio',
                    path: '/workspace/happy',
                    projectName: 'happy',
                    title: 'Codex shell',
                    updatedAt: 20,
                },
            ],
        });

        expect(entries.map((entry) => entry.id)).toEqual([
            'destination-tasks',
            'session-newer',
            'session-older',
            'project-mac-1:/workspace/happy',
            'machine-mac-1',
        ]);
        expect(entries.find((entry) => entry.id === 'session-older')).toMatchObject({
            subtitle: 'happy · /workspace/happy · Mac Studio',
            target: { kind: 'session', sessionId: 'older' },
            title: '修复侧栏',
        });
        expect(entries.find((entry) => entry.id.startsWith('project-'))).toMatchObject({
            subtitle: '/workspace/happy · Mac Studio',
            target: { kind: 'session', sessionId: 'newer' },
            title: 'happy',
        });
        expect(entries.find((entry) => entry.id === 'machine-mac-1')).toMatchObject({
            subtitle: 'darwin',
            target: { kind: 'route', route: '/settings/agents' },
        });
    });

    it('keeps projects distinct across Machines and tolerates missing metadata', () => {
        const entries = buildCodexFirstSearchEntries({
            categories: {
                destinations: 'Navigation',
                machines: 'Machines',
                projects: 'Projects',
                sessions: 'Sessions',
            },
            destinations: [],
            machines: [],
            sessions: [
                { id: 'a', machineId: 'one', path: '/repo', projectName: 'repo', title: 'A', updatedAt: 2 },
                { id: 'b', machineId: 'two', path: '/repo', projectName: 'repo', title: 'B', updatedAt: 1 },
                { id: 'unknown', title: 'Untitled', updatedAt: 0 },
            ],
        });

        expect(entries.filter((entry) => entry.kind === 'project')).toHaveLength(2);
        expect(entries.find((entry) => entry.id === 'session-unknown')).toMatchObject({
            title: 'Untitled',
            target: { kind: 'session', sessionId: 'unknown' },
        });
    });
});
