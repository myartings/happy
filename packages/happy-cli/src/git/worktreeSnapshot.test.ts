import { afterEach, describe, expect, it } from 'vitest';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import {
    cleanupWorktreeSnapshot,
    createWorktreeSnapshot,
    inspectWorktreeSnapshot,
} from './worktreeSnapshot';

const execFileAsync = promisify(execFile);
const roots: string[] = [];

async function git(cwd: string, ...args: string[]): Promise<string> {
    const result = await execFileAsync('git', args, { cwd, encoding: 'utf8' });
    return result.stdout.trim();
}

async function createRepo(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'happy-worktree-snapshot-'));
    roots.push(root);
    await git(root, 'init');
    await git(root, 'config', 'user.email', 'test@happy.local');
    await git(root, 'config', 'user.name', 'Happy Test');
    await writeFile(join(root, '.gitignore'), '.dev/worktree/\nignored.txt\n');
    await writeFile(join(root, 'staged.txt'), 'base staged\n');
    await writeFile(join(root, 'mixed.txt'), 'base mixed\n');
    await writeFile(join(root, 'deleted.txt'), 'remove me\n');
    await git(root, 'add', '.');
    await git(root, 'commit', '-m', 'base');
    return root;
}

afterEach(async () => {
    for (const root of roots.splice(0)) {
        await rm(root, { recursive: true, force: true });
    }
});

describe('worktreeSnapshot', () => {
    it('inspects staged, unstaged, and non-ignored untracked changes', async () => {
        const root = await createRepo();
        await writeFile(join(root, 'staged.txt'), 'staged change\n');
        await git(root, 'add', 'staged.txt');
        await writeFile(join(root, 'mixed.txt'), 'unstaged change\n');
        await writeFile(join(root, 'new.txt'), 'new file\n');
        await writeFile(join(root, 'ignored.txt'), 'secret\n');

        const inspection = await inspectWorktreeSnapshot(root);

        expect(inspection).toMatchObject({
            stagedCount: 1,
            unstagedCount: 1,
            untrackedCount: 1,
            isDirty: true,
        });
        expect(inspection.untrackedBytes).toBe(Buffer.byteLength('new file\n'));
    });

    it('recreates the exact staged, unstaged, deleted, and untracked layers without touching the source', async () => {
        const root = await createRepo();
        await mkdir(join(root, 'nested'));
        await writeFile(join(root, 'staged.txt'), 'staged change\n');
        await git(root, 'add', 'staged.txt');
        await git(root, 'mv', 'staged.txt', 'renamed.txt');
        await writeFile(join(root, 'mixed.txt'), 'staged version\n');
        await git(root, 'add', 'mixed.txt');
        await writeFile(join(root, 'mixed.txt'), 'working version\n');
        await rm(join(root, 'deleted.txt'));
        await writeFile(join(root, 'nested', 'new.bin'), Buffer.from([0, 1, 2, 255]));
        await writeFile(join(root, 'ignored.txt'), 'do not copy\n');

        const sourceStatus = await git(root, 'status', '--porcelain=v1', '--untracked-files=all');
        const sourceHead = await git(root, 'rev-parse', 'HEAD');
        const created = await createWorktreeSnapshot({
            sourceDirectory: root,
            inheritChanges: true,
        });

        expect(await git(root, 'rev-parse', 'HEAD')).toBe(sourceHead);
        expect(await git(root, 'status', '--porcelain=v1', '--untracked-files=all')).toBe(sourceStatus);
        expect(await git(created.worktreeRoot, 'status', '--porcelain=v1', '--untracked-files=all')).toBe(sourceStatus);
        expect(await readFile(join(created.worktreeRoot, 'mixed.txt'), 'utf8')).toBe('working version\n');
        expect((await readFile(join(created.worktreeRoot, 'renamed.txt'), 'utf8')).replace(/\r\n/g, '\n')).toBe('staged change\n');
        await expect(readFile(join(created.worktreeRoot, 'staged.txt'))).rejects.toThrow();
        expect(await readFile(join(created.worktreeRoot, 'nested', 'new.bin'))).toEqual(Buffer.from([0, 1, 2, 255]));
        await expect(readFile(join(created.worktreeRoot, 'ignored.txt'))).rejects.toThrow();

        await cleanupWorktreeSnapshot(created);
        expect(await git(root, 'branch', '--list', created.branchName)).toBe('');
    });

    it('creates a clean worktree from HEAD when inheritance is disabled', async () => {
        const root = await createRepo();
        await writeFile(join(root, 'mixed.txt'), 'dirty\n');

        const created = await createWorktreeSnapshot({
            sourceDirectory: root,
            inheritChanges: false,
        });

        expect(await git(created.worktreeRoot, 'status', '--porcelain=v1', '--untracked-files=all')).toBe('');
        expect((await readFile(join(created.worktreeRoot, 'mixed.txt'), 'utf8')).replace(/\r\n/g, '\n')).toBe('base mixed\n');
        await cleanupWorktreeSnapshot(created);
    });

    it('returns the matching subdirectory inside the new worktree', async () => {
        const root = await createRepo();
        await mkdir(join(root, 'packages', 'app'), { recursive: true });

        const created = await createWorktreeSnapshot({
            sourceDirectory: join(root, 'packages', 'app'),
            inheritChanges: false,
        });

        expect(created.sessionDirectory).toBe(join(created.worktreeRoot, 'packages', 'app'));
        await cleanupWorktreeSnapshot(created);
    });
});
