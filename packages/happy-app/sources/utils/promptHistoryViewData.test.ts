import { describe, expect, it } from 'vitest';
import type { PromptHistoryItem } from '@/sync/promptHistory';
import type { Session } from '@/sync/storageTypes';
import {
    enrichPromptHistoryItems,
    filterPromptHistoryEntries,
    groupPromptHistoryEntries,
} from './promptHistoryViewData';

function session(id: string, path: string, flavor: string): Session {
    return {
        id,
        seq: 1,
        createdAt: 1,
        updatedAt: 1,
        active: true,
        activeAt: 1,
        metadata: { path, host: 'mac', flavor },
        metadataVersion: 1,
        agentState: null,
        agentStateVersion: 1,
        thinking: false,
        thinkingAt: 1,
        presence: 'online',
    };
}

function prompt(id: string, sessionId: string, createdAt: number, text: string): PromptHistoryItem {
    return { id, localId: id, sessionId, seq: createdAt, createdAt, text };
}

describe('prompt history view data', () => {
    it('enriches, filters, and groups prompts by session and calendar day', () => {
        const sessions = {
            a: session('a', '/workspace/happy', 'codex'),
            b: session('b', '/workspace/wordLink', 'claude'),
        };
        const morning = new Date(2026, 7, 6, 9).getTime();
        const afternoon = new Date(2026, 7, 6, 14).getTime();
        const entries = enrichPromptHistoryItems([
            prompt('one', 'a', morning, 'Research prompt history'),
            prompt('two', 'a', afternoon, 'Discuss details'),
            prompt('three', 'b', afternoon + 1, 'Fix sync'),
        ], sessions);

        expect(entries.map((entry) => [entry.project, entry.agent])).toEqual([
            ['happy', 'Codex'],
            ['happy', 'Codex'],
            ['wordLink', 'Claude'],
        ]);
        expect(filterPromptHistoryEntries(entries, 'sync', null, 'Claude')).toHaveLength(1);

        const groups = groupPromptHistoryEntries(entries);
        expect(groups).toHaveLength(2);
        expect(groups.find((group) => group.session.id === 'a')?.prompts.map((item) => item.id))
            .toEqual(['one', 'two']);
    });
});
