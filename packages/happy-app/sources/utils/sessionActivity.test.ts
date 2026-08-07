import { describe, expect, it } from 'vitest';
import { getUserMessageActivityAt, resolveLatestSessionActivityAt } from './sessionActivity';

describe('session activity', () => {
    it('uses an inbound user message as cross-device activity', () => {
        expect(getUserMessageActivityAt({ role: 'user', createdAt: 1_700_000_000_000 }))
            .toBe(1_700_000_000_000);
    });

    it('ignores agent output and session events', () => {
        expect(getUserMessageActivityAt({ role: 'agent', createdAt: 1_700_000_000_000 })).toBeNull();
        expect(getUserMessageActivityAt({ role: 'event', createdAt: 1_700_000_000_000 })).toBeNull();
    });

    it('does not let a delayed message move activity backwards', () => {
        expect(resolveLatestSessionActivityAt(200, 100)).toBe(200);
        expect(resolveLatestSessionActivityAt(100, 200)).toBe(200);
    });
});
