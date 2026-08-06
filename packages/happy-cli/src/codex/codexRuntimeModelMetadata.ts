import type { Metadata } from '@/api/types';

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
