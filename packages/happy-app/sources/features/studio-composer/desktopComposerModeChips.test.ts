import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveDesktopComposerModeChips } from './desktopComposerModeChipPresentation';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('desktop Studio composer model and effort chips', () => {
    it('shows known values in Studio and preserves disabled values', () => {
        expect(resolveDesktopComposerModeChips({
            isStudioComposer: true,
            zenMode: false,
            modelLabel: 'GPT-5.6 Sol',
            effortLabel: 'xHigh',
            canSelectModel: true,
            canSelectEffort: false,
        })).toEqual([
            { key: 'model', label: 'GPT-5.6 Sol', enabled: true },
            { key: 'effort', label: 'xHigh', enabled: false },
        ]);
    });

    it('omits absent values and hides the chips outside desktop Studio or in zen mode', () => {
        const base = {
            isStudioComposer: true,
            zenMode: false,
            modelLabel: 'Opus 5',
            effortLabel: null,
            canSelectModel: true,
            canSelectEffort: false,
        };

        expect(resolveDesktopComposerModeChips(base)).toEqual([
            { key: 'model', label: 'Opus 5', enabled: true },
        ]);
        expect(resolveDesktopComposerModeChips({ ...base, isStudioComposer: false })).toEqual([]);
        expect(resolveDesktopComposerModeChips({ ...base, zenMode: true })).toEqual([]);
    });

    it('wires each desktop label to its matching existing picker', () => {
        const input = readSource('../../components/AgentInput.tsx');

        expect(input).toContain('<DesktopComposerModeChips');
        expect(input).toContain('onModelPress={handleModelPress}');
        expect(input).toContain('onEffortPress={handleEffortPress}');
        expect(input).toContain("isStudioComposer && openPicker !== 'permission'");
    });
});
