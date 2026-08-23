import * as React from 'react';
import * as Clipboard from 'expo-clipboard';
import { Pressable, Text, View } from 'react-native';

import type { ToolCall } from '@/sync/typesMessage';
import type { StudioToolPresentation } from '@/features/studio-tool-presentation/studioToolPresentation';
import { t } from '@/text';

import { resolveStudioToolOutputDisclosure } from './studioToolOutputDisclosure';

export function StudioToolOutputActions(props: {
    tool: ToolCall;
    presentation: StudioToolPresentation;
    onOpenFullTranscript?: () => void;
}) {
    const disclosure = resolveStudioToolOutputDisclosure(props.tool);
    if (!disclosure) return null;

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 12, paddingTop: 6 }}>
            {disclosure.completeCopyText.command.length > 0 ? (
                <Pressable
                    testID="studio-tool-copy-command"
                    accessibilityRole="button"
                    accessibilityLabel={t('tools.outputDisclosure.copyCommand')}
                    onPress={() => Clipboard.setStringAsync(disclosure.completeCopyText.command)}
                >
                    <Text style={{ color: props.presentation.transcript.metadataColor, fontSize: 12 }}>
                        {t('tools.outputDisclosure.copyCommand')}
                    </Text>
                </Pressable>
            ) : null}
            {disclosure.completeCopyText.output.length > 0 ? (
                <Pressable
                    testID="studio-tool-copy-output"
                    accessibilityRole="button"
                    accessibilityLabel={t('tools.outputDisclosure.copyOutput')}
                    onPress={() => Clipboard.setStringAsync(disclosure.completeCopyText.output)}
                >
                    <Text style={{ color: props.presentation.transcript.metadataColor, fontSize: 12 }}>
                        {t('tools.outputDisclosure.copyOutput')}
                    </Text>
                </Pressable>
            ) : null}
            {props.onOpenFullTranscript ? (
                <Pressable
                    testID="studio-tool-open-full-transcript"
                    accessibilityRole="button"
                    accessibilityLabel={t('tools.outputDisclosure.openFullTranscript')}
                    onPress={props.onOpenFullTranscript}
                >
                    <Text style={{ color: props.presentation.transcript.metadataColor, fontSize: 12 }}>
                        {t('tools.outputDisclosure.openFullTranscript')}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}
