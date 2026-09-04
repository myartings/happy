export type CodexLaunchInitialization = {
    run(initializer: () => Promise<void>): Promise<void>;
    waitUntilReady(): Promise<void>;
};

/**
 * Serializes messages that can arrive as soon as the Happy session connects
 * behind Codex thread initialization and authoritative route publication.
 */
export function createCodexLaunchInitialization(): CodexLaunchInitialization {
    let started = false;
    let resolveReady!: () => void;
    let rejectReady!: (error: unknown) => void;
    const ready = new Promise<void>((resolve, reject) => {
        resolveReady = resolve;
        rejectReady = reject;
    });
    // Initialization can fail before any Happy message has arrived. Mark the
    // shared promise as observed while preserving rejection for later waiters.
    void ready.catch(() => undefined);

    return {
        async run(initializer) {
            if (started) {
                throw new Error('Codex launch initialization already started');
            }
            started = true;
            try {
                await initializer();
                resolveReady();
            } catch (error) {
                rejectReady(error);
                throw error;
            }
        },
        waitUntilReady() {
            return ready;
        },
    };
}

export async function initializeCodexBeforeMessages(opts: {
    launch: CodexLaunchInitialization;
    connectAndRestore: () => Promise<void>;
    hasActiveThread: () => boolean;
    startFreshThread: () => Promise<void>;
}): Promise<void> {
    await opts.launch.run(async () => {
        await opts.connectAndRestore();
        if (!opts.hasActiveThread()) {
            await opts.startFreshThread();
        }
    });
}

export function assertCodexDaemonRoutePublished(
    result: { error?: unknown } | null | undefined,
): void {
    if (result?.error) {
        throw new Error(`Daemon rejected Codex effective-route projection: ${String(result.error)}`);
    }
}
