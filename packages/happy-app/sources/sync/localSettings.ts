import * as z from 'zod';

const GithubRepositoryRefSchema = z.object({
    owner: z.string(),
    repo: z.string(),
});

const GithubRepositoryAssociationSchema = z.object({
    repository: GithubRepositoryRefSchema,
    remoteFingerprint: z.string(),
});

//
// Schema
//

export const LocalSettingsSchema = z.object({
    // Developer settings (device-specific)
    debugMode: z.boolean().describe('Enable debug logging'),
    devModeEnabled: z.boolean().describe('Enable developer menu in settings'),
    voiceUpsellOverride: z.enum(['control', 'show-paywall-before-first-voice-chat', 'voice-onboarding-and-upsell']).nullable().describe('Developer-only local override for the voice-upsell PostHog flag'),
    commandPaletteEnabled: z.boolean().describe('Enable CMD+K command palette (web only)'),
    themePreference: z.enum(['light', 'dark', 'adaptive']).describe('Theme preference: light, dark, or adaptive (follows system)'),
    markdownCopyV2: z.boolean().describe('Replace native paragraph selection with long-press modal for full markdown copy'),
    consoleLoggingEnabled: z.boolean().describe('Enable console output in production builds'),
    verboseLogging: z.boolean().describe('Log all network requests and responses'),
    zenMode: z.boolean().describe('Hide all sidebars and non-essential UI for focused work'),
    desktopSessionNotificationsEnabled: z.boolean().describe('Enable local desktop notifications for background session events'),
    devProjectTodosEnabled: z.boolean().describe('Show the personal project todo UI'),
    devGithubIssuesEnabled: z.boolean().describe('Show the personal GitHub Issues UI'),
    devGithubIssuesLastRepository: GithubRepositoryRefSchema.nullable().describe('Last GitHub Issues repository selected on this device'),
    devGithubIssuesRepositoryAssociations: z.record(z.string(), GithubRepositoryAssociationSchema).describe('GitHub Issue repository associations keyed by machine and project path'),
    devGithubIssueDrafts: z.record(z.string(), z.object({ title: z.string(), body: z.string() })).describe('GitHub Issue creation drafts keyed by repository'),
    devNeedsAttentionSessionsEnabled: z.boolean().describe('Show the personal needs-attention session section'),
    devPromptHistoryNavigatorEnabled: z.boolean().describe('Show the personal prompt history navigator'),
    devSessionEnvironmentLabelsEnabled: z.boolean().describe('Show personal branch and worktree labels on session rows'),
    devEnhancedStatusDotsEnabled: z.boolean().describe('Use the personal high-visibility active-session status dots'),
    devSortActiveSessionsGloballyEnabled: z.boolean().describe('Show active sessions in one global list ordered by recent user activity'),
    devGroupActiveSessionsByDateEnabled: z.boolean().describe('Split globally sorted active sessions into today and earlier activity groups'),
    devShowActiveSessionRuntimeEnabled: z.boolean().describe('Show project, device platform, AI provider, and model details on active session rows'),
    devShowSessionModelEnabled: z.boolean().describe('Show the AI provider icon and name plus the model name and version in session UI'),
    devPersonalDisplaySettingsMigrated: z.boolean().describe('Whether legacy synced personal display preferences were copied to this device'),
    devSessionListSettingsSynced: z.boolean().describe('Whether device-local session list choices were migrated to account settings'),
    // Right file sidebar: which panels the user has opened and which is active.
    // Persisted so the layout survives reloads and long absences.
    sidebarPanelsOpen: z.array(z.enum(['changes', 'allFiles', 'sideChat'])).describe('Open right-sidebar panels, in tab order'),
    sidebarPanelActive: z.enum(['changes', 'allFiles', 'sideChat']).nullable().describe('Currently active right-sidebar panel (null shows the picker)'),
    // CLI version acknowledgments - keyed by machineId
    acknowledgedCliVersions: z.record(z.string(), z.string()).describe('Acknowledged CLI versions per machine'),
    // Collapsed Rig projects in the session list - keyed by project id
    collapsedProjects: z.record(z.string(), z.boolean()).describe('Collapsed state per sidebar project'),
});

//
// NOTE: Local settings are device-specific and should NOT be synced.
// These are preferences that make sense to be different on each device.
//

const LocalSettingsSchemaPartial = LocalSettingsSchema.passthrough().partial();

export type LocalSettings = z.infer<typeof LocalSettingsSchema>;

//
// Defaults
//

export const localSettingsDefaults: LocalSettings = {
    debugMode: false,
    devModeEnabled: false,
    voiceUpsellOverride: null,
    commandPaletteEnabled: false,
    themePreference: 'adaptive',
    markdownCopyV2: false,
    consoleLoggingEnabled: false,
    verboseLogging: false,
    zenMode: false,
    desktopSessionNotificationsEnabled: true,
    devProjectTodosEnabled: true,
    devGithubIssuesEnabled: false,
    devGithubIssuesLastRepository: null,
    devGithubIssuesRepositoryAssociations: {},
    devGithubIssueDrafts: {},
    devNeedsAttentionSessionsEnabled: true,
    devPromptHistoryNavigatorEnabled: true,
    devSessionEnvironmentLabelsEnabled: true,
    devEnhancedStatusDotsEnabled: true,
    devSortActiveSessionsGloballyEnabled: false,
    devGroupActiveSessionsByDateEnabled: false,
    devShowActiveSessionRuntimeEnabled: false,
    devShowSessionModelEnabled: true,
    devPersonalDisplaySettingsMigrated: false,
    devSessionListSettingsSynced: false,
    sidebarPanelsOpen: [],
    sidebarPanelActive: null,
    acknowledgedCliVersions: {},
    collapsedProjects: {},
};
Object.freeze(localSettingsDefaults);

//
// Parsing
//

export function localSettingsParse(settings: unknown): LocalSettings {
    const parsed = LocalSettingsSchemaPartial.safeParse(settings);
    if (!parsed.success) {
        return { ...localSettingsDefaults };
    }
    return { ...localSettingsDefaults, ...parsed.data };
}

//
// Applying changes
//

export function applyLocalSettings(settings: LocalSettings, delta: Partial<LocalSettings>): LocalSettings {
    return { ...localSettingsDefaults, ...settings, ...delta };
}

export function buildPersonalDisplaySettingsMigration(
    localSettings: LocalSettings,
    accountSettings: unknown,
): Partial<LocalSettings> | null {
    if (localSettings.devPersonalDisplaySettingsMigrated) return null;

    const legacy = accountSettings && typeof accountSettings === 'object'
        ? accountSettings as Record<string, unknown>
        : {};
    const inheritBoolean = (legacyKey: string, fallback: boolean): boolean => (
        typeof legacy[legacyKey] === 'boolean' ? legacy[legacyKey] : fallback
    ) as boolean;

    return {
        devShowActiveSessionRuntimeEnabled: inheritBoolean(
            'showActiveSessionRuntime',
            localSettings.devShowActiveSessionRuntimeEnabled,
        ),
        devShowSessionModelEnabled: inheritBoolean(
            'showSessionModel',
            localSettings.devShowSessionModelEnabled,
        ),
        devPersonalDisplaySettingsMigrated: true,
    };
}

export function buildSyncedSessionListSettingsMigration(
    localSettings: LocalSettings,
    accountSettings: { sessionListSettingsMigrated?: boolean },
): {
    accountDelta: {
        sortActiveSessionsGlobally: boolean;
        groupActiveSessionsByDate: boolean;
        needsAttentionSessionsEnabled: boolean;
        sessionListSettingsMigrated: true;
    } | null;
    localDelta: { devSessionListSettingsSynced: true };
} | null {
    if (localSettings.devSessionListSettingsSynced) return null;
    return {
        accountDelta: accountSettings.sessionListSettingsMigrated
            ? null
            : {
                sortActiveSessionsGlobally: localSettings.devSortActiveSessionsGloballyEnabled,
                groupActiveSessionsByDate: localSettings.devGroupActiveSessionsByDateEnabled,
                needsAttentionSessionsEnabled: localSettings.devNeedsAttentionSessionsEnabled,
                sessionListSettingsMigrated: true,
            },
        localDelta: { devSessionListSettingsSynced: true },
    };
}
