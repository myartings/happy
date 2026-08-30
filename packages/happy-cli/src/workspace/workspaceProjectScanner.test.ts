import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { listWorkspaceProjects } from './workspaceProjectScanner';

const temporaryRoots: string[] = [];

async function createWorkspace(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'happy-workspace-projects-'));
    temporaryRoots.push(root);
    return root;
}

afterEach(async () => {
    await Promise.all(temporaryRoots.splice(0).map((root) => (
        rm(root, { recursive: true, force: true })
    )));
});

describe('listWorkspaceProjects', () => {
    it('discovers a marked project beneath the workspace root', async () => {
        const root = await createWorkspace();
        const project = join(root, 'alpha');
        await mkdir(project);
        await writeFile(join(project, 'package.json'), '{}');

        const result = await listWorkspaceProjects({ root });

        expect(result.root).toBe(root);
        expect(result.truncated).toBe(false);
        expect(result.projects).toEqual([{
            name: 'alpha',
            path: project,
            relativePath: 'alpha',
            markers: ['package.json'],
            depth: 1,
        }]);
        expect(result.scannedAt).toEqual(expect.any(Number));
    });

    it('discovers recognized projects through the configured depth in deterministic order', async () => {
        const root = await createWorkspace();
        const shallowProject = join(root, 'zeta');
        const nestedProject = join(root, 'group', 'alpha');
        await mkdir(join(shallowProject, '.git'), { recursive: true });
        await mkdir(nestedProject, { recursive: true });
        await writeFile(join(nestedProject, 'Cargo.toml'), '[package]');

        const result = await listWorkspaceProjects({ root, maxDepth: 2 });

        expect(result.projects).toEqual([
            {
                name: 'alpha',
                path: nestedProject,
                relativePath: join('group', 'alpha'),
                markers: ['Cargo.toml'],
                depth: 2,
            },
            {
                name: 'zeta',
                path: shallowProject,
                relativePath: 'zeta',
                markers: ['.git'],
                depth: 1,
            },
        ]);
    });

    it('treats a recognized project as a leaf instead of emitting nested packages', async () => {
        const root = await createWorkspace();
        const project = join(root, 'monorepo');
        const nestedPackage = join(project, 'packages', 'child');
        await mkdir(nestedPackage, { recursive: true });
        await writeFile(join(project, 'package.json'), '{}');
        await writeFile(join(nestedPackage, 'package.json'), '{}');

        const result = await listWorkspaceProjects({ root, maxDepth: 3 });

        expect(result.projects.map((item) => item.relativePath)).toEqual(['monorepo']);
    });

    it('does not traverse beyond max depth or into skipped directories', async () => {
        const root = await createWorkspace();
        const visibleProject = join(root, 'group', 'visible');
        const tooDeepProject = join(root, 'group', 'nested', 'hidden');
        const dependencyProject = join(root, 'node_modules', 'dependency');
        await mkdir(visibleProject, { recursive: true });
        await mkdir(tooDeepProject, { recursive: true });
        await mkdir(dependencyProject, { recursive: true });
        await writeFile(join(visibleProject, 'go.mod'), 'module visible');
        await writeFile(join(tooDeepProject, 'go.mod'), 'module hidden');
        await writeFile(join(dependencyProject, 'package.json'), '{}');

        const result = await listWorkspaceProjects({ root, maxDepth: 2 });

        expect(result.projects.map((project) => project.name)).toEqual(['visible']);
    });

    it('limits returned projects and reports truncation', async () => {
        const root = await createWorkspace();
        for (const name of ['charlie', 'alpha', 'bravo']) {
            const project = join(root, name);
            await mkdir(project);
            await writeFile(join(project, 'pyproject.toml'), '[project]');
        }

        const result = await listWorkspaceProjects({ root, maxProjects: 2 });

        expect(result.projects.map((project) => project.name)).toEqual(['alpha', 'bravo']);
        expect(result.truncated).toBe(true);
    });

    it('applies a search query before the matching-project limit', async () => {
        const root = await createWorkspace();
        for (const name of ['charlie', 'alpha', 'bravo']) {
            const project = join(root, name);
            await mkdir(project);
            await writeFile(join(project, 'pyproject.toml'), '[project]');
        }

        const result = await listWorkspaceProjects({
            root,
            maxProjects: 2,
            query: 'charlie',
        });

        expect(result.projects.map((project) => project.name)).toEqual(['charlie']);
        expect(result.truncated).toBe(false);
    });

    it('recognizes a Unity project from its canonical directory structure', async () => {
        const root = await createWorkspace();
        const project = join(root, 'unity-game');
        await mkdir(join(project, 'Assets'), { recursive: true });
        await mkdir(join(project, 'ProjectSettings'), { recursive: true });

        const result = await listWorkspaceProjects({ root });

        expect(result.projects).toEqual([expect.objectContaining({
            name: 'unity-game',
            markers: ['Assets/', 'ProjectSettings/', 'unity-project'],
        })]);
    });

    it('returns an empty result when the conventional workspace root is missing', async () => {
        const root = join(tmpdir(), `happy-missing-workspace-${Date.now()}`);

        const result = await listWorkspaceProjects({ root });

        expect(result).toMatchObject({ root, projects: [], truncated: false });
    });
});
