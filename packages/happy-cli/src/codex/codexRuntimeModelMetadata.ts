import type { Metadata } from '@/api/types';

export type CodexEffectiveRouteEvidence = {
    model?: unknown;
    reasoningEffort?: unknown;
} | null | undefined;

export type CodexEffectiveRouteProjection = {
    effectiveModel: string;
    effectiveReasoningEffort: string;
};

export const CODEX_REASONING_EFFORTS = [
    'none',
    'minimal',
    'low',
    'medium',
    'high',
    'xhigh',
    'max',
    'ultra',
] as const;

export function isConcreteCodexModel(value: unknown): value is string {
    if (typeof value !== 'string' || value.length > 128 || value !== value.trim()) {
        return false;
    }
    const normalized = value.toLowerCase();
    if (normalized === 'default' || normalized === 'null' || normalized === 'undefined') {
        return false;
    }
    // Codex model identifiers are opaque, but App Server emits identifier-like
    // values: a known short o-series name or a namespaced/versioned token. This
    // excludes prose, sentinels, whitespace, and control characters while
    // remaining open to future provider/model and version suffixes.
    return /^(?:o\d[A-Za-z0-9._-]*|[A-Za-z][A-Za-z0-9._]*[-/:][A-Za-z0-9][A-Za-z0-9._:/-]*)$/.test(value);
}

export function isCodexReasoningEffort(value: unknown): value is string {
    return typeof value === 'string'
        && (CODEX_REASONING_EFFORTS as readonly string[]).includes(value);
}

/**
 * Store the model currently requested by the Codex runtime in session metadata.
 * `default` represents an explicit reset where Codex chooses its backend default.
 */
export function withCodexRuntimeModelMetadata(
    metadata: Metadata,
    model: string | null | undefined,
): Metadata {
    const modelMode = model ?? 'default';
    if (metadata.modelMode === modelMode) {
        return metadata;
    }
    return {
        ...metadata,
        modelMode,
    };
}

/** Mark a fresh launch as pending without presenting requested state as authority. */
export function withCodexPendingLaunchRouteMetadata(
    metadata: Metadata,
    model: string | null | undefined,
): Metadata {
    const requestedMetadata = withCodexRuntimeModelMetadata(metadata, model);
    const {
        effectiveModel: _effectiveModel,
        effectiveReasoningEffort: _effectiveReasoningEffort,
        ...unconfirmedMetadata
    } = requestedMetadata;
    return {
        ...unconfirmedMetadata,
        codexLaunchRoutePending: true,
    };
}

/** Clear confirmed authority whenever a requested model or effort changes. */
export function withCodexUnconfirmedRouteRequestMetadata(
    metadata: Metadata,
    change: {
        modelUpdated: boolean;
        model?: string | null;
        effortUpdated: boolean;
    },
): Metadata {
    if (!change.modelUpdated && !change.effortUpdated) {
        return metadata;
    }
    const requestedMetadata = change.modelUpdated
        ? withCodexRuntimeModelMetadata(metadata, change.model)
        : metadata;
    return withCodexEffectiveRouteMetadata(requestedMetadata, null);
}

/** Publish one complete model/effort pair confirmed by Codex App Server. */
export function withCodexEffectiveRouteMetadata(
    metadata: Metadata,
    evidence: CodexEffectiveRouteEvidence,
): Metadata {
    if (!isConcreteCodexModel(evidence?.model)
        || !isCodexReasoningEffort(evidence?.reasoningEffort)) {
        if (metadata.effectiveModel === undefined
            && metadata.effectiveReasoningEffort === undefined) {
            return metadata;
        }
        const {
            effectiveModel: _effectiveModel,
            effectiveReasoningEffort: _effectiveReasoningEffort,
            ...remainingMetadata
        } = metadata;
        return remainingMetadata;
    }
    if (metadata.effectiveModel === evidence.model
        && metadata.effectiveReasoningEffort === evidence.reasoningEffort
        && metadata.codexLaunchRoutePending === undefined) {
        return metadata;
    }
    const { codexLaunchRoutePending: _codexLaunchRoutePending, ...confirmedMetadata } = metadata;
    return {
        ...confirmedMetadata,
        effectiveModel: evidence.model,
        effectiveReasoningEffort: evidence.reasoningEffort,
    };
}

export function projectCodexEffectiveRoute(
    metadata: Metadata,
    evidence: CodexEffectiveRouteEvidence,
): CodexEffectiveRouteProjection | null {
    const projected = withCodexEffectiveRouteMetadata(metadata, evidence);
    if (!isConcreteCodexModel(projected.effectiveModel)
        || !isCodexReasoningEffort(projected.effectiveReasoningEffort)) {
        return null;
    }
    return {
        effectiveModel: projected.effectiveModel,
        effectiveReasoningEffort: projected.effectiveReasoningEffort,
    };
}
