import { describe, expect, it } from 'vitest';
import { extractPromptHistoryItems } from './promptHistory';
import type { DecryptedMessage } from './storageTypes';

function message(overrides: Partial<DecryptedMessage>): DecryptedMessage {
    return {
        id: 'message-1',
        seq: 1,
        localId: 'local-1',
        createdAt: 1,
        content: {
            role: 'user',
            content: { type: 'text', text: 'Ship the desktop update' },
        },
        ...overrides,
    };
}

describe('extractPromptHistoryItems', () => {
    it('extracts user prompts and sorts them newest first', () => {
        const result = extractPromptHistoryItems('session-1', [
            message({ id: 'older', createdAt: 10 }),
            message({ id: 'newer', createdAt: 20 }),
        ]);

        expect(result.map((item) => item.id)).toEqual(['newer', 'older']);
        expect(result[0]).toMatchObject({
            sessionId: 'session-1',
            text: 'Ship the desktop update',
        });
    });

    it('prefers displayText and ignores non-user or empty messages', () => {
        const result = extractPromptHistoryItems('session-1', [
            message({
                id: 'display',
                content: {
                    role: 'user',
                    content: { type: 'text', text: 'internal prompt wrapper' },
                    meta: { displayText: 'Visible prompt' },
                },
            }),
            message({
                id: 'agent',
                content: {
                    role: 'agent',
                    content: { type: 'output', data: { type: 'result', result: 'done' } },
                },
            }),
            message({
                id: 'empty',
                content: { role: 'user', content: { type: 'text', text: '   ' } },
            }),
            null,
        ]);

        expect(result).toHaveLength(1);
        expect(result[0].text).toBe('Visible prompt');
    });
});
