import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUnistyles } from 'react-native-unistyles';
import { githubIssuesApi, type GithubIssue } from '@/features/github-issues/githubIssuesApi';
import { useLocalSetting } from '@/sync/storage';
import { MarkdownView } from '@/components/markdown/MarkdownView';
import { Modal } from '@/modal';

export default function GithubIssueDetailScreen() {
    const params = useLocalSearchParams<{ owner: string; repo: string; number: string }>();
    const number = Number(params.number); const router = useRouter(); const { theme } = useUnistyles();
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const [issue, setIssue] = React.useState<GithubIssue | null>(null); const [error, setError] = React.useState<string | null>(null);
    const load = React.useCallback(async () => {
        if (!enabled) return;
        try { setIssue(await githubIssuesApi.getIssue({ owner: params.owner, repo: params.repo, number })); }
        catch (e) { setError(e instanceof Error ? e.message : 'Unable to load issue'); }
    }, [enabled, number, params.owner, params.repo]);
    React.useEffect(() => { void load(); }, [load]);
    if (!enabled) return <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}><Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>GitHub Issues is disabled.</Text></View>;
    if (!issue) return <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>{error ? <Text style={{ color: theme.colors.textDestructive }}>{error}</Text> : <ActivityIndicator />}</View>;
    const setState = async () => {
        try {
            await githubIssuesApi.setIssueState({ owner: params.owner, repo: params.repo, number, state: issue.state === 'open' ? 'closed' : 'open' });
            await load();
        } catch (e) { Modal.alert('Could not update issue', e instanceof Error ? e.message : 'Unknown error'); }
    };
    const remove = async () => {
        const confirmed = await Modal.confirm(
            'Permanently delete issue?',
            'This cannot be undone on GitHub.',
            { cancelText: 'Cancel', confirmText: 'Delete', destructive: true },
        );
        if (!confirmed) return;
        try {
            await githubIssuesApi.deleteIssue({ owner: params.owner, repo: params.repo, number });
            router.back();
        } catch (e) {
            Modal.alert('Could not delete issue', e instanceof Error ? e.message : 'Unknown error');
        }
    };
    return <ScrollView contentContainerStyle={{ padding: 18, gap: 14 }} style={{ flex: 1, backgroundColor: theme.colors.groupped.background }}>
        <Text style={{ color: theme.colors.textSecondary }}>{params.owner}/{params.repo} · #{issue.number} · {issue.state}</Text>
        <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '600' }}>{issue.title}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>Opened by {issue.author?.login ?? 'unknown'} · {issue.comments} comments</Text>
        {issue.labels.length > 0 && <Text style={{ color: theme.colors.textSecondary }}>{issue.labels.map((label) => label.name).join(' · ')}</Text>}
        {issue.body ? <MarkdownView markdown={issue.body} /> : <Text style={{ color: theme.colors.textSecondary }}>No description.</Text>}
        <Pressable accessibilityRole="button" onPress={setState} style={{ paddingVertical: 12 }}>
            <Text style={{ color: theme.colors.textLink, fontWeight: '600' }}>{issue.state === 'open' ? 'Close issue' : 'Reopen issue'}</Text>
        </Pressable>
        {issue.viewerCanDelete && <Pressable onPress={remove} style={{ paddingVertical: 12 }}><Text style={{ color: theme.colors.textDestructive }}>Permanently delete</Text></Pressable>}
    </ScrollView>;
}
