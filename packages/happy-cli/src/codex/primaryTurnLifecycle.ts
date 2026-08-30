export interface CodexPrimaryTurnLifecycleEffects {
    setKeepAlive: (thinking: boolean) => void;
    resetDiff: () => void;
}

export function hasCodexSubagentReference(message: Record<string, unknown>): boolean {
    for (const key of ['subagent', 'parent_call_id', 'parentCallId', 'agent_thread_id', 'agentThreadId']) {
        const value = message[key];
        if (typeof value === 'string' && value.length > 0) {
            return true;
        }
    }
    return false;
}

/**
 * Consume the primary turn lifecycle once. Child lifecycle events never own
 * the parent session's keepalive or diff cleanup, and duplicate terminal
 * events are ignored after the primary turn has already become idle.
 */
export function applyCodexPrimaryTurnLifecycleEvent(
    message: Record<string, unknown>,
    thinking: boolean,
    effects: CodexPrimaryTurnLifecycleEffects,
): boolean {
    if (hasCodexSubagentReference(message)) {
        return thinking;
    }

    if (message.type === 'task_started') {
        if (!thinking) {
            effects.setKeepAlive(true);
            return true;
        }
        return thinking;
    }

    if (message.type === 'task_complete' || message.type === 'turn_aborted') {
        if (thinking) {
            effects.setKeepAlive(false);
            effects.resetDiff();
            return false;
        }
    }

    return thinking;
}
