export type CodexFirstSearchTarget =
    | { kind: 'route'; route: string }
    | { kind: 'session'; sessionId: string };

export type CodexFirstSearchEntry = {
    category: string;
    icon: string;
    id: string;
    kind: 'destination' | 'machine' | 'project' | 'session';
    subtitle?: string;
    target: CodexFirstSearchTarget;
    title: string;
};

export type CodexFirstSearchDestination = {
    id: string;
    icon: string;
    route: string;
    subtitle?: string;
    title: string;
};

export type CodexFirstSearchMachine = {
    id: string;
    name: string;
    platform?: string | null;
};

export type CodexFirstSearchSession = {
    id: string;
    machineId?: string | null;
    machineName?: string | null;
    path?: string | null;
    projectPath?: string | null;
    projectName?: string | null;
    title: string;
    updatedAt: number;
};

type BuildCodexFirstSearchEntriesInput = {
    categories: {
        destinations: string;
        machines: string;
        projects: string;
        sessions: string;
    };
    destinations: readonly CodexFirstSearchDestination[];
    machines: readonly CodexFirstSearchMachine[];
    sessions: readonly CodexFirstSearchSession[];
};

function compactSubtitle(parts: Array<string | null | undefined>): string | undefined {
    const seen = new Set<string>();
    const compact = parts.flatMap((part) => {
        const value = part?.trim();
        if (!value || seen.has(value)) return [];
        seen.add(value);
        return [value];
    });
    return compact.length > 0 ? compact.join(' · ') : undefined;
}

export function buildCodexFirstSearchEntries({
    categories,
    destinations,
    machines,
    sessions,
}: BuildCodexFirstSearchEntriesInput): CodexFirstSearchEntry[] {
    const destinationEntries = destinations.map<CodexFirstSearchEntry>((destination) => ({
        category: categories.destinations,
        icon: destination.icon,
        id: `destination-${destination.id}`,
        kind: 'destination',
        subtitle: destination.subtitle,
        target: { kind: 'route', route: destination.route },
        title: destination.title,
    }));

    const sortedSessions = [...sessions].sort((left, right) => (
        right.updatedAt - left.updatedAt || left.id.localeCompare(right.id)
    ));
    const sessionEntries = sortedSessions.map<CodexFirstSearchEntry>((session) => ({
        category: categories.sessions,
        icon: 'chatbubble-outline',
        id: `session-${session.id}`,
        kind: 'session',
        subtitle: compactSubtitle([session.projectName, session.path, session.machineName]),
        target: { kind: 'session', sessionId: session.id },
        title: session.title,
    }));

    const projects = new Map<string, CodexFirstSearchEntry>();
    for (const session of sortedSessions) {
        const projectName = session.projectName?.trim();
        const path = session.projectPath?.trim() || session.path?.trim();
        if (!projectName || !path) continue;
        const machineKey = session.machineId?.trim() || 'unknown';
        const key = `${machineKey}:${path}`;
        if (projects.has(key)) continue;
        projects.set(key, {
            category: categories.projects,
            icon: 'folder-outline',
            id: `project-${key}`,
            kind: 'project',
            subtitle: compactSubtitle([path, session.machineName]),
            target: { kind: 'session', sessionId: session.id },
            title: projectName,
        });
    }

    const machineEntries = [...machines]
        .sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id))
        .map<CodexFirstSearchEntry>((machine) => ({
            category: categories.machines,
            icon: 'desktop-outline',
            id: `machine-${machine.id}`,
            kind: 'machine',
            subtitle: machine.platform?.trim() || undefined,
            target: { kind: 'route', route: '/settings/agents' },
            title: machine.name,
        }));

    return [
        ...destinationEntries,
        ...sessionEntries,
        ...projects.values(),
        ...machineEntries,
    ];
}
