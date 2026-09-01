import { describe, expect, it } from 'vitest';

import { resolveCodexFirstDesktopContract } from './codexFirstDesktopContract';
import {
    isCodexFirstDestinationSelected,
    projectCodexFirstSidebarDestinations,
} from './codexFirstSidebarNavigation';

describe('projectCodexFirstSidebarDestinations', () => {
    it('projects enabled Happy routes in the accepted Codex-first order', () => {
        const contract = resolveCodexFirstDesktopContract({
            hostPlatform: 'macos',
            isTauriRuntime: true,
        });

        expect(projectCodexFirstSidebarDestinations({
            contract,
            githubIssuesEnabled: true,
            projectTodosEnabled: true,
        })).toEqual([
            { icon: 'create-outline', id: 'new-session', route: '/new' },
            { icon: 'checkbox-outline', id: 'tasks', route: '/project-todos' },
            { icon: 'git-network-outline', id: 'issues', route: '/github-issues' },
            { icon: 'sparkles-outline', id: 'artifacts', route: '/artifacts' },
            { icon: 'desktop-outline', id: 'machines-agents', route: '/settings/agents' },
        ]);
    });

    it('derives selection from existing nested routes without changing routing', () => {
        expect(isCodexFirstDestinationSelected('new-session', '/new')).toBe(true);
        expect(isCodexFirstDestinationSelected('tasks', '/project-todos')).toBe(true);
        expect(isCodexFirstDestinationSelected('issues', '/github-issues/42')).toBe(true);
        expect(isCodexFirstDestinationSelected('artifacts', '/artifacts/example')).toBe(true);
        expect(isCodexFirstDestinationSelected('machines-agents', '/machine/host-1')).toBe(true);
        expect(isCodexFirstDestinationSelected('machines-agents', '/settings/agents')).toBe(true);
        expect(isCodexFirstDestinationSelected('new-session', '/session/abc')).toBe(false);
    });
});
