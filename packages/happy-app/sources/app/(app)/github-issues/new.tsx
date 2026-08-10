import * as React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { layout } from '@/components/layout';
import { Typography } from '@/constants/Typography';
import { githubIssuesApi, type GithubIssue } from '@/features/github-issues/githubIssuesApi';
import { Modal } from '@/modal';
import { storage, useLocalSetting } from '@/sync/storage';
import { t } from '@/text';

export default function NewGithubIssueScreen() {
    const params = useLocalSearchParams<{ owner: string; repo: string; sourceSessionId?: string }>();
    const router = useRouter();
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const draftKey = `${params.owner}/${params.repo}`.toLowerCase();
    const initial = storage.getState().localSettings.devGithubIssueDrafts[draftKey] ?? { title: '', body: '' };
    const [title, setTitle] = React.useState(initial.title);
    const [body, setBody] = React.useState(initial.body);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [created, setCreated] = React.useState<GithubIssue | null>(null);

    const persist = React.useCallback((nextTitle: string, nextBody: string) => {
        const drafts = { ...storage.getState().localSettings.devGithubIssueDrafts };
        if (nextTitle || nextBody) drafts[draftKey] = { title: nextTitle, body: nextBody };
        else delete drafts[draftKey];
        storage.getState().applyLocalSettings({ devGithubIssueDrafts: drafts });
    }, [draftKey]);
    const updateTitle = (value: string) => { setTitle(value); persist(value, body); };
    const updateBody = (value: string) => { setBody(value); persist(title, value); };
    const submit = async () => {
        if (!title.trim() || saving) return;
        setSaving(true);
        setError(null);
        try {
            const issue = await githubIssuesApi.createIssue({ owner: params.owner, repo: params.repo, title: title.trim(), body });
            persist('', '');
            setCreated(issue);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : t('githubIssues.createFailed'));
        } finally { setSaving(false); }
    };
    const cancel = async () => {
        if (!title.trim() && !body.trim()) { router.back(); return; }
        const discard = await Modal.confirm(t('githubIssues.keepDraftTitle'), t('githubIssues.keepDraftMessage'), { cancelText: t('githubIssues.keepDraft'), confirmText: t('githubIssues.discard'), destructive: true });
        if (discard) persist('', '');
        router.back();
    };

    if (!enabled) return <View style={styles.center}><Text style={styles.secondary}>{t('githubIssues.disabledShort')}</Text></View>;
    if (created) return (
        <View style={styles.center}>
            <Stack.Screen options={{ title: `#${created.number}`, headerLeft: () => null, headerRight: () => null }} />
            <Text style={styles.successTitle}>{t('githubIssues.issueCreated')}</Text>
            <Text style={styles.secondary}>{params.owner}/{params.repo} #{created.number}</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.replace({ pathname: '/github-issues/[number]', params: { ...params, number: created.number, startWork: '1' } } as any)}><Text style={styles.primaryText}>{t('githubIssues.workOnIt')}</Text></Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.replace({ pathname: '/github-issues/[number]', params: { ...params, number: created.number } } as any)}><Text style={styles.link}>{t('githubIssues.done')}</Text></Pressable>
        </View>
    );
    return (
        <View style={styles.page}>
            <Stack.Screen options={{
                title: t('githubIssues.newIssueTitle'),
                headerLeft: () => <Pressable accessibilityRole="button" onPress={() => void cancel()}><Text style={styles.link}>{t('common.cancel')}</Text></Pressable>,
                headerRight: () => <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving || !title.trim() }} disabled={saving || !title.trim()} onPress={() => void submit()}><Text style={[styles.link, (saving || !title.trim()) && styles.disabled]}>{saving ? t('githubIssues.creating') : t('githubIssues.create')}</Text></Pressable>,
            }} />
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>{t('githubIssues.repository')}</Text>
                <Text style={styles.repository}>{params.owner}/{params.repo}</Text>
                <Text style={styles.label}>{t('githubIssues.issueTitle')}</Text>
                <TextInput value={title} onChangeText={updateTitle} placeholder={t('githubIssues.issueTitlePlaceholder')} accessibilityLabel={t('githubIssues.issueTitlePlaceholder')} autoFocus style={styles.input} />
                <Text style={styles.label}>{t('githubIssues.description')}</Text>
                <TextInput value={body} onChangeText={updateBody} placeholder={t('githubIssues.descriptionPlaceholder')} accessibilityLabel={t('githubIssues.description')} multiline textAlignVertical="top" style={[styles.input, styles.bodyInput]} />
                {error && <Text style={styles.error}>{error}</Text>}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    page: { flex: 1, backgroundColor: theme.colors.groupped.background },
    content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: 18, gap: 9 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: theme.colors.groupped.background },
    label: { marginTop: 12, color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    repository: { color: theme.colors.text, fontSize: 16, ...Typography.default('semiBold') },
    input: { minHeight: 46, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 12, backgroundColor: theme.colors.input.background, color: theme.colors.input.text, ...Typography.default() },
    bodyInput: { minHeight: 220 },
    error: { marginTop: 8, color: theme.colors.textDestructive, ...Typography.default() },
    link: { color: theme.colors.textLink, ...Typography.default('semiBold') },
    disabled: { opacity: 0.45 },
    secondary: { color: theme.colors.textSecondary, textAlign: 'center', ...Typography.default() },
    successTitle: { color: theme.colors.text, fontSize: 22, ...Typography.default('semiBold') },
    primaryButton: { minWidth: 180, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: theme.colors.button.primary.background },
    primaryText: { color: theme.colors.button.primary.tint, ...Typography.default('semiBold') },
    secondaryButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 24 },
}));
