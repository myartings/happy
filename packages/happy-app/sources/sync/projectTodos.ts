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

export interface ProjectTodoSessionContext {
    sessionId?: string;
    sessionTitle?: string;
    sessionSubtitle?: string | null;
    draft?: string | null;
    active?: boolean;
    projectId?: string | null;
    projectName?: string | null;
    machineId: string | null;
    path: string | null;
    homeDir?: string | null;
    updatedAt: number;
}

export interface ProjectTodoSessionChoice {
    id: string;
    title: string;
    subtitle: string | null;
    draft: string | null;
    active: boolean;
    updatedAt: number;
}

export interface ProjectTodoContext {
    key: string;
    name: string;
    target: ProjectTodoDraftTarget | null;
    sessions: ProjectTodoSessionChoice[];
    updatedAt: number;
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

export function prepareProjectTodoSessionDraft(existingDraft: string | null | undefined, content: string): string {
    const existing = existingDraft?.trim();
    return existing ? `${existing}\n\n${content}` : content;
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

function fallbackProjectName(projectKey: string): string {
    if (projectKey.startsWith('name:')) return projectKey.slice('name:'.length);
    if (projectKey.startsWith('path:')) {
        return projectKey.split('/').filter(Boolean).pop() ?? projectKey;
    }
    return projectKey.slice(projectKey.indexOf(':') + 1) || projectKey;
}

function projectPathContext(path: string, homeDir?: string | null) {
    const marker = '/.dev/worktree/';
    const markerIndex = path.indexOf(marker);
    const worktree = markerIndex >= 0;
    const repoPath = worktree ? path.slice(0, markerIndex) : path;
    if (!homeDir) return { repoPath, draftPath: repoPath, worktree };
    const normalizedHome = homeDir.replace(/[\\/]$/, '');
    const draftPath = repoPath.startsWith(normalizedHome)
        ? `~${repoPath.slice(normalizedHome.length).replace(/^\\/, '/')}`
        : repoPath;
    return { repoPath, draftPath, worktree };
}

export function collectProjectTodoContexts(
    sessions: ProjectTodoSessionContext[],
    projectTodos: ProjectTodos,
): ProjectTodoContext[] {
    const contexts = new Map<string, ProjectTodoContext>();

    for (const session of sessions) {
        if (!session.path) continue;
        const { repoPath, draftPath, worktree } = projectPathContext(session.path, session.homeDir);
        const name = session.projectName?.trim()
            || repoPath.split(/[/\\]/).filter(Boolean).pop()
            || repoPath;
        const key = resolveProjectTodoKey({
            projectId: session.projectId,
            projectName: name,
            machineId: session.machineId,
            path: repoPath,
        });
        if (!key) continue;

        const existing = contexts.get(key);
        const sessionChoice = session.sessionId && session.sessionTitle ? {
            id: session.sessionId,
            title: session.sessionTitle,
            subtitle: session.sessionSubtitle ?? null,
            draft: session.draft ?? null,
            active: session.active ?? false,
            updatedAt: session.updatedAt,
        } : null;
        const sessions = sessionChoice
            ? [...(existing?.sessions.filter((choice) => choice.id !== sessionChoice.id) ?? []), sessionChoice]
                .sort((a, b) => b.updatedAt - a.updatedAt)
            : existing?.sessions ?? [];
        if (!existing || session.updatedAt > existing.updatedAt) {
            contexts.set(key, {
                key,
                name,
                target: {
                    machineId: session.machineId,
                    path: draftPath,
                    sessionType: worktree ? 'worktree' : 'simple',
                    worktreeKey: worktree ? session.path : null,
                },
                sessions,
                updatedAt: session.updatedAt,
            });
        } else if (sessions !== existing.sessions) {
            contexts.set(key, { ...existing, sessions });
        }
    }

    for (const [key, todos] of Object.entries(projectTodos)) {
        if (contexts.has(key)) continue;
        contexts.set(key, {
            key,
            name: fallbackProjectName(key),
            target: null,
            sessions: [],
            updatedAt: todos.reduce((latest, todo) => Math.max(latest, todo.updatedAt), 0),
        });
    }

    return [...contexts.values()].sort((a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name));
}

export function selectProjectTodoContext(
    contexts: ProjectTodoContext[],
    requestedKey: string | null | undefined,
): ProjectTodoContext | null {
    return contexts.find((context) => context.key === requestedKey) ?? contexts[0] ?? null;
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
