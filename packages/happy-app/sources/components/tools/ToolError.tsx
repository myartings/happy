import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { parseToolUseError } from '@/utils/toolErrorParser';
import { useStudioToolPresentation } from '@/features/studio-tool-presentation/useStudioToolPresentation';

export function ToolError(props: { message: string }) {
    const { theme } = useUnistyles();
    const studioPresentation = useStudioToolPresentation();
    const { isToolUseError, errorMessage } = parseToolUseError(props.message);
    const displayMessage = isToolUseError && errorMessage ? errorMessage : props.message;
    
    return (
        <View style={[
            styles.errorContainer,
            isToolUseError && styles.toolUseErrorContainer,
            studioPresentation && {
                backgroundColor: studioPresentation.error.backgroundColor,
                borderColor: studioPresentation.error.borderColor,
                borderRadius: studioPresentation.error.borderRadius,
                marginBottom: studioPresentation.error.marginBottom,
                padding: studioPresentation.error.padding,
            },
        ]}>
            {isToolUseError && (
                <Ionicons name="warning" size={16} color={studioPresentation?.error.textColor ?? theme.colors.box.warning.text} />
            )}
            <Text style={[
                styles.errorText,
                isToolUseError && styles.toolUseErrorText,
                studioPresentation && { color: studioPresentation.error.textColor },
            ]}>
                {displayMessage}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create((theme) => ({
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: theme.colors.box.error.background,
        borderRadius: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.colors.box.error.border,
        marginBottom: 12,
        maxHeight: 115,
        overflow: 'hidden',
    },
    toolUseErrorContainer: {
        backgroundColor: theme.colors.box.error.background,
        borderColor: theme.colors.box.error.border,
    },
    errorText: {
        fontSize: 13,
        color: theme.colors.box.error.text,
        flex: 1,
    },
    toolUseErrorText: {
        color: theme.colors.box.error.text,
    },
}));
