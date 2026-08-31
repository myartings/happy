export function createGithubIssueBindingRefreshQueue(run: () => Promise<void>) {
    let active: Promise<void> | null = null;
    let trailing = false;

    return {
        request(): Promise<void> {
            if (active) {
                trailing = true;
                return active;
            }
            active = (async () => {
                do {
                    trailing = false;
                    await run();
                } while (trailing);
            })().finally(() => {
                active = null;
            });
            return active;
        },
    };
}
