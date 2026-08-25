import type { AgentState, Metadata, Session } from '../storageTypes';

interface VersionedValue<T> {
    value: T;
    version: number;
}

interface DecryptedSessionUpdate {
    agentState?: VersionedValue<AgentState | null>;
    metadata?: VersionedValue<Metadata | null>;
    updatedAt: number;
    seq: number;
}

/**
 * Apply server-owned update-session fields to the latest in-memory session.
 * The caller must read the session after asynchronous decrypts complete so
 * ephemeral activity such as `thinking` cannot be restored from a stale
 * pre-decrypt snapshot.
 */
export function mergeDecryptedSessionUpdate(
    current: Session,
    update: DecryptedSessionUpdate,
): Session {
    return {
        ...current,
        ...(update.agentState ? {
            agentState: update.agentState.value,
            agentStateVersion: update.agentState.version,
        } : {}),
        ...(update.metadata ? {
            metadata: update.metadata.value,
            metadataVersion: update.metadata.version,
        } : {}),
        updatedAt: update.updatedAt,
        seq: update.seq,
    };
}
