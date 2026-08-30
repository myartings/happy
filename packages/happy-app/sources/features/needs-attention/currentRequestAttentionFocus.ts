import {
    selectPendingCommunications,
    shouldUseAgentQuestionFallback,
} from '@/sync/agentCommunications';
import type { AgentState } from '@/sync/storageTypes';
import type { Message } from '@/sync/typesMessage';
import {
    deriveCurrentSessionAttention,
    type CurrentAttentionReason,
} from './currentRequestAttention';

export type CurrentRequestAttentionFocusHint = Pick<
    CurrentAttentionReason,
    'kind' | 'sourceId' | 'observedAgentStateVersion'
>;

export type CurrentRequestAttentionFocus =
    | { kind: 'general' }
    | { kind: 'tool'; toolUseId: string }
    | { kind: 'communication'; sourceId: string };

export function parseCurrentRequestAttentionRouteVersion(
    value: unknown,
): number | undefined {
    if (typeof value !== 'string' || !/^(0|[1-9]\d*)$/.test(value)) return undefined;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function resolveCurrentRequestAttentionMessageId(
    messages: readonly Message[],
    focus: CurrentRequestAttentionFocus,
): string | undefined {
    if (focus.kind !== 'tool') return undefined;
    return messages.find((message) => (
        message.kind === 'tool-call' && message.tool.callId === focus.toolUseId
    ))?.id;
}

export function resolveCurrentRequestAttentionFocus(
    session: { agentStateVersion: number; agentState: AgentState | null },
    hint: CurrentRequestAttentionFocusHint,
): CurrentRequestAttentionFocus {
    const observedVersion = hint.observedAgentStateVersion;
    if (
        !Number.isSafeInteger(observedVersion)
        || observedVersion === undefined
        || observedVersion < 0
        || session.agentStateVersion !== observedVersion
    ) {
        return { kind: 'general' };
    }

    const projection = deriveCurrentSessionAttention(session.agentState, session.agentStateVersion);
    const stillCurrent = projection?.reasons.some((reason) => (
        reason.kind === hint.kind && reason.sourceId === hint.sourceId
    ));
    if (!stillCurrent || !session.agentState) return { kind: 'general' };

    if (hint.kind === 'permission_required') {
        const request = session.agentState.requests?.[hint.sourceId];
        if (!request || session.agentState.completedRequests?.[hint.sourceId]) return { kind: 'general' };
        const toolUseId = request.toolUseId?.trim() || hint.sourceId.trim();
        return toolUseId ? { kind: 'tool', toolUseId } : { kind: 'general' };
    }

    const communication = selectPendingCommunications(session.agentState)
        .find((item) => item.id === hint.sourceId);
    if (!communication) return { kind: 'general' };
    const toolUseId = communication.toolUseId?.trim();
    if (toolUseId) return { kind: 'tool', toolUseId };
    if (shouldUseAgentQuestionFallback(communication)) {
        return { kind: 'communication', sourceId: communication.id };
    }
    const legacyToolUseId = communication.id.trim();
    return legacyToolUseId
        ? { kind: 'tool', toolUseId: legacyToolUseId }
        : { kind: 'general' };
}
