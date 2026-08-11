import { describe, expect, it } from 'vitest';

import { LruMap } from './lruMap';

describe('LruMap', () => {
    it('evicts the least recently read entry', () => {
        const cache = new LruMap<string, number>(2);
        cache.set('first', 1);
        cache.set('second', 2);

        expect(cache.get('first')).toBe(1);
        cache.set('third', 3);

        expect(cache.get('second')).toBeUndefined();
        expect(cache.get('first')).toBe(1);
        expect(cache.get('third')).toBe(3);
    });

    it('treats an updated entry as most recently used', () => {
        const cache = new LruMap<string, number>(2);
        cache.set('first', 1);
        cache.set('second', 2);
        cache.set('first', 10);
        cache.set('third', 3);

        expect(cache.get('second')).toBeUndefined();
        expect(cache.get('first')).toBe(10);
        expect(cache.size).toBe(2);
    });

    it('touches entries whose stored value is undefined', () => {
        const cache = new LruMap<string, undefined>(2);
        cache.set('first', undefined);
        cache.set('second', undefined);

        expect(cache.get('first')).toBeUndefined();
        cache.set('third', undefined);

        expect([...cache.keys()]).toEqual(['first', 'third']);
    });
});
