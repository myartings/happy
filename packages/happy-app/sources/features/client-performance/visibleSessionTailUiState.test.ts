import { describe, expect, it } from 'vitest';

import { aggregateVisibleSessionTailUiSources } from './visibleSessionTailUiState';

describe('aggregateVisibleSessionTailUiSources', () => {
    it('requires every mounted transcript to be safe and preserves independent composer protection', () => {
        expect(aggregateVisibleSessionTailUiSources([])).toBeNull();
        expect(aggregateVisibleSessionTailUiSources([
            { atLiveTail: true, readingOlderHistory: false, targetActive: false, viewportBusy: false },
            { composerBusy: false },
        ])).toEqual({
            atLiveTail: true,
            readingOlderHistory: false,
            targetActive: false,
            composerBusy: false,
            viewportBusy: false,
        });
        expect(aggregateVisibleSessionTailUiSources([
            { atLiveTail: true, readingOlderHistory: false },
            { atLiveTail: false, readingOlderHistory: true, targetActive: true },
            { composerBusy: true },
        ])).toMatchObject({
            atLiveTail: false,
            readingOlderHistory: true,
            targetActive: true,
            composerBusy: true,
        });
        expect(aggregateVisibleSessionTailUiSources([{ composerBusy: false }])?.atLiveTail).toBe(false);
    });
});
