import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '@/components/Item';
import { ItemGroup } from '@/components/ItemGroup';
import { ItemList } from '@/components/ItemList';
import { useSettingMutable, useLocalSettingMutable } from '@/sync/storage';
import { Switch } from '@/components/Switch';
import { t } from '@/text';
import { isTauri } from '@/utils/isTauri';
import { DevFeatureBadge } from '@/components/DevFeatureBadge';
import { useRouter } from 'expo-router';

export default function FeaturesSettingsScreen() {
    const githubIssuesSupported = Platform.OS !== 'web' || isTauri();
    const router = useRouter();
    const [experiments, setExperiments] = useSettingMutable('experiments');
    const [analyticsOptOut, setAnalyticsOptOut] = useSettingMutable('analyticsOptOut');
    const [agentInputEnterToSend, setAgentInputEnterToSend] = useSettingMutable('agentInputEnterToSend');
    const [commandPaletteEnabled, setCommandPaletteEnabled] = useLocalSettingMutable('commandPaletteEnabled');
    const [markdownCopyV2, setMarkdownCopyV2] = useLocalSettingMutable('markdownCopyV2');
    const [desktopSessionNotificationsEnabled, setDesktopSessionNotificationsEnabled] = useLocalSettingMutable('desktopSessionNotificationsEnabled');
    const [hideInactiveSessions, setHideInactiveSessions] = useSettingMutable('hideInactiveSessions');
    const [expResumeSession, setExpResumeSession] = useSettingMutable('expResumeSession');
    const [fileDiffsSidebar, setFileDiffsSidebar] = useSettingMutable('fileDiffsSidebar');
    const [groupToolCalls, setGroupToolCalls] = useSettingMutable('groupToolCalls');
    const [expImageUpload, setExpImageUpload] = useSettingMutable('expImageUpload');
    const [sortSessionsByActivity, setSortSessionsByActivity] = useSettingMutable('sortSessionsByActivity');
    const [devProjectTodosEnabled, setDevProjectTodosEnabled] = useLocalSettingMutable('devProjectTodosEnabled');
    const [devGithubIssuesEnabled, setDevGithubIssuesEnabled] = useLocalSettingMutable('devGithubIssuesEnabled');
    const [needsAttentionSessionsEnabled, setNeedsAttentionSessionsEnabled] = useSettingMutable('needsAttentionSessionsEnabled');
    const [devPromptHistoryNavigatorEnabled, setDevPromptHistoryNavigatorEnabled] = useLocalSettingMutable('devPromptHistoryNavigatorEnabled');
    const [devSessionEnvironmentLabelsEnabled, setDevSessionEnvironmentLabelsEnabled] = useLocalSettingMutable('devSessionEnvironmentLabelsEnabled');
    const [devEnhancedStatusDotsEnabled, setDevEnhancedStatusDotsEnabled] = useLocalSettingMutable('devEnhancedStatusDotsEnabled');
    const [sortActiveSessionsGlobally, setSortActiveSessionsGlobally] = useSettingMutable('sortActiveSessionsGlobally');
    const [groupActiveSessionsByDate, setGroupActiveSessionsByDate] = useSettingMutable('groupActiveSessionsByDate');
    const [devShowActiveSessionRuntimeEnabled, setDevShowActiveSessionRuntimeEnabled] = useLocalSettingMutable('devShowActiveSessionRuntimeEnabled');
    const [devShowSessionModelEnabled, setDevShowSessionModelEnabled] = useLocalSettingMutable('devShowSessionModelEnabled');

    return (
        <ItemList style={{ paddingTop: 0 }}>
            {/* Interface */}
            <ItemGroup
                title="Interface"
                footer="Optional panels and layout elements."
            >
                <Item
                    title="File Diffs Sidebar"
                    subtitle="Show git changes next to the chat on desktop"
                    icon={<Ionicons name="git-branch-outline" size={29} color="#5AC8FA" />}
                    rightElement={
                        <Switch
                            value={fileDiffsSidebar}
                            onValueChange={setFileDiffsSidebar}
                        />
                    }
                    showChevron={false}
                />
                <Item
                    title={t('settingsFeatures.groupToolCalls')}
                    subtitle={t('settingsFeatures.groupToolCallsSubtitle')}
                    icon={<Ionicons name="layers-outline" size={29} color="#AF52DE" />}
                    rightElement={
                        <Switch
                            value={groupToolCalls}
                            onValueChange={setGroupToolCalls}
                        />
                    }
                    showChevron={false}
                />
                <Item
                    title="Sort by Recent Activity"
                    subtitle="Order the session list by last activity instead of creation date"
                    icon={<Ionicons name="swap-vertical-outline" size={29} color="#FF9500" />}
                    rightElement={
                        <Switch
                            value={sortSessionsByActivity}
                            onValueChange={setSortSessionsByActivity}
                        />
                    }
                    showChevron={false}
                />
            </ItemGroup>

            <ItemGroup
                title="Personal Development"
                footer="Device-local feature switches for comparing with the official Happy experience. Turning one off keeps its data."
            >
                <Item
                    title="Project Todos"
                    titleAccessory={<DevFeatureBadge />}
                    subtitle="Show project todo shortcuts and the project todo page"
                    icon={<Ionicons name="checkbox-outline" size={29} color="#34C759" />}
                    rightElement={<Switch value={devProjectTodosEnabled} onValueChange={setDevProjectTodosEnabled} />}
                    showChevron={false}
                />
                <Item
                    title="GitHub Issues"
                    titleAccessory={<DevFeatureBadge />}
                    subtitle={githubIssuesSupported
                        ? "Manage selected repositories with a device-local GitHub connection"
                        : "Available in Happy desktop and mobile"}
                    icon={<Ionicons name="logo-github" size={29} color="#24292F" />}
                    rightElement={<Switch value={devGithubIssuesEnabled && githubIssuesSupported} onValueChange={setDevGithubIssuesEnabled} disabled={!githubIssuesSupported} />}
                    showChevron={false}
                />
                {githubIssuesSupported && devGithubIssuesEnabled && (
                    <Item
                        title="GitHub Issues connection"
                        subtitle="Connect, remove this device, or manage repository access"
                        icon={<Ionicons name="key-outline" size={29} color="#5856D6" />}
                        onPress={() => router.push('/github-issues' as any)}
                    />
                )}
                <Item
                    title="Needs Attention Sessions"
                    titleAccessory={<DevFeatureBadge />}
                    subtitle="Collect unread and permission-blocked sessions at the top"
                    icon={<Ionicons name="alert-circle-outline" size={29} color="#FF9500" />}
                    rightElement={<Switch value={needsAttentionSessionsEnabled} onValueChange={setNeedsAttentionSessionsEnabled} />}
                    showChevron={false}
                />
                <Item
                    title="Prompt History Navigator"
                    titleAccessory={<DevFeatureBadge />}
                    subtitle="Show the message rail for jumping between your previous prompts"
                    icon={<Ionicons name="time-outline" size={29} color="#007AFF" />}
                    rightElement={<Switch value={devPromptHistoryNavigatorEnabled} onValueChange={setDevPromptHistoryNavigatorEnabled} />}
                    showChevron={false}
                />
                <Item
                    title="Session Environment Labels"
                    titleAccessory={<DevFeatureBadge />}
                    subtitle="Show both worktree and branch names directly on session rows"
                    icon={<Ionicons name="git-branch-outline" size={29} color="#AF52DE" />}
                    rightElement={<Switch value={devSessionEnvironmentLabelsEnabled} onValueChange={setDevSessionEnvironmentLabelsEnabled} />}
                    showChevron={false}
                />
                <Item
                    title="Enhanced Session Status Dots"
                    titleAccessory={<DevFeatureBadge />}
                    subtitle="Use larger, higher-contrast indicators for active sessions"
                    icon={<Ionicons name="radio-button-on-outline" size={29} color="#FF2D55" />}
                    rightElement={<Switch value={devEnhancedStatusDotsEnabled} onValueChange={setDevEnhancedStatusDotsEnabled} />}
                    showChevron={false}
                />
                <Item
                    title="Sort Active Sessions Globally"
                    titleAccessory={<DevFeatureBadge />}
                    subtitle="Show active sessions in one list ordered by recent activity"
                    icon={<Ionicons name="list-outline" size={29} color="#34C759" />}
                    rightElement={<Switch value={sortActiveSessionsGlobally} onValueChange={setSortActiveSessionsGlobally} />}
                    showChevron={false}
                />
                <Item
                    title={t('settingsFeatures.groupActiveSessionsByDate')}
                    titleAccessory={<DevFeatureBadge />}
                    subtitle={t('settingsFeatures.groupActiveSessionsByDateSubtitle')}
                    icon={<Ionicons name="calendar-outline" size={29} color="#007AFF" />}
                    rightElement={(
                        <Switch
                            value={groupActiveSessionsByDate}
                            onValueChange={setGroupActiveSessionsByDate}
                            disabled={!sortActiveSessionsGlobally}
                        />
                    )}
                    showChevron={false}
                />
                <Item
                    title={t('settingsFeatures.showActiveSessionRuntime')}
                    titleAccessory={<DevFeatureBadge />}
                    subtitle={t('settingsFeatures.showActiveSessionRuntimeSubtitle')}
                    icon={<Ionicons name="desktop-outline" size={29} color="#5856D6" />}
                    rightElement={<Switch value={devShowActiveSessionRuntimeEnabled} onValueChange={setDevShowActiveSessionRuntimeEnabled} />}
                    showChevron={false}
                />
                <Item
                    title={t('settingsFeatures.showSessionModel')}
                    titleAccessory={<DevFeatureBadge />}
                    subtitle={t('settingsFeatures.showSessionModelSubtitle')}
                    icon={<Ionicons name="hardware-chip-outline" size={29} color="#AF52DE" />}
                    rightElement={<Switch value={devShowSessionModelEnabled} onValueChange={setDevShowSessionModelEnabled} />}
                    showChevron={false}
                />
                {Platform.OS === 'web' && isTauri() && (
                    <Item
                        title="Desktop Session Notifications"
                        titleAccessory={<DevFeatureBadge />}
                        subtitle={desktopSessionNotificationsEnabled
                            ? "Show native desktop notifications when background sessions need attention"
                            : "Desktop session notifications are disabled on this device"}
                        icon={<Ionicons name="notifications-outline" size={29} color="#FF9500" />}
                        rightElement={<Switch value={desktopSessionNotificationsEnabled} onValueChange={setDesktopSessionNotificationsEnabled} />}
                        showChevron={false}
                    />
                )}
            </ItemGroup>

            {/* Experimental Features */}
            <ItemGroup
                title={t('settingsFeatures.experiments')}
                footer={t('settingsFeatures.experimentsDescription')}
            >
                <Item
                    title={t('settingsFeatures.experimentalFeatures')}
                    subtitle={experiments ? t('settingsFeatures.experimentalFeaturesEnabled') : t('settingsFeatures.experimentalFeaturesDisabled')}
                    icon={<Ionicons name="flask-outline" size={29} color="#5856D6" />}
                    rightElement={
                        <Switch
                            value={experiments}
                            onValueChange={setExperiments}
                        />
                    }
                    showChevron={false}
                />
                <Item
                    title={t('settingsFeatures.markdownCopyV2')}
                    subtitle={t('settingsFeatures.markdownCopyV2Subtitle')}
                    icon={<Ionicons name="text-outline" size={29} color="#34C759" />}
                    rightElement={
                        <Switch
                            value={markdownCopyV2}
                            onValueChange={setMarkdownCopyV2}
                        />
                    }
                    showChevron={false}
                />
                <Item
                    title={t('settingsFeatures.hideInactiveSessions')}
                    subtitle={t('settingsFeatures.hideInactiveSessionsSubtitle')}
                    icon={<Ionicons name="eye-off-outline" size={29} color="#FF9500" />}
                    rightElement={
                        <Switch
                            value={hideInactiveSessions}
                            onValueChange={setHideInactiveSessions}
                        />
                    }
                    showChevron={false}
                />
                <Item
                    title="Resume Session"
                    subtitle="Resume disconnected Claude Code and Codex sessions via the machine daemon"
                    icon={<Ionicons name="play-circle-outline" size={29} color="#30D158" />}
                    rightElement={
                        <Switch
                            value={expResumeSession}
                            onValueChange={setExpResumeSession}
                        />
                    }
                    showChevron={false}
                />
                <Item
                    title={t('settingsFeatures.imageUpload')}
                    subtitle={t('settingsFeatures.imageUploadSubtitle')}
                    icon={<Ionicons name="image-outline" size={29} color="#FF2D55" />}
                    rightElement={
                        <Switch
                            value={expImageUpload}
                            onValueChange={setExpImageUpload}
                        />
                    }
                    showChevron={false}
                />
            </ItemGroup>

            {/* Privacy */}
            <ItemGroup
                title={t('settingsFeatures.privacy')}
                footer={t('settingsFeatures.privacyDescription')}
            >
                <Item
                    title={t('settingsFeatures.disableAnalytics')}
                    subtitle={analyticsOptOut ? t('settingsFeatures.analyticsDisabled') : t('settingsFeatures.analyticsEnabled')}
                    icon={<Ionicons name="analytics-outline" size={29} color="#FF3B30" />}
                    rightElement={
                        <Switch
                            value={analyticsOptOut}
                            onValueChange={setAnalyticsOptOut}
                        />
                    }
                    showChevron={false}
                />
            </ItemGroup>

            {/* Web-only Features */}
            {Platform.OS === 'web' && (
                <ItemGroup 
                    title={t('settingsFeatures.webFeatures')}
                    footer={t('settingsFeatures.webFeaturesDescription')}
                >
                    <Item
                        title={t('settingsFeatures.enterToSend')}
                        subtitle={agentInputEnterToSend ? t('settingsFeatures.enterToSendEnabled') : t('settingsFeatures.enterToSendDisabled')}
                        icon={<Ionicons name="return-down-forward-outline" size={29} color="#007AFF" />}
                        rightElement={
                            <Switch
                                value={agentInputEnterToSend}
                                onValueChange={setAgentInputEnterToSend}
                            />
                        }
                        showChevron={false}
                    />
                    <Item
                        title={t('settingsFeatures.commandPalette')}
                        subtitle={commandPaletteEnabled ? t('settingsFeatures.commandPaletteEnabled') : t('settingsFeatures.commandPaletteDisabled')}
                        icon={<Ionicons name="keypad-outline" size={29} color="#007AFF" />}
                        rightElement={
                            <Switch
                                value={commandPaletteEnabled}
                                onValueChange={setCommandPaletteEnabled}
                            />
                        }
                        showChevron={false}
                    />
                </ItemGroup>
            )}
        </ItemList>
    );
}
