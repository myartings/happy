import { describe, expect, it } from 'vitest';
import type { Session } from '../storageTypes';
import { mergeDecryptedSessionUpdate } from './sessionUpdateMerge';

function session(overrides: Partial<Session> = {}): Session {
    return {
        id: 'session-1',
        seq: 1,
        createdAt: 1,
        updatedAt: 1,
        active: true,
        activeAt: 1,
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

describe('mergeDecryptedSessionUpdate', () => {
    it('preserves live thinking state while applying asynchronously decrypted fields', () => {
        const current = session({ thinking: true, thinkingAt: 20 });

        const merged = mergeDecryptedSessionUpdate(current, {
            metadata: { value: { path: '/repo', host: 'desktop' }, version: 2 },
            projectId: 'project-2',
            updatedAt: 30,
            seq: 3,
        });

        expect(merged).toMatchObject({
            thinking: true,
            thinkingAt: 20,
            metadata: { path: '/repo' },
            metadataVersion: 2,
            projectId: 'project-2',
            updatedAt: 30,
            seq: 3,
        });
    });
});
