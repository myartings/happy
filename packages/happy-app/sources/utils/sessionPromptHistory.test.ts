import { describe, expect, it } from 'vitest';
import type { DisplayItem } from '@/hooks/useGroupedMessages';
import type { PromptHistoryItem } from '@/sync/promptHistory';
import type { Message } from '@/sync/typesMessage';
import {
    getPromptIndexFromTrackPosition,
    getPromptRailMetrics,
    getPromptRailTickWidth,
    getSampledPromptIndices,
    mergeSessionPromptHistory,
    resolveVisiblePromptId,
} from './sessionPromptHistory';

function user(id: string, createdAt: number, text = id): Message {
    return { kind: 'user-text', id, localId: null, createdAt, text };
}

function agent(id: string, createdAt: number): Message {
    return { kind: 'agent-text', id, localId: null, createdAt, text: id };
}

function item(message: Message): DisplayItem {
    return { type: 'message', id: message.id, message };
}

describe('session prompt history', () => {
    it('keeps the desktop prompt rail compact with tightly spaced sampled ticks', () => {
        expect(getPromptRailMetrics(5)).toEqual({ trackHeight: 24, totalHeight: 82 });
        expect(getPromptRailMetrics(10)).toEqual({ trackHeight: 36, totalHeight: 94 });
        expect(getPromptRailMetrics(100)).toEqual({ trackHeight: 76, totalHeight: 134 });

        const sampled = getSampledPromptIndices(100);
        expect(sampled).toHaveLength(20);
        expect(sampled[0]).toBe(0);
        expect(sampled.at(-1)).toBe(99);
    });

    it('uses Grok-like short, medium, and major tick lengths on the desktop rail', () => {
        expect([0, 1, 2, 3, 4, 5].map((index) => (
            getPromptRailTickWidth(index, 6, false)
        ))).toEqual([12, 20, 28, 12, 20, 28]);
        expect(getPromptRailTickWidth(1, 6, true)).toBe(28);
    });

    it('merges fetched prompts with currently loaded user messages chronologically', () => {
        const fetched: PromptHistoryItem[] = [
            { id: 'older', localId: null, sessionId: 's', seq: 1, createdAt: 10, text: 'old' },
            { id: 'current', localId: null, sessionId: 's', seq: 2, createdAt: 20, text: 'stale' },
        ];
        const result = mergeSessionPromptHistory('s', fetched, [
            user('newer', 30),
            user('current', 20, 'visible'),
            agent('answer', 21),
        ]);

        expect(result.map((entry) => entry.id)).toEqual(['older', 'current', 'newer']);
        expect(result[1]).toMatchObject({ text: 'visible', seq: 2 });
    });

    it('maps pointer positions to the nearest prompt and clamps track edges', () => {
        expect(getPromptIndexFromTrackPosition(-10, 100, 5)).toBe(0);
        expect(getPromptIndexFromTrackPosition(51, 100, 5)).toBe(2);
        expect(getPromptIndexFromTrackPosition(120, 100, 5)).toBe(4);
        expect(getPromptIndexFromTrackPosition(10, 0, 5)).toBeNull();
    });

    it('resolves the prompt that owns the visible assistant turn in an inverted list', () => {
        const items = [
            item(agent('latest-answer', 40)),
            item(user('latest-prompt', 30)),
            item(agent('older-answer', 20)),
            item(user('older-prompt', 10)),
        ];

        expect(resolveVisiblePromptId(items, [0])).toBe('latest-prompt');
        expect(resolveVisiblePromptId(items, [2])).toBe('older-prompt');
        expect(resolveVisiblePromptId(items, [])).toBeNull();
    });
});
