import { Platform } from 'react-native';
import { getCurrentAppState } from '@/sync/apiSocket';
import type { ApiEphemeralSessionEventUpdate } from '@/sync/apiTypes';
import { isTauri } from '@/utils/isTauri';
import { log } from '@/log';

const MAX_NOTIFIED_EVENTS = 200;
const notifiedEventKeys: string[] = [];
const notifiedEventKeySet = new Set<string>();
let actionListenerInitialized = false;

type TauriNotificationModule = typeof import('@tauri-apps/plugin-notification');

function rememberEventKey(key: string): boolean {
    if (notifiedEventKeySet.has(key)) {
        return false;
    }

    notifiedEventKeySet.add(key);
    notifiedEventKeys.push(key);

    while (notifiedEventKeys.length > MAX_NOTIFIED_EVENTS) {
        const oldestKey = notifiedEventKeys.shift();
        if (oldestKey) {
            notifiedEventKeySet.delete(oldestKey);
        }
    }

    return true;
}

function buildNotificationId(event: ApiEphemeralSessionEventUpdate): number {
    const input = `${event.sessionId}:${event.kind}:${event.timestamp}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0) & 0x7fffffff;
}

function getSessionIdFromNotification(value: unknown): string | null {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const extra = (value as { extra?: unknown }).extra;
    if (!extra || typeof extra !== 'object') {
        return null;
    }
    const sessionId = (extra as { sessionId?: unknown }).sessionId;
    return typeof sessionId === 'string' && sessionId.trim() ? sessionId : null;
}

async function ensureActionListener(notification: TauriNotificationModule) {
    if (actionListenerInitialized || typeof window === 'undefined') {
        return;
    }
    actionListenerInitialized = true;

    try {
        await notification.onAction((event) => {
            const sessionId = getSessionIdFromNotification(event);
            if (!sessionId) {
                return;
            }
            window.dispatchEvent(new CustomEvent('happy-session-notification-open', {
                detail: { sessionId }
            }));
        });
    } catch (error) {
        log.log(`Failed to attach desktop notification action listener: ${error}`);
    }
}

async function ensurePermission(notification: TauriNotificationModule): Promise<boolean> {
    try {
        if (await notification.isPermissionGranted()) {
            return true;
        }
        return (await notification.requestPermission()) === 'granted';
    } catch (error) {
        log.log(`Failed to request desktop notification permission: ${error}`);
        return false;
    }
}

export async function maybeShowDesktopSessionNotification(event: ApiEphemeralSessionEventUpdate) {
    if (Platform.OS !== 'web' || !isTauri()) {
        return;
    }
    if (getCurrentAppState() === 'active') {
        return;
    }

    const eventKey = `${event.sessionId}:${event.kind}:${event.timestamp}`;
    if (!rememberEventKey(eventKey)) {
        return;
    }

    try {
        const notification = await import('@tauri-apps/plugin-notification');
        await ensureActionListener(notification);
        if (!(await ensurePermission(notification))) {
            return;
        }

        notification.sendNotification({
            id: buildNotificationId(event),
            title: event.title,
            body: event.body,
            group: event.sessionId,
            autoCancel: true,
            extra: {
                sessionId: event.sessionId,
                kind: event.kind,
                url: `/session/${encodeURIComponent(event.sessionId)}`
            }
        });
    } catch (error) {
        log.log(`Failed to show desktop session notification: ${error}`);
    }
}
