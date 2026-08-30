export const DEFAULT_SESSION_MESSAGE_COALESCE_MS = 24;
export const MAX_SESSION_MESSAGE_COALESCE_MS = 32;

export type SessionMessageBatch<T> = {
    sessionId: string;
    generation: number;
    messages: T[];
    isCurrent: () => boolean;
};

type SessionMessageBatchSchedulerOptions<T> = {
    drain: (batch: SessionMessageBatch<T>) => Promise<void> | void;
    windowMs?: number;
    onError?: (error: unknown, sessionId: string) => void;
    onIdle?: (sessionId: string) => void;
};

type ReadyBatch<T> = {
    generation: number;
    messages: T[];
};

type SessionSchedule<T> = {
    sessionId: string;
    generation: number;
    pending: T[];
    ready: ReadyBatch<T>[];
    timer: ReturnType<typeof setTimeout> | null;
    processing: boolean;
};

/**
 * Coalesces messages independently per Session. Timers only promote pending
 * messages into FIFO-ready batches; the owning Sync instance decides which
 * lock protects the actual drain.
 */
export class SessionMessageBatchScheduler<T> {
    private readonly drain: SessionMessageBatchSchedulerOptions<T>['drain'];
    private readonly windowMs: number;
    private readonly onError: SessionMessageBatchSchedulerOptions<T>['onError'];
    private readonly onIdle: SessionMessageBatchSchedulerOptions<T>['onIdle'];
    private readonly schedules = new Map<string, SessionSchedule<T>>();
    private readonly processingSessionIds = new Set<string>();

    constructor(options: SessionMessageBatchSchedulerOptions<T>) {
        const windowMs = options.windowMs ?? DEFAULT_SESSION_MESSAGE_COALESCE_MS;
        if (
            !Number.isFinite(windowMs)
            || windowMs <= 0
            || windowMs > MAX_SESSION_MESSAGE_COALESCE_MS
        ) {
            throw new Error(
                `Session message coalescing window must be within 1-${MAX_SESSION_MESSAGE_COALESCE_MS} ms`,
            );
        }
        this.drain = options.drain;
        this.windowMs = windowMs;
        this.onError = options.onError;
        this.onIdle = options.onIdle;
    }

    enqueue(sessionId: string, generation: number, messages: readonly T[]): void {
        if (messages.length === 0) return;

        let schedule = this.schedules.get(sessionId);
        if (schedule && schedule.generation !== generation) {
            this.cancel(sessionId);
            schedule = undefined;
        }
        if (!schedule) {
            schedule = this.createSchedule(sessionId, generation);
            this.schedules.set(sessionId, schedule);
        }
        schedule.pending.push(...messages);
        this.ensureTimer(schedule);
    }

    flush(sessionId: string): void {
        const schedule = this.schedules.get(sessionId);
        if (!schedule) return;
        this.clearTimer(schedule);
        this.stagePending(schedule);
        this.startProcessing(schedule);
    }

    cancel(sessionId: string): void {
        const schedule = this.schedules.get(sessionId);
        if (!schedule) return;
        this.clearTimer(schedule);
        schedule.pending.length = 0;
        schedule.ready.length = 0;
        this.schedules.delete(sessionId);
    }

    shutdown(): void {
        for (const sessionId of Array.from(this.schedules.keys())) {
            this.cancel(sessionId);
        }
    }

    isBusy(sessionId: string): boolean {
        const schedule = this.schedules.get(sessionId);
        return this.processingSessionIds.has(sessionId) || (
            !!schedule && (
                schedule.processing
                || schedule.timer !== null
                || schedule.pending.length > 0
                || schedule.ready.length > 0
            )
        );
    }

    busySessionIds(): string[] {
        return Array.from(new Set([
            ...this.schedules.keys(),
            ...this.processingSessionIds,
        ])).filter((sessionId) => this.isBusy(sessionId));
    }

    private createSchedule(sessionId: string, generation: number): SessionSchedule<T> {
        return {
            sessionId,
            generation,
            pending: [],
            ready: [],
            timer: null,
            processing: false,
        };
    }

    private ensureTimer(schedule: SessionSchedule<T>): void {
        if (schedule.timer !== null || schedule.pending.length === 0) return;
        try {
            schedule.timer = setTimeout(() => {
                if (this.schedules.get(schedule.sessionId) !== schedule) return;
                schedule.timer = null;
                this.stagePending(schedule);
                this.startProcessing(schedule);
            }, this.windowMs);
        } catch (error) {
            // Scheduling is only an optimization. Preserve the old immediate
            // path if the host cannot create a timer.
            schedule.timer = null;
            this.onError?.(error, schedule.sessionId);
            this.stagePending(schedule);
            this.startProcessing(schedule);
        }
    }

    private clearTimer(schedule: SessionSchedule<T>): void {
        if (schedule.timer === null) return;
        clearTimeout(schedule.timer);
        schedule.timer = null;
    }

    private stagePending(schedule: SessionSchedule<T>): void {
        if (schedule.pending.length === 0) return;
        schedule.ready.push({
            generation: schedule.generation,
            messages: schedule.pending.splice(0, schedule.pending.length),
        });
    }

    private startProcessing(schedule: SessionSchedule<T>): void {
        if (
            schedule.processing
            || this.processingSessionIds.has(schedule.sessionId)
            || schedule.ready.length === 0
        ) return;
        schedule.processing = true;
        this.processingSessionIds.add(schedule.sessionId);
        void this.process(schedule);
    }

    private async process(schedule: SessionSchedule<T>): Promise<void> {
        try {
            while (this.schedules.get(schedule.sessionId) === schedule) {
                const batch = schedule.ready.shift();
                if (!batch) break;
                try {
                    await this.drain({
                        sessionId: schedule.sessionId,
                        generation: batch.generation,
                        messages: batch.messages,
                        isCurrent: () => (
                            this.schedules.get(schedule.sessionId) === schedule
                        ),
                    });
                } catch (error) {
                    this.onError?.(error, schedule.sessionId);
                }
            }
        } finally {
            schedule.processing = false;
            this.processingSessionIds.delete(schedule.sessionId);
            const currentSchedule = this.schedules.get(schedule.sessionId);
            if (currentSchedule !== schedule) {
                if (currentSchedule?.ready.length) {
                    this.startProcessing(currentSchedule);
                } else if (!currentSchedule) {
                    this.onIdle?.(schedule.sessionId);
                }
                return;
            }
            if (schedule.ready.length > 0) {
                this.startProcessing(schedule);
                return;
            }
            if (schedule.pending.length > 0) {
                this.ensureTimer(schedule);
                return;
            }
            if (schedule.timer === null) {
                this.schedules.delete(schedule.sessionId);
                this.onIdle?.(schedule.sessionId);
            }
        }
    }
}
