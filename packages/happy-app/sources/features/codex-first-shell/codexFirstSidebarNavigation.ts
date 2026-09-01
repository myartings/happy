import type {
    CodexFirstDesktopContract,
    CodexFirstDestination,
} from './codexFirstDesktopContract';

export type CodexFirstSidebarDestination = {
    icon: 'checkbox-outline' | 'create-outline' | 'desktop-outline' | 'git-network-outline' | 'sparkles-outline';
    id: CodexFirstDestination['id'];
    route: '/artifacts' | '/github-issues' | '/new' | '/project-todos' | '/settings/agents';
};

type ProjectCodexFirstSidebarDestinationsInput = {
    contract: CodexFirstDesktopContract;
    githubIssuesEnabled: boolean;
    projectTodosEnabled: boolean;
};

const DESTINATION_PRESENTATION: Record<
    CodexFirstDestination['id'],
    Omit<CodexFirstSidebarDestination, 'id'>
> = {
    'new-session': { icon: 'create-outline', route: '/new' },
    tasks: { icon: 'checkbox-outline', route: '/project-todos' },
    issues: { icon: 'git-network-outline', route: '/github-issues' },
    artifacts: { icon: 'sparkles-outline', route: '/artifacts' },
    'machines-agents': { icon: 'desktop-outline', route: '/settings/agents' },
};

export function projectCodexFirstSidebarDestinations({
    contract,
    githubIssuesEnabled,
    projectTodosEnabled,
}: ProjectCodexFirstSidebarDestinationsInput): CodexFirstSidebarDestination[] {
    if (!contract.enabled) return [];

    return contract.navigation.destinations
        .filter((destination) => {
            if (destination.availability === 'github-issues') return githubIssuesEnabled;
            if (destination.availability === 'project-todos') return projectTodosEnabled;
            return true;
        })
        .map((destination) => ({
            id: destination.id,
            ...DESTINATION_PRESENTATION[destination.id],
        }));
}

export function isCodexFirstDestinationSelected(
    destinationId: CodexFirstDestination['id'],
    pathname: string,
): boolean {
    switch (destinationId) {
        case 'new-session':
            return pathname === '/new' || pathname.startsWith('/new/');
        case 'tasks':
            return pathname === '/project-todos' || pathname.startsWith('/project-todos/');
        case 'issues':
            return pathname === '/github-issues' || pathname.startsWith('/github-issues/');
        case 'artifacts':
            return pathname === '/artifacts' || pathname.startsWith('/artifacts/');
        case 'machines-agents':
            return pathname === '/settings/agents'
                || pathname.startsWith('/settings/agents/')
                || pathname === '/machine'
                || pathname.startsWith('/machine/');
    }
}
