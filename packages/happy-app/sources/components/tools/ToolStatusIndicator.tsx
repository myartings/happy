import * as React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToolCall } from '@/sync/typesMessage';
import { useStudioToolPresentation } from '@/features/studio-tool-presentation/useStudioToolPresentation';
interface ToolStatusIndicatorProps {
    tool: ToolCall;
}

export function ToolStatusIndicator({ tool }: ToolStatusIndicatorProps) {
    const studioPresentation = useStudioToolPresentation();

    return (
        <View style={styles.container}>
            <StatusIndicator
                state={tool.state}
                successColor={studioPresentation?.diff.addedColor}
                errorColor={studioPresentation?.error.textColor}
                runningColor={studioPresentation?.diff.metadataColor}
            />
        </View>
    );
}

function StatusIndicator({
    errorColor,
    runningColor,
    state,
    successColor,
}: {
    errorColor?: string;
    runningColor?: string;
    state: ToolCall['state'];
    successColor?: string;
}) {
    switch (state) {
        case 'running':
            return <ActivityIndicator size="small" color={runningColor ?? '#007AFF'} />;
        case 'completed':
            return <Ionicons name="checkmark-circle" size={22} color={successColor ?? '#34C759'} />;
        case 'error':
            return <Ionicons name="close-circle" size={22} color={errorColor ?? '#FF3B30'} />;
        default:
            return null;
    }
}

const styles = StyleSheet.create({
    container: {
        width: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
