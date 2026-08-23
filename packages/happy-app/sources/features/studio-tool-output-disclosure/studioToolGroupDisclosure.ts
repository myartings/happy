import type { Message } from '@/sync/typesMessage';

export type StudioToolGroupMetrics = Readonly<{
    durationMs: number | null;
    failureCount: number;
}>;

export function resolveStudioToolGroupMetrics(messages: readonly Message[]): StudioToolGroupMetrics {
    const tools = messages
        .filter((message) => message.kind === 'tool-call')
        .map((message) => message.tool);
    const failureCount = tools.filter((tool) => tool.state === 'error').length;
    const completedTools = tools.filter((tool) => tool.completedAt !== null);

    if (tools.length === 0 || completedTools.length !== tools.length) {
        return { durationMs: null, failureCount };
    }

    const startedAt = Math.min(...tools.map((tool) => tool.startedAt ?? tool.createdAt));
    const completedAt = Math.max(...completedTools.map((tool) => tool.completedAt as number));
    return {
        durationMs: Math.max(0, completedAt - startedAt),
        failureCount,
    };
}
