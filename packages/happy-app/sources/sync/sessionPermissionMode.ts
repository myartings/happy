import type { Session } from './storageTypes';

type CodexSessionPermissionSource = Pick<Session, 'permissionMode' | 'metadata'>;

/**
 * Resolve the permission mode shared by the composer and outbound Codex turns.
 * A synchronized null is an explicit reset; only a session that never
 * published the field may recover YOLO from the exact legacy launch marker.
 */
export function resolveCodexSessionPermissionMode(
    session: CodexSessionPermissionSource,
    fallback: string,
): string {
    if (session.permissionMode !== null && session.permissionMode !== undefined) {
        return session.permissionMode;
    }

    const metadata = session.metadata;
    if (metadata && Object.prototype.hasOwnProperty.call(metadata, 'permissionMode')) {
        return metadata.permissionMode ?? fallback;
    }

    return metadata?.flavor === 'codex'
        && metadata.dangerouslySkipPermissions === true
        ? 'yolo'
        : fallback;
}
