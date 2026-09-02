const CODEX_REASONING_EFFORTS = new Set([
    'none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra',
]);

export function isConcreteCodexModel(value: unknown): value is string {
    if (typeof value !== 'string' || value.length > 128 || value !== value.trim()) {
        return false;
    }
    const normalized = value.toLowerCase();
    if (normalized === 'default' || normalized === 'null' || normalized === 'undefined') {
        return false;
    }
    return /^(?:o\d[A-Za-z0-9._-]*|[A-Za-z][A-Za-z0-9._]*[-/:][A-Za-z0-9][A-Za-z0-9._:/-]*)$/.test(value);
}

export function isCodexReasoningEffort(value: unknown): value is string {
    return typeof value === 'string' && CODEX_REASONING_EFFORTS.has(value);
}

export function getCodexEffectiveRoute(metadata: {
    [key: string]: unknown;
    effectiveModel?: unknown;
    effectiveReasoningEffort?: unknown;
} | null | undefined): { modelMode: string; effortLevel: string } | null {
    if (!isConcreteCodexModel(metadata?.effectiveModel)
        || !isCodexReasoningEffort(metadata?.effectiveReasoningEffort)) {
        return null;
    }
    return {
        modelMode: metadata.effectiveModel,
        effortLevel: metadata.effectiveReasoningEffort,
    };
}

export function resolveCodexSessionDisplayRoute(
    session: {
        modelMode?: string | null;
        effortLevel?: string | null;
        metadata?: {
            [key: string]: unknown;
            effectiveModel?: unknown;
            effectiveReasoningEffort?: unknown;
        } | null;
    },
    defaults: { modelMode: string | null; effortLevel: string | null },
): { modelMode: string | null; effortLevel: string | null } {
    const effective = getCodexEffectiveRoute(session.metadata);
    const launchPending = session.metadata?.codexLaunchRoutePending === true;
    return {
        modelMode: session.modelMode
            ?? effective?.modelMode
            ?? (launchPending ? null : defaults.modelMode),
        effortLevel: session.effortLevel
            ?? effective?.effortLevel
            ?? (launchPending ? null : defaults.effortLevel),
    };
}

export function resolveCodexDisplayCandidate<
    K extends 'modelMode' | 'effortLevel',
>(
    route: { modelMode: string | null; effortLevel: string | null } | null,
    key: K,
    fallback: string | null,
): string | null {
    return route ? route[key] : fallback;
}
