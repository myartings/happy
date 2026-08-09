import * as React from 'react';
import { ActivityIndicator, AppState, Pressable, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUnistyles } from 'react-native-unistyles';
import { Item } from '@/components/Item';
import { ItemGroup } from '@/components/ItemGroup';
import { ItemList } from '@/components/ItemList';
import {
    GithubIssuesError,
    githubIssuesAuthorization,
    githubIssuesApi,
    type DeviceVerificationPrompt,
    type GithubConnectedAccount,
    type GithubIssue,
    type GithubIssueState,
    type GithubRepository,
} from '@/features/github-issues/githubIssuesApi';
import { useLocalSetting } from '@/sync/storage';
import { openExternalUrl } from '@/utils/openExternalUrl';

type ConnectionState =
    | { status: 'checking' }
    | { status: 'disconnected' }
    | { status: 'unavailable'; message: string }
    | { status: 'connected'; account: GithubConnectedAccount };

function messageFor(error: unknown): string {
    if (!(error instanceof GithubIssuesError)) return error instanceof Error ? error.message : 'Unable to use GitHub Issues';
    switch (error.code) {
        case 'unsupported_platform': return 'GitHub Issues is available in Happy desktop and mobile.';
        case 'not_configured': return 'This Happy build is missing the GitHub Issues App configuration.';
        case 'secure_storage_unavailable': return 'Secure credential storage is unavailable on this device.';
        case 'authorization_denied': return 'GitHub authorization was denied.';
        case 'authorization_expired': return 'The GitHub verification code expired. Try connecting again.';
        case 'reauthorization_required': return 'GitHub Issues needs to be connected again.';
        case 'permission_denied': return 'The selected repository does not grant the required Issue permission.';
        case 'rate_limited': return 'GitHub rate limit reached. Try again later.';
        case 'offline': return 'Unable to reach GitHub. Check your connection and try again.';
        default: return error.message;
    }
}

export default function GithubIssuesScreen() {
    const requestedRepository = useLocalSearchParams<{ owner?: string; repo?: string }>();
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const router = useRouter();
    const { theme } = useUnistyles();
    const [connection, setConnection] = React.useState<ConnectionState>({ status: 'checking' });
    const [authorization, setAuthorization] = React.useState(githubIssuesAuthorization.getSnapshot());
    const [repositories, setRepositories] = React.useState<GithubRepository[]>([]);
    const [repository, setRepository] = React.useState<GithubRepository | null>(null);
    const [issues, setIssues] = React.useState<GithubIssue[]>([]);
    const [state, setState] = React.useState<GithubIssueState>('open');
    const [loading, setLoading] = React.useState(true);
    const [reloadKey, setReloadKey] = React.useState(0);
    const [error, setError] = React.useState<string | null>(null);

    const loadRepositories = React.useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        setError(null);
        try {
            const current = await githubIssuesApi.getConnectionState();
            if (current.status === 'disconnected') {
                setConnection(current);
                setRepositories([]);
                setRepository(null);
                return;
            }
            setConnection(current);
            const result = await githubIssuesApi.listRepositories();
            setRepositories(result);
            setRepository((selected) => selected
                ?? result.find((item) => item.owner.toLowerCase() === requestedRepository.owner?.toLowerCase()
                    && item.name.toLowerCase() === requestedRepository.repo?.toLowerCase())
                ?? result[0]
                ?? null);
        } catch (caught) {
            const message = messageFor(caught);
            if (caught instanceof GithubIssuesError
                && ['unsupported_platform', 'not_configured', 'secure_storage_unavailable'].includes(caught.code)) {
                setConnection({ status: 'unavailable', message });
                setError(null);
                return;
            }
            setError(message);
            if (caught instanceof GithubIssuesError && ['not_connected', 'reauthorization_required'].includes(caught.code)) {
                setConnection({ status: 'disconnected' });
            }
        } finally {
            setLoading(false);
        }
    }, [enabled, requestedRepository.owner, requestedRepository.repo]);

    React.useEffect(() => { void loadRepositories(); }, [loadRepositories]);
    React.useEffect(() => githubIssuesAuthorization.subscribe(setAuthorization), []);
    React.useEffect(() => {
        if (authorization.status === 'connected') {
            void loadRepositories().finally(() => githubIssuesAuthorization.clear());
        } else if (authorization.status === 'failed') {
            setError(messageFor(authorization.error));
            setConnection({ status: 'disconnected' });
            githubIssuesAuthorization.clear();
        }
    }, [authorization, loadRepositories]);
    React.useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active' && connection.status === 'connected') {
                void loadRepositories();
            }
        });
        return () => subscription.remove();
    }, [connection.status, loadRepositories]);
    React.useEffect(() => {
        if (!enabled || connection.status !== 'connected' || !repository) {
            setIssues([]);
            return;
        }
        setLoading(true);
        setError(null);
        githubIssuesApi.listIssues({ owner: repository.owner, repo: repository.name, state })
            .then((result) => setIssues(result.items))
            .catch((caught) => setError(messageFor(caught)))
            .finally(() => setLoading(false));
    }, [connection.status, enabled, reloadKey, repository, state]);

    const connect = React.useCallback(() => {
        setError(null);
        void githubIssuesAuthorization.start();
    }, []);

    const disconnect = React.useCallback(async () => {
        try {
            await githubIssuesApi.disconnect();
            setConnection({ status: 'disconnected' });
            setRepositories([]);
            setRepository(null);
            setIssues([]);
        } catch (caught) {
            setError(messageFor(caught));
        }
    }, []);

    if (!enabled) {
        return <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}><Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>GitHub Issues is disabled in Settings → Features.</Text></View>;
    }

    const prompt: DeviceVerificationPrompt | null = authorization.status === 'connecting'
        ? authorization.prompt
        : null;
    return (
        <ItemList>
            {error && <ItemGroup title="Could not use GitHub Issues">
                <Item title="Try again" subtitle={error} onPress={() => void loadRepositories()} />
            </ItemGroup>}
            <ItemGroup
                title="GitHub Issues connection"
                footer="This device-local connection is separate from your Happy GitHub profile."
            >
                {connection.status === 'checking' && <Item title="Checking connection…" loading showChevron={false} />}
                {connection.status === 'unavailable' && <Item title="GitHub Issues unavailable" subtitle={connection.message} showChevron={false} />}
                {connection.status === 'disconnected' && authorization.status !== 'connecting' && (
                    <Item title="Connect GitHub Issues" subtitle="Authorize the selected-repository GitHub App on this device" onPress={() => void connect()} />
                )}
                {authorization.status === 'connecting' && !prompt && <Item title="Requesting verification code…" loading showChevron={false} />}
                {prompt && (
                    <>
                        <Item title={prompt.userCode} subtitle="Copy this code, then enter it on GitHub" onPress={() => void Clipboard.setStringAsync(prompt.userCode)} />
                        <Item title="Open GitHub" subtitle={prompt.verificationUri} onPress={() => void openExternalUrl(prompt.verificationUri)} />
                        <Item title="Cancel" destructive onPress={() => githubIssuesAuthorization.cancel()} showChevron={false} />
                    </>
                )}
                {connection.status === 'connected' && (
                    <>
                        <Item title={`Connected as @${connection.account.login}`} subtitle="Credential stored securely on this device" showChevron={false} />
                        <Item title="Remove from this device" destructive onPress={() => void disconnect()} showChevron={false} />
                        {githubIssuesApi.installationUrl && (
                            <Item title="Manage repository access" onPress={() => void openExternalUrl(githubIssuesApi.installationUrl!)} />
                        )}
                    </>
                )}
            </ItemGroup>
            {connection.status === 'connected' && (
                <ItemGroup title="Repository" footer="Only repositories selected for the GitHub App appear here.">
                    {repositories.length === 0 && !loading && (
                        <Item title="No repositories available" subtitle="Install the GitHub App and select repositories to continue."
                            onPress={githubIssuesApi.installationUrl ? () => void openExternalUrl(githubIssuesApi.installationUrl!) : undefined}
                            showChevron={!!githubIssuesApi.installationUrl} />
                    )}
                    {repositories.map((item) => (
                        <Item key={item.id} title={item.fullName} detail={repository?.id === item.id ? 'Selected' : undefined}
                            onPress={() => setRepository(item)} showChevron={false} />
                    ))}
                </ItemGroup>
            )}
            {connection.status === 'connected' && repository && (
                <ItemGroup title={`${repository.fullName} · ${state}`}>
                    <View style={{ flexDirection: 'row', minHeight: 52, paddingHorizontal: 16, gap: 16, alignItems: 'center' }}>
                        <Pressable accessibilityRole="button" onPress={() => setState('open')}>
                            <Text style={{ color: state === 'open' ? theme.colors.textLink : theme.colors.textSecondary, fontWeight: state === 'open' ? '600' : '400' }}>Open</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" onPress={() => setState('closed')}>
                            <Text style={{ color: state === 'closed' ? theme.colors.textLink : theme.colors.textSecondary, fontWeight: state === 'closed' ? '600' : '400' }}>Closed</Text>
                        </Pressable>
                        <View style={{ flex: 1 }} />
                        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/github-issues/new', params: { owner: repository.owner, repo: repository.name } } as any)}>
                            <Text style={{ color: theme.colors.textLink, fontWeight: '600' }}>New issue</Text>
                        </Pressable>
                    </View>
                    {loading && <ActivityIndicator style={{ margin: 16 }} />}
                    {!loading && issues.length === 0 && <Item title={`No ${state} issues`} showChevron={false} />}
                    {issues.map((issue) => (
                        <Item key={issue.number} title={`#${issue.number} ${issue.title}`}
                            subtitle={`${issue.author?.login ?? 'unknown'} · ${issue.comments} comments`}
                            onPress={() => router.push({ pathname: '/github-issues/[number]', params: { owner: repository.owner, repo: repository.name, number: issue.number } } as any)} />
                    ))}
                </ItemGroup>
            )}
        </ItemList>
    );
}
