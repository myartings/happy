import * as React from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUnistyles } from 'react-native-unistyles';
import { useAuth } from '@/auth/AuthContext';
import { Item } from '@/components/Item';
import { ItemGroup } from '@/components/ItemGroup';
import { ItemList } from '@/components/ItemList';
import { GithubIssuesApiError, githubIssuesApi, type GithubIssue, type GithubIssueState, type GithubRepository } from '@/features/github-issues/githubIssuesApi';
import { useLocalSetting } from '@/sync/storage';
import { getGitHubOAuthParams } from '@/sync/apiGithub';

export default function GithubIssuesScreen() {
    const { credentials } = useAuth();
    const requestedRepository = useLocalSearchParams<{ owner?: string; repo?: string }>();
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const router = useRouter();
    const { theme } = useUnistyles();
    const [repositories, setRepositories] = React.useState<GithubRepository[]>([]);
    const [installationUrl, setInstallationUrl] = React.useState<string | null>(null);
    const [repository, setRepository] = React.useState<GithubRepository | null>(null);
    const [issues, setIssues] = React.useState<GithubIssue[]>([]);
    const [state, setState] = React.useState<GithubIssueState>('open');
    const [loading, setLoading] = React.useState(true);
    const [reloadKey, setReloadKey] = React.useState(0);
    const [error, setError] = React.useState<string | null>(null);
    const [reconnectRequired, setReconnectRequired] = React.useState(false);
    const reconnect = React.useCallback(async () => {
        if (!credentials) return;
        try { const { url } = await getGitHubOAuthParams(credentials); await Linking.openURL(url); }
        catch (e) { setError(e instanceof Error ? e.message : 'Unable to connect GitHub'); }
    }, [credentials]);

    const loadRepositories = React.useCallback(async () => {
        if (!enabled || !credentials) return;
        setLoading(true); setError(null); setReconnectRequired(false);
        try {
            const result = await githubIssuesApi.repositories(credentials);
            setRepositories(result.repositories);
            setInstallationUrl(result.installationUrl);
            setRepository((current) => current
                ?? result.repositories.find((item) => item.owner.toLowerCase() === requestedRepository.owner?.toLowerCase()
                    && item.name.toLowerCase() === requestedRepository.repo?.toLowerCase())
                ?? result.repositories[0]
                ?? null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unable to load repositories');
            setReconnectRequired(e instanceof GithubIssuesApiError && ['github_not_connected', 'github_reconnect_required', 'github_auth_required'].includes(e.code));
        }
        finally { setLoading(false); }
    }, [credentials, enabled, requestedRepository.owner, requestedRepository.repo]);

    React.useEffect(() => { void loadRepositories(); }, [loadRepositories]);
    React.useEffect(() => {
        if (!enabled || !credentials || !repository) { setIssues([]); return; }
        setLoading(true); setError(null);
        githubIssuesApi.list(credentials, repository.owner, repository.name, state)
            .then((result) => setIssues(result.items))
            .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load issues'))
            .finally(() => setLoading(false));
    }, [credentials, enabled, reloadKey, repository, state]);

    if (!enabled) return <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}><Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>GitHub Issues is disabled in Settings → Features.</Text></View>;
    if (loading && repositories.length === 0) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
    return (
        <ItemList>
            {error && <ItemGroup title={reconnectRequired ? 'GitHub connection' : 'Could not load Issues'}>
                <Item title={reconnectRequired ? 'Reconnect GitHub' : 'Try again'} subtitle={error}
                    onPress={reconnectRequired
                        ? () => void reconnect()
                        : repository ? () => setReloadKey((value) => value + 1) : () => void loadRepositories()} />
            </ItemGroup>}
            <ItemGroup title="Repository" footer="Only repositories selected for the Happy GitHub App appear here.">
                {repositories.length === 0 && (
                    <Item title="No repositories available" subtitle="Install Happy's GitHub App and select repositories to continue."
                        onPress={installationUrl ? () => void Linking.openURL(installationUrl) : undefined}
                        showChevron={!!installationUrl} />
                )}
                {repositories.map((item) => (
                    <Item key={item.id} title={item.fullName} detail={repository?.id === item.id ? 'Selected' : undefined}
                        onPress={() => setRepository(item)} showChevron={false} />
                ))}
            </ItemGroup>
            {repository && (
                <>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 12, alignItems: 'center' }}>
                        <Pressable onPress={() => setState('open')}><Text style={{ color: state === 'open' ? theme.colors.button.primary.tint : theme.colors.textSecondary }}>Open</Text></Pressable>
                        <Pressable onPress={() => setState('closed')}><Text style={{ color: state === 'closed' ? theme.colors.button.primary.tint : theme.colors.textSecondary }}>Closed</Text></Pressable>
                        <View style={{ flex: 1 }} />
                        <Pressable onPress={() => router.push({ pathname: '/github-issues/new', params: { owner: repository.owner, repo: repository.name } } as any)}>
                            <Text style={{ color: theme.colors.button.primary.tint }}>New issue</Text>
                        </Pressable>
                    </View>
                    <ItemGroup title={`${repository.fullName} · ${state}`}>
                        {loading && <ActivityIndicator style={{ margin: 16 }} />}
                        {!loading && issues.length === 0 && <Item title={`No ${state} issues`} showChevron={false} />}
                        {issues.map((issue) => (
                            <Item key={issue.number} title={`#${issue.number} ${issue.title}`}
                                subtitle={`${issue.author?.login ?? 'unknown'} · ${issue.comments} comments`}
                                onPress={() => router.push({ pathname: '/github-issues/[number]', params: { owner: repository.owner, repo: repository.name, number: issue.number } } as any)} />
                        ))}
                    </ItemGroup>
                </>
            )}
        </ItemList>
    );
}
