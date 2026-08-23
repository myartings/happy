import type { Session } from '@/sync/storageTypes';

export type SessionActivityMessage = {
    role: 'user' | 'agent' | 'event';
    createdAt: number;
};

export function getUserMessageActivityAt(message: SessionActivityMessage | null): number | null {
    if (message?.role !== 'user' || !Number.isFinite(message.createdAt) || message.createdAt <= 0) {
        return null;
    }
    return message.createdAt;
}

export function resolveLatestSessionActivityAt(
    currentActivityAt: number | null | undefined,
    incomingActivityAt: number,
): number {
    return Math.max(currentActivityAt ?? 0, incomingActivityAt);
}

/**
 * The timestamp the session list sorts on.
 *
 * Prefers `metadata.lastMeaningfulMessageAt`, which the agent publishes and
 * every device therefore agrees on. Agents that do not write it yet fall back
 * to `lastMessageSentAt` — this device's own record of the last message it
 * sent — and finally to creation, so a session always has an ordering key.
 *
 * Kept apart from sessionUtils, which reaches for React and the translation
 * table; this is plain arithmetic over stored fields.
 */
export function getSessionActivityAt(session: Session): number {
    return session.metadata?.lastMeaningfulMessageAt
        ?? session.lastMessageSentAt
        ?? session.createdAt;
}
