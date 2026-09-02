export type SavedProject = {
    id: string;
    name: string;
    primaryPath: string;
    canonicalPath: string;
    kind: 'git' | 'directory';
    createdAt: string;
    updatedAt: string;
};

export type SavedProjectRegistrySnapshot = {
    schemaVersion: 1;
    revision: number;
    projects: SavedProject[];
};

export type AddSavedProjectResult = {
    created: boolean;
    project: SavedProject;
    registry: SavedProjectRegistrySnapshot;
};

export type ResolvedSavedProject = {
    projectId: string;
    primaryPath: string;
};

export type SavedProjectRegistryBinding = {
    machineId: string;
    registry: SavedProjectRegistrySnapshot;
};

export type SavedProjectRegistryOutcome =
    | { status: 'ready'; registry: SavedProjectRegistrySnapshot }
    | { status: 'unavailable' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WINDOWS_DRIVE_ABSOLUTE_PATH = /^[a-zA-Z]:[\\/]/;
const WINDOWS_UNC_PATH = /^[\\/]{2}/;

function isWindowsPath(value: string): boolean {
    return WINDOWS_DRIVE_ABSOLUTE_PATH.test(value) || WINDOWS_UNC_PATH.test(value);
}

function isAbsolutePath(value: string): boolean {
    if (WINDOWS_DRIVE_ABSOLUTE_PATH.test(value)) return true;
    if (WINDOWS_UNC_PATH.test(value)) {
        return value.slice(2).split(/[\\/]+/).filter(Boolean).length >= 2;
    }
    return value.startsWith('/');
}

function pathIdentity(value: string): string {
    if (!isWindowsPath(value)) return value;
    return value
        .replace(/[\\/]+/g, '\\')
        .replace(/\\+$/, '')
        .toLowerCase();
}

function isIsoDate(value: unknown): value is string {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

export function isSavedProject(value: unknown): value is SavedProject {
    if (!value || typeof value !== 'object') return false;
    const project = value as Partial<SavedProject>;
    return typeof project.id === 'string'
        && UUID.test(project.id)
        && typeof project.name === 'string'
        && project.name.length > 0
        && typeof project.primaryPath === 'string'
        && isAbsolutePath(project.primaryPath)
        && typeof project.canonicalPath === 'string'
        && isAbsolutePath(project.canonicalPath)
        && pathIdentity(project.primaryPath) === pathIdentity(project.canonicalPath)
        && (project.kind === 'git' || project.kind === 'directory')
        && isIsoDate(project.createdAt)
        && isIsoDate(project.updatedAt);
}

export function isSavedProjectRegistrySnapshot(value: unknown): value is SavedProjectRegistrySnapshot {
    if (!value || typeof value !== 'object') return false;
    const registry = value as Partial<SavedProjectRegistrySnapshot>;
    if (
        registry.schemaVersion !== 1
        || !Number.isInteger(registry.revision)
        || (registry.revision ?? -1) < 0
        || !Array.isArray(registry.projects)
        || !registry.projects.every(isSavedProject)
    ) return false;
    return new Set(registry.projects.map((project) => project.id)).size === registry.projects.length
        && new Set(registry.projects.map((project) => pathIdentity(project.canonicalPath))).size === registry.projects.length;
}

export function isResolvedSavedProject(value: unknown): value is ResolvedSavedProject {
    if (!value || typeof value !== 'object') return false;
    const resolved = value as Partial<ResolvedSavedProject>;
    return typeof resolved.projectId === 'string'
        && UUID.test(resolved.projectId)
        && typeof resolved.primaryPath === 'string'
        && isAbsolutePath(resolved.primaryPath);
}

export function registryForMachine(
    binding: SavedProjectRegistryBinding | null,
    machineId: string | null,
): SavedProjectRegistrySnapshot | null {
    return binding?.machineId === machineId ? binding.registry : null;
}

function savedProjectEquals(left: SavedProject, right: SavedProject): boolean {
    return left.id === right.id
        && left.name === right.name
        && left.primaryPath === right.primaryPath
        && left.canonicalPath === right.canonicalPath
        && left.kind === right.kind
        && left.createdAt === right.createdAt
        && left.updatedAt === right.updatedAt;
}

export function isAddSavedProjectResult(value: unknown): value is AddSavedProjectResult {
    if (!value || typeof value !== 'object') return false;
    const result = value as Partial<AddSavedProjectResult>;
    return typeof result.created === 'boolean'
        && isSavedProject(result.project)
        && isSavedProjectRegistrySnapshot(result.registry)
        && result.registry.projects.some((project) => savedProjectEquals(project, result.project!));
}

export type SavedProjectAddAttempt = Readonly<{ machineId: string; generation: number }>;

export type SavedProjectAddOutcome =
    | { status: 'accepted'; result: AddSavedProjectResult }
    | { status: 'stale' }
    | { status: 'invalid' };

export class SavedProjectAddGuard {
    private generation = 0;
    private machineId: string | null = null;

    syncMachine(machineId: string | null): void {
        if (machineId === this.machineId) return;
        this.generation += 1;
        this.machineId = machineId;
    }

    begin(machineId: string): SavedProjectAddAttempt {
        this.syncMachine(machineId);
        this.generation += 1;
        return { machineId, generation: this.generation };
    }

    finish(attempt: SavedProjectAddAttempt, value: unknown): SavedProjectAddOutcome {
        if (attempt.generation !== this.generation || attempt.machineId !== this.machineId) {
            return { status: 'stale' };
        }
        return isAddSavedProjectResult(value)
            ? { status: 'accepted', result: value }
            : { status: 'invalid' };
    }
}

export class SavedProjectRegistryLoader {
    private generation = 0;
    private readonly outcomes = new Map<string, SavedProjectRegistryOutcome>();
    private readonly pending = new Map<string, Promise<SavedProjectRegistryOutcome>>();
    private readonly request: (machineId: string) => Promise<unknown>;
    private readonly timeoutMs: number;

    constructor({
        request,
        // Match apiSocket's machine-RPC acknowledgement budget. The server can
        // spend 15 seconds waiting for a reconnecting daemon before dispatch.
        timeoutMs = 50_000,
    }: {
        request: (machineId: string) => Promise<unknown>;
        timeoutMs?: number;
    }) {
        this.request = request;
        this.timeoutMs = timeoutMs;
    }

    async load(machineId: string): Promise<SavedProjectRegistryOutcome | null> {
        const generation = ++this.generation;
        const outcome = await this.loadOnce(machineId);
        return generation === this.generation ? outcome : null;
    }

    private loadOnce(machineId: string): Promise<SavedProjectRegistryOutcome> {
        const cached = this.outcomes.get(machineId);
        if (cached) return Promise.resolve(cached);
        const existing = this.pending.get(machineId);
        if (existing) return existing;

        let timeout: ReturnType<typeof setTimeout> | undefined;
        const pending = (async (): Promise<SavedProjectRegistryOutcome> => {
            let outcome: SavedProjectRegistryOutcome;
            try {
                const value = await Promise.race([
                    this.request(machineId),
                    new Promise<never>((_resolve, reject) => {
                        timeout = setTimeout(() => reject(new Error('Saved project registry timed out')), this.timeoutMs);
                    }),
                ]);
                outcome = isSavedProjectRegistrySnapshot(value)
                    ? { status: 'ready', registry: value }
                    : { status: 'unavailable' };
            } catch {
                outcome = { status: 'unavailable' };
            } finally {
                if (timeout) clearTimeout(timeout);
                this.pending.delete(machineId);
            }
            this.outcomes.set(machineId, outcome);
            return outcome;
        })();
        this.pending.set(machineId, pending);
        return pending;
    }

    reset(): void {
        this.generation += 1;
    }

    peek(machineId: string): SavedProjectRegistrySnapshot | null {
        const outcome = this.outcomes.get(machineId);
        return outcome?.status === 'ready' ? outcome.registry : null;
    }

    remember(machineId: string, registry: SavedProjectRegistrySnapshot): void {
        this.outcomes.set(machineId, { status: 'ready', registry });
    }
}

export function filterSavedProjects(projects: readonly SavedProject[], query: string): SavedProject[] {
    const normalized = query.trim().toLocaleLowerCase();
    return projects
        .filter((project) => !normalized
            || project.name.toLocaleLowerCase().includes(normalized)
            || project.primaryPath.toLocaleLowerCase().includes(normalized))
        .sort((left, right) => (
            left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
            || left.primaryPath.localeCompare(right.primaryPath)
        ));
}
