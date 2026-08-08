export interface GithubRepositoryRef { owner: string; repo: string }

export function parseGithubRepository(remote: string | null | undefined): GithubRepositoryRef | null {
    if (!remote) return null;
    const match = remote.trim().match(/^(?:git@github\.com:|https?:\/\/github\.com\/|ssh:\/\/git@github\.com\/)([^/]+)\/([^/#]+?)(?:\.git)?$/i);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
}

