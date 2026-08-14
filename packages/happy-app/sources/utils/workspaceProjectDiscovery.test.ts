import { describe, expect, it, vi } from 'vitest';

import {
    WorkspaceProjectDiscoveryLoader,
    buildWorkspaceProjectSections,
    type ListWorkspaceProjectsResult,
} from './workspaceProjectDiscovery';

describe('buildWorkspaceProjectSections', () => {
    it('keeps Recent first and removes Windows-equivalent discovered paths', () => {
        const sections = buildWorkspaceProjectSections({
            recentPaths: [
                'C:\\Users\\dev\\workspace\\Happy\\',
                'C:\\Users\\dev\\workspace\\recent-only',
            ],
            discoveredProjects: [
                {
                    name: 'happy',
                    path: 'c:/users/dev/workspace/happy',
                    relativePath: 'happy',
                    markers: ['package.json'],
                    depth: 1,
                },
                {
                    name: 'new-project',
                    path: 'C:\\Users\\dev\\workspace\\new-project',
                    relativePath: 'new-project',
                    markers: ['Cargo.toml'],
                    depth: 1,
                },
            ],
            homeDir: 'C:\\Users\\dev',
            platform: 'win32',
            query: '',
        });

        expect(sections.recent.map((item) => item.path)).toEqual([
            'C:\\Users\\dev\\workspace\\Happy\\',
            'C:\\Users\\dev\\workspace\\recent-only',
        ]);
        expect(sections.workspaceProjects.map((item) => item.path)).toEqual([
            'C:\\Users\\dev\\workspace\\new-project',
        ]);
    });

    it.each([
        ['project name', 'compiler'],
        ['absolute path', '/home/dev/workspace/tools'],
        ['relative path', 'tools/compiler-kit'],
    ])('searches discovered projects by %s', (_label, query) => {
        const sections = buildWorkspaceProjectSections({
            recentPaths: ['/home/dev/workspace/recent'],
            discoveredProjects: [
                {
                    name: 'compiler-kit',
                    path: '/home/dev/workspace/tools/compiler-kit',
                    relativePath: 'tools/compiler-kit',
                    markers: ['Cargo.toml'],
                    depth: 2,
                },
                {
                    name: 'website',
                    path: '/home/dev/workspace/website',
                    relativePath: 'website',
                    markers: ['package.json'],
                    depth: 1,
                },
            ],
            homeDir: '/home/dev',
            platform: 'unix',
            query,
        });

        expect(sections.workspaceProjects.map((item) => item.name)).toEqual(['compiler-kit']);
        expect(sections.recent.map((item) => item.name)).toEqual(['recent']);
    });

    it('keeps differently cased Unix paths distinct', () => {
        const sections = buildWorkspaceProjectSections({
            recentPaths: ['/home/dev/workspace/Happy'],
            discoveredProjects: [{
                name: 'happy',
                path: '/home/dev/workspace/happy',
                relativePath: 'happy',
                markers: ['package.json'],
                depth: 1,
            }],
            homeDir: '/home/dev',
            platform: 'unix',
            query: '',
        });

        expect(sections.workspaceProjects).toHaveLength(1);
    });

    it.each([
        {
            label: 'Unix',
            platform: 'unix' as const,
            homeDir: '/home/dev',
            discoveredPath: '/home/dev/workspace/happy',
        },
        {
            label: 'Windows',
            platform: 'win32' as const,
            homeDir: 'C:\\Users\\dev',
            discoveredPath: 'C:\\Users\\dev\\workspace\\happy',
        },
    ])('expands a home-relative Recent path before $label deduplication', ({ platform, homeDir, discoveredPath }) => {
        const sections = buildWorkspaceProjectSections({
            recentPaths: ['~/workspace/happy'],
            discoveredProjects: [{
                name: 'happy',
                path: discoveredPath,
                relativePath: 'happy',
                markers: ['package.json'],
                depth: 1,
            }],
            homeDir,
            platform,
            query: '',
        });

        expect(sections.workspaceProjects).toEqual([]);
    });
});

describe('WorkspaceProjectDiscoveryLoader', () => {
    it('rejects a late response after a different Machine starts loading', async () => {
        const resolvers = new Map<string, (result: ListWorkspaceProjectsResult) => void>();
        const request = (machineId: string) => new Promise<ListWorkspaceProjectsResult>((resolve) => {
            resolvers.set(machineId, resolve);
        });
        const loader = new WorkspaceProjectDiscoveryLoader({ request, timeoutMs: 10_000 });

        const first = loader.load('machine-a');
        const second = loader.load('machine-b');
        resolvers.get('machine-a')?.({ root: '/a', projects: [], scannedAt: 1, truncated: false });
        resolvers.get('machine-b')?.({ root: '/b', projects: [], scannedAt: 2, truncated: false });

        await expect(first).resolves.toBeNull();
        await expect(second).resolves.toEqual({
            status: 'ready',
            result: { root: '/b', projects: [], scannedAt: 2, truncated: false },
        });
    });

    it('reuses a fresh result for the same Machine', async () => {
        let now = 1_000;
        const result = { root: '/workspace', projects: [], scannedAt: 1, truncated: false };
        const request = vi.fn().mockResolvedValue(result);
        const loader = new WorkspaceProjectDiscoveryLoader({
            request,
            cacheMs: 45_000,
            now: () => now,
        });

        await expect(loader.load('machine-a')).resolves.toEqual({ status: 'ready', result });
        now += 30_000;
        await expect(loader.load('machine-a')).resolves.toEqual({ status: 'ready', result });

        expect(request).toHaveBeenCalledTimes(1);
    });

    it('turns an RPC failure into a non-blocking unavailable outcome', async () => {
        const loader = new WorkspaceProjectDiscoveryLoader({
            request: vi.fn().mockRejectedValue(new Error('Method not found')),
        });

        await expect(loader.load('old-daemon')).resolves.toEqual({ status: 'unavailable' });
    });

    it('rejects a resolved encrypted handler-error response without caching it', async () => {
        const request = vi.fn().mockResolvedValue({ error: 'Permission denied' });
        const loader = new WorkspaceProjectDiscoveryLoader({ request });

        await expect(loader.load('machine-a')).resolves.toEqual({ status: 'unavailable' });
        await expect(loader.load('machine-a')).resolves.toEqual({ status: 'unavailable' });

        expect(request).toHaveBeenCalledTimes(2);
    });

    it('turns a caller timeout into a non-blocking unavailable outcome', async () => {
        vi.useFakeTimers();
        const loader = new WorkspaceProjectDiscoveryLoader({
            request: () => new Promise(() => {}),
            timeoutMs: 3_000,
        });

        const outcome = loader.load('slow-machine');
        await vi.advanceTimersByTimeAsync(3_000);
        await expect(outcome).resolves.toEqual({ status: 'unavailable' });
        vi.useRealTimers();
    });
});
