import { describe, expect, it } from 'vitest';
import { applyLocalSettings, localSettingsDefaults, localSettingsParse } from './localSettings';

describe('personal development local settings', () => {
    it('enables every personal UI feature by default', () => {
        expect(localSettingsDefaults).toMatchObject({
            devProjectTodosEnabled: true,
            devNeedsAttentionSessionsEnabled: true,
            devPromptHistoryNavigatorEnabled: true,
            devSessionEnvironmentLabelsEnabled: true,
            devWorktreeProjectIdentityEnabled: true,
            devEnhancedStatusDotsEnabled: true,
        });
    });

    it('adds enabled defaults when loading settings saved by an older client', () => {
        expect(localSettingsParse({ themePreference: 'dark' })).toMatchObject({
            themePreference: 'dark',
            devProjectTodosEnabled: true,
            devNeedsAttentionSessionsEnabled: true,
            devPromptHistoryNavigatorEnabled: true,
            devSessionEnvironmentLabelsEnabled: true,
            devWorktreeProjectIdentityEnabled: true,
            devEnhancedStatusDotsEnabled: true,
        });
    });

    it('updates one feature without changing the other switches', () => {
        expect(applyLocalSettings(localSettingsDefaults, {
            devPromptHistoryNavigatorEnabled: false,
        })).toMatchObject({
            devProjectTodosEnabled: true,
            devPromptHistoryNavigatorEnabled: false,
            devSessionEnvironmentLabelsEnabled: true,
        });
    });
});
