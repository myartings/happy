import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const featuresSettings = readFileSync(
    new URL('../features/personal-settings/PersonalFeaturesSettingsScreen.tsx', import.meta.url),
    'utf8',
);
const sessionsList = readFileSync(
    new URL('../components/SessionsList.tsx', import.meta.url),
    'utf8',
);

describe('flat session list preference wiring', () => {
    it('exposes the personal layout preference in Personal Features settings', () => {
        expect(featuresSettings).toContain('title="Flat Session List"');
        expect(featuresSettings).toContain('value={flatSessionList}');
        expect(featuresSettings).toContain('onValueChange={setFlatSessionList}');
    });

    it('uses the persisted preference to select the home session-list layout', () => {
        expect(sessionsList).toContain("useLocalSetting('flatSessionList')");
        expect(sessionsList).not.toContain('const flatSessionList = true;');
    });
});
