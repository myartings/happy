type ProjectionEntry<TSource, TMachine, TRow> = {
    source: TSource;
    unread: boolean;
    machine: TMachine | undefined;
    row: TRow;
};

export type SessionRowProjectionRequest<TSource, TMachine, TRow> = {
    id: string;
    source: TSource;
    unread: boolean;
    machine: TMachine | undefined;
    build: () => TRow;
};

/**
 * Retains stable row projections while their immutable Session source and the
 * two external inputs used by row presentation remain unchanged.
 */
export class SessionRowProjectionCache<TSource, TMachine, TRow> {
    private readonly entries = new Map<string, ProjectionEntry<TSource, TMachine, TRow>>();

    get size(): number {
        return this.entries.size;
    }

    project(request: SessionRowProjectionRequest<TSource, TMachine, TRow>): TRow {
        const existing = this.entries.get(request.id);
        if (
            existing
            && existing.source === request.source
            && existing.unread === request.unread
            && existing.machine === request.machine
        ) {
            return existing.row;
        }

        const row = request.build();
        this.entries.set(request.id, {
            source: request.source,
            unread: request.unread,
            machine: request.machine,
            row,
        });
        return row;
    }

    prune(retainedIds: ReadonlySet<string>): void {
        for (const id of this.entries.keys()) {
            if (!retainedIds.has(id)) {
                this.entries.delete(id);
            }
        }
    }

    clear(): void {
        this.entries.clear();
    }
}
