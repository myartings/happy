import { describe, expect, it } from 'vitest';

import { DecryptedMessage } from '../storageTypes';
import { EncryptionCache } from './encryptionCache';

describe('EncryptionCache', () => {
    it('keeps recently read messages when the message limit is exceeded', () => {
        const cache = new EncryptionCache();

        for (let index = 0; index < 1000; index++) {
            cache.setCachedMessage(`message-${index}`, { index } as unknown as DecryptedMessage);
        }

        expect(cache.getCachedMessage('message-0')).toEqual({ index: 0 });
        cache.setCachedMessage('message-1000', { index: 1000 } as unknown as DecryptedMessage);

        expect(cache.getCachedMessage('message-1')).toBeNull();
        expect(cache.getCachedMessage('message-0')).toEqual({ index: 0 });
        expect(cache.getStats().messages).toBe(1000);
    });

    it('preserves daemon-state return semantics, including cached null', () => {
        const cache = new EncryptionCache();

        expect(cache.getCachedDaemonState('machine', 1)).toBeUndefined();
        cache.setCachedDaemonState('machine', 1, null);

        expect(cache.getCachedDaemonState('machine', 1)).toBeNull();
    });

    it('clears session-scoped entries without clearing immutable messages', () => {
        const cache = new EncryptionCache();
        const agentState = { value: 'agent' };
        const metadata = { value: 'metadata' };
        const message = { value: 'message' };

        cache.setCachedAgentState('session-a', 1, agentState as never);
        cache.setCachedAgentState('session-b', 1, agentState as never);
        cache.setCachedMetadata('session-a', 1, metadata as never);
        cache.setCachedMessage('message-a', message as unknown as DecryptedMessage);

        cache.clearSessionCache('session-a');

        expect(cache.getCachedAgentState('session-a', 1)).toBeNull();
        expect(cache.getCachedMetadata('session-a', 1)).toBeNull();
        expect(cache.getCachedAgentState('session-b', 1)).toBe(agentState);
        expect(cache.getCachedMessage('message-a')).toBe(message);
        expect(cache.getStats()).toMatchObject({
            agentStates: 1,
            metadata: 0,
            messages: 1,
            totalEntries: 2,
        });
    });
});
