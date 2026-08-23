import * as React from 'react';
import { Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import type { ToolCall } from '@/sync/typesMessage';
import type { StudioToolPresentation } from '@/features/studio-tool-presentation/studioToolPresentation';
import type { ParsedSemanticText } from '@/features/studio-semantic-text/semanticText';
import {
    STUDIO_FAILURE_PREVIEW_HEAD_VISUAL_LINE_BUDGET,
    STUDIO_FAILURE_PREVIEW_TAIL_VISUAL_LINE_BUDGET,
    STUDIO_RUNNING_PREVIEW_VISUAL_LINE_BUDGET,
    resolveStudioToolOutputDisclosure,
    toggleStudioToolOutputDisclosure,
    type StudioToolOutputManualOverride,
    type StudioToolOutputPreview,
} from '@/features/studio-tool-output-disclosure/studioToolOutputDisclosure';
import { t } from '@/text';

import {
    resolveStudioAnsiRunStyle,
    resolveStudioExecutionTranscript,
} from './studioExecutionTranscript';

export function StudioExecutionTranscriptView(props: {
    tool: ToolCall;
    presentation: StudioToolPresentation;
}) {
    const [manualOverride, setManualOverride] = React.useState<StudioToolOutputManualOverride>(null);
    const expandedScrollRef = React.useRef<ScrollView>(null);
    const expandedAtEndRef = React.useRef(true);
    const viewportHeight = useWindowDimensions().height;
    const transcript = resolveStudioExecutionTranscript(props.tool);
    const initialDisclosure = resolveStudioToolOutputDisclosure(props.tool);
    if (!transcript || !initialDisclosure) return null;
    const previewVisualLines = initialDisclosure.preview?.sourceText.split('\n') ?? [];
    const disclosure = resolveStudioToolOutputDisclosure(props.tool, { manualOverride, previewVisualLines });
    if (!disclosure) return null;
    const tokens = props.presentation.transcript;
    const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
    const baseText = { fontFamily: mono, fontSize: tokens.fontSize, lineHeight: tokens.lineHeight };
    const statusColor = transcript.state === 'completed'
        ? tokens.successColor
        : transcript.state === 'error'
            ? tokens.errorColor
            : tokens.runningColor;
    const statusLabel = disclosure.summary.status === 'completed'
        ? t('tools.fullView.completed')
        : disclosure.summary.status === 'running'
            ? t('tools.fullView.running')
            : disclosure.summary.status === 'failed'
                ? t('tools.fullView.error')
                : disclosure.summary.status === 'cancelled'
                    ? t('tools.outputDisclosure.cancelled')
                    : disclosure.summary.status === 'interrupted'
                        ? t('tools.outputDisclosure.interrupted')
                        : t('tools.outputDisclosure.pendingPermission');
    const summaryParts = [
        disclosure.summary.command.replace(/\s+/g, ' ').trim() || t('tools.names.terminal'),
        statusLabel,
        ...(disclosure.summary.durationMs !== null
            ? [`${(disclosure.summary.durationMs / 1000).toFixed(1)}s`]
            : []),
        ...(disclosure.summary.exitCode !== null && disclosure.summary.exitCode !== 0
            ? [t('tools.outputDisclosure.exitCode', { code: disclosure.summary.exitCode })]
            : []),
        ...(disclosure.summary.outputLineCount > 0
            ? [t('tools.outputDisclosure.lines', { count: disclosure.summary.outputLineCount })]
            : []),
        ...(disclosure.summary.truncated ? [t('tools.outputDisclosure.truncated')] : []),
    ];
    const handleToggle = () => {
        setManualOverride(toggleStudioToolOutputDisclosure(disclosure.presentation));
    };
    const expandedMaxHeight = Math.min(viewportHeight * 0.4, 480);
    const handleExpandedScroll = (event: {
        nativeEvent: {
            contentOffset: { y: number };
            contentSize: { height: number };
            layoutMeasurement: { height: number };
        };
    }) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        expandedAtEndRef.current = contentSize.height - layoutMeasurement.height - contentOffset.y <= 24;
    };
    const handleExpandedContentSizeChange = () => {
        if (expandedAtEndRef.current) {
            expandedScrollRef.current?.scrollToEnd({ animated: false });
        }
    };

    return (
        <View style={{
            backgroundColor: tokens.backgroundColor,
            borderColor: tokens.borderColor,
            borderRadius: tokens.borderRadius,
            borderWidth: 1,
            paddingHorizontal: tokens.paddingHorizontal,
            paddingVertical: tokens.paddingVertical,
        }}>
            <Pressable
                testID="studio-tool-output-summary"
                accessibilityRole="button"
                accessibilityLabel={summaryParts.join(', ')}
                accessibilityState={{ expanded: disclosure.presentation === 'expanded' }}
                onPress={handleToggle}
                style={{
                    minHeight: props.presentation.disclosureRow.minHeight,
                    paddingHorizontal: props.presentation.disclosureRow.paddingHorizontal,
                    paddingVertical: props.presentation.disclosureRow.paddingVertical,
                    justifyContent: 'center',
                }}
            >
                <Text
                    numberOfLines={1}
                    style={[baseText, {
                        color: statusColor,
                        fontSize: props.presentation.disclosureRow.fontSize,
                        lineHeight: props.presentation.disclosureRow.lineHeight,
                    }]}
                >
                    {summaryParts.join(' · ')}
                </Text>
            </Pressable>
            {disclosure.presentation === 'preview' && disclosure.preview && (
                <TranscriptPreview preview={disclosure.preview} color={statusColor} lineHeight={tokens.lineHeight} />
            )}
            {disclosure.presentation === 'expanded' && (
                <ScrollView
                    ref={expandedScrollRef}
                    testID="studio-tool-output-expanded"
                    style={{ maxHeight: expandedMaxHeight }}
                    nestedScrollEnabled
                    onContentSizeChange={handleExpandedContentSizeChange}
                    onScroll={handleExpandedScroll}
                    scrollEventThrottle={16}
                >
                    {transcript.command ? (
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <Text selectable style={[baseText, { color: tokens.promptColor, fontWeight: '600' }]}>$ </Text>
                            <Text selectable style={[baseText, { color: tokens.commandColor, flexShrink: 1 }]}>{transcript.command}</Text>
                        </View>
                    ) : null}
                    {transcript.cwd ? (
                        <Text selectable style={[baseText, { color: tokens.metadataColor, fontSize: 12, lineHeight: 17, marginTop: 3 }]}>
                            {transcript.cwd}
                        </Text>
                    ) : null}
                    {transcript.stdout ? (
                        <TranscriptRuns parsed={transcript.stdout} color={tokens.stdoutColor} dark={tokens.dark} />
                    ) : null}
                    {transcript.stderr ? (
                        <TranscriptRuns parsed={transcript.stderr} color={tokens.stderrColor} dark={tokens.dark} />
                    ) : null}
                    {transcript.error ? (
                        <TranscriptRuns parsed={transcript.error} color={tokens.errorColor} dark={tokens.dark} />
                    ) : null}
                </ScrollView>
            )}
        </View>
    );
}

function TranscriptPreview(props: {
    preview: StudioToolOutputPreview;
    color: string;
    lineHeight: number;
}) {
    const running = props.preview.kind === 'running-tail';
    if (!running) {
        return <FailureTranscriptPreview {...props} />;
    }
    const clipHeight = STUDIO_RUNNING_PREVIEW_VISUAL_LINE_BUDGET * props.lineHeight;

    return (
        <View
            testID="studio-tool-output-preview"
            accessibilityLiveRegion="none"
            style={{
                height: clipHeight,
                maxHeight: clipHeight,
                justifyContent: 'flex-end',
                overflow: 'hidden',
                marginTop: 7,
            }}
        >
            <PreviewText color={props.color} lineHeight={props.lineHeight} style={{ flexShrink: 0 }}>
                {props.preview.tail.join('\n')}
            </PreviewText>
        </View>
    );
}

function FailureTranscriptPreview(props: {
    preview: StudioToolOutputPreview;
    color: string;
    lineHeight: number;
}) {
    const [measuredVisualLineCount, setMeasuredVisualLineCount] = React.useState<number | null>(null);
    const headHeight = STUDIO_FAILURE_PREVIEW_HEAD_VISUAL_LINE_BUDGET * props.lineHeight;
    const tailHeight = STUDIO_FAILURE_PREVIEW_TAIL_VISUAL_LINE_BUDGET * props.lineHeight;
    const failureLineBudget = STUDIO_FAILURE_PREVIEW_HEAD_VISUAL_LINE_BUDGET
        + STUDIO_FAILURE_PREVIEW_TAIL_VISUAL_LINE_BUDGET;
    const hasOmission = props.preview.omittedVisualLineCount > 0
        || (measuredVisualLineCount !== null && measuredVisualLineCount > failureLineBudget);
    const measurement = (
        <PreviewText
            color={props.color}
            lineHeight={props.lineHeight}
            testID="studio-tool-output-preview-measure"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            selectable={false}
            onLayout={(event: { nativeEvent: { layout: { height: number } } }) => {
                const next = Math.ceil(event.nativeEvent.layout.height / props.lineHeight);
                setMeasuredVisualLineCount((current) => current === next ? current : next);
            }}
            style={{ position: 'absolute', left: 0, right: 0, opacity: 0, pointerEvents: 'none' }}
        >
            {props.preview.sourceText}
        </PreviewText>
    );

    if (!hasOmission) {
        return (
            <View
                testID="studio-tool-output-preview"
                accessibilityLiveRegion="none"
                style={{ maxHeight: failureLineBudget * props.lineHeight, overflow: 'hidden', marginTop: 7 }}
            >
                <PreviewText
                    color={props.color}
                    lineHeight={props.lineHeight}
                    numberOfLines={failureLineBudget}
                >
                    {props.preview.sourceText}
                </PreviewText>
                {measurement}
            </View>
        );
    }

    const headText = props.preview.omittedVisualLineCount > 0
        ? props.preview.head.join('\n')
        : props.preview.sourceText;
    const tailText = props.preview.omittedVisualLineCount > 0
        ? props.preview.tail.join('\n')
        : props.preview.sourceText;

    return (
        <View
            testID="studio-tool-output-preview"
            accessibilityLiveRegion="none"
            style={{ maxHeight: headHeight + props.lineHeight + tailHeight, overflow: 'hidden', marginTop: 7 }}
        >
            <View testID="studio-tool-output-preview-head" style={{ height: headHeight, overflow: 'hidden' }}>
                <PreviewText
                    color={props.color}
                    lineHeight={props.lineHeight}
                    numberOfLines={STUDIO_FAILURE_PREVIEW_HEAD_VISUAL_LINE_BUDGET}
                >
                    {headText}
                </PreviewText>
            </View>
            <PreviewText color={props.color} lineHeight={props.lineHeight}>
                {t('tools.outputDisclosure.omitted')}
            </PreviewText>
            <View
                testID="studio-tool-output-preview-tail"
                style={{ height: tailHeight, justifyContent: 'flex-end', overflow: 'hidden' }}
            >
                <PreviewText color={props.color} lineHeight={props.lineHeight} style={{ flexShrink: 0 }}>
                    {tailText}
                </PreviewText>
            </View>
            {measurement}
        </View>
    );
}

function PreviewText(props: {
    children: React.ReactNode;
    accessible?: boolean;
    accessibilityElementsHidden?: boolean;
    color: string;
    importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
    lineHeight: number;
    numberOfLines?: number;
    onLayout?: (event: { nativeEvent: { layout: { height: number } } }) => void;
    style?: Record<string, unknown>;
    testID?: string;
    selectable?: boolean;
}) {
    return (
        <Text
            selectable={props.selectable ?? true}
            accessible={props.accessible}
            accessibilityElementsHidden={props.accessibilityElementsHidden}
            importantForAccessibility={props.importantForAccessibility}
            numberOfLines={props.numberOfLines}
            onLayout={props.onLayout}
            testID={props.testID}
            style={{
                color: props.color,
                fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
                fontSize: 13,
                lineHeight: props.lineHeight,
                ...props.style,
            }}
        >
            {props.children}
        </Text>
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
