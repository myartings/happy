import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    const path = new URL(relativePath, import.meta.url);
    return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

const settingsView = readSource('../components/SettingsView.tsx');
const personalFeaturesRoute = readSource('../app/(app)/settings/personal-features.tsx');
const personalFeaturesScreen = readSource('../features/personal-settings/PersonalFeaturesSettingsScreen.tsx');
const developerTools = readSource('../app/(app)/dev/index.tsx');

const protectedSettingKeys = [
    'flatSessionList',
    'devSideChatQuickPanelEnabled',
    'devProjectTodosEnabled',
    'devGithubIssuesEnabled',
    'needsAttentionSessionsEnabled',
    'devPromptHistoryNavigatorEnabled',
    'devSessionEnvironmentLabelsEnabled',
    'devEnhancedStatusDotsEnabled',
    'sortActiveSessionsGlobally',
    'groupActiveSessionsByDate',
    'devShowActiveSessionRuntimeEnabled',
    'devShowSessionModelEnabled',
    'desktopSessionNotificationsEnabled',
] as const;

describe('personal features settings wiring', () => {
    it('exposes an always-visible Settings entry that opens the dedicated route', () => {
        const alwaysVisibleSettings = settingsView.split('{/* Developer */}')[0];

        expect(alwaysVisibleSettings).toContain("router.push('/settings/personal-features')");
        expect(alwaysVisibleSettings).toContain("t('settings.featuresTitle')");
    });

    it('delegates the route to the personal feature module', () => {
        expect(personalFeaturesRoute).toContain("@/features/personal-settings/PersonalFeaturesSettingsScreen");
        expect(personalFeaturesRoute).toContain('<PersonalFeaturesSettingsScreen />');
    });

    it('keeps every protected persisted key on the dedicated screen', () => {
        for (const settingKey of protectedSettingKeys) {
            expect(personalFeaturesScreen, settingKey).toMatch(
                new RegExp(`use(?:Local)?SettingMutable\\('${settingKey}'\\)`),
            );
        }
    });

    it('makes Developer Tools delegate instead of owning duplicate switches', () => {
        expect(developerTools).toContain("router.push('/settings/personal-features')");
        expect(developerTools).not.toContain('title="Flat Session List"');
        expect(developerTools).not.toContain("useLocalSettingMutable('flatSessionList')");
    });
});
