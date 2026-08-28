export type OrderedMessage = {
    id: string;
    createdAt: number;
};

export type OrderedMessageCollectionFallbackReason =
    | 'source-length-mismatch'
    | 'source-map-mismatch'
    | 'source-order-violation'
    | 'invalid-created-at'
    | 'created-at-changed'
    | 'index-mismatch';

export type OrderedMessageCollectionResult<T extends OrderedMessage> = {
    messages: T[];
    messagesMap: Record<string, T>;
};

type CollectionIndex<T extends OrderedMessage> = {
    messages: readonly T[];
    messagesMap: Readonly<Record<string, T>>;
    positions: Map<string, number>;
};

type OrderedMessageCollectionOptions = {
    onFallback?: (reason: OrderedMessageCollectionFallbackReason) => void;
};

function ownsMessage<T extends OrderedMessage>(
    messagesMap: Readonly<Record<string, T>>,
    id: string,
): boolean {
    return Object.prototype.hasOwnProperty.call(messagesMap, id);
}

/**
 * Maintains the descending `createdAt` order used by Session message selectors
 * without sorting the entire lookup after every reducer update.
 *
 * The positional index is deliberately kept outside Zustand. Published arrays
 * and lookup objects remain ordinary immutable snapshots, while the index can
 * be discarded and reconstructed whenever an external state replacement is
 * observed.
 */
export class IncrementalOrderedMessageCollection<T extends OrderedMessage> {
    private readonly indexes = new Map<string, CollectionIndex<T>>();
    private readonly onFallback: OrderedMessageCollectionOptions['onFallback'];

    constructor(options: OrderedMessageCollectionOptions = {}) {
        this.onFallback = options.onFallback;
    }

    apply(
        key: string,
        previousMessages: readonly T[],
        previousMessagesMap: Readonly<Record<string, T>>,
        updates: readonly T[],
    ): OrderedMessageCollectionResult<T> {
        let index = this.indexes.get(key);
        if (
            !index
            || index.messages !== previousMessages
            || index.messagesMap !== previousMessagesMap
        ) {
            const indexed = this.indexSource(previousMessages, previousMessagesMap);
            if ('reason' in indexed) {
                return this.fallback(key, previousMessagesMap, updates, indexed.reason);
            }
            index = indexed.index;
            this.indexes.set(key, index);
        }

        if (updates.length === 0) {
            return {
                messages: previousMessages as T[],
                messagesMap: previousMessagesMap as Record<string, T>,
            };
        }

        // A reducer should emit each changed ID once, but retaining the last
        // value gives deterministic map-assignment semantics if it does not.
        const uniqueUpdates = new Map<string, T>();
        for (const update of updates) {
            uniqueUpdates.set(update.id, update);
        }

        let nextMessages: T[] | null = null;
        let nextMessagesMap: Record<string, T> | null = null;
        const additions: T[] = [];

        for (const update of uniqueUpdates.values()) {
            if (!Number.isFinite(update.createdAt)) {
                return this.fallback(
                    key,
                    previousMessagesMap,
                    uniqueUpdates.values(),
                    'invalid-created-at',
                );
            }

            if (!ownsMessage(previousMessagesMap, update.id)) {
                additions.push(update);
                nextMessagesMap ??= { ...previousMessagesMap };
                nextMessagesMap[update.id] = update;
                continue;
            }

            const previous = previousMessagesMap[update.id];
            if (previous.createdAt !== update.createdAt) {
                return this.fallback(
                    key,
                    previousMessagesMap,
                    uniqueUpdates.values(),
                    'created-at-changed',
                );
            }

            const position = index.positions.get(update.id);
            if (
                position === undefined
                || previousMessages[position] !== previous
            ) {
                return this.fallback(
                    key,
                    previousMessagesMap,
                    uniqueUpdates.values(),
                    'index-mismatch',
                );
            }

            if (previous === update) {
                continue;
            }

            nextMessages ??= previousMessages.slice();
            nextMessages[position] = update;
            nextMessagesMap ??= { ...previousMessagesMap };
            nextMessagesMap[update.id] = update;
        }

        if (!nextMessagesMap) {
            return {
                messages: previousMessages as T[],
                messagesMap: previousMessagesMap as Record<string, T>,
            };
        }

        if (additions.length > 1) {
            // Only the bounded incoming batch is sorted. The retained Session
            // history is merged in one pass and never participates in a sort.
            additions.sort((a, b) => b.createdAt - a.createdAt);
        }

        if (additions.length > 0) {
            nextMessages = this.merge(previousMessages, nextMessages, additions);
            index = {
                messages: nextMessages,
                messagesMap: nextMessagesMap,
                positions: this.buildPositions(nextMessages),
            };
        } else {
            index = {
                messages: nextMessages!,
                messagesMap: nextMessagesMap,
                positions: index.positions,
            };
        }

        this.indexes.set(key, index);
        return {
            messages: nextMessages!,
            messagesMap: nextMessagesMap,
        };
    }

    remove(key: string): void {
        this.indexes.delete(key);
    }

    private indexSource(
        messages: readonly T[],
        messagesMap: Readonly<Record<string, T>>,
    ):
        | { index: CollectionIndex<T> }
        | { reason: OrderedMessageCollectionFallbackReason } {
        if (messages.length !== Object.keys(messagesMap).length) {
            return { reason: 'source-length-mismatch' };
        }

        const positions = new Map<string, number>();
        let previousCreatedAt = Number.POSITIVE_INFINITY;
        for (let position = 0; position < messages.length; position += 1) {
            const message = messages[position];
            if (!Number.isFinite(message.createdAt)) {
                return { reason: 'invalid-created-at' };
            }
            if (message.createdAt > previousCreatedAt) {
                return { reason: 'source-order-violation' };
            }
            if (
                positions.has(message.id)
                || !ownsMessage(messagesMap, message.id)
                || messagesMap[message.id] !== message
            ) {
                return { reason: 'source-map-mismatch' };
            }
            positions.set(message.id, position);
            previousCreatedAt = message.createdAt;
        }

        return {
            index: { messages, messagesMap, positions },
        };
    }

    private merge(
        previousMessages: readonly T[],
        replacedMessages: T[] | null,
        additions: readonly T[],
    ): T[] {
        const existing = replacedMessages ?? previousMessages;
        const merged: T[] = [];
        let existingIndex = 0;
        let additionIndex = 0;

        while (
            existingIndex < existing.length
            && additionIndex < additions.length
        ) {
            // Existing messages win ties, matching stable full-sort behavior:
            // newly assigned lookup entries followed retained entries.
            if (existing[existingIndex].createdAt >= additions[additionIndex].createdAt) {
                merged.push(existing[existingIndex]);
                existingIndex += 1;
            } else {
                merged.push(additions[additionIndex]);
                additionIndex += 1;
            }
        }

        if (existingIndex < existing.length) {
            for (; existingIndex < existing.length; existingIndex += 1) {
                merged.push(existing[existingIndex]);
            }
        }
        if (additionIndex < additions.length) {
            for (; additionIndex < additions.length; additionIndex += 1) {
                merged.push(additions[additionIndex]);
            }
        }
        return merged;
    }

    private fallback(
        key: string,
        previousMessagesMap: Readonly<Record<string, T>>,
        updates: Iterable<T>,
        reason: OrderedMessageCollectionFallbackReason,
    ): OrderedMessageCollectionResult<T> {
        const messagesMap = { ...previousMessagesMap };
        for (const update of updates) {
            messagesMap[update.id] = update;
        }
        const messages = Object.values(messagesMap)
            .sort((a, b) => b.createdAt - a.createdAt);
        this.indexes.set(key, {
            messages,
            messagesMap,
            positions: this.buildPositions(messages),
        });
        this.onFallback?.(reason);
        return { messages, messagesMap };
    }

    private buildPositions(messages: readonly T[]): Map<string, number> {
        const positions = new Map<string, number>();
        for (let position = 0; position < messages.length; position += 1) {
            positions.set(messages[position].id, position);
        }
        return positions;
    }
}
