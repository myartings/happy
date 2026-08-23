import * as React from 'react';
import { Platform, Text, View } from 'react-native';

import type { ToolCall } from '@/sync/typesMessage';
import type { ParsedSemanticText } from '@/features/studio-semantic-text/semanticText';
import type { StudioToolPresentation } from '@/features/studio-tool-presentation/studioToolPresentation';
import {
    resolveStudioAnsiRunStyle,
    resolveStudioExecutionTranscript,
} from '@/features/studio-execution-transcript/studioExecutionTranscript';

export function StudioToolFullTranscriptView(props: { presentation: StudioToolPresentation; tool: ToolCall }) {
    const transcript = resolveStudioExecutionTranscript(props.tool, { allowEmptyCommand: true });
    if (!transcript) return null;
    const tokens = props.presentation.transcript;
    const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
    const baseText = { fontFamily: mono, fontSize: tokens.fontSize, lineHeight: tokens.lineHeight };

    return (
        <View testID="studio-tool-full-transcript" style={{ gap: 10, paddingHorizontal: 4, paddingVertical: 20 }}>
            {transcript.command ? (
                <Text selectable style={[baseText, { color: tokens.promptColor, fontWeight: '600' }]}>
                    $ <Text selectable style={[baseText, { color: tokens.commandColor, fontWeight: '400' }]}>{transcript.command}</Text>
                </Text>
            ) : null}
            {transcript.cwd ? (
                <Text selectable style={[baseText, { color: tokens.metadataColor, fontSize: 12, lineHeight: 17 }]}>{transcript.cwd}</Text>
            ) : null}
            {transcript.stdout ? <FullTranscriptRuns parsed={transcript.stdout} color={tokens.stdoutColor} dark={tokens.dark} /> : null}
            {transcript.stderr ? <FullTranscriptRuns parsed={transcript.stderr} color={tokens.stderrColor} dark={tokens.dark} /> : null}
            {transcript.error ? <FullTranscriptRuns parsed={transcript.error} color={tokens.errorColor} dark={tokens.dark} /> : null}
        </View>
    );
}

function FullTranscriptRuns(props: { parsed: ParsedSemanticText; color: string; dark: boolean }) {
    return (
        <Text selectable style={{
            color: props.color,
            fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
            fontSize: 13,
            lineHeight: 19,
        }}>
            {props.parsed.runs.map((run, index) => (
                <Text key={index} style={resolveStudioAnsiRunStyle(run.style, props.dark)}>{run.text}</Text>
            ))}
        </Text>
    );
}
