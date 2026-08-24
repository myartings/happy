type CachedTurn<TItem, TOutput> = {
    items: readonly TItem[];
    variant: string;
    output: TOutput;
};

export type TurnProjectionRequest<TItem, TOutput> = {
    items: readonly TItem[];
    getId: (item: TItem) => string;
    isBoundary: (item: TItem) => boolean;
    variantForSegment: (segmentIndex: number) => string;
    projectSegment: (segment: readonly TItem[], segmentIndex: number) => TOutput;
};

function sameItems<TItem>(left: readonly TItem[], right: readonly TItem[]): boolean {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
        if (left[index] !== right[index]) return false;
    }
    return true;
}

/** Cache immutable completed-turn projections while the newest turn streams. */
export class TurnProjectionCache<TItem, TOutput> {
    private readonly turns = new Map<string, CachedTurn<TItem, TOutput>>();

    get size(): number {
        return this.turns.size;
    }

    project(request: TurnProjectionRequest<TItem, TOutput>): TOutput[] {
        const segments: TItem[][] = [];
        let current: TItem[] = [];
        for (const item of request.items) {
            current.push(item);
            if (request.isBoundary(item)) {
                segments.push(current);
                current = [];
            }
        }
        if (current.length > 0) {
            segments.push(current);
        }

        const retainedKeys = new Set<string>();
        const output: TOutput[] = [];
        segments.forEach((segment, segmentIndex) => {
            const oldest = segment[segment.length - 1];
            const key = request.getId(oldest);
            const variant = request.variantForSegment(segmentIndex);
            retainedKeys.add(key);
            const existing = this.turns.get(key);
            if (existing && existing.variant === variant && sameItems(existing.items, segment)) {
                output.push(existing.output);
                return;
            }

            const projected = request.projectSegment(segment, segmentIndex);
            this.turns.set(key, { items: segment, variant, output: projected });
            output.push(projected);
        });

        for (const key of this.turns.keys()) {
            if (!retainedKeys.has(key)) {
                this.turns.delete(key);
            }
        }
        return output;
    }

    clear(): void {
        this.turns.clear();
    }
}
