import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Command } from './types';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useStudioOverlayPresentation } from '@/features/studio-overlays/useStudioOverlayPresentation';
import { useStudioInteractionState } from '@/features/studio-visual-style/useStudioInteractionState';
import type { StudioOverlayPresentation } from '@/features/studio-overlays/studioOverlayPresentation';

interface CommandPaletteItemProps {
    command: Command;
    isSelected: boolean;
    onPress: () => void;
    onHover?: () => void;
    presentation?: StudioOverlayPresentation;
}

export function CommandPaletteItem({ command, isSelected, onPress, onHover, presentation }: CommandPaletteItemProps) {
    const resolvedPresentation = useStudioOverlayPresentation();
    const overlayPresentation = presentation ?? resolvedPresentation;
    const interactionState = useStudioInteractionState(
        overlayPresentation.isStudio && Platform.OS === 'web',
    );
    
    const handleMouseEnter = React.useCallback(() => {
        if (Platform.OS === 'web') {
            onHover?.();
        }
    }, [onHover]);
    
    const pressableProps: any = {
        style: ({ pressed }: any) => [
            styles.container,
            isSelected && styles.selected,
            interactionState.hovered && !isSelected && styles.hovered,
            pressed && Platform.OS === 'web' && styles.pressed,
            overlayPresentation.isStudio && isSelected && {
                backgroundColor: overlayPresentation.selectedColor,
                borderColor: overlayPresentation.selectedBorderColor,
            },
            overlayPresentation.isStudio && interactionState.hovered && !isSelected && {
                backgroundColor: overlayPresentation.hoverColor,
            },
            overlayPresentation.isStudio && pressed && {
                backgroundColor: overlayPresentation.pressedColor,
            },
            overlayPresentation.isStudio && {
                borderWidth: overlayPresentation.commandPalette.itemBorderWidth,
                marginVertical: overlayPresentation.commandPalette.itemMarginVertical,
                paddingHorizontal: overlayPresentation.commandPalette.itemPaddingHorizontal,
                paddingVertical: overlayPresentation.commandPalette.itemPaddingVertical,
                ...(Platform.OS === 'web' && interactionState.focused ? {
                    outlineColor: overlayPresentation.focusRingColor,
                    outlineOffset: -2,
                    outlineStyle: 'solid',
                    outlineWidth: 2,
                } as any : {}),
            },
        ],
        accessibilityRole: 'button',
        accessibilityState: { selected: isSelected },
        onPress,
        ...interactionState.interactionProps,
    };
    
    // Add mouse events only on web
    if (Platform.OS === 'web') {
        pressableProps.onMouseEnter = handleMouseEnter;
    }
    
    return (
        <Pressable {...pressableProps}>
            <View style={styles.content}>
                {command.icon && (
                    <View
                        style={[
                            styles.iconContainer,
                            overlayPresentation.isStudio && {
                                backgroundColor: 'transparent',
                                height: overlayPresentation.commandPalette.itemIconContainerSize,
                                marginRight: overlayPresentation.commandPalette.itemIconMarginRight,
                                width: overlayPresentation.commandPalette.itemIconContainerSize,
                            },
                        ]}
                    >
                        <Ionicons 
                            name={command.icon as any} 
                            size={overlayPresentation.isStudio
                                ? overlayPresentation.commandPalette.itemIconSize
                                : 20}
                            color={overlayPresentation.isStudio
                                ? overlayPresentation.textSecondaryColor
                                : (isSelected ? '#007AFF' : '#666')}
                        />
                    </View>
                )}
                <View style={styles.textContainer}>
                    <Text
                        style={[
                            styles.title,
                            Typography.default(),
                            overlayPresentation.isStudio && {
                                color: overlayPresentation.textColor,
                                fontSize: overlayPresentation.commandPalette.itemTitleFontSize,
                            },
                        ]}
                    >
                        {command.title}
                    </Text>
                    {command.subtitle && (
                        <Text
                            style={[
                                styles.subtitle,
                                Typography.default(),
                                overlayPresentation.isStudio && {
                                    color: overlayPresentation.textSecondaryColor,
                                    fontSize: overlayPresentation.commandPalette.itemSubtitleFontSize,
                                },
                            ]}
                        >
                            {command.subtitle}
                        </Text>
                    )}
                </View>
                {command.shortcut && (
                    <View
                        style={[
                            styles.shortcutContainer,
                            overlayPresentation.isStudio && {
                                backgroundColor: 'transparent',
                                paddingHorizontal: overlayPresentation.commandPalette.shortcutPaddingHorizontal,
                                paddingVertical: overlayPresentation.commandPalette.shortcutPaddingVertical,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.shortcut,
                                Typography.mono(),
                                overlayPresentation.isStudio && {
                                    color: overlayPresentation.textSecondaryColor,
                                },
                            ]}
                        >
                            {command.shortcut}
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'transparent',
        marginHorizontal: 8,
        marginVertical: 2,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selected: {
        backgroundColor: '#F0F7FF',
        borderColor: '#007AFF20',
    },
    pressed: {
        backgroundColor: '#F5F5F5',
    },
    hovered: {
        backgroundColor: '#F8F8F8',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 15,
        color: '#000',
        marginBottom: 2,
        letterSpacing: -0.2,
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        letterSpacing: -0.1,
    },
    shortcutContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: 6,
    },
    shortcut: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
});
