import type { ToolCall } from '@/sync/typesMessage';
import { resolveStudioExecutionTranscript } from '@/features/studio-execution-transcript/studioExecutionTranscript';

export type StudioToolOutputPresentation = 'collapsed' | 'preview' | 'expanded';
export type StudioToolOutputManualOverride = 'collapsed' | 'expanded' | null;
export const STUDIO_RUNNING_PREVIEW_VISUAL_LINE_BUDGET = 5;
export const STUDIO_FAILURE_PREVIEW_HEAD_VISUAL_LINE_BUDGET = 2;
export const STUDIO_FAILURE_PREVIEW_TAIL_VISUAL_LINE_BUDGET = 8;

export type StudioToolOutputDisclosureOptions = Readonly<{
    /** Caller-owned mounted-view state. Do not persist it to synchronized history. */
    manualOverride?: StudioToolOutputManualOverride;
    /** Rendered lines measured from the returned preview source at the current width. */
    previewVisualLines?: readonly string[];
}>;
export type StudioToolOutputPreview = Readonly<{
    kind: 'running-tail' | 'failure-head-tail';
    sourceText: string;
    head: readonly string[];
    tail: readonly string[];
    omittedVisualLineCount: number;
}>;

export type StudioToolOutputDisclosure = Readonly<{
    presentation: StudioToolOutputPresentation;
    automaticPresentation: Exclude<StudioToolOutputPresentation, 'expanded'>;
    manualOverride: StudioToolOutputManualOverride;
    summary: Readonly<{
        command: string;
        status: 'running' | 'completed' | 'failed' | 'cancelled' | 'interrupted' | 'pending-permission';
        durationMs: number | null;
        exitCode: number | null;
        outputLineCount: number;
        truncated: boolean;
    }>;
    preview: StudioToolOutputPreview | null;
    completeCopyText: Readonly<{
        command: string;
        output: string;
    }>;
}>;

export function toggleStudioToolOutputDisclosure(
    currentPresentation: StudioToolOutputPresentation,
): Exclude<StudioToolOutputManualOverride, null> {
    return currentPresentation === 'expanded' ? 'collapsed' : 'expanded';
}

function resolveStatus(
    tool: ToolCall,
    result: Record<string, unknown> | null,
): StudioToolOutputDisclosure['summary']['status'] {
    if (tool.permission?.status === 'pending') return 'pending-permission';
    if (tool.permission?.status === 'canceled' || tool.permission?.status === 'denied') return 'cancelled';
    if (tool.state === 'running') return 'running';
    const providerStatus = typeof result?.status === 'string' ? result.status.toLowerCase() : '';
    if (providerStatus === 'interrupted') return 'interrupted';
    if (providerStatus === 'cancelled' || providerStatus === 'canceled' || providerStatus === 'aborted') {
        return 'cancelled';
    }
    if (tool.state === 'error') return 'failed';
    return 'completed';
}

export function resolveStudioToolOutputDisclosure(
    tool: ToolCall,
    options: StudioToolOutputDisclosureOptions = {},
): StudioToolOutputDisclosure | null {
    const transcript = resolveStudioExecutionTranscript(tool, { allowEmptyCommand: true });
    if (!transcript) return null;
    const output = [transcript.stdout?.text, transcript.stderr?.text, transcript.error?.text]
        .filter((value): value is string => typeof value === 'string')
        .join('\n');
    const result = tool.result && typeof tool.result === 'object' && !Array.isArray(tool.result)
        ? tool.result
        : null;
    const exitCode = typeof result?.exitCode === 'number' && Number.isFinite(result.exitCode)
        ? result.exitCode
        : null;
    const outputLineCount = output.length === 0
        ? 0
        : output.split('\n').length - (output.endsWith('\n') ? 1 : 0);
    const status = resolveStatus(tool, result);
    const isFailurePreviewStatus = status === 'failed' || status === 'cancelled' || status === 'interrupted';
    const previewSourceText = isFailurePreviewStatus
        ? transcript.error?.text ?? transcript.stderr?.text ?? transcript.stdout?.text ?? ''
        : output;
    const automaticPresentation = (status === 'running' || isFailurePreviewStatus) && previewSourceText.length > 0
        ? 'preview'
        : 'collapsed';
    const visualLines = options.previewVisualLines ?? [];
    const preview: StudioToolOutputPreview | null = automaticPresentation !== 'preview'
        ? null
        : status === 'running'
            ? {
                kind: 'running-tail',
                sourceText: previewSourceText,
                head: [],
                tail: visualLines.slice(-STUDIO_RUNNING_PREVIEW_VISUAL_LINE_BUDGET),
                omittedVisualLineCount: Math.max(
                    0,
                    visualLines.length - STUDIO_RUNNING_PREVIEW_VISUAL_LINE_BUDGET,
                ),
            }
            : {
                kind: 'failure-head-tail',
                sourceText: previewSourceText,
                head: visualLines.slice(0, STUDIO_FAILURE_PREVIEW_HEAD_VISUAL_LINE_BUDGET),
                tail: visualLines.slice(Math.max(
                    STUDIO_FAILURE_PREVIEW_HEAD_VISUAL_LINE_BUDGET,
                    visualLines.length - STUDIO_FAILURE_PREVIEW_TAIL_VISUAL_LINE_BUDGET,
                )),
                omittedVisualLineCount: Math.max(
                    0,
                    visualLines.length
                        - STUDIO_FAILURE_PREVIEW_HEAD_VISUAL_LINE_BUDGET
                        - STUDIO_FAILURE_PREVIEW_TAIL_VISUAL_LINE_BUDGET,
                ),
            };
    const manualOverride = options.manualOverride ?? null;

    return {
        presentation: manualOverride ?? automaticPresentation,
        automaticPresentation,
        manualOverride,
        summary: {
            command: transcript.command,
            status,
            durationMs: transcript.durationMs,
            exitCode,
            outputLineCount,
            truncated: result?.truncated === true,
        },
        preview,
        completeCopyText: {
            command: transcript.command,
            output,
        },
    };
}
