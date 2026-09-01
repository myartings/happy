import * as React from 'react';
import { ActivityIndicator, Modal as NativeModal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { layout } from '@/components/layout';
import { MarkdownView } from '@/components/markdown/MarkdownView';
import { Typography } from '@/constants/Typography';
import {
    buildGithubIssueDispatchTask,
    getGithubIssueRelativeTime,
    githubIssuesApi,
    githubIssuesRepositoryResolver,
    prepareGithubIssueSessionDraft,
    type GithubIssue,
    type GithubRepository,
} from '@/features/github-issues/githubIssuesApi';
import { useNewSessionDraft } from '@/hooks/useNewSessionDraft';
import { useNavigateToSession } from '@/hooks/useNavigateToSession';
import { Modal } from '@/modal';
import { storage, useLocalSetting } from '@/sync/storage';
import { sessionBash } from '@/sync/ops';
import { openExternalUrl } from '@/utils/openExternalUrl';
import { getSessionSubtitle } from '@/utils/sessionUtils';
import { t } from '@/text';
import { getGithubIssueBindingDispatchActionKey, resolveGithubIssueBindingDispatch, type GithubIssueBindingDispatchResolution } from '@/features/github-issues/githubIssueBindingDispatch';
import type { GithubIssueBindingIntent } from '@/features/github-issues/githubIssueBindingIdentity';
import {
    mutateGithubIssueBindingForExistingSession,
    prepareGithubIssueExceptionalReplacement,
} from '@/features/github-issues/githubIssueBindingReplacement';

function updatedText(updatedAt: string): string {
    const relative = getGithubIssueRelativeTime(updatedAt);
    if (!relative || relative.unit === 'now') return t('githubIssues.updatedNow');
    if (relative.unit === 'minute') return t('githubIssues.updatedMinutes', { count: relative.value });
    if (relative.unit === 'hour') return t('githubIssues.updatedHours', { count: relative.value });
    return t('githubIssues.updatedDays', { count: relative.value });
}

export default function GithubIssueDetailScreen() {
    const params = useLocalSearchParams<{ owner: string; repo: string; number: string; sourceSessionId?: string; startWork?: string }>();
    const issueNumber = Number(params.number);
    const router = useRouter();
    const { theme } = useUnistyles();
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const newSessionDraft = useNewSessionDraft();
    const navigateToSession = useNavigateToSession();
    const [issue, setIssue] = React.useState<GithubIssue | null>(null);
    const [repositoryRecord, setRepositoryRecord] = React.useState<GithubRepository | null>(null);
    const [bindingIntent, setBindingIntent] = React.useState<GithubIssueBindingIntent | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [mutating, setMutating] = React.useState(false);
    const [actionsVisible, setActionsVisible] = React.useState(false);
    const [dispatchVisible, setDispatchVisible] = React.useState(false);
    const [dispatchWorkflow, setDispatchWorkflow] = React.useState<'triage-first' | 'repository-rules'>('repository-rules');
    const [currentRepositoryEligible, setCurrentRepositoryEligible] = React.useState(false);
    const [currentBindingEligible, setCurrentBindingEligible] = React.useState(false);
    const [canonicalDispatch, setCanonicalDispatch] = React.useState<GithubIssueBindingDispatchResolution>({ kind: 'loading' });
    const openedInitialDispatch = React.useRef(false);

    const load = React.useCallback(async () => {
        if (!enabled) return;
        try {
            const [nextIssue, repositories] = await Promise.all([
                githubIssuesApi.getIssue({ owner: params.owner, repo: params.repo, number: issueNumber }),
                githubIssuesApi.listRepositories(),
            ]);
            const repository = repositories.find((candidate) =>
                candidate.owner.toLowerCase() === params.owner.toLowerCase()
                && candidate.name.toLowerCase() === params.repo.toLowerCase());
            if (!repository) throw new Error('Repository identity is unavailable');
            setIssue(nextIssue);
            setRepositoryRecord(repository);
            setError(null);
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : 'Unable to load issue';
            setError(`${params.owner}/${params.repo}#${issueNumber}: ${message}`);
        }
    }, [enabled, issueNumber, params.owner, params.repo]);
    React.useEffect(() => { void load(); }, [load]);
    React.useEffect(() => {
        if (!params.sourceSessionId) return;
        const path = storage.getState().sessions[params.sourceSessionId]?.metadata?.path;
        if (!path) return;
        void sessionBash(params.sourceSessionId, {
            command: 'test -f .agents/skills/triage/SKILL.md || test -f .claude/skills/triage/SKILL.md',
            cwd: path,
            timeout: 3000,
        }).then((result) => setDispatchWorkflow(result.success ? 'triage-first' : 'repository-rules'));
    }, [params.sourceSessionId]);
    React.useEffect(() => {
        const source = params.sourceSessionId ? storage.getState().sessions[params.sourceSessionId] : null;
        setCurrentRepositoryEligible(false);
        if (!source?.active || !source.metadata?.path || !repositoryRecord) return;
        void githubIssuesRepositoryResolver.resolve({
            sessionId: source.id,
            machineId: source.metadata.machineId,
            path: source.metadata.path,
        }).then((resolution) => setCurrentRepositoryEligible(
            resolution.status === 'resolved' && resolution.repository.id === repositoryRecord.id,
        )).catch(() => setCurrentRepositoryEligible(false));
    }, [params.sourceSessionId, repositoryRecord]);
    React.useEffect(() => {
        let canceled = false;
        if (!repositoryRecord || !issue) return;
        setCurrentBindingEligible(false);
        void Promise.all([
            import('@/features/github-issues/githubIssueBindingIntent'),
            import('@/features/github-issues/githubIssueBindingApi'),
            import('@/features/github-issues/githubIssueBindingStore'),
        ]).then(async ([{ prepareGithubIssueBindingIntent }, { githubIssueBindingApi }, {
            getGithubIssueCanonicalProjectionByIssueKey,
            getGithubIssueCanonicalIssueKeyForSession,
            refreshGithubIssueSessionProjections,
            validateGithubIssueBindingEvidence,
        }]) => {
            await refreshGithubIssueSessionProjections();
            const intent = await prepareGithubIssueBindingIntent(repositoryRecord, issue);
            const currentIssueKey = params.sourceSessionId
                ? getGithubIssueCanonicalIssueKeyForSession(params.sourceSessionId)
                : null;
            const resolution = await resolveGithubIssueBindingDispatch(
                githubIssueBindingApi,
                intent.issueKey,
                (issueKey) => getGithubIssueCanonicalProjectionByIssueKey(issueKey)?.sessionId ?? null,
                validateGithubIssueBindingEvidence,
            );
            if (!canceled) {
                setCurrentBindingEligible(
                    !currentIssueKey || currentIssueKey === intent.issueKey,
                );
                setCanonicalDispatch(resolution);
            }
        }).catch(() => { if (!canceled) setCanonicalDispatch({ kind: 'unavailable' }); });
        return () => { canceled = true; };
    }, [issue, params.sourceSessionId, repositoryRecord]);

    const issueIdentity = `${params.owner}/${params.repo}#${issue?.number ?? issueNumber}`;

    const openDispatch = async () => {
        if (!repositoryRecord || !issue || mutating) return;
        setMutating(true);
        try {
            const [{ prepareGithubIssueBindingIntent }, { githubIssueBindingApi }, {
                getGithubIssueCanonicalProjectionByIssueKey,
                refreshGithubIssueSessionProjections,
                validateGithubIssueBindingEvidence,
            }] = await Promise.all([
                import('@/features/github-issues/githubIssueBindingIntent'),
                import('@/features/github-issues/githubIssueBindingApi'),
                import('@/features/github-issues/githubIssueBindingStore'),
            ]);
            await refreshGithubIssueSessionProjections();
            const intent = await prepareGithubIssueBindingIntent(repositoryRecord, issue);
            const resolution = await resolveGithubIssueBindingDispatch(
                githubIssueBindingApi,
                intent.issueKey,
                (issueKey) => getGithubIssueCanonicalProjectionByIssueKey(issueKey)?.sessionId ?? null,
                validateGithubIssueBindingEvidence,
            );
            setCanonicalDispatch(resolution);
            if (resolution.kind === 'continue' || resolution.kind === 'offline') {
                navigateToSession(resolution.sessionId);
                return;
            }
            if (resolution.kind === 'restore') {
                const { restoreGithubIssueCanonicalSession } = await import('@/features/github-issues/githubIssueBindingRestore');
                const restored = await restoreGithubIssueCanonicalSession(resolution.sessionId);
                if (restored.outcome === 'restored') {
                    navigateToSession(restored.sessionId);
                } else {
                    Modal.alert(t('common.error'), t('githubIssues.bindingRestoreFailed', { issue: issueIdentity }));
                    router.push(`/session/${resolution.sessionId}/info`);
                }
                return;
            }
            if (resolution.kind === 'repair-required') {
                setBindingIntent({
                    ...intent,
                    operation: 'replace',
                    expectedRevision: resolution.expectedRevision,
                    formerSessionId: resolution.formerSessionId,
                });
                setDispatchVisible(true);
                return;
            }
            if (resolution.kind !== 'unbound') {
                Modal.alert(t('common.error'), `${issueIdentity}: ${t('githubIssues.bindingUnavailable')}`);
                return;
            }
            setBindingIntent(intent);
            setDispatchVisible(true);
        } catch {
            Modal.alert(t('common.error'), `${issueIdentity}: ${t('githubIssues.bindingUnavailable')}`);
        } finally {
            setMutating(false);
        }
    };
    const openReplacementDispatch = async () => {
        if (!repositoryRecord || !issue || mutating) return;
        setMutating(true);
        setActionsVisible(false);
        try {
            const [{ prepareGithubIssueBindingIntent }, { githubIssueBindingApi }] = await Promise.all([
                import('@/features/github-issues/githubIssueBindingIntent'),
                import('@/features/github-issues/githubIssueBindingApi'),
            ]);
            const intent = await prepareGithubIssueBindingIntent(repositoryRecord, issue);
            setBindingIntent(await prepareGithubIssueExceptionalReplacement(githubIssueBindingApi, intent));
            setDispatchVisible(true);
        } catch {
            Modal.alert(t('common.error'), `${issueIdentity}: ${t('githubIssues.bindingUnavailable')}`);
        } finally {
            setMutating(false);
        }
    };
    React.useEffect(() => {
        if (issue && repositoryRecord && params.startWork === '1' && !openedInitialDispatch.current) {
            openedInitialDispatch.current = true;
            void openDispatch();
        }
    }, [issue, repositoryRecord, params.startWork]);

    if (!enabled) return <View style={styles.center}><Text style={styles.secondary}>{t('githubIssues.disabledShort')}</Text></View>;
    if (!issue) return <View style={styles.center}>{error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator />}</View>;

    const task = buildGithubIssueDispatchTask({
        repository: { owner: params.owner, repo: params.repo },
        issue,
        workflow: dispatchWorkflow,
    });
    const sourcePath = params.sourceSessionId ? storage.getState().sessions[params.sourceSessionId]?.metadata?.path : null;
    const sourceSession = params.sourceSessionId ? storage.getState().sessions[params.sourceSessionId] : null;
    const eligibleCurrent = sourcePath
        && sourceSession?.active
        && !sourceSession.metadata?.isSideChat
        && currentRepositoryEligible
        && currentBindingEligible
        && (bindingIntent?.operation !== 'replace' || bindingIntent.formerSessionId !== sourceSession.id)
        ? sourceSession
        : null;
    const setState = async () => {
        setMutating(true);
        try {
            const updated = await githubIssuesApi.setIssueState({ owner: params.owner, repo: params.repo, number: issueNumber, state: issue.state === 'open' ? 'closed' : 'open' });
            setIssue(updated);
        } catch (caught) {
            Modal.alert(t('githubIssues.updateFailed'), `${issueIdentity}: ${caught instanceof Error ? caught.message : 'Unknown error'}`);
        } finally { setMutating(false); }
    };
    const remove = async () => {
        const identity = `${params.owner}/${params.repo} #${issue.number}`;
        const confirmed = await Modal.confirm(t('githubIssues.deleteConfirmTitle'), t('githubIssues.deleteConfirmMessage', { identity }), { cancelText: t('common.cancel'), confirmText: t('githubIssues.deletePermanently'), destructive: true });
        if (!confirmed) return;
        setMutating(true);
        try { await githubIssuesApi.deleteIssue({ owner: params.owner, repo: params.repo, number: issueNumber }); router.back(); }
        catch (caught) { Modal.alert(t('githubIssues.deleteFailed'), `${issueIdentity}: ${caught instanceof Error ? caught.message : 'Unknown error'}`); }
        finally { setMutating(false); }
    };
    const addToSession = async (sessionId: string) => {
        if (!bindingIntent) return;
        const current = storage.getState().sessions[sessionId];
        if (current?.metadata?.isSideChat) return;
        if (bindingIntent.operation === 'replace' && bindingIntent.formerSessionId === sessionId) return;
        if (bindingIntent.operation === 'replace') {
            const confirmed = await Modal.confirm(
                t('githubIssues.replaceBindingTitle'),
                t('githubIssues.replaceBindingMessage', {
                    issue: `${params.owner}/${params.repo}#${issue.number}`,
                    oldSession: bindingIntent.formerSessionId ?? t('githubIssues.missingSession'),
                    newSession: sessionId,
                }),
                { cancelText: t('common.cancel'), confirmText: t('githubIssues.replaceBinding') },
            );
            if (!confirmed) return;
        } else {
            const confirmed = await Modal.confirm(
                t('githubIssues.adoptBindingTitle'),
                t('githubIssues.adoptBindingMessage', {
                    issue: issueIdentity,
                    session: sessionId,
                    hasDraft: !!current?.draft?.trim(),
                }),
                { cancelText: t('common.cancel'), confirmText: t('githubIssues.adoptBinding') },
            );
            if (!confirmed) return;
        }
        if (bindingIntent.operation === 'replace' && current?.draft?.trim()) {
            const confirmed = await Modal.confirm(
                t('githubIssues.addDraftTitle'),
                t('githubIssues.addDraftMessage'),
                { cancelText: t('common.cancel'), confirmText: t('githubIssues.addDraft') },
            );
            if (!confirmed) return;
        }
        setCanonicalDispatch({ kind: 'binding' });
        try {
            const [{ githubIssueBindingApi }, { validateGithubIssueBindingIntentAccount }] = await Promise.all([
                import('@/features/github-issues/githubIssueBindingApi'),
                import('@/features/github-issues/githubIssueBindingIntent'),
            ]);
            if (!await validateGithubIssueBindingIntentAccount(bindingIntent)) {
                setBindingIntent(null);
                newSessionDraft.setGithubIssueBindingIntent(null);
                setDispatchVisible(false);
                setCanonicalDispatch({ kind: 'unavailable' });
                Modal.alert(t('common.error'), t('githubIssues.bindingAccountChanged', { issue: issueIdentity }));
                return;
            }
            const result = await mutateGithubIssueBindingForExistingSession(
                githubIssueBindingApi,
                bindingIntent,
                sessionId,
            );
            if (result.outcome === 'repair-required') {
                setBindingIntent({
                    ...bindingIntent,
                    operation: 'replace',
                    requestId: randomUUID(),
                    expectedRevision: result.binding.revision,
                    formerSessionId: result.binding.lastSessionId ?? null,
                });
                setCanonicalDispatch({
                    kind: 'repair-required',
                    expectedRevision: result.binding.revision,
                    formerSessionId: result.binding.lastSessionId ?? null,
                });
                return;
            }
            if ((result.outcome === 'resumed' || result.outcome === 'revision-conflict') && result.binding.sessionId !== sessionId) {
                setDispatchVisible(false);
                if (result.binding.sessionId) navigateToSession(result.binding.sessionId);
                return;
            }
            if (result.outcome !== 'claimed' && result.outcome !== 'resumed' && result.outcome !== 'replaced') {
                setCanonicalDispatch({ kind: 'conflict' });
                Modal.alert(t('common.error'), `${issueIdentity}: ${t('githubIssues.bindingConflictHelp')}`);
                return;
            }
            storage.getState().updateSessionDraft(sessionId, prepareGithubIssueSessionDraft(current?.draft, task));
            setDispatchVisible(false);
            navigateToSession(sessionId);
        } catch {
            setCanonicalDispatch({ kind: 'unavailable' });
            Modal.alert(t('common.error'), `${issueIdentity}: ${t('githubIssues.bindingRetry')}`);
        }
    };
    const startNewSession = () => {
        if (!bindingIntent) return;
        const source = params.sourceSessionId ? storage.getState().sessions[params.sourceSessionId] : null;
        if (source?.metadata?.machineId) newSessionDraft.setMachineId(source.metadata.machineId);
        if (source?.metadata?.path) newSessionDraft.setPath(source.metadata.path);
        newSessionDraft.setInput(prepareGithubIssueSessionDraft(newSessionDraft.input, task));
        newSessionDraft.setGithubIssueBindingIntent(bindingIntent);
        setDispatchVisible(false);
        router.navigate('/new');
    };
    const canonicalActionLabel = t(getGithubIssueBindingDispatchActionKey(canonicalDispatch));
    return (
        <View style={styles.page}>
            <Stack.Screen options={{
                title: `#${issue.number}`,
                headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel="Issue actions" hitSlop={10} onPress={() => setActionsVisible((value) => !value)}><Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.header.tint} /></Pressable>,
            }} />
            {actionsVisible && <View style={styles.actionsMenu}>
                <Pressable onPress={() => void openExternalUrl(issue.url)}><Text style={styles.menuText}>{t('githubIssues.openOnGithub')}</Text></Pressable>
                <Pressable disabled={mutating} onPress={() => void setState()}><Text style={styles.menuText}>{t(issue.state === 'open' ? 'githubIssues.closeIssue' : 'githubIssues.reopenIssue')}</Text></Pressable>
                {canonicalDispatch.kind === 'continue' || canonicalDispatch.kind === 'restore' || canonicalDispatch.kind === 'offline' ? (
                    <Pressable disabled={mutating} onPress={() => void openReplacementDispatch()}><Text style={styles.menuText}>{t('githubIssues.replaceCanonicalSession')}</Text></Pressable>
                ) : null}
                {issue.viewerCanDelete && <Pressable disabled={mutating} onPress={() => void remove()}><Text style={styles.deleteText}>{t('githubIssues.deletePermanently')}</Text></Pressable>}
            </View>}
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>{issue.title}</Text>
                <Text style={styles.secondary}>{t(issue.state === 'open' ? 'githubIssues.open' : 'githubIssues.closed')} · {issue.author?.login ?? 'unknown'} · {updatedText(issue.updatedAt)} · {issue.comments}</Text>
                {issue.labels.length > 0 && <View style={styles.labels}>{issue.labels.map((label) => <View key={label.name} style={styles.label}><Text style={styles.labelText}>{label.name}</Text></View>)}</View>}
                <View style={styles.body}>{issue.body ? <MarkdownView markdown={issue.body} /> : <Text style={styles.secondary}>{t('githubIssues.noDescription')}</Text>}</View>
                <Pressable accessibilityRole="button" accessibilityLabel={canonicalActionLabel} disabled={mutating} onPress={() => void openDispatch()} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{canonicalActionLabel}</Text></Pressable>
                <Pressable accessibilityRole="button" disabled={mutating} onPress={() => void setState()} style={styles.lifecycleButton}><Text style={styles.link}>{mutating ? t('githubIssues.updating') : t(issue.state === 'open' ? 'githubIssues.closeIssue' : 'githubIssues.reopenIssue')}</Text></Pressable>
            </ScrollView>
            <NativeModal visible={dispatchVisible} transparent animationType="fade" onRequestClose={() => setDispatchVisible(false)}>
                <Pressable style={styles.backdrop} onPress={() => setDispatchVisible(false)}>
                    <View style={styles.sheet}>
                        <Text style={styles.sheetTitle}>{t('githubIssues.workOnIssueNumber', { number: issue.number })}</Text>
                        <Pressable style={styles.targetRow} onPress={startNewSession}><Text style={styles.menuText}>{t('githubIssues.startNewSession')}</Text></Pressable>
                        {eligibleCurrent ? (
                            <Pressable style={styles.targetRow} onPress={() => void addToSession(eligibleCurrent.id)}>
                                <Text style={styles.menuText}>{t('githubIssues.addCurrentSession')}</Text>
                                <Text style={styles.secondary}>{eligibleCurrent.draft ? `${t('githubIssues.keepsDraft')} · ` : ''}{getSessionSubtitle(eligibleCurrent)}</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </Pressable>
            </NativeModal>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    page: { flex: 1, backgroundColor: theme.colors.groupped.background },
    content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: 18, paddingBottom: 40 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: theme.colors.groupped.background },
    title: { color: theme.colors.text, fontSize: 24, lineHeight: 31, ...Typography.default('semiBold') },
    secondary: { marginTop: 8, color: theme.colors.textSecondary, ...Typography.default() },
    error: { color: theme.colors.textDestructive, ...Typography.default() },
    labels: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
    label: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9, backgroundColor: theme.colors.surfaceHigh },
    labelText: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    body: { marginTop: 24, minHeight: 140, padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface },
    primaryButton: { minHeight: 48, marginTop: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.button.primary.background },
    primaryButtonText: { color: theme.colors.button.primary.tint, ...Typography.default('semiBold') },
    lifecycleButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    link: { color: theme.colors.textLink, ...Typography.default('semiBold') },
    actionsMenu: { position: 'absolute', zIndex: 10, top: 8, right: 16, minWidth: 190, gap: 16, padding: 16, borderRadius: 14, backgroundColor: theme.colors.surfaceHighest },
    menuText: { color: theme.colors.text, ...Typography.default('semiBold') },
    deleteText: { color: theme.colors.textDestructive, ...Typography.default('semiBold') },
    backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18, backgroundColor: 'rgba(0,0,0,0.42)' },
    sheet: { width: '100%', maxWidth: 480, gap: 8, padding: 16, borderRadius: 20, backgroundColor: theme.colors.surface },
    sheetTitle: { padding: 8, color: theme.colors.text, fontSize: 18, ...Typography.default('semiBold') },
    targetRow: { minHeight: 54, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 12, backgroundColor: theme.colors.surfaceHigh },
}));
