import * as React from 'react';
import { ActivityIndicator, AppState, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { layout } from '@/components/layout';
import { Typography } from '@/constants/Typography';
import { GithubRepositoryPicker } from '@/features/github-issues/GithubRepositoryPicker';
import {
    GithubIssuesError,
    getGithubIssueRelativeTime,
    getGithubIssuesErrorMessage,
    githubIssuesAuthorization,
    githubIssuesApi,
    githubIssuesRepositoryResolver,
    type DeviceVerificationPrompt,
    type GithubIssue,
    type GithubIssueState,
    type GithubIssuesConnectionState,
    type GithubRepository,
} from '@/features/github-issues/githubIssuesApi';
import { useLocalSetting } from '@/sync/storage';
import { openExternalUrl } from '@/utils/openExternalUrl';
import { Modal } from '@/modal';
import { t } from '@/text';

function relativeTime(updatedAt: string): string {
    const value = getGithubIssueRelativeTime(updatedAt);
    if (!value || value.unit === 'now') return t('githubIssues.updatedNow');
    if (value.unit === 'minute') return t('githubIssues.updatedMinutes', { count: value.value });
    if (value.unit === 'hour') return t('githubIssues.updatedHours', { count: value.value });
    return t('githubIssues.updatedDays', { count: value.value });
}

export default function GithubIssuesScreen() {
    const requested = useLocalSearchParams<{ owner?: string; repo?: string; sourceSessionId?: string; mode?: string }>();
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const router = useRouter();
    const { theme } = useUnistyles();
    const [connection, setConnection] = React.useState<GithubIssuesConnectionState>({ status: 'checking' });
    const [authorization, setAuthorization] = React.useState(githubIssuesAuthorization.getSnapshot());
    const [repositories, setRepositories] = React.useState<GithubRepository[]>([]);
    const [repository, setRepository] = React.useState<GithubRepository | null>(null);
    const [state, setState] = React.useState<GithubIssueState>('open');
    const [items, setItems] = React.useState<Record<GithubIssueState, GithubIssue[]>>({ open: [], closed: [] });
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [pickerVisible, setPickerVisible] = React.useState(false);

    const selectRepository = React.useCallback((next: GithubRepository) => {
        githubIssuesRepositoryResolver.remember(next);
        setRepository(next);
        setPickerVisible(false);
    }, []);

    const loadRepositories = React.useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        try {
            const current = await githubIssuesApi.getConnectionState();
            setConnection(current);
            if (current.status !== 'connected') return;
            const result = await githubIssuesApi.listRepositories();
            setRepositories(result);
            setRepository((selected) => result.find((item) => item.id === selected?.id)
                ?? result.find((item) => item.owner.toLowerCase() === requested.owner?.toLowerCase()
                    && item.name.toLowerCase() === requested.repo?.toLowerCase())
                ?? result[0]
                ?? null);
            setError(null);
        } catch (caught) {
            const message = getGithubIssuesErrorMessage(caught);
            if (caught instanceof GithubIssuesError
                && ['unsupported_platform', 'not_configured', 'secure_storage_unavailable'].includes(caught.code)) {
                setConnection({ status: 'unavailable', message });
            } else {
                setError(message);
                if (caught instanceof GithubIssuesError && ['not_connected', 'reauthorization_required'].includes(caught.code)) {
                    setConnection({ status: 'disconnected' });
                }
            }
        } finally {
            setLoading(false);
        }
    }, [enabled, requested.owner, requested.repo]);

    const loadIssues = React.useCallback(async (refresh = false) => {
        if (!repository || connection.status !== 'connected') return;
        refresh ? setRefreshing(true) : setLoading(true);
        try {
            const [open, closed] = await Promise.all([
                githubIssuesApi.listIssues({ owner: repository.owner, repo: repository.name, state: 'open' }),
                githubIssuesApi.listIssues({ owner: repository.owner, repo: repository.name, state: 'closed' }),
            ]);
            setItems({ open: open.items, closed: closed.items });
            setError(null);
        } catch (caught) {
            setError(getGithubIssuesErrorMessage(caught));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [connection.status, repository]);

    React.useEffect(() => { void loadRepositories(); }, [loadRepositories]);
    React.useEffect(() => { void loadIssues(); }, [loadIssues]);
    React.useEffect(() => githubIssuesAuthorization.subscribe(setAuthorization), []);
    React.useEffect(() => {
        if (authorization.status === 'connected') void loadRepositories().finally(githubIssuesAuthorization.clear);
        if (authorization.status === 'failed') {
            setError(getGithubIssuesErrorMessage(authorization.error));
            setConnection({ status: 'disconnected' });
            githubIssuesAuthorization.clear();
        }
    }, [authorization, loadRepositories]);
    React.useEffect(() => {
        const subscription = AppState.addEventListener('change', (next) => {
        if (next === 'active' && connection.status === 'connected') void loadRepositories();
        });
        return () => subscription.remove();
    }, [connection.status, loadRepositories]);

    const disconnect = React.useCallback(async () => {
        const confirmed = await Modal.confirm(t('githubIssues.removeDeviceTitle'), t('githubIssues.removeDeviceMessage'), { cancelText: t('common.cancel'), confirmText: t('githubIssues.remove'), destructive: true });
        if (!confirmed) return;
        await githubIssuesApi.disconnect();
        setConnection({ status: 'disconnected' });
        setRepositories([]);
        setRepository(null);
    }, []);

    const createIssue = React.useCallback(() => {
        if (repository) router.push({ pathname: '/github-issues/new', params: { owner: repository.owner, repo: repository.name, ...(requested.sourceSessionId ? { sourceSessionId: requested.sourceSessionId } : {}) } } as any);
    }, [repository, requested.sourceSessionId, router]);

    if (!enabled) return <View style={styles.center}><Text style={styles.secondary}>{t('githubIssues.disabled')}</Text></View>;
    const prompt: DeviceVerificationPrompt | null = authorization.status === 'connecting' ? authorization.prompt : null;

    return (
        <View style={styles.page}>
            <Stack.Screen options={{
                title: t('githubIssues.title'),
                headerRight: repository ? () => (
                    <Pressable accessibilityRole="button" accessibilityLabel={t('githubIssues.newIssue')} hitSlop={10} onPress={createIssue}>
                        <Ionicons name="add" size={25} color={theme.colors.header.tint} />
                    </Pressable>
                ) : undefined,
            }} />
            {connection.status !== 'connected' ? (
                <View style={styles.center}>
                    <Ionicons name="logo-github" size={38} color={theme.colors.textSecondary} />
                    {connection.status === 'checking' && <ActivityIndicator />}
                    {connection.status === 'unavailable' && <Text style={styles.secondary}>{connection.message}</Text>}
                    {connection.status === 'disconnected' && !prompt && (
                        <>
                            <Text style={styles.blockTitle}>{t('githubIssues.connectTitle')}</Text>
                            <Text style={styles.secondary}>{t('githubIssues.connectionDescription')}</Text>
                            <Pressable style={styles.primaryButton} onPress={() => void githubIssuesAuthorization.start()}>
                                <Text style={styles.primaryButtonText}>{t('githubIssues.connect')}</Text>
                            </Pressable>
                        </>
                    )}
                    {authorization.status === 'connecting' && !prompt && <ActivityIndicator />}
                    {prompt && (
                        <View style={styles.verificationCard}>
                            <Text style={styles.code}>{prompt.userCode}</Text>
                            <Pressable onPress={() => void Clipboard.setStringAsync(prompt.userCode)}><Text style={styles.link}>{t('githubIssues.copyCode')}</Text></Pressable>
                            <Pressable accessibilityRole="link" accessibilityLabel={t('githubIssues.openGithubVerification')} onPress={() => void openExternalUrl(prompt.verificationUri)}><Text style={styles.link}>{t('githubIssues.openGithub')}</Text></Pressable>
                            <Pressable onPress={githubIssuesAuthorization.cancel}><Text style={styles.secondary}>{t('common.cancel')}</Text></Pressable>
                        </View>
                    )}
                </View>
            ) : requested.mode === 'settings' ? (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.settingsCard}>
                        <Text style={styles.blockTitle}>{t('githubIssues.connectedAs', { login: connection.account.login })}</Text>
                        <Text style={styles.secondary}>{t('githubIssues.credentialStored')}</Text>
                        {githubIssuesApi.installationUrl && <Pressable style={styles.settingsRow} onPress={() => void openExternalUrl(githubIssuesApi.installationUrl!)}><Text style={styles.link}>{t('githubIssues.manageRepositoryAccess')}</Text></Pressable>}
                        <Pressable style={styles.settingsRow} onPress={() => void disconnect()}><Text style={styles.deleteText}>{t('githubIssues.removeDevice')}</Text></Pressable>
                    </View>
                </ScrollView>
            ) : repositories.length === 0 && !loading ? (
                <View style={styles.center}>
                    <Text style={styles.blockTitle}>{t('githubIssues.chooseRepositories')}</Text>
                    <Text style={styles.secondary}>{t('githubIssues.chooseRepositoriesDescription')}</Text>
                    {githubIssuesApi.installationUrl && <Pressable style={styles.primaryButton} onPress={() => void openExternalUrl(githubIssuesApi.installationUrl!)}><Text style={styles.primaryButtonText}>{t('githubIssues.manageAccess')}</Text></Pressable>}
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadIssues(true)} />}
                >
                    {repository && (
                        <View style={styles.toolbar}>
                            <Pressable accessibilityRole="button" onPress={() => setPickerVisible(true)} style={styles.repositoryButton}>
                                <Text style={styles.repositoryText} numberOfLines={1}>{repository.name}</Text>
                                <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                            </Pressable>
                            <View style={styles.filters}>
                                {(['open', 'closed'] as const).map((value) => (
                                    <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: state === value }} onPress={() => setState(value)} style={[styles.filter, state === value && styles.filterSelected]}>
                                        <Text style={[styles.filterText, state === value && styles.filterTextSelected]}>{t(value === 'open' ? 'githubIssues.open' : 'githubIssues.closed')} {items[value].length}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}
                    {error && <Pressable accessibilityRole="button" onPress={() => void loadIssues(true)} style={styles.errorBanner}><Text style={styles.errorText}>{error} · {t('githubIssues.retry')}</Text></Pressable>}
                    {loading && items[state].length === 0 && <ActivityIndicator style={styles.loader} />}
                    {!loading && repository && items[state].length === 0 && (
                        <View style={styles.empty}><Text style={styles.blockTitle}>{t(state === 'open' ? 'githubIssues.noOpenIssues' : 'githubIssues.noClosedIssues')}</Text><Pressable onPress={createIssue}><Text style={styles.link}>{t('githubIssues.newIssue')}</Text></Pressable></View>
                    )}
                    <View style={styles.list}>
                        {repository && items[state].map((issue) => (
                            <Pressable key={issue.number} accessibilityRole="button" accessibilityLabel={t('githubIssues.issueAccessibility', { number: issue.number, title: issue.title })} style={styles.issueCard} onPress={() => router.push({ pathname: '/github-issues/[number]', params: { owner: repository.owner, repo: repository.name, number: issue.number, ...(requested.sourceSessionId ? { sourceSessionId: requested.sourceSessionId } : {}) } } as any)}>
                                <Text style={styles.issueNumber}>#{issue.number}</Text>
                                <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
                                <View style={styles.metadata}>
                                    {issue.labels.slice(0, 2).map((label) => <View key={label.name} style={styles.label}><Text style={styles.labelText}>{label.name}</Text></View>)}
                                    <Text style={styles.metaText}>{relativeTime(issue.updatedAt)}</Text>
                                    {issue.comments > 0 && <Text style={styles.metaText}>◯ {issue.comments}</Text>}
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            )}
            <GithubRepositoryPicker visible={pickerVisible} repositories={repositories} selectedRepository={repository ? { owner: repository.owner, repo: repository.name } : null} onSelect={selectRepository} onClose={() => setPickerVisible(false)} onManageAccess={githubIssuesApi.installationUrl ? () => void openExternalUrl(githubIssuesApi.installationUrl!) : undefined} />
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    page: { flex: 1, backgroundColor: theme.colors.groupped.background },
    content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: 16, paddingBottom: 40 },
    center: { flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 28, backgroundColor: theme.colors.groupped.background },
    secondary: { color: theme.colors.textSecondary, textAlign: 'center', ...Typography.default() },
    blockTitle: { color: theme.colors.text, fontSize: 18, textAlign: 'center', ...Typography.default('semiBold') },
    primaryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 22, borderRadius: 12, backgroundColor: theme.colors.button.primary.background },
    primaryButtonText: { color: theme.colors.button.primary.tint, ...Typography.default('semiBold') },
    verificationCard: { minWidth: 260, alignItems: 'center', gap: 14, padding: 22, borderRadius: 18, backgroundColor: theme.colors.surface },
    code: { color: theme.colors.text, fontSize: 26, letterSpacing: 3, ...Typography.default('semiBold') },
    link: { color: theme.colors.textLink, ...Typography.default('semiBold') },
    toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    repositoryButton: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: theme.colors.surface },
    repositoryText: { maxWidth: 190, color: theme.colors.text, ...Typography.default('semiBold') },
    filters: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 7 },
    filter: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: theme.colors.surface },
    filterSelected: { backgroundColor: theme.colors.surfaceSelected },
    filterText: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    filterTextSelected: { color: theme.colors.text },
    errorBanner: { marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: theme.colors.surfaceHigh },
    errorText: { color: theme.colors.textDestructive, ...Typography.default() },
    loader: { marginTop: 40 },
    list: { gap: 9 },
    issueCard: { minHeight: 104, padding: 15, borderRadius: 16, backgroundColor: theme.colors.surface },
    issueNumber: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    issueTitle: { marginTop: 5, color: theme.colors.text, fontSize: 16, lineHeight: 21, ...Typography.default('semiBold') },
    metadata: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
    label: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: theme.colors.surfaceHigh },
    labelText: { color: theme.colors.textSecondary, fontSize: 11, ...Typography.default('semiBold') },
    metaText: { color: theme.colors.textSecondary, fontSize: 11, ...Typography.default() },
    empty: { minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 8 },
    settingsCard: { marginTop: 12, alignItems: 'center', gap: 10, padding: 20, borderRadius: 18, backgroundColor: theme.colors.surface },
    settingsRow: { minHeight: 46, width: '100%', alignItems: 'center', justifyContent: 'center' },
    deleteText: { color: theme.colors.textDestructive, ...Typography.default('semiBold') },
}));
