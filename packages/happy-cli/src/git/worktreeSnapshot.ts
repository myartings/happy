import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readlink, rm } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const MANAGED_WORKTREE_DIRECTORY = join('.dev', 'worktree');

export type WorktreeSnapshotInspection = {
    sourceDirectory: string;
    repositoryRoot: string;
    primaryRepositoryRoot: string;
    head: string;
    branch: string | null;
    stagedCount: number;
    unstagedCount: number;
    untrackedCount: number;
    untrackedBytes: number;
    isDirty: boolean;
};

export type CreatedWorktreeSnapshot = WorktreeSnapshotInspection & {
    worktreeRoot: string;
    sessionDirectory: string;
    branchName: string;
};

export class WorktreeSnapshotError extends Error {
    constructor(public readonly code: string, message: string) {
        super(message);
        this.name = 'WorktreeSnapshotError';
    }
}

async function git(cwd: string, args: string[]): Promise<string> {
    try {
        const result = await execFileAsync('git', args, {
            cwd,
            encoding: 'utf8',
            maxBuffer: 16 * 1024 * 1024,
            windowsHide: true,
        });
        return result.stdout;
    } catch (error) {
        const detail = error as { stderr?: string; message?: string };
        throw new WorktreeSnapshotError('git-failed', detail.stderr?.trim() || detail.message || 'Git command failed');
    }
}

async function gitOptional(cwd: string, args: string[]): Promise<string> {
    try {
        return await git(cwd, args);
    } catch (error) {
        if (error instanceof WorktreeSnapshotError && error.code === 'git-failed') return '';
        throw error;
    }
}

function splitNull(value: string): string[] {
    return value.split('\0').filter(Boolean);
}

function assertRepositoryRelative(path: string): void {
    if (isAbsolute(path) || path === '..' || path.startsWith(`..${sep}`)) {
        throw new WorktreeSnapshotError('unsafe-path', `Git returned an unsafe path: ${path}`);
    }
}

async function getUntrackedBytes(repositoryRoot: string, paths: string[]): Promise<number> {
    let total = 0;
    for (const path of paths) {
        assertRepositoryRelative(path);
        const info = await lstat(join(repositoryRoot, path));
        total += info.size;
    }
    return total;
}

async function assertSupportedRepositoryState(repositoryRoot: string): Promise<void> {
    const conflicts = splitNull(await git(repositoryRoot, ['ls-files', '-u', '-z']));
    if (conflicts.length > 0) {
        throw new WorktreeSnapshotError('conflicted-index', 'Resolve Git conflicts before creating a Worktree snapshot');
    }
    const sparse = (await gitOptional(repositoryRoot, ['config', '--bool', 'core.sparseCheckout'])).trim();
    if (sparse === 'true') {
        throw new WorktreeSnapshotError('sparse-checkout', 'Sparse checkouts are not supported by Worktree snapshots yet');
    }
    const gitDirectory = resolve(repositoryRoot, (await git(repositoryRoot, ['rev-parse', '--git-dir'])).trim());
    for (const marker of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-apply', 'rebase-merge']) {
        try {
            await lstat(join(gitDirectory, marker));
            throw new WorktreeSnapshotError('git-operation-in-progress', 'Finish the current Git operation before creating a Worktree snapshot');
        } catch (error) {
            if (error instanceof WorktreeSnapshotError) throw error;
        }
    }
}

export async function inspectWorktreeSnapshot(sourceDirectory: string): Promise<WorktreeSnapshotInspection> {
    const absoluteSource = resolve(sourceDirectory);
    const repositoryRoot = resolve((await git(absoluteSource, ['rev-parse', '--show-toplevel'])).trim());
    await assertSupportedRepositoryState(repositoryRoot);
    const commonGitDirectory = resolve(repositoryRoot, (await git(repositoryRoot, ['rev-parse', '--git-common-dir'])).trim());
    const primaryRepositoryRoot = dirname(commonGitDirectory);
    const head = (await git(repositoryRoot, ['rev-parse', 'HEAD'])).trim();
    const branchValue = (await git(repositoryRoot, ['branch', '--show-current'])).trim();
    const staged = splitNull(await git(repositoryRoot, ['diff', '--cached', '--name-only', '-z', 'HEAD']));
    const unstaged = splitNull(await git(repositoryRoot, ['diff', '--name-only', '-z']));
    const untracked = splitNull(await git(repositoryRoot, ['ls-files', '--others', '--exclude-standard', '-z']));

    return {
        sourceDirectory: absoluteSource,
        repositoryRoot,
        primaryRepositoryRoot,
        head,
        branch: branchValue || null,
        stagedCount: new Set(staged).size,
        unstagedCount: new Set(unstaged).size,
        untrackedCount: new Set(untracked).size,
        untrackedBytes: await getUntrackedBytes(repositoryRoot, [...new Set(untracked)]),
        isDirty: staged.length > 0 || unstaged.length > 0 || untracked.length > 0,
    };
}

async function digestPath(path: string): Promise<string> {
    try {
        const info = await lstat(path);
        if (info.isSymbolicLink()) {
            return `link:${await readlink(path)}`;
        }
        if (info.isDirectory()) {
            throw new WorktreeSnapshotError('nested-repository', `Cannot snapshot directory entry: ${path}`);
        }
        return createHash('sha256').update(await readFile(path)).digest('hex');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 'missing';
        throw error;
    }
}

async function copyOverlay(sourceRoot: string, targetRoot: string, paths: string[]): Promise<Map<string, string>> {
    const manifest = new Map<string, string>();
    for (const path of paths) {
        assertRepositoryRelative(path);
        const sourcePath = join(sourceRoot, path);
        const targetPath = join(targetRoot, path);
        const sourceDigest = await digestPath(sourcePath);
        manifest.set(path, sourceDigest);
        await rm(targetPath, { recursive: true, force: true });
        if (sourceDigest === 'missing') continue;
        await mkdir(dirname(targetPath), { recursive: true });
        await cp(sourcePath, targetPath, { recursive: true, force: true, preserveTimestamps: true });
    }
    return manifest;
}

async function verifyOverlay(sourceRoot: string, targetRoot: string, manifest: Map<string, string>): Promise<void> {
    for (const [path, expected] of manifest) {
        const sourceDigest = await digestPath(join(sourceRoot, path));
        const targetDigest = await digestPath(join(targetRoot, path));
        if (sourceDigest !== expected || targetDigest !== expected) {
            throw new WorktreeSnapshotError('source-changed', 'The source workspace changed while the Worktree snapshot was being created');
        }
    }
}

export async function cleanupWorktreeSnapshot(created: Pick<CreatedWorktreeSnapshot, 'primaryRepositoryRoot' | 'worktreeRoot' | 'branchName'>): Promise<void> {
    await git(created.primaryRepositoryRoot, ['worktree', 'remove', '--force', created.worktreeRoot]).catch(() => undefined);
    await git(created.primaryRepositoryRoot, ['branch', '-D', created.branchName]).catch(() => undefined);
}

export async function createWorktreeSnapshot(options: {
    sourceDirectory: string;
    inheritChanges: boolean;
}): Promise<CreatedWorktreeSnapshot> {
    const inspection = await inspectWorktreeSnapshot(options.sourceDirectory);
    const sourceSubdirectory = (await git(inspection.sourceDirectory, ['rev-parse', '--show-prefix']))
        .trim()
        .replace(/[\\/]$/, '');
    assertRepositoryRelative(sourceSubdirectory || '.');
    const suffix = randomUUID().slice(0, 8);
    const branchName = `happy/fork/${suffix}`;
    const worktreeRoot = join(inspection.primaryRepositoryRoot, MANAGED_WORKTREE_DIRECTORY, `fork-${suffix}`);
    const created: CreatedWorktreeSnapshot = {
        ...inspection,
        worktreeRoot,
        sessionDirectory: sourceSubdirectory ? join(worktreeRoot, sourceSubdirectory) : worktreeRoot,
        branchName,
    };

    try {
        await mkdir(dirname(worktreeRoot), { recursive: true });
        await git(inspection.primaryRepositoryRoot, ['worktree', 'add', '-b', branchName, worktreeRoot, inspection.head]);
        if (!options.inheritChanges || !inspection.isDirty) return created;

        const sourceIndexTree = (await git(inspection.repositoryRoot, ['write-tree'])).trim();
        const unstaged = splitNull(await git(inspection.repositoryRoot, ['diff', '--name-only', '-z']));
        const untracked = splitNull(await git(inspection.repositoryRoot, ['ls-files', '--others', '--exclude-standard', '-z']));
        // read-tree recreates the staged layer, including checkout filters.
        // Only overlay paths that differ from the index plus untracked files;
        // copying staged-only bytes can create false unstaged CRLF deltas.
        const overlayPaths = [...new Set([...unstaged, ...untracked])].sort();
        await git(worktreeRoot, ['read-tree', '--reset', '-u', sourceIndexTree]);
        const manifest = await copyOverlay(inspection.repositoryRoot, worktreeRoot, overlayPaths);
        await verifyOverlay(inspection.repositoryRoot, worktreeRoot, manifest);
        // read-tree populated the target index before the exact working-copy
        // bytes were overlaid. Refresh stat data so equivalent staged-only
        // files do not appear spuriously unstaged (notably with autocrlf).
        await gitOptional(worktreeRoot, ['update-index', '--refresh']);

        const sourceHeadAfter = (await git(inspection.repositoryRoot, ['rev-parse', 'HEAD'])).trim();
        const sourceIndexAfter = (await git(inspection.repositoryRoot, ['write-tree'])).trim();
        const sourceStatus = await git(inspection.repositoryRoot, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
        const targetStatus = await git(worktreeRoot, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
        if (sourceHeadAfter !== inspection.head || sourceIndexAfter !== sourceIndexTree || sourceStatus !== targetStatus) {
            throw new WorktreeSnapshotError(
                'source-changed',
                `The source workspace changed while the Worktree snapshot was being created (head=${sourceHeadAfter === inspection.head}, index=${sourceIndexAfter === sourceIndexTree}, sourceStatus=${JSON.stringify(sourceStatus)}, targetStatus=${JSON.stringify(targetStatus)})`,
            );
        }
        return created;
    } catch (error) {
        await cleanupWorktreeSnapshot(created);
        throw error;
    }
}
