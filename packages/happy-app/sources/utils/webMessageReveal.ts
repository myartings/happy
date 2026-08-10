const MAX_REVEAL_ATTEMPTS = 30;
const REVEAL_RETRY_DELAY_MS = 100;

/**
 * Repeatedly centers a message while React Native Web's virtualized list settles.
 * The returned cleanup must be called when another navigation request supersedes
 * this one, otherwise stale retry loops can fight over the scroll position.
 */
export function revealWebMessage(messageTargetId: string): () => void {
    if (typeof document === 'undefined') return () => {};

    let attempts = 0;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const reveal = () => {
        if (cancelled) return;

        const target = document.getElementById(messageTargetId);
        if (target) {
            target.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
        }

        attempts += 1;
        if (attempts < MAX_REVEAL_ATTEMPTS) {
            retryTimer = setTimeout(reveal, REVEAL_RETRY_DELAY_MS);
        }
    };

    reveal();

    return () => {
        cancelled = true;
        if (retryTimer !== null) clearTimeout(retryTimer);
    };
}
