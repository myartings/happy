import { describe, expect, it } from 'vitest';
import { addProjectTodo, createProjectTodoDraft, deleteProjectTodo, resolveProjectTodoKey, setProjectTodoCompleted, updateProjectTodo } from './projectTodos';

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
});
