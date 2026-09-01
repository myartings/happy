import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';
import {
    SavedProjectRegistry,
    SavedProjectRegistryCorruptError,
    SavedProjectRevisionConflictError,
    SavedProjectUnavailableError,
} from './savedProjectRegistry';

const roots: string[] = [];
const run = promisify(execFile);

afterEach(async () => {
    await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function fixture() {
    const root = await mkdtemp(join(tmpdir(), 'happy-saved-projects-'));
    roots.push(root);
    const registryFile = join(root, '.happy', 'projects.json');
    return {
        root,
        registryFile,
        registry: new SavedProjectRegistry({ registryFile, homeDir: root }),
    };
}

describe('SavedProjectRegistry', () => {
    it('returns a stable empty schema without creating a registry file', async () => {
        const { registry, registryFile } = await fixture();

        await expect(registry.list()).resolves.toEqual({
            schemaVersion: 1,
            revision: 0,
            projects: [],
        });
        await expect(readFile(registryFile, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it('adds a relative existing directory once and keeps its stable identity', async () => {
        const { root, registryFile } = await fixture();
        const projectPath = join(root, 'project-a');
        await mkdir(projectPath);
        const canonicalProjectPath = await realpath(projectPath);
        const registry = new SavedProjectRegistry({
            registryFile,
            homeDir: root,
            createId: () => '11111111-1111-4111-8111-111111111111',
            now: () => new Date('2026-09-01T00:00:00.000Z'),
        });

        const first = await registry.add({ path: 'project-a', expectedRevision: 0 });
        const duplicate = await registry.add({ path: './project-a', expectedRevision: 1 });

        expect(first).toMatchObject({
            created: true,
            project: {
                id: '11111111-1111-4111-8111-111111111111',
                name: 'project-a',
                primaryPath: canonicalProjectPath,
                canonicalPath: canonicalProjectPath,
                kind: 'directory',
                createdAt: '2026-09-01T00:00:00.000Z',
                updatedAt: '2026-09-01T00:00:00.000Z',
            },
            registry: { schemaVersion: 1, revision: 1 },
        });
        expect(duplicate).toEqual({ ...first, created: false });
        expect(JSON.parse(await readFile(registryFile, 'utf8'))).toEqual(first.registry);
    });

    it('collapses a Git child and linked worktree onto the primary repository identity', async () => {
        const { root, registryFile } = await fixture();
        const primary = join(root, 'primary');
        const child = join(primary, 'packages', 'app');
        const linked = join(root, 'linked');
        await mkdir(child, { recursive: true });
        await run('git', ['init', primary]);
        await run('git', ['-C', primary, 'config', 'user.email', 'saved-projects@example.test']);
        await run('git', ['-C', primary, 'config', 'user.name', 'Saved Projects Test']);
        await writeFile(join(primary, 'README.md'), 'fixture\n');
        await run('git', ['-C', primary, 'add', 'README.md']);
        await run('git', ['-C', primary, 'commit', '-m', 'fixture']);
        await run('git', ['-C', primary, 'worktree', 'add', '-b', 'linked-fixture', linked]);
        await mkdir(join(linked, 'nested'));
        const canonicalPrimary = await realpath(primary);
        const registry = new SavedProjectRegistry({
            registryFile,
            homeDir: root,
            createId: () => '22222222-2222-4222-8222-222222222222',
            now: () => new Date('2026-09-01T01:00:00.000Z'),
        });

        const fromChild = await registry.add({ path: child });
        const fromLinked = await registry.add({ path: join(linked, 'nested') });

        expect(fromChild.project).toMatchObject({
            kind: 'git',
            primaryPath: canonicalPrimary,
            canonicalPath: canonicalPrimary,
        });
        expect(fromLinked).toEqual({ ...fromChild, created: false });
    });

    it('resolves a symbolic-link input to the same canonical directory identity', async () => {
        const { root, registry } = await fixture();
        const target = join(root, 'target-project');
        const link = join(root, 'project-link');
        await mkdir(target);
        await symlink(target, link, process.platform === 'win32' ? 'junction' : 'dir');

        const fromLink = await registry.add({ path: link });
        const fromTarget = await registry.add({ path: target });

        expect(fromTarget).toEqual({ ...fromLink, created: false });
        expect(fromLink.project.canonicalPath).toBe(await realpath(target));
    });

    it('keeps a Git submodule as its own project instead of collapsing it into the parent', async () => {
        const { root, registry } = await fixture();
        const source = join(root, 'submodule-source');
        const parent = join(root, 'parent');
        await mkdir(source);
        await run('git', ['init', source]);
        await run('git', ['-C', source, 'config', 'user.email', 'saved-projects@example.test']);
        await run('git', ['-C', source, 'config', 'user.name', 'Saved Projects Test']);
        await writeFile(join(source, 'README.md'), 'submodule\n');
        await run('git', ['-C', source, 'add', 'README.md']);
        await run('git', ['-C', source, 'commit', '-m', 'submodule']);
        await mkdir(parent);
        await run('git', ['init', parent]);
        await run('git', ['-C', parent, 'config', 'user.email', 'saved-projects@example.test']);
        await run('git', ['-C', parent, 'config', 'user.name', 'Saved Projects Test']);
        await run('git', ['-c', 'protocol.file.allow=always', '-C', parent, 'submodule', 'add', source, 'modules/child']);

        const result = await registry.add({ path: join(parent, 'modules', 'child') });

        expect(result.project).toMatchObject({
            kind: 'git',
            primaryPath: await realpath(join(parent, 'modules', 'child')),
        });
    }, 15_000);

    it('rejects a directory with broken Git worktree metadata instead of saving it as a directory', async () => {
        const { root, registry } = await fixture();
        const broken = join(root, 'broken-worktree');
        await mkdir(broken);
        await writeFile(join(broken, '.git'), 'gitdir: ../missing-common/worktrees/broken\n');

        await expect(registry.add({ path: broken }))
            .rejects.toThrow('Cannot resolve Git project metadata');
        await expect(registry.list()).resolves.toEqual({
            schemaVersion: 1,
            revision: 0,
            projects: [],
        });
    });

    it('rejects a stale revision without changing registry bytes or leaving temp files', async () => {
        const { root, registryFile, registry } = await fixture();
        await mkdir(join(root, 'first'));
        await mkdir(join(root, 'second'));
        await registry.add({ path: 'first', expectedRevision: 0 });
        const before = await readFile(registryFile, 'utf8');

        await expect(registry.add({ path: 'second', expectedRevision: 0 }))
            .rejects.toBeInstanceOf(SavedProjectRevisionConflictError);

        expect(await readFile(registryFile, 'utf8')).toBe(before);
        expect((await readdir(join(root, '.happy'))).sort()).toEqual(['projects.json']);
    });

    it('preserves corrupt registry bytes and refuses both list and add', async () => {
        const { root, registryFile, registry } = await fixture();
        await mkdir(dirname(registryFile), { recursive: true });
        await mkdir(join(root, 'project'));
        const corrupt = '{"schemaVersion":1,"revision":"broken"}\n';
        await writeFile(registryFile, corrupt);

        await expect(registry.list()).rejects.toBeInstanceOf(SavedProjectRegistryCorruptError);
        await expect(registry.add({ path: 'project' })).rejects.toBeInstanceOf(SavedProjectRegistryCorruptError);
        expect(await readFile(registryFile, 'utf8')).toBe(corrupt);
    });

    it('treats relative paths and duplicate project IDs as corrupt without rewriting bytes', async () => {
        const { root, registryFile, registry } = await fixture();
        await mkdir(dirname(registryFile), { recursive: true });
        const absolute = join(root, 'project');
        const baseProject = {
            id: '44444444-4444-4444-8444-444444444444',
            name: 'project',
            primaryPath: absolute,
            canonicalPath: absolute,
            kind: 'directory',
            createdAt: '2026-09-01T00:00:00.000Z',
            updatedAt: '2026-09-01T00:00:00.000Z',
        };
        const corruptRegistries = [{
            schemaVersion: 1,
            revision: 1,
            projects: [{ ...baseProject, primaryPath: 'relative/project', canonicalPath: 'relative/project' }],
        }, {
            schemaVersion: 1,
            revision: 2,
            projects: [baseProject, {
                ...baseProject,
                name: 'other',
                primaryPath: join(root, 'other'),
                canonicalPath: join(root, 'other'),
            }],
        }];

        for (const value of corruptRegistries) {
            const bytes = `${JSON.stringify(value)}\n`;
            await writeFile(registryFile, bytes);
            await expect(registry.list()).rejects.toBeInstanceOf(SavedProjectRegistryCorruptError);
            expect(await readFile(registryFile, 'utf8')).toBe(bytes);
        }
    });

    it('fails closed when a selected project directory disappears before start', async () => {
        const { root, registry } = await fixture();
        const projectPath = join(root, 'project');
        await mkdir(projectPath);
        const added = await registry.add({ path: projectPath });
        await rm(projectPath, { recursive: true });

        await expect(registry.resolveProjectPath(added.project.id))
            .rejects.toBeInstanceOf(SavedProjectUnavailableError);
        await expect(registry.resolveProjectPath('33333333-3333-4333-8333-333333333333'))
            .rejects.toBeInstanceOf(SavedProjectUnavailableError);
    });

    it('fails closed when a saved directory is replaced by a symlink to another target', async () => {
        const { root, registry } = await fixture();
        const projectPath = join(root, 'project');
        const replacement = join(root, 'replacement');
        await mkdir(projectPath);
        await mkdir(replacement);
        const added = await registry.add({ path: projectPath });
        await rm(projectPath, { recursive: true });
        await symlink(replacement, projectPath, process.platform === 'win32' ? 'junction' : 'dir');

        await expect(registry.resolveProjectPath(added.project.id))
            .rejects.toBeInstanceOf(SavedProjectUnavailableError);
    });
});
