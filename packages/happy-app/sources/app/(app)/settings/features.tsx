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
    const [agentInputEnterToSend, setAgentInputEnterToSend] = useSettingMutable('agentInputEnterToSend');
    const [commandPaletteEnabled, setCommandPaletteEnabled] = useLocalSettingMutable('commandPaletteEnabled');
    const [markdownCopyV2, setMarkdownCopyV2] = useLocalSettingMutable('markdownCopyV2');
    const [desktopSessionNotificationsEnabled, setDesktopSessionNotificationsEnabled] = useLocalSettingMutable('desktopSessionNotificationsEnabled');
    const [hideInactiveSessions, setHideInactiveSessions] = useSettingMutable('hideInactiveSessions');
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
    const [devSideChatQuickPanelEnabled, setDevSideChatQuickPanelEnabled] = useLocalSettingMutable('devSideChatQuickPanelEnabled');
    const [flatSessionList, setFlatSessionList] = useLocalSettingMutable('flatSessionList');

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
                    title="Flat Session List"
                    subtitle="One full-width list on the home screen instead of project cards"
                    icon={<Ionicons name="reorder-four-outline" size={29} color="#34C759" />}
                    rightElement={
                        <Switch
                            value={flatSessionList}
                            onValueChange={setFlatSessionList}
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
                    title="Side Chat Quick Panel"
                    titleAccessory={<DevFeatureBadge />}
                    subtitle="Use a Codex-style header toggle and compact right-side chat panel"
                    icon={<Ionicons name="chatbox-ellipses-outline" size={29} color="#007AFF" />}
                    rightElement={<Switch value={devSideChatQuickPanelEnabled} onValueChange={setDevSideChatQuickPanelEnabled} />}
                    showChevron={false}
                />
                <Item
                    title="Project Todos"
                    titleAccessory={<DevFeatureBadge />}
                    subtitle="Show project todo shortcuts and the project todo page"
                    icon={<Ionicons name="checkbox-outline" size={29} color="#34C759" />}
                    rightElement={<Switch value={devProjectTodosEnabled} onValueChange={setDevProjectTodosEnabled} />}
                    showChevron={false}
                />
                <Item
                    title={t('githubIssues.title')}
                    titleAccessory={<DevFeatureBadge />}
                    subtitle={githubIssuesSupported
                        ? t('githubIssues.featureDescription')
                        : t('githubIssues.supportedPlatforms')}
                    icon={<Ionicons name="logo-github" size={29} color="#24292F" />}
                    rightElement={<Switch value={devGithubIssuesEnabled && githubIssuesSupported} onValueChange={setDevGithubIssuesEnabled} disabled={!githubIssuesSupported} />}
                    showChevron={false}
                />
                {githubIssuesSupported && devGithubIssuesEnabled && (
                    <Item
                        title={t('githubIssues.connectionSettings')}
                        subtitle={t('githubIssues.connectionSettingsDescription')}
                        icon={<Ionicons name="key-outline" size={29} color="#5856D6" />}
                        onPress={() => router.push({ pathname: '/github-issues', params: { mode: 'settings' } } as any)}
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
