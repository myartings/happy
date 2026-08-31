import { randomUUID } from 'expo-crypto';
import { TokenStorage } from '@/auth/tokenStorage';
import { decodeBase64 } from '@/encryption/base64';
import type { GithubIssue, GithubRepository } from './githubIssuesClient';
import { createGithubIssueBindingIntent, deriveGithubIssueBindingAccountScope } from './githubIssueBindingIdentity';

export async function validateGithubIssueBindingIntentAccount(intent: { accountScope?: string }) {
    const credentials = await TokenStorage.getCredentials();
    if (!credentials || !intent.accountScope) return false;
    const matches = intent.accountScope === await deriveGithubIssueBindingAccountScope(
        decodeBase64(credentials.secret, 'base64url'),
    );
    return matches && (await TokenStorage.getCredentials())?.token === credentials.token;
}

export async function prepareGithubIssueBindingIntent(
    repository: GithubRepository,
    issue: GithubIssue,
) {
    const credentials = await TokenStorage.getCredentials();
    if (!credentials) throw new Error('GitHub Issue binding authority unavailable');
    const intent = await createGithubIssueBindingIntent({
        accountMasterSecret: decodeBase64(credentials.secret, 'base64url'),
        repositoryId: String(repository.id),
        issueNodeId: issue.nodeId,
        owner: repository.owner,
        repository: repository.name,
        number: issue.number,
        url: issue.url,
        title: issue.title,
        updatedAt: issue.updatedAt,
        requestId: randomUUID(),
    });
    if ((await TokenStorage.getCredentials())?.token !== credentials.token) {
        throw new Error('GitHub Issue binding account changed');
    }
    return intent;
}
