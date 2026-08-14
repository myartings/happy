import * as React from 'react';
import { Platform, Text, View } from 'react-native';

import type { ToolCall } from '@/sync/typesMessage';
import type { StudioToolPresentation } from '@/features/studio-tool-presentation/studioToolPresentation';
import type { ParsedSemanticText } from '@/features/studio-semantic-text/semanticText';
import { t } from '@/text';

import {
    resolveStudioAnsiRunStyle,
    resolveStudioExecutionTranscript,
} from './studioExecutionTranscript';

export function StudioExecutionTranscriptView(props: {
    tool: ToolCall;
    presentation: StudioToolPresentation;
}) {
    const transcript = resolveStudioExecutionTranscript(props.tool);
    if (!transcript) return null;
    const tokens = props.presentation.transcript;
    const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
    const baseText = { fontFamily: mono, fontSize: tokens.fontSize, lineHeight: tokens.lineHeight };
    const statusColor = transcript.state === 'completed'
        ? tokens.successColor
        : transcript.state === 'error'
            ? tokens.errorColor
            : tokens.runningColor;

    return (
        <View style={{
            backgroundColor: tokens.backgroundColor,
            borderColor: tokens.borderColor,
            borderRadius: tokens.borderRadius,
            borderWidth: 1,
            paddingHorizontal: tokens.paddingHorizontal,
            paddingVertical: tokens.paddingVertical,
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <Text selectable style={[baseText, { color: tokens.promptColor, fontWeight: '600' }]}>$ </Text>
                <Text selectable style={[baseText, { color: tokens.commandColor, flexShrink: 1 }]}>{transcript.command}</Text>
            </View>
            {transcript.cwd && (
                <Text selectable style={[baseText, { color: tokens.metadataColor, fontSize: 12, lineHeight: 17, marginTop: 3 }]}>
                    {transcript.cwd}
                </Text>
            )}
            <Text style={[baseText, { color: statusColor, fontSize: 12, lineHeight: 17, marginTop: 5 }]}>{
                transcript.state === 'completed'
                    ? t('tools.fullView.completed')
                    : transcript.state === 'error'
                        ? t('tools.fullView.error')
                        : t('tools.fullView.running')
            }{transcript.durationMs !== null ? ` · ${(transcript.durationMs / 1000).toFixed(1)}s` : ''}</Text>
            {transcript.stdout && (
                <TranscriptRuns parsed={transcript.stdout} color={tokens.stdoutColor} dark={tokens.dark} />
            )}
            {transcript.stderr && (
                <TranscriptRuns parsed={transcript.stderr} color={tokens.stderrColor} dark={tokens.dark} />
            )}
            {transcript.error && (
                <TranscriptRuns parsed={transcript.error} color={tokens.errorColor} dark={tokens.dark} />
            )}
        </View>
    );
}

function TranscriptRuns(props: {
    parsed: ParsedSemanticText;
    color: string;
    dark: boolean;
}) {
    return (
        <Text selectable style={{
            color: props.color,
            fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
            fontSize: 13,
            lineHeight: 19,
            marginTop: 7,
        }}>
            {props.parsed.runs.map((run, index) => (
                <Text key={index} style={resolveStudioAnsiRunStyle(run.style, props.dark)}>{run.text}</Text>
            ))}
        </Text>
    );
}
