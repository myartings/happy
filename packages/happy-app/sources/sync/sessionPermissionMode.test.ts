import { describe, expect, it } from 'vitest';
import { resolveCodexSessionPermissionMode } from './sessionPermissionMode';

describe('resolveCodexSessionPermissionMode', () => {
    it('recovers YOLO only from an unambiguous legacy Codex launch marker', () => {
        expect(resolveCodexSessionPermissionMode({
            permissionMode: null,
            metadata: {
                flavor: 'codex',
                dangerouslySkipPermissions: true,
            },
        } as any, 'auto')).toBe('yolo');
    });

    it('does not elevate a non-Codex session from the legacy marker', () => {
        expect(resolveCodexSessionPermissionMode({
            permissionMode: null,
            metadata: {
                flavor: 'claude',
                dangerouslySkipPermissions: true,
            },
        } as any, 'auto')).toBe('auto');
    });

    it.each([
        ['missing marker', {}, 'auto'],
        ['false marker', { dangerouslySkipPermissions: false }, 'auto'],
        ['null marker', { dangerouslySkipPermissions: null }, 'auto'],
        ['non-boolean marker', { dangerouslySkipPermissions: 'true' }, 'auto'],
        ['explicit reset', { permissionMode: null, dangerouslySkipPermissions: true }, 'auto'],
    ])('does not elevate from %s', (_label, metadata, expected) => {
        expect(resolveCodexSessionPermissionMode({
            permissionMode: null,
            metadata: { flavor: 'codex', ...metadata },
        } as any, 'auto')).toBe(expected);
    });

    it.each([
        ['auto', 'auto'],
        ['default', 'default'],
        ['yolo', 'yolo'],
    ])('prefers explicit synchronized %s over a stale legacy marker', (_label, permissionMode) => {
        expect(resolveCodexSessionPermissionMode({
            permissionMode: null,
            metadata: {
                flavor: 'codex',
                permissionMode,
                dangerouslySkipPermissions: true,
            },
        } as any, 'auto')).toBe(permissionMode);
    });

    it('lets the optimistic local selection override synchronized metadata', () => {
        expect(resolveCodexSessionPermissionMode({
            permissionMode: 'yolo',
            metadata: { flavor: 'codex', permissionMode: 'auto' },
        } as any, 'auto')).toBe('yolo');
    });
});
