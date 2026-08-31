import type { Router } from "expo-router"
import { useRouter } from "expo-router"
import { storage } from '@/sync/storage';
import { trackSessionSwitched } from '@/track';
import type { CurrentRequestAttentionFocusHint } from '@/features/needs-attention/currentRequestAttentionFocus';

export function navigateToSession(
    router: Router,
    sessionId: string,
    attentionFocus?: CurrentRequestAttentionFocusHint,
) {
    const session = storage.getState().sessions[sessionId];
    if (session) {
        trackSessionSwitched(session);
    }

    if (attentionFocus) {
        router.push({
            pathname: '/session/[id]',
            params: {
                id: sessionId,
                attentionKind: attentionFocus.kind,
                attentionSourceId: attentionFocus.sourceId,
                ...(attentionFocus.observedAgentStateVersion !== undefined
                    ? { attentionAgentStateVersion: String(attentionFocus.observedAgentStateVersion) }
                    : {}),
            },
        });
        return;
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
    return (sessionId: string, attentionFocus?: CurrentRequestAttentionFocusHint) => {
        navigateToSession(router, sessionId, attentionFocus);
    }
}

export function useNavigateToSessionMessage() {
    const router = useRouter();
    return (sessionId: string, messageId: string, localId?: string | null, createdAt?: number) => {
        navigateToSessionMessage(router, sessionId, messageId, localId, createdAt);
    }
}
