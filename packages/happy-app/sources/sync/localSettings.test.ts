import { describe, expect, it } from 'vitest';
import {
    applyLocalSettings,
    buildPersonalDisplaySettingsMigration,
    buildSyncedSessionListSettingsMigration,
    LocalSettingsSchema,
    localSettingsDefaults,
    localSettingsParse,
} from './localSettings';

describe('personal development local settings', () => {
    it('uses the intended defaults for every personal UI feature', () => {
        expect(localSettingsDefaults).toMatchObject({
            devProjectTodosEnabled: true,
            devGithubIssuesEnabled: false,
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
            devGithubIssuesEnabled: false,
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

    it('keeps GitHub Issue repository choices device-local and backward compatible', () => {
        expect(localSettingsDefaults).toMatchObject({
            devGithubIssuesLastRepository: null,
            devGithubIssuesRepositoryAssociations: {},
            devGithubIssueDrafts: {},
        });

        expect(localSettingsParse({
            devGithubIssuesLastRepository: { owner: 'myartings', repo: 'happy' },
            devGithubIssuesRepositoryAssociations: {
                '["machine-a","/work/happy"]': {
                    repository: { owner: 'myartings', repo: 'happy' },
                    remoteFingerprint: 'origin:myartings/happy',
                },
            },
        })).toMatchObject({
            devGithubIssuesLastRepository: { owner: 'myartings', repo: 'happy' },
            devGithubIssuesRepositoryAssociations: {
                '["machine-a","/work/happy"]': {
                    repository: { owner: 'myartings', repo: 'happy' },
                    remoteFingerprint: 'origin:myartings/happy',
                },
            },
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

    it('inherits only display choices that remain device-local', () => {
        const migration = buildPersonalDisplaySettingsMigration(localSettingsDefaults, {
            sortActiveSessionsGlobally: true,
            groupActiveSessionsByDate: true,
            showActiveSessionRuntime: true,
            showSessionModel: false,
        });

        expect(migration).toEqual({
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

    it('migrates current session-list choices to account settings once', () => {
        expect(buildSyncedSessionListSettingsMigration(applyLocalSettings(localSettingsDefaults, {
            devSortActiveSessionsGloballyEnabled: true,
            devGroupActiveSessionsByDateEnabled: true,
            devNeedsAttentionSessionsEnabled: false,
        }), {})).toEqual({
            accountDelta: {
                sortActiveSessionsGlobally: true,
                groupActiveSessionsByDate: true,
                needsAttentionSessionsEnabled: false,
                sessionListSettingsMigrated: true,
            },
            localDelta: { devSessionListSettingsSynced: true },
        });
    });

    it('accepts an existing account migration without overwriting it', () => {
        expect(buildSyncedSessionListSettingsMigration(localSettingsDefaults, {
            sessionListSettingsMigrated: true,
        })).toEqual({
            accountDelta: null,
            localDelta: { devSessionListSettingsSynced: true },
        });
    });
});
