export type CodexReconnectCredentials = {
    sessionId: string;
    keyBase64: string;
    variant: 'legacy' | 'dataKey';
};

const CODEX_RECONNECT_ENV_NAMES = [
    'HAPPY_RECONNECT_SESSION_ID',
    'HAPPY_RECONNECT_ENCRYPTION_KEY',
    'HAPPY_RECONNECT_ENCRYPTION_VARIANT',
    'HAPPY_RECONNECT_SEQ',
    'HAPPY_RECONNECT_METADATA_VERSION',
    'HAPPY_RECONNECT_AGENT_STATE_VERSION',
] as const;

export function resolveCodexReconnectCredentials(
    env: Record<string, string | undefined>,
): CodexReconnectCredentials | undefined {
    const sessionId = env.HAPPY_RECONNECT_SESSION_ID;
    const keyBase64 = env.HAPPY_RECONNECT_ENCRYPTION_KEY;
    const variant = env.HAPPY_RECONNECT_ENCRYPTION_VARIANT;
    const hasReconnectEnvironment = CODEX_RECONNECT_ENV_NAMES.some((name) => env[name] !== undefined);
    if (!hasReconnectEnvironment) {
        return undefined;
    }
    if (!sessionId || !keyBase64 || !variant) {
        throw new Error('Incomplete Happy reconnect environment: session ID, encryption key, and encryption variant must be provided together.');
    }
    if (variant !== 'legacy' && variant !== 'dataKey') {
        throw new Error(`Unsupported Happy reconnect encryption variant: ${variant}`);
    }
    return { sessionId, keyBase64, variant };
}
