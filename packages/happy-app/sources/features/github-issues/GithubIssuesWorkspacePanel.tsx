import * as React from 'react';
import { ActivityIndicator, Modal as NativeModal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { MarkdownView } from '@/components/markdown/MarkdownView';
import { Typography } from '@/constants/Typography';
import { useNewSessionDraft } from '@/hooks/useNewSessionDraft';
import { useNavigateToSession } from '@/hooks/useNavigateToSession';
import { Modal } from '@/modal';
import { sessionBash } from '@/sync/ops';
import { storage, useAllSessions } from '@/sync/storage';
import { t } from '@/text';
import { openExternalUrl } from '@/utils/openExternalUrl';
import { getSessionName, getSessionSubtitle } from '@/utils/sessionUtils';
import {
    buildGithubIssueDispatchTask,
    getGithubIssueRelativeTime,
    getGithubIssuesErrorMessage,
    githubIssuesApi,
    prepareGithubIssueSessionDraft,
    type GithubIssue,
    type GithubIssueState,
} from './githubIssuesApi';
import type { GithubIssuesWorkspaceSelection } from './githubIssuesWorkspace';

export function GithubIssuesWorkspacePanel({
    parentSessionId,
    selection,
    onSelectionChange,
}: {
    parentSessionId: string;
    selection: GithubIssuesWorkspaceSelection;
    onSelectionChange: (selection: GithubIssuesWorkspaceSelection) => void;
}) {
    if (selection.mode === 'detail' && selection.issueNumber) {
        return <IssueDetail parentSessionId={parentSessionId} selection={selection} onSelectionChange={onSelectionChange} />;
    }
    if (selection.mode === 'new') {
        return <NewIssue selection={selection} onSelectionChange={onSelectionChange} />;
    }
    return <IssueList selection={selection} onSelectionChange={onSelectionChange} />;
}

function PanelHeader({ title, onBack, action }: { title: string; onBack?: () => void; action?: React.ReactNode }) {
    const { theme } = useUnistyles();
    return (
        <View style={styles.header}>
            {onBack ? (
                <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={onBack} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={20} color={theme.colors.textSecondary} />
                </Pressable>
            ) : null}
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            {action ?? <View style={styles.iconButton} />}
        </View>
    );
}

function IssueList({ selection, onSelectionChange }: {
    selection: GithubIssuesWorkspaceSelection;
    onSelectionChange: (selection: GithubIssuesWorkspaceSelection) => void;
}) {
    const { theme } = useUnistyles();
    const [state, setState] = React.useState<GithubIssueState>('open');
    const [issues, setIssues] = React.useState<GithubIssue[]>([]);
    const [nextPage, setNextPage] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const load = React.useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const result = await githubIssuesApi.listIssues({ ...selection.repository, state, page });
            setIssues((current) => page === 1 ? result.items : [...current, ...result.items]);
            setNextPage(result.nextPage);
            setError(null);
        } catch (caught) {
            setError(getGithubIssuesErrorMessage(caught));
        } finally {
            setLoading(false);
        }
    }, [selection.repository, state]);
    React.useEffect(() => { void load(); }, [load]);
    return (
        <View style={styles.page}>
            <PanelHeader
                title={`${selection.repository.owner}/${selection.repository.repo}`}
                action={(
                    <Pressable accessibilityRole="button" accessibilityLabel={t('githubIssues.newIssue')} onPress={() => onSelectionChange({ ...selection, mode: 'new', issueNumber: undefined })} style={styles.iconButton}>
                        <Ionicons name="add" size={20} color={theme.colors.textSecondary} />
                    </Pressable>
                )}
            />
            <View style={styles.filters}>
                {(['open', 'closed'] as const).map((value) => (
                    <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: state === value }} onPress={() => setState(value)} style={[styles.filter, state === value && styles.filterSelected]}>
                        <Text style={[styles.filterText, state === value && styles.filterTextSelected]}>{t(value === 'open' ? 'githubIssues.open' : 'githubIssues.closed')}</Text>
                    </Pressable>
                ))}
            </View>
            {error ? <Pressable onPress={() => void load()} style={styles.errorBanner}><Text style={styles.error}>{error} · {t('githubIssues.retry')}</Text></Pressable> : null}
            <ScrollView style={styles.scroll} contentContainerStyle={styles.listContent}>
                {loading && issues.length === 0 ? <ActivityIndicator style={styles.loading} /> : null}
                {!loading && issues.length === 0 ? <Text style={styles.empty}>{t(state === 'open' ? 'githubIssues.noOpenIssues' : 'githubIssues.noClosedIssues')}</Text> : null}
                {issues.map((issue) => (
                    <Pressable
                        key={issue.number}
                        accessibilityRole="button"
                        accessibilityLabel={t('githubIssues.issueAccessibility', { number: issue.number, title: issue.title })}
                        onPress={() => onSelectionChange({ ...selection, mode: 'detail', issueNumber: issue.number })}
                        style={({ pressed, hovered }: any) => [styles.issueRow, (pressed || hovered) && styles.rowHovered]}
                    >
                        <Text style={styles.issueNumber}>#{issue.number}</Text>
                        <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
                        <View style={styles.metadata}>
                            {issue.labels.slice(0, 2).map((label) => <Text key={label.name} style={styles.metaText}>{label.name}</Text>)}
                            <Text style={styles.metaText}>{formatRelativeTime(issue.updatedAt)}</Text>
                            {issue.comments > 0 ? <Text style={styles.metaText}>◯ {issue.comments}</Text> : null}
                        </View>
                    </Pressable>
                ))}
                {nextPage ? <Pressable disabled={loading} onPress={() => void load(nextPage)} style={styles.loadMore}><Text style={styles.link}>{t('githubIssues.loadMore')}</Text></Pressable> : null}
            </ScrollView>
        </View>
    );
}

function IssueDetail({ parentSessionId, selection, onSelectionChange }: {
    parentSessionId: string;
    selection: GithubIssuesWorkspaceSelection;
    onSelectionChange: (selection: GithubIssuesWorkspaceSelection) => void;
}) {
    const { theme } = useUnistyles();
    const router = useRouter();
    const newSessionDraft = useNewSessionDraft();
    const navigateToSession = useNavigateToSession();
    const allSessions = useAllSessions();
    const [issue, setIssue] = React.useState<GithubIssue | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [mutating, setMutating] = React.useState(false);
    const [actionsVisible, setActionsVisible] = React.useState(false);
    const [dispatchVisible, setDispatchVisible] = React.useState(false);
    const [workflow, setWorkflow] = React.useState<'triage-first' | 'repository-rules'>('repository-rules');
    const number = selection.issueNumber!;
    const load = React.useCallback(async () => {
        try {
            setIssue(await githubIssuesApi.getIssue({ ...selection.repository, number }));
            setError(null);
        } catch (caught) {
            setError(getGithubIssuesErrorMessage(caught));
        }
    }, [number, selection.repository]);
    React.useEffect(() => { void load(); }, [load]);
    React.useEffect(() => {
        const source = storage.getState().sessions[parentSessionId];
        if (!source?.metadata?.path) return;
        void sessionBash(parentSessionId, {
            command: 'test -f .agents/skills/triage/SKILL.md || test -f .claude/skills/triage/SKILL.md',
            cwd: source.metadata.path,
            timeout: 3000,
        }).then((result) => setWorkflow(result.success ? 'triage-first' : 'repository-rules'));
    }, [parentSessionId]);

    if (!issue) return <View style={styles.center}>{error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator />}</View>;
    const task = buildGithubIssueDispatchTask({ repository: selection.repository, issue, workflow });
    const source = storage.getState().sessions[parentSessionId];
    const matching = source?.metadata?.path
        ? allSessions.filter((candidate) => candidate.active && candidate.metadata?.path === source.metadata?.path)
        : [];
    const setState = async () => {
        if (mutating) return;
        setMutating(true);
        try {
            setIssue(await githubIssuesApi.setIssueState({ ...selection.repository, number, state: issue.state === 'open' ? 'closed' : 'open' }));
        } catch (caught) {
            Modal.alert(t('githubIssues.updateFailed'), getGithubIssuesErrorMessage(caught));
        } finally { setMutating(false); }
    };
    const remove = async () => {
        const identity = `${selection.repository.owner}/${selection.repository.repo} #${issue.number}`;
        const confirmed = await Modal.confirm(t('githubIssues.deleteConfirmTitle'), t('githubIssues.deleteConfirmMessage', { identity }), { cancelText: t('common.cancel'), confirmText: t('githubIssues.deletePermanently'), destructive: true });
        if (!confirmed) return;
        setMutating(true);
        try {
            await githubIssuesApi.deleteIssue({ ...selection.repository, number });
            onSelectionChange({ ...selection, mode: 'list', issueNumber: undefined });
        } catch (caught) {
            Modal.alert(t('githubIssues.deleteFailed'), getGithubIssuesErrorMessage(caught));
        } finally { setMutating(false); }
    };
    const addToSession = async (sessionId: string) => {
        const current = storage.getState().sessions[sessionId];
        if (current?.draft?.trim()) {
            const confirmed = await Modal.confirm(t('githubIssues.addDraftTitle'), t('githubIssues.addDraftMessage'), { cancelText: t('common.cancel'), confirmText: t('githubIssues.addDraft') });
            if (!confirmed) return;
        }
        storage.getState().updateSessionDraft(sessionId, prepareGithubIssueSessionDraft(current?.draft, task));
        setDispatchVisible(false);
        if (sessionId !== parentSessionId) navigateToSession(sessionId);
    };
    const startNewSession = () => {
        if (source?.metadata?.machineId) newSessionDraft.setMachineId(source.metadata.machineId);
        if (source?.metadata?.path) newSessionDraft.setPath(source.metadata.path);
        newSessionDraft.setInput(task.prompt);
        setDispatchVisible(false);
        router.navigate('/new');
    };
    return (
        <View style={styles.page}>
            <PanelHeader
                title={`#${issue.number}`}
                onBack={() => onSelectionChange({ ...selection, mode: 'list', issueNumber: undefined })}
                action={(
                    <Pressable accessibilityRole="button" accessibilityLabel={t('githubIssues.issueActions')} onPress={() => setActionsVisible((value) => !value)} style={styles.iconButton}>
                        <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
                    </Pressable>
                )}
            />
            {actionsVisible ? (
                <View style={styles.actionsMenu}>
                    <Pressable onPress={() => void openExternalUrl(issue.url)}><Text style={styles.menuText}>{t('githubIssues.openOnGithub')}</Text></Pressable>
                    {issue.viewerCanDelete ? <Pressable disabled={mutating} onPress={() => void remove()}><Text style={styles.deleteText}>{t('githubIssues.deletePermanently')}</Text></Pressable> : null}
                </View>
            ) : null}
            <ScrollView style={styles.scroll} contentContainerStyle={styles.detailContent}>
                <Text style={styles.detailTitle}>{issue.title}</Text>
                <Text style={styles.secondary}>{t(issue.state === 'open' ? 'githubIssues.open' : 'githubIssues.closed')} · {issue.author?.login ?? 'unknown'} · {formatRelativeTime(issue.updatedAt)} · {issue.comments}</Text>
                {issue.labels.length > 0 ? <View style={styles.labels}>{issue.labels.map((label) => <Text key={label.name} style={styles.label}>{label.name}</Text>)}</View> : null}
                <View style={styles.body}>{issue.body ? <MarkdownView markdown={issue.body} /> : <Text style={styles.secondary}>{t('githubIssues.noDescription')}</Text>}</View>
                <Pressable accessibilityRole="button" onPress={() => setDispatchVisible(true)} style={styles.primaryButton}><Text style={styles.primaryText}>{t('githubIssues.workOnIssue')}</Text></Pressable>
                <Pressable accessibilityRole="button" disabled={mutating} onPress={() => void setState()} style={styles.lifecycleButton}><Text style={styles.link}>{mutating ? t('githubIssues.updating') : t(issue.state === 'open' ? 'githubIssues.closeIssue' : 'githubIssues.reopenIssue')}</Text></Pressable>
            </ScrollView>
            <NativeModal visible={dispatchVisible} transparent animationType="fade" onRequestClose={() => setDispatchVisible(false)}>
                <Pressable style={styles.backdrop} onPress={() => setDispatchVisible(false)}>
                    <View style={styles.dispatchSheet}>
                        <Text style={styles.sheetTitle}>{t('githubIssues.workOnIssueNumber', { number: issue.number })}</Text>
                        {matching.map((candidate) => (
                            <Pressable key={candidate.id} style={styles.targetRow} onPress={() => void addToSession(candidate.id)}>
                                <Text style={styles.menuText}>{candidate.id === parentSessionId ? t('githubIssues.addCurrentSession') : getSessionName(candidate)}</Text>
                                <Text style={styles.secondary}>{candidate.draft ? `${t('githubIssues.keepsDraft')} · ` : ''}{getSessionSubtitle(candidate)}</Text>
                            </Pressable>
                        ))}
                        <Pressable style={styles.targetRow} onPress={startNewSession}><Text style={styles.menuText}>{t('githubIssues.startNewSession')}</Text></Pressable>
                    </View>
                </Pressable>
            </NativeModal>
        </View>
    );
}

function NewIssue({ selection, onSelectionChange }: {
    selection: GithubIssuesWorkspaceSelection;
    onSelectionChange: (selection: GithubIssuesWorkspaceSelection) => void;
}) {
    const draftKey = `${selection.repository.owner}/${selection.repository.repo}`.toLowerCase();
    const initial = storage.getState().localSettings.devGithubIssueDrafts[draftKey] ?? { title: '', body: '' };
    const [title, setTitle] = React.useState(initial.title);
    const [body, setBody] = React.useState(initial.body);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const persist = React.useCallback((nextTitle: string, nextBody: string) => {
        const drafts = { ...storage.getState().localSettings.devGithubIssueDrafts };
        if (nextTitle || nextBody) drafts[draftKey] = { title: nextTitle, body: nextBody };
        else delete drafts[draftKey];
        storage.getState().applyLocalSettings({ devGithubIssueDrafts: drafts });
    }, [draftKey]);
    const submit = async () => {
        if (!title.trim() || saving) return;
        setSaving(true);
        try {
            const created = await githubIssuesApi.createIssue({ ...selection.repository, title: title.trim(), body });
            persist('', '');
            onSelectionChange({ ...selection, mode: 'detail', issueNumber: created.number });
        } catch (caught) {
            setError(getGithubIssuesErrorMessage(caught));
        } finally { setSaving(false); }
    };
    return (
        <View style={styles.page}>
            <PanelHeader title={t('githubIssues.newIssueTitle')} onBack={() => onSelectionChange({ ...selection, mode: 'list', issueNumber: undefined })} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
                <Text style={styles.formLabel}>{t('githubIssues.repository')}</Text>
                <Text style={styles.repository}>{selection.repository.owner}/{selection.repository.repo}</Text>
                <Text style={styles.formLabel}>{t('githubIssues.issueTitle')}</Text>
                <TextInput value={title} onChangeText={(value) => { setTitle(value); persist(value, body); }} placeholder={t('githubIssues.issueTitlePlaceholder')} accessibilityLabel={t('githubIssues.issueTitlePlaceholder')} style={styles.input} />
                <Text style={styles.formLabel}>{t('githubIssues.description')}</Text>
                <TextInput value={body} onChangeText={(value) => { setBody(value); persist(title, value); }} placeholder={t('githubIssues.descriptionPlaceholder')} accessibilityLabel={t('githubIssues.description')} multiline textAlignVertical="top" style={[styles.input, styles.bodyInput]} />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving || !title.trim() }} disabled={saving || !title.trim()} onPress={() => void submit()} style={[styles.primaryButton, (saving || !title.trim()) && styles.disabled]}>
                    <Text style={styles.primaryText}>{saving ? t('githubIssues.creating') : t('githubIssues.create')}</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

function formatRelativeTime(updatedAt: string): string {
    const value = getGithubIssueRelativeTime(updatedAt);
    if (!value || value.unit === 'now') return t('githubIssues.updatedNow');
    if (value.unit === 'minute') return t('githubIssues.updatedMinutes', { count: value.value });
    if (value.unit === 'hour') return t('githubIssues.updatedHours', { count: value.value });
    return t('githubIssues.updatedDays', { count: value.value });
}

const styles = StyleSheet.create((theme) => ({
    page: { flex: 1, backgroundColor: theme.colors.groupped.background },
    header: { minHeight: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider },
    headerTitle: { flex: 1, color: theme.colors.text, fontSize: 14, ...Typography.default('semiBold') },
    iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
    filters: { flexDirection: 'row', gap: 6, padding: 10 },
    filter: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 15 },
    filterSelected: { backgroundColor: theme.colors.surfaceSelected },
    filterText: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    filterTextSelected: { color: theme.colors.text },
    scroll: { flex: 1 },
    listContent: { paddingHorizontal: 8, paddingBottom: 18 },
    issueRow: { padding: 11, borderRadius: 12 },
    rowHovered: { backgroundColor: theme.colors.surfaceHigh },
    issueNumber: { color: theme.colors.textSecondary, fontSize: 11, ...Typography.mono() },
    issueTitle: { marginTop: 4, color: theme.colors.text, fontSize: 13, lineHeight: 18, ...Typography.default('semiBold') },
    metadata: { marginTop: 7, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
    metaText: { color: theme.colors.textSecondary, fontSize: 10, ...Typography.default() },
    loading: { marginTop: 30 },
    empty: { padding: 28, color: theme.colors.textSecondary, textAlign: 'center', ...Typography.default() },
    loadMore: { minHeight: 42, alignItems: 'center', justifyContent: 'center' },
    errorBanner: { margin: 8, padding: 10, borderRadius: 10, backgroundColor: theme.colors.surfaceHigh },
    error: { color: theme.colors.textDestructive, ...Typography.default() },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    actionsMenu: { position: 'absolute', zIndex: 20, top: 48, right: 10, minWidth: 180, gap: 14, padding: 14, borderRadius: 13, backgroundColor: theme.colors.surfaceHighest },
    menuText: { color: theme.colors.text, ...Typography.default('semiBold') },
    deleteText: { color: theme.colors.textDestructive, ...Typography.default('semiBold') },
    detailContent: { padding: 15, paddingBottom: 30 },
    detailTitle: { color: theme.colors.text, fontSize: 20, lineHeight: 26, ...Typography.default('semiBold') },
    secondary: { marginTop: 7, color: theme.colors.textSecondary, ...Typography.default() },
    labels: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    label: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: theme.colors.surfaceHigh, color: theme.colors.textSecondary, fontSize: 11, ...Typography.default('semiBold') },
    body: { marginTop: 18, minHeight: 120, padding: 12, borderRadius: 13, backgroundColor: theme.colors.surface },
    primaryButton: { minHeight: 44, marginTop: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.colors.button.primary.background },
    primaryText: { color: theme.colors.button.primary.tint, ...Typography.default('semiBold') },
    lifecycleButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
    link: { color: theme.colors.textLink, ...Typography.default('semiBold') },
    backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18, backgroundColor: 'rgba(0,0,0,0.35)' },
    dispatchSheet: { width: '100%', maxWidth: 440, gap: 7, padding: 14, borderRadius: 18, backgroundColor: theme.colors.surface },
    sheetTitle: { padding: 7, color: theme.colors.text, fontSize: 17, ...Typography.default('semiBold') },
    targetRow: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 11, backgroundColor: theme.colors.surfaceHigh },
    formContent: { padding: 15, paddingBottom: 28 },
    formLabel: { marginTop: 11, marginBottom: 6, color: theme.colors.textSecondary, fontSize: 11, ...Typography.default('semiBold') },
    repository: { color: theme.colors.text, fontSize: 14, ...Typography.default('semiBold') },
    input: { minHeight: 44, paddingHorizontal: 11, paddingVertical: 10, borderRadius: 11, backgroundColor: theme.colors.input.background, color: theme.colors.input.text, ...Typography.default() },
    bodyInput: { minHeight: 180 },
    disabled: { opacity: 0.45 },
}));
