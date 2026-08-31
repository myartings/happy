import { createGithubIssueBindingKvClient } from './githubIssueBindingKvClient';
import { createPlatformGithubIssueBindingKvDependencies } from './githubIssueBindingTransport';
import { getGithubIssueBindingSessionAvailability } from './githubIssueBindingSessionAvailability';

async function createReadClient() {
    return createGithubIssueBindingKvClient(
        await createPlatformGithubIssueBindingKvDependencies(),
    );
}

async function createMutationClient(accountScope?: string) {
    if (!accountScope) throw new Error('GitHub Issue binding account scope required');
    return createGithubIssueBindingKvClient(
        await createPlatformGithubIssueBindingKvDependencies(accountScope),
    );
}

export const githubIssueBindingApi = {
    async list() {
        return (await createReadClient()).list();
    },
    async history() {
        return (await createReadClient()).history();
    },
    async resolve(issueKey: string) {
        const result = await (await createReadClient()).resolve(issueKey);
        if (result.outcome !== 'bound' || !result.binding.sessionId) return result;
        return {
            ...result,
            binding: {
                ...result.binding,
                sessionAvailability: getGithubIssueBindingSessionAvailability(
                    result.binding.sessionId,
                ),
            },
        };
    },
    async claim(input: Parameters<ReturnType<typeof createGithubIssueBindingKvClient>['claim']>[0]) {
        return (await createMutationClient(input.accountScope)).claim(input);
    },
    async replace(input: Parameters<ReturnType<typeof createGithubIssueBindingKvClient>['replace']>[0]) {
        return (await createMutationClient(input.accountScope)).replace(input);
    },
    async refresh(input: Parameters<ReturnType<typeof createGithubIssueBindingKvClient>['refresh']>[0]) {
        return (await createMutationClient(input.accountScope)).refresh(input);
    },
    async abandonFirstDispatch(input: Parameters<ReturnType<typeof createGithubIssueBindingKvClient>['abandonFirstDispatch']>[0]) {
        return (await createMutationClient(input.accountScope)).abandonFirstDispatch(input);
    },
};
