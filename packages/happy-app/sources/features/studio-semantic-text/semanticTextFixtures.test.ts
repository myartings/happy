import { describe, expect, it } from 'vitest';

import { parseAnsiSgr } from './parseAnsiSgr';
import { semanticTextRoles } from './semanticText';
import { semanticTextFixtures } from './semanticTextFixtures';

describe('semanticTextFixtures', () => {
    it('deterministically covers every accepted semantic role', () => {
        const coveredRoles = new Set(semanticTextFixtures.flatMap((fixture) => fixture.expectedRoles));

        expect([...coveredRoles].sort()).toEqual([...semanticTextRoles].sort());
        expect(new Set(semanticTextFixtures.map((fixture) => fixture.id)).size)
            .toBe(semanticTextFixtures.length);
    });

    it('includes ANSI display input with stable readable output', () => {
        const ansiFixture = semanticTextFixtures.find((fixture) => fixture.kind === 'ansi');

        expect(ansiFixture).toBeDefined();
        expect(parseAnsiSgr(ansiFixture!.input).text).toBe(ansiFixture!.readableText);
    });
});
