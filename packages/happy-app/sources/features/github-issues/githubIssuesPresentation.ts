import type {
    GithubConnectedAccount,
    GithubIssue,
    GithubIssueState,
    GithubRepository,
} from './githubIssuesClient';
import type { GithubRepositoryRef } from './githubRepository';

export type GithubIssuesCollectionStatus = 'idle' | 'loading' | 'refreshing' | 'ready' | 'error';

export function getGithubIssuesErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) return 'Unable to use GitHub Issues';
    const code = 'code' in error ? String(error.code) : '';
    const messages: Record<string, string> = {
        unsupported_platform: 'GitHub Issues is available in Happy desktop and mobile.',
        not_configured: 'This Happy build is missing the GitHub Issues App configuration.',
        secure_storage_unavailable: 'Secure credential storage is unavailable on this device.',
        authorization_denied: 'GitHub authorization was denied.',
        authorization_expired: 'The GitHub verification code expired. Try connecting again.',
        reauthorization_required: 'GitHub Issues needs to be connected again.',
        permission_denied: 'The selected repository does not grant the required Issue permission.',
        rate_limited: 'GitHub rate limit reached. Try again later.',
        offline: 'Unable to reach GitHub. Check your connection and try again.',
    };
    return messages[code] ?? error.message;
}

export type GithubIssueRelativeTime =
    | { unit: 'now'; value: 0 }
    | { unit: 'minute' | 'hour' | 'day'; value: number };

export type GithubIssueDispatchWorkflow = 'triage-first' | 'repository-rules';

export interface GithubIssuesSessionEntryContext {
    enabled: boolean;
    hasSession: boolean;
    deviceType: 'phone' | 'tablet' | 'desktop';
    platform: string;
    isTauri: boolean;
}

export function shouldShowGithubIssuesSessionEntry(
    context: GithubIssuesSessionEntryContext,
): boolean {
    if (!context.enabled || !context.hasSession) return false;
    return context.isTauri || (context.deviceType === 'phone' && context.platform !== 'web');
}

export interface GithubIssueDispatchTaskInput {
    repository: GithubRepositoryRef;
    issue: Pick<GithubIssue, 'number' | 'title' | 'url'>;
    workflow: GithubIssueDispatchWorkflow;
}

export interface GithubIssueDispatchTask {
    repository: GithubRepositoryRef;
    issueNumber: number;
    title: string;
    prompt: string;
}

export type GithubIssuesConnectionState =
    | { status: 'checking' }
    | { status: 'disconnected' }
    | { status: 'unavailable'; message: string }
    | { status: 'connected'; account: GithubConnectedAccount };

export interface GithubIssuesListState {
    connection: GithubIssuesConnectionState;
    repositories: GithubIssuesCollectionState<GithubRepository>;
    selectedRepository: GithubRepository | null;
    filter: GithubIssueState;
    issues: GithubIssuesCollectionState<GithubIssue>;
}

export type GithubIssueMutation = 'close' | 'reopen' | 'delete';

export interface GithubIssueDetailState {
    status: 'idle' | 'loading' | 'ready' | 'mutating' | 'error';
    issue: GithubIssue | null;
    mutation: GithubIssueMutation | null;
    error: string | null;
}

export interface GithubIssueDraftState {
    repository: GithubRepositoryRef;
    title: string;
    body: string;
    status: 'editing' | 'submitting' | 'failed' | 'created';
    createdIssue: GithubIssue | null;
    error: string | null;
}

export interface GithubIssueDispatchState {
    status: 'idle' | 'preparing' | 'ready' | 'failed';
    task: GithubIssueDispatchTask | null;
    error: string | null;
}

export interface GithubIssuesCollectionState<T> {
    status: GithubIssuesCollectionStatus;
    items: readonly T[];
    error: string | null;
}

export type GithubIssuesCollectionEvent<T> =
    | { type: 'load' }
    | { type: 'success'; items: readonly T[] }
    | { type: 'failure'; error: string };

export function createGithubIssuesCollectionState<T>(
    items: readonly T[] = [],
): GithubIssuesCollectionState<T> {
    return {
        status: items.length > 0 ? 'ready' : 'idle',
        items,
        error: null,
    };
}

export function createGithubIssuesListState(): GithubIssuesListState {
    return {
        connection: { status: 'checking' },
        repositories: createGithubIssuesCollectionState<GithubRepository>(),
        selectedRepository: null,
        filter: 'open',
        issues: createGithubIssuesCollectionState<GithubIssue>(),
    };
}

export function createGithubIssueDetailState(): GithubIssueDetailState {
    return {
        status: 'idle',
        issue: null,
        mutation: null,
        error: null,
    };
}

export function createGithubIssueDraftState(
    repository: GithubRepositoryRef,
): GithubIssueDraftState {
    return {
        repository,
        title: '',
        body: '',
        status: 'editing',
        createdIssue: null,
        error: null,
    };
}

export function createGithubIssueDispatchState(): GithubIssueDispatchState {
    return {
        status: 'idle',
        task: null,
        error: null,
    };
}

export function reduceGithubIssuesCollectionState<T>(
    state: GithubIssuesCollectionState<T>,
    event: GithubIssuesCollectionEvent<T>,
): GithubIssuesCollectionState<T> {
    if (event.type === 'load') {
        return {
            status: state.items.length > 0 ? 'refreshing' : 'loading',
            items: state.items,
            error: null,
        };
    }
    if (event.type === 'success') {
        return {
            status: 'ready',
            items: event.items,
            error: null,
        };
    }
    return {
        status: 'error',
        items: state.items,
        error: event.error,
    };
}

export function getGithubIssueRelativeTime(
    updatedAt: string,
    now: number = Date.now(),
): GithubIssueRelativeTime | null {
    const updatedAtTimestamp = Date.parse(updatedAt);
    if (!Number.isFinite(updatedAtTimestamp) || !Number.isFinite(now)) {
        return null;
    }

    const elapsedMilliseconds = Math.max(0, now - updatedAtTimestamp);
    const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000);
    if (elapsedMinutes < 1) {
        return { unit: 'now', value: 0 };
    }
    if (elapsedMinutes < 60) {
        return { unit: 'minute', value: elapsedMinutes };
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
        return { unit: 'hour', value: elapsedHours };
    }

    return { unit: 'day', value: Math.floor(elapsedHours / 24) };
}

export function buildGithubIssueDispatchTask(
    input: GithubIssueDispatchTaskInput,
): GithubIssueDispatchTask {
    const issueTitle = input.issue.title.trim().replace(/\s+/g, ' ');
    const repositoryName = `${input.repository.owner}/${input.repository.repo}`;
    const issueContext = [
        `Work on GitHub Issue #${input.issue.number} in ${repositoryName}.`,
        `Title: ${issueTitle}`,
        `Issue: ${input.issue.url}`,
    ];
    const prompt = input.workflow === 'triage-first'
        ? [
            `/triage #${input.issue.number}`,
            '',
            ...issueContext,
            '',
            'Follow the repository instructions and complete required triage before implementation.',
            'After triage is ready for Agent execution, continue through the repository development workflow in this Session.',
        ]
        : [
            ...issueContext,
            '',
            'Follow the repository instructions before implementation.',
            'Continue through the repository development workflow in this Session.',
        ];
    return {
        repository: input.repository,
        issueNumber: input.issue.number,
        title: `Issue #${input.issue.number}: ${issueTitle}`,
        prompt: prompt.join('\n'),
    };
}

export function prepareGithubIssueSessionDraft(
    existingDraft: string | null | undefined,
    task: GithubIssueDispatchTask,
): string {
    const existing = existingDraft?.trim();
    return existing ? `${existing}\n\n${task.prompt}` : task.prompt;
}
