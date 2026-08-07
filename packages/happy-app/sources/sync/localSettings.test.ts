import { describe, expect, it } from 'vitest';
import {
    applyLocalSettings,
    buildPersonalDisplaySettingsMigration,
    LocalSettingsSchema,
    localSettingsDefaults,
    localSettingsParse,
} from './localSettings';

describe('personal development local settings', () => {
    it('uses the intended defaults for every personal UI feature', () => {
        expect(localSettingsDefaults).toMatchObject({
            devProjectTodosEnabled: true,
            devNeedsAttentionSessionsEnabled: true,
            devPromptHistoryNavigatorEnabled: true,
            devSessionEnvironmentLabelsEnabled: true,
            devEnhancedStatusDotsEnabled: true,
            devSortActiveSessionsGloballyEnabled: false,
            devGroupActiveSessionsByDateEnabled: false,
            devShowActiveSessionRuntimeEnabled: false,
            devShowSessionModelEnabled: true,
        });
    });

    it('adds enabled defaults when loading settings saved by an older client', () => {
        expect(localSettingsParse({ themePreference: 'dark' })).toMatchObject({
            themePreference: 'dark',
            devProjectTodosEnabled: true,
            devNeedsAttentionSessionsEnabled: true,
            devPromptHistoryNavigatorEnabled: true,
            devSessionEnvironmentLabelsEnabled: true,
            devEnhancedStatusDotsEnabled: true,
            devSortActiveSessionsGloballyEnabled: false,
            devGroupActiveSessionsByDateEnabled: false,
            devShowActiveSessionRuntimeEnabled: false,
            devShowSessionModelEnabled: true,
        });
    });

    it('updates independent features without changing the other switches', () => {
        expect(applyLocalSettings(localSettingsDefaults, {
            devPromptHistoryNavigatorEnabled: false,
            devSortActiveSessionsGloballyEnabled: true,
            devShowSessionModelEnabled: false,
        })).toMatchObject({
            devProjectTodosEnabled: true,
            devPromptHistoryNavigatorEnabled: false,
            devSessionEnvironmentLabelsEnabled: true,
            devSortActiveSessionsGloballyEnabled: true,
            devGroupActiveSessionsByDateEnabled: false,
            devShowActiveSessionRuntimeEnabled: false,
            devShowSessionModelEnabled: false,
        });
    });

    it('keeps personal display choices device-local instead of accepting synced settings', () => {
        const local = localSettingsParse({
            devSortActiveSessionsGloballyEnabled: true,
            devGroupActiveSessionsByDateEnabled: true,
            devShowActiveSessionRuntimeEnabled: true,
            devShowSessionModelEnabled: false,
        });

        expect(local).toMatchObject({
            devSortActiveSessionsGloballyEnabled: true,
            devGroupActiveSessionsByDateEnabled: true,
            devShowActiveSessionRuntimeEnabled: true,
            devShowSessionModelEnabled: false,
        });
    });

    it('does not expose repository/worktree identity correctness as a feature switch', () => {
        expect(LocalSettingsSchema.shape).not.toHaveProperty('devWorktreeProjectIdentityEnabled');
    });

    it('inherits legacy synced display choices once on each device', () => {
        const migration = buildPersonalDisplaySettingsMigration(localSettingsDefaults, {
            sortActiveSessionsGlobally: true,
            groupActiveSessionsByDate: true,
            showActiveSessionRuntime: true,
            showSessionModel: false,
        });

        expect(migration).toEqual({
            devSortActiveSessionsGloballyEnabled: true,
            devGroupActiveSessionsByDateEnabled: true,
            devShowActiveSessionRuntimeEnabled: true,
            devShowSessionModelEnabled: false,
            devPersonalDisplaySettingsMigrated: true,
        });
    });

    it('does not overwrite device-local choices after migration', () => {
        const migrated = applyLocalSettings(localSettingsDefaults, {
            devSortActiveSessionsGloballyEnabled: false,
            devShowSessionModelEnabled: true,
            devPersonalDisplaySettingsMigrated: true,
        });

        expect(buildPersonalDisplaySettingsMigration(migrated, {
            sortActiveSessionsGlobally: true,
            showSessionModel: false,
        })).toBeNull();
    });
});
