import type { PromptHistoryItem } from '@/sync/promptHistory';
import type { Session } from '@/sync/storageTypes';

export type PromptHistoryEntry = PromptHistoryItem & {
    session: Session;
    sessionName: string;
    project: string;
    agent: string;
};

export type PromptHistoryGroup = {
    id: string;
    session: Session;
    sessionName: string;
    project: string;
    agent: string;
    dateKey: string;
    latestAt: number;
    prompts: PromptHistoryEntry[];
};

function basename(path: string): string {
    return path.replace(/[\\/]+$/, '').split(/[\\/]/).pop() || path;
}

export function getPromptHistoryAgent(session: Session): string {
    const flavor = session.metadata?.flavor?.toLowerCase();
    if (flavor === 'codex' || flavor === 'openai' || flavor === 'gpt') return 'Codex';
    if (flavor === 'claude') return 'Claude';
    if (flavor === 'gemini') return 'Gemini';
    if (flavor === 'openclaw') return 'OpenClaw';
    if (flavor === 'agy') return 'Agy';
    return flavor ? flavor[0].toUpperCase() + flavor.slice(1) : 'Agent';
}

export function enrichPromptHistoryItems(
    items: readonly PromptHistoryItem[],
    sessions: Readonly<Record<string, Session>>,
): PromptHistoryEntry[] {
    return items.flatMap((item) => {
        const session = sessions[item.sessionId];
        if (!session) return [];
        return [{
            ...item,
            session,
            sessionName: session.metadata?.summary?.text ?? session.metadata?.name ?? 'New chat',
            project: session.metadata?.project?.name
                ?? (session.metadata?.path ? basename(session.metadata.path) : session.metadata?.host ?? 'Unknown'),
            agent: getPromptHistoryAgent(session),
        }];
    });
}

export function filterPromptHistoryEntries(
    entries: readonly PromptHistoryEntry[],
    query: string,
    project: string | null,
    agent: string | null,
): PromptHistoryEntry[] {
    const needle = query.trim().toLocaleLowerCase();
    return entries.filter((entry) => {
        if (project && entry.project !== project) return false;
        if (agent && entry.agent !== agent) return false;
        if (!needle) return true;
        return [entry.text, entry.sessionName, entry.project, entry.agent]
            .some((value) => value.toLocaleLowerCase().includes(needle));
    });
}

export function groupPromptHistoryEntries(entries: readonly PromptHistoryEntry[]): PromptHistoryGroup[] {
    const groups = new Map<string, PromptHistoryGroup>();

    for (const entry of entries) {
        const dateKey = new Date(entry.createdAt).toDateString();
        const id = `${dateKey}:${entry.sessionId}`;
        const existing = groups.get(id);
        if (existing) {
            existing.prompts.push(entry);
            existing.latestAt = Math.max(existing.latestAt, entry.createdAt);
            continue;
        }
        groups.set(id, {
            id,
            session: entry.session,
            sessionName: entry.sessionName,
            project: entry.project,
            agent: entry.agent,
            dateKey,
            latestAt: entry.createdAt,
            prompts: [entry],
        });
    }

    return Array.from(groups.values())
        .map((group) => ({
            ...group,
            prompts: group.prompts.slice().sort((left, right) => left.createdAt - right.createdAt),
        }))
        .sort((left, right) => right.latestAt - left.latestAt);
}
