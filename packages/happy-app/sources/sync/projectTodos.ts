import * as z from 'zod';
import { createId } from '@paralleldrive/cuid2';

export const PROJECT_TODO_CONTENT_LIMIT = 500;
export const PROJECT_TODO_ITEM_LIMIT = 100;

export const ProjectTodoItemSchema = z.object({
    id: z.string(),
    content: z.string().max(PROJECT_TODO_CONTENT_LIMIT),
    completed: z.boolean(),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export const ProjectTodosSchema = z.record(
    z.string(),
    z.array(ProjectTodoItemSchema).max(PROJECT_TODO_ITEM_LIMIT),
);

export type ProjectTodoItem = z.infer<typeof ProjectTodoItemSchema>;
export type ProjectTodos = z.infer<typeof ProjectTodosSchema>;

export interface ProjectTodoIdentity {
    projectId?: string | null;
    projectName?: string | null;
    machineId?: string | null;
    path?: string | null;
}

export interface ProjectTodoDraftTarget {
    machineId: string | null;
    path: string;
    sessionType: 'simple' | 'worktree';
    worktreeKey: string | null;
}

export function createProjectTodoDraft(target: ProjectTodoDraftTarget, todo: ProjectTodoItem) {
    return {
        input: todo.content,
        selectedMachineId: target.machineId,
        selectedPath: target.path,
        sessionType: target.sessionType,
        worktreeKey: target.worktreeKey,
    } as const;
}

export function resolveProjectTodoKey(identity: ProjectTodoIdentity): string | null {
    const projectId = identity.projectId?.trim();
    if (projectId) {
        return `project:${projectId}`;
    }

    const projectName = identity.projectName?.trim().toLocaleLowerCase();
    if (projectName) {
        return `name:${projectName}`;
    }

    const machineId = identity.machineId?.trim();
    const path = identity.path?.trim().replace(/\\/g, '/').replace(/\/+$/, '');
    if (!machineId || !path) {
        return null;
    }

    return `path:${machineId}:${path}`;
}

export function addProjectTodo(state: ProjectTodos, projectKey: string, content: string): ProjectTodos {
    const normalizedContent = content.trim().slice(0, PROJECT_TODO_CONTENT_LIMIT);
    if (!normalizedContent) return state;

    const now = Date.now();
    const item: ProjectTodoItem = {
        id: createId(),
        content: normalizedContent,
        completed: false,
        createdAt: now,
        updatedAt: now,
    };
    const existing = state[projectKey] ?? [];
    return {
        ...state,
        [projectKey]: [item, ...existing].slice(0, PROJECT_TODO_ITEM_LIMIT),
    };
}

export function setProjectTodoCompleted(
    state: ProjectTodos,
    projectKey: string,
    todoId: string,
    completed: boolean,
): ProjectTodos {
    const existing = state[projectKey];
    if (!existing?.some((item) => item.id === todoId && item.completed !== completed)) return state;

    return {
        ...state,
        [projectKey]: existing.map((item) => item.id === todoId
            ? { ...item, completed, updatedAt: Date.now() }
            : item),
    };
}

export function updateProjectTodo(
    state: ProjectTodos,
    projectKey: string,
    todoId: string,
    content: string,
): ProjectTodos {
    const normalizedContent = content.trim().slice(0, PROJECT_TODO_CONTENT_LIMIT);
    const existing = state[projectKey];
    if (!normalizedContent || !existing?.some((item) => item.id === todoId && item.content !== normalizedContent)) {
        return state;
    }

    return {
        ...state,
        [projectKey]: existing.map((item) => item.id === todoId
            ? { ...item, content: normalizedContent, updatedAt: Date.now() }
            : item),
    };
}

export function deleteProjectTodo(state: ProjectTodos, projectKey: string, todoId: string): ProjectTodos {
    const existing = state[projectKey];
    if (!existing?.some((item) => item.id === todoId)) return state;

    const remaining = existing.filter((item) => item.id !== todoId);
    const next = { ...state };
    if (remaining.length === 0) {
        delete next[projectKey];
    } else {
        next[projectKey] = remaining;
    }
    return next;
}
