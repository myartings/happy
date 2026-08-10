import { createGithubIssuesClient } from './githubIssuesClient';
import { createGithubIssuesAuthorizationSession } from './githubIssuesAuthorizationSession';
import { createPlatformGithubCredentialStore, createPlatformGithubTransport } from './githubIssuesPlatform';
import { createGithubRepositoryEntryResolver } from './githubRepositoryResolution';
import { sessionBash } from '@/sync/ops';
import { storage } from '@/sync/storage';

export {
    GithubIssuesError,
    type DeviceVerificationPrompt,
    type GithubConnectedAccount,
    type GithubIssue,
    type GithubIssueState,
    type GithubRepository,
} from './githubIssuesClient';
export {
    buildGithubIssueDispatchTask,
    createGithubIssueDetailState,
    createGithubIssueDispatchState,
    createGithubIssueDraftState,
    createGithubIssuesCollectionState,
    createGithubIssuesListState,
    getGithubIssueRelativeTime,
    getGithubIssuesErrorMessage,
    prepareGithubIssueSessionDraft,
    reduceGithubIssuesCollectionState,
    type GithubIssueDetailState,
    type GithubIssueDispatchState,
    type GithubIssueDispatchTask,
    type GithubIssueDispatchTaskInput,
    type GithubIssueDispatchWorkflow,
    type GithubIssueDraftState,
    type GithubIssuesConnectionState,
    type GithubIssuesListState,
} from './githubIssuesPresentation';
export {
    isSameGithubRepository,
    parseGithubRepository,
    type GithubRepositoryRef,
} from './githubRepository';
export {
    createGithubRepositoryAssociationKey,
    createGithubRepositoryEntryResolver,
    resolveGithubRepositoryAssociation,
    type GithubRepositoryAssociation,
    type GithubRepositoryAssociations,
    type GithubRepositoryEntryInput,
    type GithubRepositoryManualAssociation,
    type GithubRepositoryResolution,
} from './githubRepositoryResolution';

export const githubIssuesApi = createGithubIssuesClient({
    clientId: process.env.EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_CLIENT_ID ?? '',
    appSlug: process.env.EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_APP_SLUG ?? '',
    store: createPlatformGithubCredentialStore(),
    transport: createPlatformGithubTransport(),
});

export const githubIssuesAuthorization = createGithubIssuesAuthorizationSession(githubIssuesApi);

export const githubIssuesRepositoryResolver = createGithubRepositoryEntryResolver({
    listRepositories: () => githubIssuesApi.listRepositories(),
    lookupRemotes: async ({ sessionId, path }) => {
        const result = await sessionBash(sessionId, {
            command: 'git remote -v',
            cwd: path,
            timeout: 5000,
        });
        return result.success
            ? { status: 'success', output: result.stdout }
            : { status: 'failed' };
    },
    getMachineId: (sessionId) => storage.getState().sessions[sessionId]?.metadata?.machineId ?? null,
    getPreferences: () => {
        const settings = storage.getState().localSettings;
        return {
            lastRepository: settings.devGithubIssuesLastRepository,
            associations: settings.devGithubIssuesRepositoryAssociations,
        };
    },
    savePreferences: ({ lastRepository, associations }) => {
        storage.getState().applyLocalSettings({
            devGithubIssuesLastRepository: lastRepository,
            devGithubIssuesRepositoryAssociations: associations,
        });
    },
});
