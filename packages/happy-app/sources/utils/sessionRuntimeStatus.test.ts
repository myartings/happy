import { describe, expect, it } from 'vitest';
import { resolveSessionRuntimeStatus } from './sessionRuntimeStatus';

describe('resolveSessionRuntimeStatus', () => {
    it('reports an online thinking session as running', () => {
        expect(resolveSessionRuntimeStatus({
            isOnline: true,
            hasPermissions: false,
            isThinking: true,
        })).toBe('running');
    });

    it('gives a permission request priority over running', () => {
        expect(resolveSessionRuntimeStatus({
            isOnline: true,
            hasPermissions: true,
            isThinking: true,
        })).toBe('permission_required');
    });

    it('reports a disconnected session regardless of stale runtime flags', () => {
        expect(resolveSessionRuntimeStatus({
            isOnline: false,
            hasPermissions: true,
            isThinking: true,
        })).toBe('disconnected');
    });

    it('reports an online session with no active turn as idle', () => {
        expect(resolveSessionRuntimeStatus({
            isOnline: true,
            hasPermissions: false,
            isThinking: false,
        })).toBe('idle');
    });
});
