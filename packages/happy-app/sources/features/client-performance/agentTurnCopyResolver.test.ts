import { describe, expect, it } from 'vitest';

import { buildAgentTurnCopyResolver } from './agentTurnCopyResolver';
import { buildAgentTurnCopyTextByMessageId } from '@/utils/agentTurnCopy';

describe('buildAgentTurnCopyResolver', () => {
    it('defers copy string construction until the resolver is invoked', () => {
        let reads = 0;
        const progress = {
            kind: 'agent-text',
            id: 'progress',
            get text() {
                reads += 1;
                return 'Progress';
            },
        };
        const final = {
            kind: 'agent-text',
            id: 'final',
            get text() {
                reads += 1;
                return 'Final';
            },
        };

        const copy = buildAgentTurnCopyResolver([final, progress], true);
        const readsAfterProjection = reads;

        expect(copy?.messageId).toBe('final');
        expect(copy?.resolve()).toBe('Progress\n\nFinal');
        expect(reads).toBeGreaterThan(readsAfterProjection);
    });

    it('does not expose the active turn before completion', () => {
        expect(buildAgentTurnCopyResolver([
            { kind: 'agent-text', id: 'active', text: 'Working' },
        ], false)).toBeNull();
    });

    it('matches the established completed-turn copy payload', () => {
        const messages = [
            { kind: 'agent-text' as const, id: 'final', text: 'Final' },
            { kind: 'agent-text' as const, id: 'thinking', text: 'Hidden', isThinking: true },
            { kind: 'agent-text' as const, id: 'progress', text: 'Progress' },
        ];
        const resolver = buildAgentTurnCopyResolver(messages, true);
        const established = buildAgentTurnCopyTextByMessageId(messages, { currentTurnComplete: true });

        expect(resolver?.resolve()).toBe(established.get('final'));
    });
});
