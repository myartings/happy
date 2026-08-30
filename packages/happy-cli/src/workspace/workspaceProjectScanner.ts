import { readdir } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';

const EXACT_MARKERS = new Set([
    '.git',
    'package.json',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'Package.swift',
]);

const GLOB_MARKERS = [
    /\.xcodeproj$/i,
    /\.xcworkspace$/i,
    /\.sln$/i,
    /\.uproject$/i,
];

export const MAX_WORKSPACE_PROJECT_QUERY_LENGTH = 256;

const SKIP_DIRECTORIES = new Set([
    '.git',
    'node_modules',
    '.venv',
    'venv',
    '__pycache__',
    '.next',
    '.turbo',
    'Library',
    'Temp',
    'Binaries',
    'Intermediate',
    'DerivedData',
    '.gradle',
    'target',
    'build',
    'dist',
]);

export type WorkspaceProject = {
    name: string;
    path: string;
    relativePath: string;
    markers: string[];
    depth: number;
};

export type ListWorkspaceProjectsResult = {
    root: string;
    projects: WorkspaceProject[];
    scannedAt: number;
    truncated: boolean;
};

export async function listWorkspaceProjects({
    root,
    maxDepth = 3,
    maxProjects = 200,
    query,
}: {
    root: string;
    maxDepth?: number;
    maxProjects?: number;
    query?: string;
}): Promise<ListWorkspaceProjectsResult> {
    const projects: WorkspaceProject[] = [];
    const resolvedRoot = resolve(root);
    const normalizedQuery = query
        ?.trim()
        .slice(0, MAX_WORKSPACE_PROJECT_QUERY_LENGTH)
        .toLocaleLowerCase() ?? '';
    const pending = [{ path: resolvedRoot, depth: 0 }];

    while (pending.length > 0) {
        const current = pending.pop()!;
        let entries;
        try {
            entries = await readdir(current.path, { withFileTypes: true });
        } catch (error) {
            if (current.depth === 0 && (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ENOENT')) {
                throw error;
            }
            continue;
        }

        if (current.depth > 0) {
            const markers = entries
                .map((entry) => entry.name)
                .filter((name) => EXACT_MARKERS.has(name) || GLOB_MARKERS.some((pattern) => pattern.test(name)));
            const hasUnityAssets = entries.some((entry) => entry.name === 'Assets' && entry.isDirectory());
            const hasUnitySettings = entries.some((entry) => entry.name === 'ProjectSettings' && entry.isDirectory());
            if (hasUnityAssets && hasUnitySettings) {
                markers.push('Assets/', 'ProjectSettings/', 'unity-project');
            }
            markers.sort((left, right) => left.localeCompare(right));

            if (markers.length > 0) {
                const project = {
                    name: basename(current.path),
                    path: current.path,
                    relativePath: relative(resolvedRoot, current.path),
                    markers,
                    depth: current.depth,
                };
                if (
                    !normalizedQuery
                    || project.name.toLocaleLowerCase().includes(normalizedQuery)
                    || project.path.toLocaleLowerCase().includes(normalizedQuery)
                    || project.relativePath.toLocaleLowerCase().includes(normalizedQuery)
                ) {
                    projects.push(project);
                    if (projects.length > maxProjects) break;
                }
                continue;
            }
        }

        if (current.depth >= maxDepth) continue;

        const directories = entries
            .filter((entry) => entry.isDirectory() && !SKIP_DIRECTORIES.has(entry.name))
            .sort((left, right) => right.name.localeCompare(left.name));
        for (const directory of directories) {
            pending.push({
                path: join(current.path, directory.name),
                depth: current.depth + 1,
            });
        }
    }

    projects.sort((left, right) => (
        left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
        || left.path.localeCompare(right.path)
    ));
    const truncated = projects.length > maxProjects;

    return {
        root: resolvedRoot,
        projects: projects.slice(0, maxProjects),
        scannedAt: Date.now(),
        truncated,
    };
}
