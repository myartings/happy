import { AgentState, Metadata, MachineMetadata } from '../storageTypes';
import { DecryptedMessage } from '../storageTypes';
import { LruMap } from './lruMap';

/**
 * In-memory cache for decrypted session data to avoid expensive re-decryption
 * Uses sessionId + version as keys for agent state and metadata
 * Uses messageId as key for messages (immutable)
 */
export class EncryptionCache {
    // Configuration
    private readonly maxAgentStates = 1000;
    private readonly maxMetadata = 1000;
    private readonly maxMessages = 1000;
    private readonly maxMachineMetadata = 500;
    private readonly maxDaemonStates = 500;

    private agentStateCache = new LruMap<string, AgentState>(this.maxAgentStates);
    private metadataCache = new LruMap<string, Metadata>(this.maxMetadata);
    private messageCache = new LruMap<string, DecryptedMessage>(this.maxMessages);
    private machineMetadataCache = new LruMap<string, MachineMetadata>(this.maxMachineMetadata);
    private daemonStateCache = new LruMap<string, any>(this.maxDaemonStates);

    /**
     * Get cached agent state for a session
     */
    getCachedAgentState(sessionId: string, version: number): AgentState | null {
        const key = `${sessionId}:${version}`;
        return this.agentStateCache.get(key) ?? null;
    }

    /**
     * Cache agent state for a session
     */
    setCachedAgentState(sessionId: string, version: number, data: AgentState): void {
        const key = `${sessionId}:${version}`;
        this.agentStateCache.set(key, data);
    }

    /**
     * Get cached metadata for a session
     */
    getCachedMetadata(sessionId: string, version: number): Metadata | null {
        const key = `${sessionId}:${version}`;
        return this.metadataCache.get(key) ?? null;
    }

    /**
     * Cache metadata for a session
     */
    setCachedMetadata(sessionId: string, version: number, data: Metadata): void {
        const key = `${sessionId}:${version}`;
        this.metadataCache.set(key, data);
    }

    /**
     * Get cached decrypted message
     */
    getCachedMessage(messageId: string): DecryptedMessage | null {
        return this.messageCache.get(messageId) ?? null;
    }

    /**
     * Cache decrypted message
     */
    setCachedMessage(messageId: string, data: DecryptedMessage): void {
        this.messageCache.set(messageId, data);
    }

    /**
     * Get cached machine metadata
     */
    getCachedMachineMetadata(machineId: string, version: number): MachineMetadata | null {
        const key = `${machineId}:${version}`;
        return this.machineMetadataCache.get(key) ?? null;
    }

    /**
     * Cache machine metadata
     */
    setCachedMachineMetadata(machineId: string, version: number, data: MachineMetadata): void {
        const key = `${machineId}:${version}`;
        this.machineMetadataCache.set(key, data);
    }

    /**
     * Get cached daemon state
     */
    getCachedDaemonState(machineId: string, version: number): any | undefined {
        const key = `${machineId}:${version}`;
        return this.daemonStateCache.get(key);
    }

    /**
     * Cache daemon state (including null values)
     */
    setCachedDaemonState(machineId: string, version: number, data: any): void {
        const key = `${machineId}:${version}`;
        this.daemonStateCache.set(key, data);
    }

    /**
     * Clear all cache entries for a specific machine
     */
    clearMachineCache(machineId: string): void {
        // Clear machine metadata and daemon state for this machine (all versions)
        for (const key of this.machineMetadataCache.keys()) {
            if (key.startsWith(`${machineId}:`)) {
                this.machineMetadataCache.delete(key);
            }
        }
        
        for (const key of this.daemonStateCache.keys()) {
            if (key.startsWith(`${machineId}:`)) {
                this.daemonStateCache.delete(key);
            }
        }
    }

    /**
     * Clear all cache entries for a specific session
     */
    clearSessionCache(sessionId: string): void {
        // Clear agent state and metadata for this session (all versions)
        for (const key of this.agentStateCache.keys()) {
            if (key.startsWith(`${sessionId}:`)) {
                this.agentStateCache.delete(key);
            }
        }
        
        for (const key of this.metadataCache.keys()) {
            if (key.startsWith(`${sessionId}:`)) {
                this.metadataCache.delete(key);
            }
        }
        
        // Note: We don't clear messages as they're immutable and session-agnostic
    }

    /**
     * Clear all cached data
     */
    clearAll(): void {
        this.agentStateCache.clear();
        this.metadataCache.clear();
        this.messageCache.clear();
        this.machineMetadataCache.clear();
        this.daemonStateCache.clear();
    }

    /**
     * Get cache statistics for debugging
     */
    getStats() {
        return {
            agentStates: this.agentStateCache.size,
            metadata: this.metadataCache.size,
            messages: this.messageCache.size,
            machineMetadata: this.machineMetadataCache.size,
            daemonStates: this.daemonStateCache.size,
            totalEntries: this.agentStateCache.size + this.metadataCache.size + this.messageCache.size + 
                         this.machineMetadataCache.size + this.daemonStateCache.size
        };
    }

}
