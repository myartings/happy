import { describe, expect, it } from 'vitest';

import { resolveCodexReconnectCredentials } from './reconnectCredentials';

describe('resolveCodexReconnectCredentials', () => {
    it('returns undefined when no reconnect environment is present', () => {
        expect(resolveCodexReconnectCredentials({})).toBeUndefined();
    });

    it('fails closed when reconnect environment is incomplete', () => {
        expect(() => resolveCodexReconnectCredentials({
            HAPPY_RECONNECT_SESSION_ID: 'session-partial',
        })).toThrow('Incomplete Happy reconnect environment');
    });

    it('fails closed when only reconnect revision state remains', () => {
        expect(() => resolveCodexReconnectCredentials({
            HAPPY_RECONNECT_METADATA_VERSION: '7',
        })).toThrow('Incomplete Happy reconnect environment');
    });

    it('fails closed when reconnect identity fields are present but empty', () => {
        expect(() => resolveCodexReconnectCredentials({
            HAPPY_RECONNECT_SESSION_ID: '',
            HAPPY_RECONNECT_ENCRYPTION_KEY: '',
            HAPPY_RECONNECT_ENCRYPTION_VARIANT: '',
        })).toThrow('Incomplete Happy reconnect environment');
    });

    it('fails closed when the encryption variant is unknown', () => {
        expect(() => resolveCodexReconnectCredentials({
            HAPPY_RECONNECT_SESSION_ID: 'session-invalid',
            HAPPY_RECONNECT_ENCRYPTION_KEY: 'encoded-key',
            HAPPY_RECONNECT_ENCRYPTION_VARIANT: 'future-format',
        })).toThrow('Unsupported Happy reconnect encryption variant');
    });

    it('accepts one complete reconnect identity', () => {
        expect(resolveCodexReconnectCredentials({
            HAPPY_RECONNECT_SESSION_ID: 'session-complete',
            HAPPY_RECONNECT_ENCRYPTION_KEY: 'encoded-key',
            HAPPY_RECONNECT_ENCRYPTION_VARIANT: 'dataKey',
        })).toEqual({
            sessionId: 'session-complete',
            keyBase64: 'encoded-key',
            variant: 'dataKey',
        });
    });
});
