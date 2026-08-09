import * as React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUnistyles } from 'react-native-unistyles';
import { githubIssuesApi } from '@/features/github-issues/githubIssuesApi';
import { useLocalSetting } from '@/sync/storage';
import { Modal } from '@/modal';

export default function NewGithubIssueScreen() {
    const { owner, repo } = useLocalSearchParams<{ owner: string; repo: string }>();
    const router = useRouter(); const { theme } = useUnistyles();
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const [title, setTitle] = React.useState(''); const [body, setBody] = React.useState(''); const [saving, setSaving] = React.useState(false);
    const submit = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try { const issue = await githubIssuesApi.createIssue({ owner, repo, title, body }); router.replace({ pathname: '/github-issues/[number]', params: { owner, repo, number: issue.number } } as any); }
        catch (e) { Modal.alert('Could not create issue', e instanceof Error ? e.message : 'Unknown error'); }
        finally { setSaving(false); }
    };
    const inputStyle = { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.divider, borderWidth: 1, borderRadius: 10, padding: 12 } as const;
    if (!enabled) return <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}><Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>GitHub Issues is disabled.</Text></View>;
    return <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: theme.colors.groupped.background }}>
        <Text style={{ color: theme.colors.textSecondary }}>{owner}/{repo}</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Issue title" placeholderTextColor={theme.colors.textSecondary} style={inputStyle} autoFocus />
        <TextInput value={body} onChangeText={setBody} placeholder="Description (optional)" placeholderTextColor={theme.colors.textSecondary} style={[inputStyle, { minHeight: 160, textAlignVertical: 'top' }]} multiline />
        <Pressable disabled={saving || !title.trim()} onPress={submit} style={{ padding: 14, borderRadius: 10, alignItems: 'center', backgroundColor: theme.colors.button.primary.background }}>
            <Text style={{ color: theme.colors.button.primary.tint }}>{saving ? 'Creating…' : 'Create issue'}</Text>
        </Pressable>
    </View>;
}
