import { createGithubIssuesClient } from './githubIssuesClient';
import { createGithubIssuesAuthorizationSession } from './githubIssuesAuthorizationSession';
import { createPlatformGithubCredentialStore, createPlatformGithubTransport } from './githubIssuesPlatform';

export {
    GithubIssuesError,
    type DeviceVerificationPrompt,
    type GithubConnectedAccount,
    type GithubIssue,
    type GithubIssueState,
    type GithubRepository,
} from './githubIssuesClient';

export const githubIssuesApi = createGithubIssuesClient({
    clientId: process.env.EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_CLIENT_ID ?? '',
    appSlug: process.env.EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_APP_SLUG ?? '',
    store: createPlatformGithubCredentialStore(),
    transport: createPlatformGithubTransport(),
});

export const githubIssuesAuthorization = createGithubIssuesAuthorizationSession(githubIssuesApi);
