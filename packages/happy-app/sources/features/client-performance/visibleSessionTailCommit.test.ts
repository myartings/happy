import { describe, expect, it } from 'vitest';

import { validateVisibleSessionTailCommit, type VisibleSessionTailCommitState } from './visibleSessionTailCommit';

const entry = {};

function validState(): VisibleSessionTailCommitState {
    return {
        generation: 4,
        lastSeq: 900,
        agentStateVersion: 12,
        sessionSeq: 40,
        uiRevision: 8,
        entry,
        eligible: true,
    };
}

describe('validateVisibleSessionTailCommit', () => {
    it('rejects every generation, cursor, session, viewport, store, and eligibility race', () => {
        const snapshot = validState();
        const cases: Array<[Partial<VisibleSessionTailCommitState>, string]> = [
            [{ generation: 5 }, 'generation-changed'],
            [{ lastSeq: 901 }, 'cursor-changed'],
            [{ agentStateVersion: 13 }, 'session-changed'],
            [{ sessionSeq: 41 }, 'session-changed'],
            [{ uiRevision: 9 }, 'viewport-changed'],
            [{ entry: {} }, 'store-entry-changed'],
            [{ eligible: false, eligibilityReason: 'composer-busy' }, 'composer-busy'],
        ];

        for (const [patch, reason] of cases) {
            expect(validateVisibleSessionTailCommit(snapshot, {
                ...validState(),
                ...patch,
            })).toEqual({ valid: false, reason });
        }
        expect(validateVisibleSessionTailCommit(snapshot, validState())).toEqual({ valid: true });
    });
});
