export interface SessionRealtimeRecoveryDependencies {
    isActive: () => boolean;
    getVisibleSessionIds: () => string[];
    reconcile: (sessionId: string, reason: string) => void;
    ensureSocketHealthy: () => Promise<boolean>;
}

export class SessionRealtimeRecovery {
    private periodicReconciliation: ReturnType<typeof setInterval> | null = null;
    private readonly trailingReconciliations = new Map<string, ReturnType<typeof setTimeout>>();

    constructor(private readonly dependencies: SessionRealtimeRecoveryDependencies) {}

    start() {
        if (this.periodicReconciliation) {
            return;
        }
        this.periodicReconciliation = setInterval(() => {
            this.reconcileAllVisible('foreground-interval');
        }, 30_000);
    }

    async onForeground() {
        await this.dependencies.ensureSocketHealthy();
        this.reconcileAllVisible('foreground');
    }

    onSocketReconnected() {
        this.reconcileAllVisible('socket-reconnected');
    }

    onSessionDone(sessionId: string) {
        this.scheduleTerminalReconciliation(sessionId, 'session-done');
    }

    onThinkingTransition(sessionId: string, previous: boolean, next: boolean) {
        if (!previous || next) {
            return;
        }

        this.scheduleTerminalReconciliation(sessionId, 'thinking-idle');
    }

    private scheduleTerminalReconciliation(sessionId: string, reason: string) {
        this.reconcileIfVisible(sessionId, reason);
        const existing = this.trailingReconciliations.get(sessionId);
        if (existing) {
            clearTimeout(existing);
        }
        const timer = setTimeout(() => {
            this.trailingReconciliations.delete(sessionId);
            this.reconcileIfVisible(sessionId, `${reason}-trailing`);
        }, 2_000);
        this.trailingReconciliations.set(sessionId, timer);
    }

    stop() {
        if (this.periodicReconciliation) {
            clearInterval(this.periodicReconciliation);
            this.periodicReconciliation = null;
        }
        for (const timer of this.trailingReconciliations.values()) {
            clearTimeout(timer);
        }
        this.trailingReconciliations.clear();
    }

    private reconcileIfVisible(sessionId: string, reason: string) {
        if (!this.dependencies.isActive()) {
            return;
        }
        if (!this.dependencies.getVisibleSessionIds().includes(sessionId)) {
            return;
        }
        this.dependencies.reconcile(sessionId, reason);
    }

    private reconcileAllVisible(reason: string) {
        if (!this.dependencies.isActive()) {
            return;
        }
        for (const sessionId of this.dependencies.getVisibleSessionIds()) {
            this.dependencies.reconcile(sessionId, reason);
        }
    }
}
