export type WorkspaceProject = {
    name: string;
    path: string;
    relativePath: string;
    markers: string[];
    depth: number;
};

export type WorkspaceProjectPickerItem = {
    source: 'recent' | 'workspace';
    name: string;
    path: string;
    relativePath?: string;
    markers: string[];
};

export type WorkspaceProjectSections = {
    recent: WorkspaceProjectPickerItem[];
    workspaceProjects: WorkspaceProjectPickerItem[];
};

export type ListWorkspaceProjectsResult = {
    root: string;
    projects: WorkspaceProject[];
    scannedAt: number;
    truncated: boolean;
};

export type WorkspaceProjectDiscoveryOutcome =
    | { status: 'ready'; result: ListWorkspaceProjectsResult }
    | { status: 'unavailable' };

type TargetPlatform = 'win32' | 'unix';

function isWorkspaceProject(value: unknown): value is WorkspaceProject {
    if (!value || typeof value !== 'object') return false;
    const project = value as Partial<WorkspaceProject>;
    return typeof project.name === 'string'
        && typeof project.path === 'string'
        && typeof project.relativePath === 'string'
        && Array.isArray(project.markers)
        && project.markers.every((marker) => typeof marker === 'string')
        && typeof project.depth === 'number'
        && Number.isFinite(project.depth);
}

function isListWorkspaceProjectsResult(value: unknown): value is ListWorkspaceProjectsResult {
    if (!value || typeof value !== 'object') return false;
    const result = value as Partial<ListWorkspaceProjectsResult>;
    return typeof result.root === 'string'
        && Array.isArray(result.projects)
        && result.projects.every(isWorkspaceProject)
        && typeof result.scannedAt === 'number'
        && Number.isFinite(result.scannedAt)
        && typeof result.truncated === 'boolean';
}

export class WorkspaceProjectDiscoveryLoader {
    private generation = 0;
    private readonly request: (machineId: string) => Promise<ListWorkspaceProjectsResult>;
    private readonly timeoutMs: number;
    private readonly cacheMs: number;
    private readonly now: () => number;
    private readonly cache = new Map<string, { result: ListWorkspaceProjectsResult; cachedAt: number }>();

    constructor({
        request,
        timeoutMs = 3_000,
        cacheMs = 45_000,
        now = Date.now,
    }: {
        request: (machineId: string) => Promise<ListWorkspaceProjectsResult>;
        timeoutMs?: number;
        cacheMs?: number;
        now?: () => number;
    }) {
        this.request = request;
        this.timeoutMs = timeoutMs;
        this.cacheMs = cacheMs;
        this.now = now;
    }

    async load(machineId: string): Promise<WorkspaceProjectDiscoveryOutcome | null> {
        const generation = ++this.generation;
        const cached = this.cache.get(machineId);
        if (cached && this.now() - cached.cachedAt <= this.cacheMs) {
            return { status: 'ready', result: cached.result };
        }
        let timeout: ReturnType<typeof setTimeout> | undefined;

        try {
            const result = await Promise.race([
                this.request(machineId),
                new Promise<never>((_resolve, reject) => {
                    timeout = setTimeout(() => reject(new Error('Workspace project discovery timed out')), this.timeoutMs);
                }),
            ]);
            if (generation !== this.generation) return null;
            if (!isListWorkspaceProjectsResult(result)) {
                return { status: 'unavailable' };
            }
            this.cache.set(machineId, { result, cachedAt: this.now() });
            return { status: 'ready', result };
        } catch {
            if (generation !== this.generation) return null;
            return { status: 'unavailable' };
        } finally {
            if (timeout) clearTimeout(timeout);
        }
    }

    reset(): void {
        this.generation += 1;
    }
}

function normalizePath(path: string, platform: TargetPlatform, homeDir?: string): string {
    const trimmed = path.trim();
    const normalizedHome = homeDir?.trim().replace(/[\\/]+$/, '');
    const expanded = normalizedHome && (trimmed === '~' || /^~[\\/]/.test(trimmed))
        ? trimmed === '~'
            ? normalizedHome
            : `${normalizedHome}${platform === 'win32' ? '\\' : '/'}${trimmed.slice(2)}`
        : trimmed;
    const withoutTrailingSeparator = /^[A-Za-z]:[\\/]?$/.test(expanded) || expanded === '/'
        ? expanded
        : expanded.replace(/[\\/]+$/, '');
    if (platform === 'win32') {
        return withoutTrailingSeparator.replace(/\\/g, '/').toLocaleLowerCase();
    }
    return withoutTrailingSeparator;
}

function pathName(path: string): string {
    const parts = path.replace(/[\\/]+$/, '').split(/[\\/]/);
    return parts.at(-1) || path;
}

export function buildWorkspaceProjectSections({
    recentPaths,
    discoveredProjects,
    homeDir,
    platform,
    query,
}: {
    recentPaths: string[];
    discoveredProjects: WorkspaceProject[];
    homeDir?: string;
    platform: TargetPlatform;
    query: string;
}): WorkspaceProjectSections {
    const recent = recentPaths.map((path) => ({
        source: 'recent' as const,
        name: pathName(path),
        path,
        markers: [],
    }));
    const recentKeys = new Set(recent.map((item) => normalizePath(item.path, platform, homeDir)));
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const workspaceProjects = discoveredProjects
        .filter((project) => !recentKeys.has(normalizePath(project.path, platform, homeDir)))
        .filter((project) => (
            !normalizedQuery
            || project.name.toLocaleLowerCase().includes(normalizedQuery)
            || project.path.toLocaleLowerCase().includes(normalizedQuery)
            || project.relativePath.toLocaleLowerCase().includes(normalizedQuery)
        ))
        .map((project) => ({
            source: 'workspace' as const,
            name: project.name,
            path: project.path,
            relativePath: project.relativePath,
            markers: project.markers,
        }));

    return { recent, workspaceProjects };
}
