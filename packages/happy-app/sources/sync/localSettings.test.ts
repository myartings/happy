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
            visualStyle: 'studio',
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
            devSideChatQuickPanelEnabled: true,
        });
    });

    it('adds enabled defaults when loading settings saved by an older client', () => {
        expect(localSettingsParse({ themePreference: 'dark' })).toMatchObject({
            themePreference: 'dark',
            visualStyle: 'studio',
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
            devSideChatQuickPanelEnabled: true,
            studioLeftPanelWidth: 275,
            studioRightPanelWidth: 360,
            studioLastResizedPanel: null,
        });
    });

    it('keeps a persisted legacy Default value parseable for backward compatibility', () => {
        expect(localSettingsParse({ visualStyle: 'default' }).visualStyle).toBe('default');
    });

    it('restores the grouped list once without blocking a later flat-list opt-in', () => {
        expect(localSettingsParse({ flatSessionList: true })).toMatchObject({
            flatSessionList: false,
            flatSessionListDefaultRestored: true,
        });

        expect(localSettingsParse({
            flatSessionList: true,
            flatSessionListDefaultRestored: true,
        })).toMatchObject({
            flatSessionList: true,
            flatSessionListDefaultRestored: true,
        });
    });

    it('persists Studio panel widths independently as device-local settings', () => {
        expect(localSettingsDefaults).toMatchObject({
            studioLeftPanelWidth: 275,
            studioRightPanelWidth: 360,
            studioLastResizedPanel: null,
        });

        const resized = applyLocalSettings(localSettingsDefaults, {
            studioLeftPanelWidth: 318,
            studioRightPanelWidth: 404,
            studioLastResizedPanel: 'left',
        });
        expect(localSettingsParse(resized)).toMatchObject({
            studioLeftPanelWidth: 318,
            studioRightPanelWidth: 404,
            studioLastResizedPanel: 'left',
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

    it('persists the Issues right-workspace tab alongside Side Session', () => {
        expect(localSettingsParse({
            sidebarPanelsOpen: ['sideChat', 'issues'],
            sidebarPanelActive: 'issues',
        })).toMatchObject({
            sidebarPanelsOpen: ['sideChat', 'issues'],
            sidebarPanelActive: 'issues',
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
            devSideChatQuickPanelEnabled: true,
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
