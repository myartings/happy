import { describe, expect, it, vi } from 'vitest';

import { TurnProjectionCache } from './turnProjectionCache';

type Item = { id: string; boundary: boolean; value: number };

function makeTurns(count: number): Item[] {
    return Array.from({ length: count }, (_, turn) => [
        { id: `agent-${turn}`, boundary: false, value: turn },
        { id: `user-${turn}`, boundary: true, value: turn },
    ]).flat();
}

describe('TurnProjectionCache', () => {
    it('reuses completed turn projections when only the active turn changes', () => {
        const cache = new TurnProjectionCache<Item, string>();
        const projectSegment = vi.fn((segment: readonly Item[]) => segment.map((item) => item.id).join(','));
        const items = makeTurns(101);

        const first = cache.project({
            items,
            getId: (item) => item.id,
            isBoundary: (item) => item.boundary,
            variantForSegment: (index) => index === 0 ? 'active' : 'completed',
            projectSegment,
        });
        expect(projectSegment).toHaveBeenCalledTimes(101);

        const updated = [...items];
        updated[0] = { ...updated[0], value: 999 };
        projectSegment.mockClear();
        const second = cache.project({
            items: updated,
            getId: (item) => item.id,
            isBoundary: (item) => item.boundary,
            variantForSegment: (index) => index === 0 ? 'active' : 'completed',
            projectSegment,
        });

        expect(projectSegment).toHaveBeenCalledTimes(1);
        expect(second[0]).toBe(first[0]);
        expect(second[1]).toBe(first[1]);
    });

    it('drops projections for turns no longer present', () => {
        const cache = new TurnProjectionCache<Item, string>();
        const items = makeTurns(3);
        const request = {
            getId: (item: Item) => item.id,
            isBoundary: (item: Item) => item.boundary,
            variantForSegment: () => 'completed',
            projectSegment: (segment: readonly Item[]) => segment[0].id,
        };

        cache.project({ items, ...request });
        expect(cache.size).toBe(3);
        cache.project({ items: items.slice(0, 2), ...request });
        expect(cache.size).toBe(1);
    });
});
