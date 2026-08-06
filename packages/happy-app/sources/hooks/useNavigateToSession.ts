import type { Router } from "expo-router"
import { useRouter } from "expo-router"
import { storage } from '@/sync/storage';
import { trackSessionSwitched } from '@/track';

export function navigateToSession(router: Router, sessionId: string) {
    const session = storage.getState().sessions[sessionId];
    if (session) {
        trackSessionSwitched(session);
    }

    router.push(`/session/${encodeURIComponent(sessionId)}`);
}

export function navigateToSessionMessage(router: Router, sessionId: string, messageId: string, localId?: string | null, createdAt?: number) {
    const session = storage.getState().sessions[sessionId];
    if (session) {
        trackSessionSwitched(session);
    }

    router.push({
        pathname: '/session/[id]',
        params: { id: sessionId, messageId, ...(localId ? { localId } : {}), ...(createdAt !== undefined ? { createdAt: String(createdAt) } : {}) },
    });
}

export function useNavigateToSession() {
    const router = useRouter();
    return (sessionId: string) => {
        navigateToSession(router, sessionId);
    }
}

export function useNavigateToSessionMessage() {
    const router = useRouter();
    return (sessionId: string, messageId: string, localId?: string | null, createdAt?: number) => {
        navigateToSessionMessage(router, sessionId, messageId, localId, createdAt);
    }
}
