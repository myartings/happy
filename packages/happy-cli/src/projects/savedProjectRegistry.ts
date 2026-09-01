import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, realpath, rename, stat, unlink } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { configuration } from '@/configuration';
import { z } from 'zod';

export const SAVED_PROJECT_SCHEMA_VERSION = 1 as const;

export type SavedProjectKind = 'git' | 'directory';

export type SavedProject = {
    id: string;
    name: string;
    primaryPath: string;
    canonicalPath: string;
    kind: SavedProjectKind;
    createdAt: string;
    updatedAt: string;
};

export type SavedProjectRegistrySnapshot = {
    schemaVersion: typeof SAVED_PROJECT_SCHEMA_VERSION;
    revision: number;
    projects: SavedProject[];
};

export type SavedProjectRegistryOptions = {
    registryFile?: string;
    homeDir?: string;
    createId?: () => string;
    now?: () => Date;
};

export type AddSavedProjectResult = {
    created: boolean;
    project: SavedProject;
    registry: SavedProjectRegistrySnapshot;
};

const EMPTY_REGISTRY: SavedProjectRegistrySnapshot = {
    schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
    revision: 0,
    projects: [],
};

const execFileAsync = promisify(execFile);

const savedProjectSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    primaryPath: z.string().min(1).refine(isAbsolute, 'primaryPath must be absolute'),
    canonicalPath: z.string().min(1).refine(isAbsolute, 'canonicalPath must be absolute'),
    kind: z.enum(['git', 'directory']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
}).strict();

const registrySchema = z.object({
    schemaVersion: z.literal(SAVED_PROJECT_SCHEMA_VERSION),
    revision: z.number().int().nonnegative(),
    projects: z.array(savedProjectSchema),
}).strict();

export class SavedProjectRegistryCorruptError extends Error {
    constructor(registryFile: string, cause?: unknown) {
        super(`Saved project registry is corrupt or unsupported: ${registryFile}`, { cause });
        this.name = 'SavedProjectRegistryCorruptError';
    }
}

export class SavedProjectRevisionConflictError extends Error {
    constructor(expected: number, actual: number) {
        super(`Saved project registry revision conflict: expected ${expected}, found ${actual}`);
        this.name = 'SavedProjectRevisionConflictError';
    }
}

export class SavedProjectUnavailableError extends Error {
    constructor(projectId: string, reason: 'unknown' | 'missing-directory') {
        super(reason === 'unknown'
            ? `Saved project is no longer registered: ${projectId}`
            : `Saved project directory is unavailable: ${projectId}`);
        this.name = 'SavedProjectUnavailableError';
    }
}

function errorCode(error: unknown): string | undefined {
    return error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : undefined;
}

function canonicalIdentity(path: string): string {
    return process.platform === 'win32' ? path.toLocaleLowerCase() : path;
}

async function hasGitMarker(directory: string): Promise<boolean> {
    let current = directory;
    while (true) {
        try {
            await lstat(join(current, '.git'));
            return true;
        } catch (error) {
            if (errorCode(error) !== 'ENOENT') throw error;
        }
        const parent = dirname(current);
        if (parent === current) return false;
        current = parent;
    }
}

async function gitPaths(directory: string): Promise<{
    topLevel: string;
    gitDir: string;
    commonDir: string;
} | null> {
    try {
        const { stdout } = await execFileAsync('git', [
            '-C', directory,
            'rev-parse', '--path-format=absolute', '--show-toplevel', '--git-dir', '--git-common-dir',
        ], { windowsHide: true });
        const [topLevel, gitDir, commonDir, ...extra] = stdout
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
        if (!topLevel || !gitDir || !commonDir || extra.length > 0) {
            throw new Error(`Git returned an invalid project identity for ${directory}`);
        }
        return {
            topLevel: await realpath(topLevel),
            gitDir: await realpath(gitDir),
            commonDir: await realpath(commonDir),
        };
    } catch (error) {
        const code = errorCode(error);
        if (code === 'ENOENT' || code === '128') {
            if (await hasGitMarker(directory)) {
                throw new Error(`Cannot resolve Git project metadata: ${directory}`, { cause: error });
            }
            return null;
        }
        throw error;
    }
}

async function normalizeProjectDirectory(directory: string): Promise<{
    path: string;
    kind: SavedProjectKind;
}> {
    const git = await gitPaths(directory);
    if (!git) return { path: directory, kind: 'directory' };
    if (canonicalIdentity(git.gitDir) === canonicalIdentity(git.commonDir)) {
        return { path: git.topLevel, kind: 'git' };
    }
    if (basename(git.commonDir).toLocaleLowerCase() !== '.git') {
        throw new Error(`Cannot prove the primary repository for linked worktree: ${directory}`);
    }
    const primaryCandidate = await realpath(dirname(git.commonDir));
    const primary = await gitPaths(primaryCandidate);
    if (
        !primary
        || canonicalIdentity(primary.topLevel) !== canonicalIdentity(primaryCandidate)
        || canonicalIdentity(primary.gitDir) !== canonicalIdentity(primary.commonDir)
        || canonicalIdentity(primary.commonDir) !== canonicalIdentity(git.commonDir)
    ) {
        throw new Error(`Cannot prove the primary repository for linked worktree: ${directory}`);
    }
    return { path: primary.topLevel, kind: 'git' };
}

function validateRegistry(value: unknown, registryFile: string): SavedProjectRegistrySnapshot {
    const parsed = registrySchema.safeParse(value);
    if (!parsed.success) throw new SavedProjectRegistryCorruptError(registryFile, parsed.error);
    const identities = new Set<string>();
    const ids = new Set<string>();
    for (const project of parsed.data.projects) {
        const identity = canonicalIdentity(project.canonicalPath);
        if (
            identities.has(identity)
            || ids.has(project.id)
            || canonicalIdentity(project.primaryPath) !== identity
        ) {
            throw new SavedProjectRegistryCorruptError(registryFile);
        }
        identities.add(identity);
        ids.add(project.id);
    }
    return parsed.data;
}

async function delay(ms: number): Promise<void> {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

export class SavedProjectRegistry {
    readonly registryFile: string;
    readonly homeDir: string;
    private readonly createId: () => string;
    private readonly now: () => Date;

    constructor(options: SavedProjectRegistryOptions = {}) {
        const happyHomeDir = configuration.happyHomeDir ?? join(homedir(), '.happy');
        this.registryFile = options.registryFile ?? join(happyHomeDir, 'projects.json');
        this.homeDir = options.homeDir ?? homedir();
        this.createId = options.createId ?? randomUUID;
        this.now = options.now ?? (() => new Date());
    }

    async list(): Promise<SavedProjectRegistrySnapshot> {
        try {
            const raw = await readFile(this.registryFile, 'utf8');
            try {
                return validateRegistry(JSON.parse(raw), this.registryFile);
            } catch (error) {
                if (error instanceof SavedProjectRegistryCorruptError) throw error;
                throw new SavedProjectRegistryCorruptError(this.registryFile, error);
            }
        } catch (error) {
            if (errorCode(error) === 'ENOENT') {
                return { ...EMPTY_REGISTRY, projects: [] };
            }
            throw error;
        }
    }

    async add({
        path,
        expectedRevision,
    }: {
        path: string;
        expectedRevision?: number;
    }): Promise<AddSavedProjectResult> {
        const lock = await this.acquireLock();
        try {
            const registry = await this.list();
            if (expectedRevision !== undefined && expectedRevision !== registry.revision) {
                throw new SavedProjectRevisionConflictError(expectedRevision, registry.revision);
            }
            const normalized = await this.normalizeDirectory(path);
            const projectPath = normalized.path;
            const identity = canonicalIdentity(projectPath);
            const existing = registry.projects.find(
                (project) => canonicalIdentity(project.canonicalPath) === identity,
            );
            if (existing) return { created: false, project: existing, registry };

            const timestamp = this.now().toISOString();
            const project: SavedProject = {
                id: this.createId(),
                name: basename(projectPath),
                primaryPath: projectPath,
                canonicalPath: projectPath,
                kind: normalized.kind,
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            const updated = validateRegistry({
                schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
                revision: registry.revision + 1,
                projects: [...registry.projects, project],
            }, this.registryFile);
            await this.atomicWrite(updated);
            return { created: true, project, registry: updated };
        } finally {
            await lock.close();
            await unlink(`${this.registryFile}.lock`).catch(() => undefined);
        }
    }

    async resolveProjectPath(projectId: string): Promise<string> {
        const registry = await this.list();
        const project = registry.projects.find((candidate) => candidate.id === projectId);
        if (!project) throw new SavedProjectUnavailableError(projectId, 'unknown');
        try {
            const resolved = await realpath(project.primaryPath);
            if (canonicalIdentity(resolved) !== canonicalIdentity(project.canonicalPath)) {
                throw new SavedProjectUnavailableError(projectId, 'missing-directory');
            }
            const info = await stat(resolved);
            if (!info.isDirectory()) throw new SavedProjectUnavailableError(projectId, 'missing-directory');
            return resolved;
        } catch (error) {
            if (error instanceof SavedProjectUnavailableError) throw error;
            if (errorCode(error) === 'ENOENT') {
                throw new SavedProjectUnavailableError(projectId, 'missing-directory');
            }
            throw error;
        }
    }

    private async normalizeDirectory(input: string): Promise<{ path: string; kind: SavedProjectKind }> {
        const trimmed = input.trim();
        if (!trimmed) throw new Error('Saved project path is required');
        const expanded = trimmed === '~'
            ? this.homeDir
            : /^~[\\/]/.test(trimmed)
                ? resolve(this.homeDir, trimmed.slice(2))
                : isAbsolute(trimmed)
                    ? resolve(trimmed)
                    : resolve(this.homeDir, trimmed);
        const canonical = await realpath(expanded);
        const info = await stat(canonical);
        if (!info.isDirectory()) throw new Error(`Saved project path is not a directory: ${input}`);
        return normalizeProjectDirectory(canonical);
    }

    private async acquireLock() {
        await mkdir(dirname(this.registryFile), { recursive: true });
        const lockFile = `${this.registryFile}.lock`;
        for (let attempt = 0; attempt < 80; attempt += 1) {
            try {
                return await open(lockFile, 'wx', 0o600);
            } catch (error) {
                if (errorCode(error) !== 'EEXIST') throw error;
                await delay(25);
            }
        }
        throw new Error(`Timed out acquiring saved project registry lock: ${lockFile}`);
    }

    private async atomicWrite(registry: SavedProjectRegistrySnapshot): Promise<void> {
        const temporary = `${this.registryFile}.${randomUUID()}.tmp`;
        let handle;
        try {
            handle = await open(temporary, 'wx', 0o600);
            await handle.writeFile(`${JSON.stringify(registry, null, 2)}\n`, 'utf8');
            await handle.sync();
            await handle.close();
            handle = undefined;
            await rename(temporary, this.registryFile);
        } catch (error) {
            await handle?.close().catch(() => undefined);
            await unlink(temporary).catch(() => undefined);
            throw error;
        }
    }
}
