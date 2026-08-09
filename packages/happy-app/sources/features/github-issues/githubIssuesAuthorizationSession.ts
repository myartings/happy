import type {
    DeviceVerificationPrompt,
    GithubConnectedAccount,
} from './githubIssuesClient';

export type GithubIssuesAuthorizationSnapshot =
    | { status: 'idle' }
    | { status: 'connecting'; prompt: DeviceVerificationPrompt | null }
    | { status: 'connected'; account: GithubConnectedAccount }
    | { status: 'failed'; error: unknown };

interface GithubIssuesConnector {
    connect(options: {
        signal?: AbortSignal;
        onVerification: (prompt: DeviceVerificationPrompt) => void;
    }): Promise<GithubConnectedAccount>;
}

export function createGithubIssuesAuthorizationSession(connector: GithubIssuesConnector) {
    let snapshot: GithubIssuesAuthorizationSnapshot = { status: 'idle' };
    let controller: AbortController | null = null;
    let inFlight: Promise<void> | null = null;
    const listeners = new Set<(value: GithubIssuesAuthorizationSnapshot) => void>();

    function publish(value: GithubIssuesAuthorizationSnapshot): void {
        snapshot = value;
        for (const listener of listeners) listener(value);
    }

    return {
        getSnapshot(): GithubIssuesAuthorizationSnapshot {
            return snapshot;
        },

        subscribe(listener: (value: GithubIssuesAuthorizationSnapshot) => void): () => void {
            listeners.add(listener);
            listener(snapshot);
            return () => { listeners.delete(listener); };
        },

        start(): Promise<void> {
            if (inFlight) return inFlight;
            const currentController = new AbortController();
            controller = currentController;
            publish({ status: 'connecting', prompt: null });
            inFlight = connector.connect({
                signal: currentController.signal,
                onVerification: (prompt) => publish({ status: 'connecting', prompt }),
            }).then((account) => {
                publish({ status: 'connected', account });
            }).catch((error) => {
                publish(currentController.signal.aborted
                    ? { status: 'idle' }
                    : { status: 'failed', error });
            }).finally(() => {
                if (controller === currentController) controller = null;
                inFlight = null;
            });
            return inFlight;
        },

        cancel(): void {
            controller?.abort();
            publish({ status: 'idle' });
        },

        clear(): void {
            if (snapshot.status !== 'connecting') publish({ status: 'idle' });
        },
    };
}
