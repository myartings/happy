export function createSerialAsyncHandler<T>(
    handler: (value: T) => Promise<void>,
    onError?: (error: unknown) => void,
): (value: T) => void {
    let tail = Promise.resolve();

    return (value: T) => {
        tail = tail
            .then(() => handler(value))
            .catch((error) => {
                onError?.(error);
            });
    };
}

/**
 * Run at most one async operation at a time while retaining only the newest
 * value queued behind it. Calling the returned function is always synchronous.
 */
export function createLatestAsyncHandler<T>(
    handler: (value: T) => Promise<void>,
    onError?: (error: unknown) => void,
): (value: T) => void {
    let running = false;
    let hasPending = false;
    let pending!: T;

    const drain = async (initial: T) => {
        running = true;
        let current = initial;
        while (true) {
            try {
                await handler(current);
            } catch (error) {
                onError?.(error);
            }
            if (!hasPending) break;
            current = pending;
            hasPending = false;
        }
        running = false;
    };

    return (value: T) => {
        if (running) {
            pending = value;
            hasPending = true;
            return;
        }
        void drain(value);
    };
}
