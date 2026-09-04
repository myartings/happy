import type { ApprovalPolicy, ReasoningEffort, SandboxMode } from './codexAppServerTypes';
import {
    projectCodexEffectiveRoute,
    withCodexEffectiveRouteMetadata,
} from './codexRuntimeModelMetadata';

type FreshThreadResult = {
    threadId: string;
    model: string;
    reasoningEffort: ReasoningEffort | null;
};

type FreshThreadClient = {
    startThread: (opts: {
        model: string;
        effort: ReasoningEffort;
        cwd: string;
        approvalPolicy: ApprovalPolicy;
        sandbox: SandboxMode;
        mcpServers: Record<string, unknown>;
    }) => Promise<FreshThreadResult>;
};

type FreshThreadSession = {
    updateMetadataAndWait: (handler: (currentMetadata: any) => any) => Promise<void>;
};

export async function startFreshThread(opts: {
    client: FreshThreadClient;
    session: FreshThreadSession;
    model: string;
    effort: ReasoningEffort;
    cwd: string;
    approvalPolicy: ApprovalPolicy;
    sandbox: SandboxMode;
    mcpServers: Record<string, unknown>;
    onConfirmedRoute?: (route: FreshThreadResult) => Promise<void> | void;
}): Promise<FreshThreadResult> {
    const startedThread = await opts.client.startThread({
        model: opts.model,
        effort: opts.effort,
        cwd: opts.cwd,
        approvalPolicy: opts.approvalPolicy,
        sandbox: opts.sandbox,
        mcpServers: opts.mcpServers,
    });
    if (!projectCodexEffectiveRoute({} as any, startedThread)) {
        throw new Error('Fresh Codex thread did not return a complete effective route');
    }

    await opts.session.updateMetadataAndWait((currentMetadata) => withCodexEffectiveRouteMetadata({
        ...currentMetadata,
        codexThreadId: startedThread.threadId,
    }, startedThread));
    await opts.onConfirmedRoute?.(startedThread);

    return startedThread;
}
