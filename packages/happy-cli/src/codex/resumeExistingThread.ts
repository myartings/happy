import { trimIdent } from '@/utils/trimIdent';
import { withCodexEffectiveRouteMetadata } from './codexRuntimeModelMetadata';

type ResumeThreadClient = {
    resumeThread: (opts: {
        threadId: string;
        cwd: string;
        mcpServers: Record<string, unknown>;
    }) => Promise<{ threadId: string; model: string; reasoningEffort: string | null }>;
};

type ResumeThreadSession = {
    updateMetadata: (handler: (currentMetadata: any) => any) => void;
    sendSessionEvent: (event: { type: 'message'; message: string }) => void;
};

type ResumeThreadMessageBuffer = {
    addMessage: (message: string, type: 'status') => void;
};

export async function resumeExistingThread(opts: {
    client: ResumeThreadClient;
    session: ResumeThreadSession;
    messageBuffer: ResumeThreadMessageBuffer;
    threadId: string;
    cwd: string;
    mcpServers: Record<string, unknown>;
    /**
     * Whether to surface a "Resumed Codex thread …" message in the chat UI.
     * Side chats open empty on purpose, so they pass `false` to keep this
     * internal resume detail out of the conversation. Defaults to `true`.
     */
    announce?: boolean;
    /** Publish the same confirmed pair to any local runtime projection. */
    onConfirmedRoute?: (route: {
        threadId: string;
        model: string;
        reasoningEffort: string | null;
    }) => Promise<void> | void;
}): Promise<{ threadId: string; model: string; reasoningEffort: string | null }> {
    try {
        const resumedThread = await opts.client.resumeThread({
            threadId: opts.threadId,
            cwd: opts.cwd,
            mcpServers: opts.mcpServers,
        });

        opts.session.updateMetadata((currentMetadata) => withCodexEffectiveRouteMetadata({
            ...currentMetadata,
            codexThreadId: resumedThread.threadId,
        }, resumedThread));
        await opts.onConfirmedRoute?.(resumedThread);
        opts.messageBuffer.addMessage(`Resumed thread ${trimIdent(resumedThread.threadId)}`, 'status');
        if (opts.announce !== false) {
            opts.session.sendSessionEvent({
                type: 'message',
                message: `Resumed Codex thread ${resumedThread.threadId}`,
            });
        }

        return resumedThread;
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to resume Codex thread ${opts.threadId}: ${reason}`);
    }
}
