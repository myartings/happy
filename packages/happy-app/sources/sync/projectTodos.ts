import * as z from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { getRepoPath, isWorktreePath } from '@/utils/worktreePaths';

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

export interface ProjectTodoTarget extends ProjectTodoDraftTarget {
    id: string;
    name: string;
    updatedAt: number;
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
    aliasKeys: string[];
    targets: ProjectTodoTarget[];
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
    const normalizedPath = path.trim().replace(/\\/g, '/').replace(/\/+$/, '');
    const worktree = isWorktreePath(normalizedPath);
    const repoPath = getRepoPath(normalizedPath).replace(/\/+$/, '');
    if (!homeDir) return { normalizedPath, repoPath, draftPath: repoPath, worktree };
    const normalizedHome = homeDir.replace(/\\/g, '/').replace(/\/+$/, '');
    const draftPath = repoPath.startsWith(normalizedHome)
        ? `~${repoPath.slice(normalizedHome.length).replace(/^\//, '/')}`
        : repoPath;
    return { normalizedPath, repoPath, draftPath, worktree };
}

function repositoryIdentityKey(machineId: string | null, repoPath: string): string {
    return JSON.stringify([machineId, repoPath]);
}

function repositoryNameIdentityKey(machineId: string | null, projectName: string): string {
    return JSON.stringify([machineId, projectName.toLocaleLowerCase()]);
}

function projectNameFromPath(repoPath: string): string {
    return repoPath.split('/').filter(Boolean).pop() || repoPath;
}

function targetTieBreakKey(target: ProjectTodoTarget): string {
    return JSON.stringify([
        target.path,
        target.worktreeKey,
        target.name,
        target.sessionType,
    ]);
}

function preferProjectTodoTarget(
    existing: ProjectTodoTarget | undefined,
    candidate: ProjectTodoTarget,
): ProjectTodoTarget {
    if (!existing || candidate.updatedAt > existing.updatedAt) return candidate;
    if (candidate.updatedAt < existing.updatedAt) return existing;
    return targetTieBreakKey(candidate).localeCompare(targetTieBreakKey(existing)) < 0 ? candidate : existing;
}

function possibleProjectTodoKeys(identity: ProjectTodoIdentity): string[] {
    const keys: string[] = [];
    const projectId = identity.projectId?.trim();
    const projectName = identity.projectName?.trim().toLocaleLowerCase();
    const machineId = identity.machineId?.trim();
    const path = identity.path?.trim().replace(/\\/g, '/').replace(/\/+$/, '');
    if (projectId) keys.push(`project:${projectId}`);
    if (projectName) keys.push(`name:${projectName}`);
    if (machineId && path) keys.push(`path:${machineId}:${path}`);
    return keys;
}

function contextTodoKeys(context: ProjectTodoContext): string[] {
    return [context.key, ...context.aliasKeys];
}

export function collectProjectTodoContexts(
    sessions: ProjectTodoSessionContext[],
    projectTodos: ProjectTodos,
): ProjectTodoContext[] {
    const contexts = new Map<string, ProjectTodoContext>();
    const repositoryPathsByName = new Map<string, Set<string>>();

    for (const session of sessions) {
        if (!session.path) continue;
        const { repoPath, worktree } = projectPathContext(session.path, session.homeDir);
        if (worktree) continue;
        const projectName = session.projectName?.trim() || projectNameFromPath(repoPath);
        const nameKey = repositoryNameIdentityKey(session.machineId, projectName);
        const paths = repositoryPathsByName.get(nameKey) ?? new Set<string>();
        paths.add(repoPath);
        repositoryPathsByName.set(nameKey, paths);
    }

    const primaryIdentities = new Map<string, ProjectTodoIdentity & { updatedAt: number }>();

    for (const session of sessions) {
        if (!session.path) continue;
        const { repoPath, worktree } = projectPathContext(session.path, session.homeDir);
        if (worktree) continue;
        const projectName = session.projectName?.trim() || projectNameFromPath(repoPath);
        const candidate = {
            projectId: session.projectId,
            projectName: repositoryPathsByName.get(repositoryNameIdentityKey(session.machineId, projectName))!.size > 1
                ? null
                : projectName,
            machineId: session.machineId,
            path: repoPath,
            updatedAt: session.updatedAt,
        };
        const identityKey = repositoryIdentityKey(session.machineId, repoPath);
        const existing = primaryIdentities.get(identityKey);
        const candidateHasProjectId = !!candidate.projectId?.trim();
        const existingHasProjectId = !!existing?.projectId?.trim();
        const shouldReplace = !existing
            || (candidateHasProjectId && !existingHasProjectId)
            || (candidateHasProjectId === existingHasProjectId && (
                candidate.updatedAt > existing.updatedAt
                || (candidate.updatedAt === existing.updatedAt
                    && (candidate.projectId ?? '').localeCompare(existing.projectId ?? '') < 0)
            ));
        if (shouldReplace) primaryIdentities.set(identityKey, candidate);
    }

    for (const session of sessions) {
        if (!session.path) continue;
        const { normalizedPath, repoPath, draftPath, worktree } = projectPathContext(session.path, session.homeDir);
        const repoName = projectNameFromPath(repoPath);
        const reportedName = session.projectName?.trim() || repoName;
        const primaryIdentity = primaryIdentities.get(repositoryIdentityKey(session.machineId, repoPath));
        const name = primaryIdentity?.projectName?.trim() || (worktree ? repoName : reportedName);
        const ambiguousPrimaryName = !session.projectId?.trim()
            && !worktree
            && repositoryPathsByName.get(repositoryNameIdentityKey(session.machineId, reportedName))!.size > 1;
        const canonicalIdentity = {
            projectId: primaryIdentity?.projectId ?? (worktree ? null : session.projectId),
            projectName: primaryIdentity
                ? primaryIdentity.projectName
                : (worktree || ambiguousPrimaryName ? null : name),
            machineId: session.machineId,
            path: repoPath,
        };
        const key = resolveProjectTodoKey(canonicalIdentity);
        if (!key) continue;
        const priorKeys = possibleProjectTodoKeys({
            projectId: session.projectId,
            projectName: reportedName,
            machineId: session.machineId,
            path: repoPath,
        });

        const existing = contexts.get(key);
        const aliasKeys = [...new Set([
            ...(existing?.aliasKeys ?? []),
            ...possibleProjectTodoKeys(canonicalIdentity),
            ...priorKeys,
        ])].filter((candidate) => candidate !== key);
        const target: ProjectTodoTarget = {
            id: repositoryIdentityKey(session.machineId, normalizedPath),
            name: worktree
                ? normalizedPath.split('/').filter(Boolean).pop() || repoName
                : repoName,
            machineId: session.machineId,
            path: draftPath,
            sessionType: worktree ? 'worktree' : 'simple',
            worktreeKey: worktree ? normalizedPath : null,
            updatedAt: session.updatedAt,
        };
        const priorTarget = existing?.targets.find((candidate) => candidate.id === target.id);
        const selectedTarget = preferProjectTodoTarget(priorTarget, target);
        const targets = [
            ...(existing?.targets.filter((candidate) => candidate.id !== target.id) ?? []),
            selectedTarget,
        ].sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));
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
                aliasKeys,
                targets,
                sessions,
                updatedAt: session.updatedAt,
            });
        } else if (
            sessions !== existing.sessions
            || targets.length !== existing.targets.length
            || aliasKeys.length !== existing.aliasKeys.length
        ) {
            contexts.set(key, { ...existing, aliasKeys, targets, sessions });
        }
    }

    const aliasOwners = new Map<string, Set<string>>();
    for (const context of contexts.values()) {
        for (const aliasKey of context.aliasKeys) {
            const owners = aliasOwners.get(aliasKey) ?? new Set<string>();
            owners.add(context.key);
            aliasOwners.set(aliasKey, owners);
        }
    }
    for (const [key, context] of contexts) {
        contexts.set(key, {
            ...context,
            aliasKeys: context.aliasKeys.filter((aliasKey) => (
                aliasOwners.get(aliasKey)?.size === 1 && !contexts.has(aliasKey)
            )),
        });
    }

    const claimedTodoKeys = new Set(
        [...contexts.values()].flatMap(contextTodoKeys),
    );
    for (const [key, todos] of Object.entries(projectTodos)) {
        if (claimedTodoKeys.has(key)) continue;
        contexts.set(key, {
            key,
            name: fallbackProjectName(key),
            aliasKeys: [],
            targets: [],
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
    return contexts.find((context) => context.key === requestedKey || context.aliasKeys.includes(requestedKey ?? ''))
        ?? contexts[0]
        ?? null;
}

export function collectProjectTodoItems(
    projectTodos: ProjectTodos,
    context: ProjectTodoContext,
): ProjectTodoItem[] {
    const todoKeys = contextTodoKeys(context);
    if (todoKeys.length === 1) return projectTodos[todoKeys[0]] ?? [];

    const items = new Map<string, ProjectTodoItem>();
    for (const key of todoKeys) {
        for (const todo of projectTodos[key] ?? []) {
            const existing = items.get(todo.id);
            if (!existing || todo.updatedAt > existing.updatedAt) items.set(todo.id, todo);
        }
    }
    return [...items.values()].sort((a, b) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt);
}

export function setProjectTodoCompletedForContext(
    state: ProjectTodos,
    context: ProjectTodoContext,
    todoId: string,
    completed: boolean,
): ProjectTodos {
    return mutateProjectTodoContext(state, context, (next, key) => (
        setProjectTodoCompleted(next, key, todoId, completed)
    ));
}

export function updateProjectTodoForContext(
    state: ProjectTodos,
    context: ProjectTodoContext,
    todoId: string,
    content: string,
): ProjectTodos {
    return mutateProjectTodoContext(state, context, (next, key) => (
        updateProjectTodo(next, key, todoId, content)
    ));
}

export function deleteProjectTodoForContext(
    state: ProjectTodos,
    context: ProjectTodoContext,
    todoId: string,
): ProjectTodos {
    return mutateProjectTodoContext(state, context, (next, key) => (
        deleteProjectTodo(next, key, todoId)
    ));
}

function mutateProjectTodoContext(
    state: ProjectTodos,
    context: ProjectTodoContext,
    mutate: (state: ProjectTodos, key: string) => ProjectTodos,
): ProjectTodos {
    let next = state;
    for (const key of contextTodoKeys(context)) {
        next = mutate(next, key);
    }
    return next;
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
