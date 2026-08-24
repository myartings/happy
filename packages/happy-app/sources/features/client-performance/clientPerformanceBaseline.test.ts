import { describe, expect, it, vi } from 'vitest';

import { runClientPerformanceBaseline } from './clientPerformanceBaseline';

vi.mock('react-native-mmkv', () => ({
    MMKV: class {
        getString() { return undefined; }
        getNumber() { return undefined; }
        set() {}
        delete() {}
    },
}));

vi.mock('@/components/tools/knownTools', () => ({
    knownTools: {},
}));

vi.mock('@/text', () => ({
    t: (key: string) => key,
}));

describe('client performance baseline', () => {
    it.each([
        { sessionCount: 100, messageCount: 100 },
        { sessionCount: 500, messageCount: 1_000 },
        { sessionCount: 2_000, messageCount: 5_000 },
    ])('records deterministic work for $sessionCount sessions and $messageCount messages', ({ sessionCount, messageCount }) => {
        const result = runClientPerformanceBaseline({ sessionCount, messageCount });

        if (process.env.HAPPY_PRINT_PERFORMANCE_BASELINE === '1') {
            console.log(JSON.stringify(result));
        }

        expect(result.fixture).toEqual({ sessionCount, messageCount });
        expect(result.sessionProjection.projectedRows).toBe(sessionCount);
        expect(result.sessionProjection.outputItems).toBeGreaterThan(0);
        expect(result.messageDerivation.inputItems).toBe(messageCount);
        expect(result.messageDerivation.indexReads).toBeGreaterThanOrEqual(messageCount);
        expect(result.messageDerivation.outputItems).toBeGreaterThan(0);
        expect(result.incrementalUpdate.projectedSessionRows).toBe(sessionCount > 0 ? 1 : 0);
        expect(result.incrementalUpdate.retainedSessionRows).toBe(sessionCount);
        expect(result.incrementalUpdate.projectedTurnSegments).toBe(messageCount > 0 ? 1 : 0);
        expect(result.incrementalUpdate.retainedTurnSegments).toBe(messageCount);
    });
});
