import { describe, expect, it } from 'vitest';
import { addProjectTodo, collectProjectTodoContexts, createProjectTodoDraft, deleteProjectTodo, prepareProjectTodoSessionDraft, resolveProjectTodoKey, selectProjectTodoContext, setProjectTodoCompleted, updateProjectTodo } from './projectTodos';

describe('resolveProjectTodoKey', () => {
    it('uses a stable project id when one is available', () => {
        expect(resolveProjectTodoKey({
            projectId: 'project-123',
            machineId: 'machine-a',
            path: 'C:\\workspace\\happy',
        })).toBe('project:project-123');
    });

    it('falls back to a normalized machine and project path', () => {
        expect(resolveProjectTodoKey({
            machineId: 'machine-a',
            path: 'C:\\workspace\\happy\\',
        })).toBe('path:machine-a:C:/workspace/happy');
    });

    it('uses a normalized project name across machines when no stable id exists', () => {
        expect(resolveProjectTodoKey({
            projectName: '  Happy Manager ',
            machineId: 'machine-a',
            path: 'C:\\workspace\\happy-manager',
        })).toBe('name:happy manager');
        expect(resolveProjectTodoKey({
            projectName: 'happy manager',
            machineId: 'machine-b',
            path: '/home/user/code/happy-manager',
        })).toBe('name:happy manager');
    });
});

describe('project todo commands', () => {
    it('adds a trimmed user todo without mutating the previous state', () => {
        const previous = {};
        const next = addProjectTodo(previous, 'project:happy', '  Investigate notifications  ');

        expect(previous).toEqual({});
        expect(next['project:happy']).toHaveLength(1);
        expect(next['project:happy'][0]).toMatchObject({
            content: 'Investigate notifications',
            completed: false,
        });
    });

    it('marks only the selected todo as completed', () => {
        const added = addProjectTodo({}, 'project:happy', 'Investigate notifications');
        const id = added['project:happy'][0].id;
        const next = setProjectTodoCompleted(added, 'project:happy', id, true);

        expect(next['project:happy'][0].completed).toBe(true);
        expect(added['project:happy'][0].completed).toBe(false);
    });

    it('edits user todo text while preserving its identity', () => {
        const added = addProjectTodo({}, 'project:happy', 'Investigate notifications');
        const before = added['project:happy'][0];
        const next = updateProjectTodo(added, 'project:happy', before.id, '  Verify notifications  ');

        expect(next['project:happy'][0]).toMatchObject({
            id: before.id,
            content: 'Verify notifications',
            createdAt: before.createdAt,
        });
    });

    it('deletes a todo and removes an empty project bucket', () => {
        const added = addProjectTodo({}, 'project:happy', 'Investigate notifications');
        const id = added['project:happy'][0].id;

        expect(deleteProjectTodo(added, 'project:happy', id)).toEqual({});
    });

    it('prepares a new-session draft without sending or changing the todo', () => {
        const added = addProjectTodo({}, 'project:happy', 'Investigate notifications');
        const todo = added['project:happy'][0];

        expect(createProjectTodoDraft({
            machineId: 'machine-a',
            path: 'workspace/happy',
            sessionType: 'simple',
            worktreeKey: null,
        }, todo)).toEqual({
            input: 'Investigate notifications',
            selectedMachineId: 'machine-a',
            selectedPath: 'workspace/happy',
            sessionType: 'simple',
            worktreeKey: null,
        });
        expect(todo.completed).toBe(false);
    });

    it('preserves an existing session draft when preparing a todo', () => {
        expect(prepareProjectTodoSessionDraft(null, 'Investigate notifications')).toBe('Investigate notifications');
        expect(prepareProjectTodoSessionDraft(
            'Keep my existing thought',
            'Investigate notifications',
        )).toBe('Keep my existing thought\n\nInvestigate notifications');
    });
});

describe('collectProjectTodoContexts', () => {
    it('builds one cross-device project choice from multiple sessions', () => {
        const contexts = collectProjectTodoContexts([
            {
                projectId: null,
                projectName: null,
                machineId: 'machine-a',
                path: 'C:\\workspace\\happy',
                homeDir: 'C:\\Users\\me',
                updatedAt: 10,
            },
            {
                projectId: null,
                projectName: null,
                machineId: 'machine-b',
                path: '/home/me/happy',
                homeDir: '/home/me',
                updatedAt: 20,
            },
        ], {});

        expect(contexts).toEqual([{
            key: 'name:happy',
            name: 'happy',
            target: {
                machineId: 'machine-b',
                path: '~/happy',
                sessionType: 'simple',
                worktreeKey: null,
            },
            sessions: [],
            updatedAt: 20,
        }]);
    });

    it('honors a requested project and otherwise selects the most recent project', () => {
        const contexts = [
            { key: 'name:happy', name: 'happy', target: null, sessions: [], updatedAt: 20 },
            { key: 'name:manager', name: 'manager', target: null, sessions: [], updatedAt: 10 },
        ];

        expect(selectProjectTodoContext(contexts, 'name:manager')?.key).toBe('name:manager');
        expect(selectProjectTodoContext(contexts, 'name:missing')?.key).toBe('name:happy');
        expect(selectProjectTodoContext([], null)).toBeNull();
    });

    it('lists every existing project session as a selectable target', () => {
        const contexts = collectProjectTodoContexts([
            {
                sessionId: 'older',
                sessionTitle: 'Older session',
                projectName: 'happy',
                machineId: 'machine-a',
                path: '/home/me/happy',
                updatedAt: 10,
                draft: 'Existing draft',
            },
            {
                sessionId: 'newer',
                sessionTitle: 'Newer session',
                projectName: 'happy',
                machineId: 'machine-a',
                path: '/home/me/happy',
                updatedAt: 20,
                draft: null,
            },
        ], {});

        expect(contexts[0].sessions.map((session) => session.id)).toEqual(['newer', 'older']);
        expect(contexts[0].sessions[1]).toMatchObject({
            title: 'Older session',
            draft: 'Existing draft',
        });
    });
});
