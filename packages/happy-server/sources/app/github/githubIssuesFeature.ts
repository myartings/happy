export function isGithubIssuesEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
    return env.HAPPY_GITHUB_ISSUES_ENABLED === 'true';
}

