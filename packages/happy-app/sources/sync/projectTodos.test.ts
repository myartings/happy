import { describe, expect, it } from 'vitest';
import {
    addProjectTodo,
    collectProjectTodoContexts,
    collectProjectTodoItems,
    createProjectTodoDraft,
    deleteProjectTodo,
    deleteProjectTodoForContext,
    prepareProjectTodoSessionDraft,
    resolveProjectTodoKey,
    selectProjectTodoContext,
    setProjectTodoCompleted,
    updateProjectTodo,
    updateProjectTodoForContext,
} from './projectTodos';

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
    it('groups managed worktrees from one repository into one todo project', () => {
        const contexts = collectProjectTodoContexts([
            {
                sessionId: 'feature-session',
                sessionTitle: 'Feature session',
                projectId: 'worktree-project-feature',
                projectName: 'feature-branch',
                machineId: 'machine-a',
                path: '/projects/happy/.dev/worktree/feature-branch',
                updatedAt: 20,
            },
            {
                sessionId: 'bugfix-session',
                sessionTitle: 'Bugfix session',
                projectId: 'worktree-project-bugfix',
                projectName: 'bugfix-branch',
                machineId: 'machine-a',
                path: '/projects/happy/.dev/worktree/bugfix-branch',
                updatedAt: 10,
            },
        ], {});

        expect(contexts).toHaveLength(1);
        expect(contexts[0]).toMatchObject({
            name: 'happy',
            sessions: [
                { id: 'feature-session' },
                { id: 'bugfix-session' },
            ],
        });
    });

    it('keeps todos stored under prior worktree keys visible in the grouped project', () => {
        const featureTodo = {
            id: 'feature-todo', content: 'Feature task', completed: false, createdAt: 10, updatedAt: 10,
        };
        const bugfixTodo = {
            id: 'bugfix-todo', content: 'Bugfix task', completed: false, createdAt: 20, updatedAt: 20,
        };
        const projectTodos = {
            'project:worktree-project-feature': [featureTodo],
            'project:worktree-project-bugfix': [bugfixTodo],
        };
        const contexts = collectProjectTodoContexts([
            {
                projectId: 'worktree-project-feature', projectName: 'feature-branch', machineId: 'machine-a',
                path: '/projects/happy/.dev/worktree/feature-branch', updatedAt: 20,
            },
            {
                projectId: 'worktree-project-bugfix', projectName: 'bugfix-branch', machineId: 'machine-a',
                path: '/projects/happy/.dev/worktree/bugfix-branch', updatedAt: 10,
            },
        ], projectTodos);

        expect(contexts).toHaveLength(1);
        expect(collectProjectTodoItems(projectTodos, contexts[0]).map((todo) => todo.id))
            .toEqual(['bugfix-todo', 'feature-todo']);
        const next = updateProjectTodoForContext(projectTodos, contexts[0], 'feature-todo', 'Updated task');
        expect(next['project:worktree-project-feature'][0].content).toBe('Updated task');
    });

    it('groups a managed worktree with the primary checkout identity', () => {
        const contexts = collectProjectTodoContexts([
            {
                projectId: 'primary-project', projectName: 'happy', machineId: 'machine-a',
                path: '/projects/happy', updatedAt: 10,
            },
            {
                projectId: 'worktree-project', projectName: 'feature', machineId: 'machine-a',
                path: '/projects/happy/.dev/worktree/feature', updatedAt: 20,
            },
        ], {});

        expect(contexts).toHaveLength(1);
        expect(contexts[0]).toMatchObject({ key: 'project:primary-project', name: 'happy' });
    });

    it('groups Windows managed worktree paths by repository', () => {
        const contexts = collectProjectTodoContexts([
            {
                projectId: 'feature', projectName: 'feature', machineId: 'machine-a',
                path: 'C:\\projects\\happy\\.dev\\worktree\\feature', updatedAt: 20,
            },
            {
                projectId: 'bugfix', projectName: 'bugfix', machineId: 'machine-a',
                path: 'C:\\projects\\happy\\.dev\\worktree\\bugfix', updatedAt: 10,
            },
        ], {});

        expect(contexts).toHaveLength(1);
        expect(contexts[0].name).toBe('happy');
    });

    it('does not merge worktrees from distinct repositories with the same basename', () => {
        const contexts = collectProjectTodoContexts([
            {
                projectId: 'client-a', projectName: 'feature', machineId: 'machine-a',
                path: '/clients/a/happy/.dev/worktree/feature', updatedAt: 20,
            },
            {
                projectId: 'client-b', projectName: 'bugfix', machineId: 'machine-a',
                path: '/clients/b/happy/.dev/worktree/bugfix', updatedAt: 10,
            },
        ], {});

        expect(contexts).toHaveLength(2);
        expect(new Set(contexts.map((context) => context.key)).size).toBe(2);
    });

    it('does not merge distinct primary checkouts with the same basename on one machine', () => {
        const contexts = collectProjectTodoContexts([
            { machineId: 'machine-a', path: '/clients/a/happy', updatedAt: 20 },
            { machineId: 'machine-a', path: '/clients/b/happy', updatedAt: 10 },
        ], {});

        expect(contexts).toHaveLength(2);
        expect(new Set(contexts.map((context) => context.key)).size).toBe(2);
    });

    it('prefers stable primary identity regardless of session input order', () => {
        const stable = {
            projectId: 'stable-project', projectName: 'happy', machineId: 'machine-a',
            path: '/projects/happy', updatedAt: 10,
        };
        const legacy = {
            projectId: null, projectName: 'happy', machineId: 'machine-a',
            path: '/projects/happy', updatedAt: 20,
        };
        const worktree = {
            projectId: 'worktree-project', projectName: 'feature', machineId: 'machine-a',
            path: '/projects/happy/.dev/worktree/feature', updatedAt: 30,
        };

        const forward = collectProjectTodoContexts([stable, legacy, worktree], {});
        const reversed = collectProjectTodoContexts([worktree, legacy, stable], {});
        expect(forward.map((context) => context.key)).toEqual(['project:stable-project']);
        expect(reversed.map((context) => context.key)).toEqual(['project:stable-project']);
    });

    it('retains every worktree as a new-session target', () => {
        const contexts = collectProjectTodoContexts([
            {
                machineId: 'machine-a', path: '/projects/happy/.dev/worktree/feature', updatedAt: 20,
            },
            {
                machineId: 'machine-a', path: '/projects/happy/.dev/worktree/bugfix', updatedAt: 10,
            },
        ], {});

        expect(contexts[0].targets.map((target) => target.name)).toEqual(['feature', 'bugfix']);
    });

    it('deduplicates normalized target paths and retains the newest target regardless of input order', () => {
        const newer = {
            machineId: 'machine-a',
            path: 'C:/projects/happy/.dev/worktree/feature/',
            homeDir: 'C:/projects',
            updatedAt: 20,
        };
        const older = {
            sessionId: 'older-session',
            sessionTitle: 'Older session',
            machineId: 'machine-a',
            path: 'C:\\projects\\happy\\.dev\\worktree\\feature',
            homeDir: 'C:\\Users\\me',
            updatedAt: 10,
        };

        const forward = collectProjectTodoContexts([newer, older], {});
        const reversed = collectProjectTodoContexts([older, newer], {});

        for (const contexts of [forward, reversed]) {
            expect(contexts).toHaveLength(1);
            expect(contexts[0].targets).toEqual([{
                id: '["machine-a","C:/projects/happy/.dev/worktree/feature"]',
                name: 'feature',
                machineId: 'machine-a',
                path: '~/happy',
                sessionType: 'worktree',
                worktreeKey: 'C:/projects/happy/.dev/worktree/feature',
                updatedAt: 20,
            }]);
            expect(contexts[0].sessions.map((session) => session.id)).toEqual(['older-session']);
        }
    });

    it('updates and deletes every stored copy of an aliased todo', () => {
        const duplicate = { id: 'same', content: 'Old', completed: false, createdAt: 1, updatedAt: 1 };
        const state = {
            'path:machine-a:/projects/happy': [{ ...duplicate, content: 'New', updatedAt: 2 }],
            'project:old-worktree': [duplicate],
        };
        const [context] = collectProjectTodoContexts([{
            projectId: 'old-worktree', projectName: 'feature', machineId: 'machine-a',
            path: '/projects/happy/.dev/worktree/feature', updatedAt: 10,
        }], state);

        const updated = updateProjectTodoForContext(state, context, 'same', 'Edited');
        expect(context.aliasKeys).toContain('project:old-worktree');
        expect(updated['path:machine-a:/projects/happy'][0].content).toBe('Edited');
        expect(updated['project:old-worktree'][0].content).toBe('Edited');
        expect(deleteProjectTodoForContext(updated, context, 'same')).toEqual({});
    });

    it('claims prior name and path todo keys after receiving a stable project id', () => {
        const projectTodos = {
            'name:happy': [{ id: 'name', content: 'Name todo', completed: false, createdAt: 1, updatedAt: 1 }],
            'path:machine-a:/projects/happy': [{ id: 'path', content: 'Path todo', completed: false, createdAt: 2, updatedAt: 2 }],
        };
        const contexts = collectProjectTodoContexts([{
            projectId: 'stable-project', projectName: 'happy', machineId: 'machine-a',
            path: '/projects/happy', updatedAt: 10,
        }], projectTodos);

        expect(contexts).toHaveLength(1);
        expect(contexts[0].key).toBe('project:stable-project');
        expect(collectProjectTodoItems(projectTodos, contexts[0]).map((todo) => todo.id)).toEqual(['path', 'name']);
    });

    it('preserves stored ordering for a single todo key', () => {
        const projectTodos = {
            'name:happy': [
                { id: 'first', content: 'First', completed: false, createdAt: 1, updatedAt: 1 },
                { id: 'second', content: 'Second', completed: false, createdAt: 2, updatedAt: 2 },
            ],
        };
        const [context] = collectProjectTodoContexts([], projectTodos);

        expect(collectProjectTodoItems(projectTodos, context).map((todo) => todo.id))
            .toEqual(['first', 'second']);
    });

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
            aliasKeys: [
                'path:machine-a:C:/workspace/happy',
                'path:machine-b:/home/me/happy',
            ],
            targets: [
                {
                    id: '["machine-b","/home/me/happy"]',
                    name: 'happy',
                    machineId: 'machine-b',
                    path: '~/happy',
                    sessionType: 'simple',
                    worktreeKey: null,
                    updatedAt: 20,
                },
                {
                    id: '["machine-a","C:/workspace/happy"]',
                    name: 'happy',
                    machineId: 'machine-a',
                    path: 'C:/workspace/happy',
                    sessionType: 'simple',
                    worktreeKey: null,
                    updatedAt: 10,
                },
            ],
            sessions: [],
            updatedAt: 20,
        }]);
    });

    it('honors a requested project and otherwise selects the most recent project', () => {
        const contexts = [
            { key: 'name:happy', name: 'happy', aliasKeys: [], targets: [], sessions: [], updatedAt: 20 },
            { key: 'name:manager', name: 'manager', aliasKeys: [], targets: [], sessions: [], updatedAt: 10 },
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
