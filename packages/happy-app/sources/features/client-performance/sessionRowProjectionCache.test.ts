import { describe, expect, it, vi } from 'vitest';

import { SessionRowProjectionCache } from './sessionRowProjectionCache';

type Source = { id: string; value: number };
type Machine = { online: boolean };
type Row = { id: string; value: number; unread: boolean; online: boolean };

function project(
    cache: SessionRowProjectionCache<Source, Machine, Row>,
    source: Source,
    unread: boolean,
    machine: Machine | undefined,
    build: ReturnType<typeof vi.fn<(value: Source) => Row>>,
): Row {
    return cache.project({
        id: source.id,
        source,
        unread,
        machine,
        build: () => build(source),
    });
}

describe('SessionRowProjectionCache', () => {
    it('reuses unchanged rows and rebuilds only the changed source row', () => {
        const cache = new SessionRowProjectionCache<Source, Machine, Row>();
        const machine = { online: true };
        const sources = Array.from({ length: 2_000 }, (_, index) => ({ id: `session-${index}`, value: index }));
        const build = vi.fn((source: Source): Row => ({
            id: source.id,
            value: source.value,
            unread: false,
            online: machine.online,
        }));

        const first = sources.map((source) => project(cache, source, false, machine, build));
        expect(build).toHaveBeenCalledTimes(2_000);

        const updatedSources = [...sources];
        updatedSources[1_234] = { ...updatedSources[1_234], value: 9_999 };
        build.mockClear();
        const second = updatedSources.map((source) => project(cache, source, false, machine, build));

        expect(build).toHaveBeenCalledTimes(1);
        expect(second[1_234]).not.toBe(first[1_234]);
        expect(second[1_233]).toBe(first[1_233]);
        expect(second[1_235]).toBe(first[1_235]);
    });

    it('invalidates a row when unread or machine identity changes and prunes removed sessions', () => {
        const cache = new SessionRowProjectionCache<Source, Machine, Row>();
        const source = { id: 'session', value: 1 };
        const firstMachine = { online: true };
        const secondMachine = { online: false };
        const build = vi.fn((value: Source): Row => ({
            id: value.id,
            value: value.value,
            unread: false,
            online: true,
        }));

        project(cache, source, false, firstMachine, build);
        project(cache, source, true, firstMachine, build);
        project(cache, source, true, secondMachine, build);
        expect(build).toHaveBeenCalledTimes(3);

        cache.prune(new Set());
        expect(cache.size).toBe(0);
    });
});
