export type VisibleSessionTailCommitState = {
    generation: number;
    lastSeq: number | undefined;
    agentStateVersion: number;
    sessionSeq: number;
    uiRevision: number | undefined;
    entry: unknown;
    eligible: boolean;
    eligibilityReason?: string;
};

export type VisibleSessionTailCommitValidation =
    | { valid: true }
    | { valid: false; reason: string };

/** Pure final gate used immediately before the atomic Zustand replacement. */
export function validateVisibleSessionTailCommit(
    snapshot: VisibleSessionTailCommitState,
    current: VisibleSessionTailCommitState,
): VisibleSessionTailCommitValidation {
    if (current.generation !== snapshot.generation) {
        return { valid: false, reason: 'generation-changed' };
    }
    if (current.lastSeq !== snapshot.lastSeq) {
        return { valid: false, reason: 'cursor-changed' };
    }
    if (
        current.agentStateVersion !== snapshot.agentStateVersion
        || current.sessionSeq !== snapshot.sessionSeq
    ) {
        return { valid: false, reason: 'session-changed' };
    }
    if (current.uiRevision !== snapshot.uiRevision) {
        return { valid: false, reason: 'viewport-changed' };
    }
    if (current.entry !== snapshot.entry) {
        return { valid: false, reason: 'store-entry-changed' };
    }
    if (!current.eligible) {
        return {
            valid: false,
            reason: current.eligibilityReason ?? 'no-longer-eligible',
        };
    }
    return { valid: true };
}
