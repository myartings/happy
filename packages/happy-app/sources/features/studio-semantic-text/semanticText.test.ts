import { describe, expect, it } from 'vitest';

import { semanticTextRoles } from './semanticText';

describe('semanticTextRoles', () => {
    it('defines each accepted presentation-neutral role exactly once', () => {
        expect(semanticTextRoles).toEqual([
            'body',
            'heading',
            'emphasis',
            'link',
            'inlineCode',
            'command',
            'path',
            'number',
            'statusSuccess',
            'statusWarning',
            'statusError',
            'statusSecondary',
        ]);
        expect(new Set(semanticTextRoles).size).toBe(semanticTextRoles.length);
    });
});
