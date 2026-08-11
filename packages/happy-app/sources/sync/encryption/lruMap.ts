/**
 * A bounded least-recently-used map backed by Map insertion order.
 * Reads and updates move an entry to the end; eviction removes the first key.
 */
export class LruMap<K, V> {
    private readonly entries = new Map<K, V>();

    constructor(private readonly maxSize: number) {}

    get size(): number {
        return this.entries.size;
    }

    get(key: K): V | undefined {
        if (!this.entries.has(key)) {
            return undefined;
        }

        const value = this.entries.get(key) as V;
        this.entries.delete(key);
        this.entries.set(key, value);
        return value;
    }

    set(key: K, value: V): void {
        this.entries.delete(key);
        this.entries.set(key, value);

        if (this.entries.size > this.maxSize) {
            const oldest = this.entries.keys().next();
            if (!oldest.done) {
                this.entries.delete(oldest.value);
            }
        }
    }

    delete(key: K): boolean {
        return this.entries.delete(key);
    }

    clear(): void {
        this.entries.clear();
    }

    keys(): MapIterator<K> {
        return this.entries.keys();
    }
}
