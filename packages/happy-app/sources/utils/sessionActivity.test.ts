import { describe, expect, it } from 'vitest';
import {
    getSessionActivityAt,
    getUserMessageActivityAt,
    resolveLatestSessionActivityAt,
} from './sessionActivity';
import type { Session } from '@/sync/storageTypes';

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

function session(overrides: Partial<Session> = {}): Session {
    return {
        id: 'session',
        seq: 0,
        createdAt: 100,
        updatedAt: 100,
        active: true,
        activeAt: 100,
        metadata: null,
        metadataVersion: 0,
        agentState: null,
        agentStateVersion: 0,
        thinking: false,
        thinkingAt: 0,
        presence: 'online',
        ...overrides,
    };
}

describe('getSessionActivityAt', () => {
    it('prefers the published timestamp so every device agrees on the order', () => {
        const value = getSessionActivityAt(session({
            metadata: { path: '/repo', host: 'host', lastMeaningfulMessageAt: 900 },
            lastMessageSentAt: 300,
        }));
        expect(value).toBe(900);
    });

    it('falls back to this device\'s own last sent message', () => {
        const value = getSessionActivityAt(session({
            metadata: { path: '/repo', host: 'host' },
            lastMessageSentAt: 300,
        }));
        expect(value).toBe(300);
    });

    it('falls back to creation when the session has never been touched', () => {
        expect(getSessionActivityAt(session())).toBe(100);
    });

    // An agent that publishes the field is authoritative even when it reports a
    // time older than what this device happens to remember sending: the local
    // value is a guess about one device, the published one covers them all.
    it('does not let the local timestamp override the published one', () => {
        const value = getSessionActivityAt(session({
            metadata: { path: '/repo', host: 'host', lastMeaningfulMessageAt: 200 },
            lastMessageSentAt: 800,
        }));
        expect(value).toBe(200);
    });
});
