import { selectPendingCommunications } from '@/sync/agentCommunications';
import type { AgentState } from '@/sync/storageTypes';

export type CurrentAttentionReasonKind = 'permission_required' | 'answer_required';

export interface CurrentAttentionReason {
    kind: CurrentAttentionReasonKind;
    sourceId: string;
    observedAgentStateVersion?: number;
    detailKind?: 'form' | 'unsupported';
}

export interface CurrentSessionAttention {
    primaryReason: CurrentAttentionReason;
    reasons: CurrentAttentionReason[];
}

export function resolveCurrentRequestReasonKind(row: {
    state: string;
    attention?: CurrentSessionAttention | null;
}): CurrentAttentionReasonKind | null {
    if (row.attention) return row.attention.primaryReason.kind;
    if (row.state === 'permission_required' || row.state === 'input_required') {
        return row.state === 'permission_required' ? 'permission_required' : 'answer_required';
    }
    return null;
}

export type CurrentRequestRowAttention = {
    kind: CurrentAttentionReasonKind | null;
    reasonTextKey: 'status.permissionRequired' | 'status.inputRequired' | null;
    actionTextKey: 'status.reviewRequest' | 'status.answerRequest' | null;
    focusHint: CurrentAttentionReason | null;
};

export function resolveCurrentRequestRowAttention(
    row: { state: string; attention?: CurrentSessionAttention | null },
    enabled: boolean,
): CurrentRequestRowAttention {
    if (!enabled) {
        return {
            kind: null,
            reasonTextKey: null,
            actionTextKey: null,
            focusHint: null,
        };
    }

    const kind = resolveCurrentRequestReasonKind(row);
    return {
        kind,
        reasonTextKey: kind === 'permission_required'
            ? 'status.permissionRequired'
            : kind === 'answer_required'
                ? 'status.inputRequired'
                : null,
        actionTextKey: kind === 'permission_required'
            ? 'status.reviewRequest'
            : kind === 'answer_required'
                ? 'status.answerRequest'
                : null,
        focusHint: kind ? row.attention?.primaryReason ?? null : null,
    };
}

interface DerivedReason {
    reason: CurrentAttentionReason;
    createdAt: number | null;
}

function safeObservedVersion(value: number): number | undefined {
    return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

function sortableCreatedAt(value: number | null | undefined): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function compareWithinKind(left: DerivedReason, right: DerivedReason): number {
    if (left.createdAt === null || right.createdAt === null) {
        if (left.createdAt === null && right.createdAt !== null) return -1;
        if (left.createdAt !== null && right.createdAt === null) return 1;
    }
    return (left.createdAt ?? 0) - (right.createdAt ?? 0)
        || left.reason.sourceId.localeCompare(right.reason.sourceId);
}

/**
 * Derives the current request reasons safe to retain in Session-list row data.
 * Sensitive request and communication payloads deliberately never cross this
 * boundary.
 */
export function deriveCurrentSessionAttention(
    agentState: AgentState | null | undefined,
    agentStateVersion: number,
): CurrentSessionAttention | null {
    if (!agentState) return null;

    const observedAgentStateVersion = safeObservedVersion(agentStateVersion);
    const withVersion = observedAgentStateVersion === undefined
        ? {}
        : { observedAgentStateVersion };

    const permissions = Object.entries(agentState.requests ?? {})
        .filter(([sourceId]) => !agentState.completedRequests?.[sourceId])
        .map<DerivedReason>(([sourceId, request]) => ({
            reason: {
                kind: 'permission_required',
                sourceId,
                ...withVersion,
            },
            createdAt: sortableCreatedAt(request.createdAt),
        }))
        .sort(compareWithinKind);

    const answers = selectPendingCommunications(agentState)
        .map<DerivedReason>((communication) => ({
            reason: {
                kind: 'answer_required',
                sourceId: communication.id,
                ...withVersion,
                detailKind: communication.kind,
            },
            createdAt: sortableCreatedAt(agentState.communications?.[communication.id]?.createdAt),
        }))
        .sort(compareWithinKind);

    const reasons = [...permissions, ...answers].map(({ reason }) => reason);
    if (reasons.length === 0) return null;
    return { primaryReason: reasons[0], reasons };
}
