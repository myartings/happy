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
