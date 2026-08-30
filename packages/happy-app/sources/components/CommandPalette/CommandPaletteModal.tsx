import React, { useEffect, useRef } from 'react';
import {
    View,
    Modal,
    TouchableWithoutFeedback,
    Animated,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { LocalBlurHalo } from '@/components/AnimatedOverlay';
import {
    StudioOverlayPresentationProvider,
    StudioOverlayPresentationSnapshotProvider,
    useStudioOverlayPresentation,
} from '@/features/studio-overlays/useStudioOverlayPresentation';
import type { StudioOverlayPresentation } from '@/features/studio-overlays/studioOverlayPresentation';
import { useReducedMotion } from '@/features/codex-first-shell/useReducedMotion';
import { resolveCodexFirstMotionDuration } from '@/features/codex-first-shell/codexFirstDesktopHardening';

interface CommandPaletteModalProps {
    visible: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    studioIsDark?: boolean;
    studioPresentation?: StudioOverlayPresentation;
}

export function CommandPaletteModal({
    visible,
    onClose,
    children,
    studioIsDark,
    studioPresentation,
}: CommandPaletteModalProps) {
    const resolvedPresentation = useStudioOverlayPresentation(studioIsDark);
    const overlayPresentation = studioPresentation ?? resolvedPresentation;
    const { width: viewportWidth } = useWindowDimensions();
    const reduceMotion = useReducedMotion();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const [isModalVisible, setIsModalVisible] = React.useState(true);
    const closingRef = useRef(false);
    const openingDuration = resolveCodexFirstMotionDuration({
        codexFirstEnabled: overlayPresentation.isStudio,
        duration: 200,
        reduceMotion: !!reduceMotion,
    });
    const closingDuration = resolveCodexFirstMotionDuration({
        codexFirstEnabled: overlayPresentation.isStudio,
        duration: 150,
        reduceMotion: !!reduceMotion,
    });

    const finishClose = React.useCallback(() => {
        setIsModalVisible(false);
        onClose?.();
    }, [onClose]);

    const runCloseAnimation = React.useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;

        if (closingDuration === 0) {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.95);
            finishClose();
            return;
        }

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: closingDuration,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: closingDuration,
                useNativeDriver: true,
            }),
        ]).start(finishClose);
    }, [closingDuration, fadeAnim, finishClose, scaleAnim]);

    useEffect(() => {
        if (visible) {
            closingRef.current = false;
            setIsModalVisible(true);
            if (openingDuration === 0) {
                fadeAnim.setValue(1);
                scaleAnim.setValue(1);
                return;
            }
            // Opening animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: openingDuration,
                    useNativeDriver: true
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 10,
                    tension: 60,
                    useNativeDriver: true
                })
            ]).start();
            return;
        }
        runCloseAnimation();
    }, [fadeAnim, openingDuration, runCloseAnimation, scaleAnim, visible]);

    const handleClose = React.useCallback(() => {
        runCloseAnimation();
    }, [runCloseAnimation]);

    const handleBackdropPress = () => {
        handleClose();
    };

    if (!isModalVisible) {
        return null;
    }

    const modalContent = (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View
                    style={[
                        Platform.OS === 'web' ? styles.backdrop : styles.nativeBackdrop,
                        overlayPresentation.isStudio && {
                            backgroundColor: overlayPresentation.modal.scrimColor,
                        },
                        {
                            opacity: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [
                                    0,
                                    overlayPresentation.isStudio
                                        ? overlayPresentation.commandPalette.backdropPeakOpacity
                                        : 0.7,
                                ]
                            })
                        }
                    ]}
                >
                    {Platform.OS !== 'web' && <View pointerEvents="none" style={styles.backdropScrim} />}
                </Animated.View>
            </TouchableWithoutFeedback>

            <Animated.View
                accessibilityViewIsModal
                role="dialog"
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    },
                    overlayPresentation.isStudio && {
                        maxWidth: overlayPresentation.commandPalette.contentMaxWidth,
                        width: Math.min(
                            viewportWidth * 0.9,
                            overlayPresentation.commandPalette.contentMaxWidth,
                        ),
                    },
                ]}
            >
                {Platform.OS !== 'web' && <LocalBlurHalo borderRadius={24} expansion={18} blurIntensity={38} />}
                {children}
            </Animated.View>
        </KeyboardAvoidingView>
    );

    return (
        <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            {studioPresentation ? (
                <StudioOverlayPresentationSnapshotProvider presentation={studioPresentation}>
                    {modalContent}
                </StudioOverlayPresentationSnapshotProvider>
            ) : typeof studioIsDark === 'boolean' ? (
                <StudioOverlayPresentationProvider isDark={studioIsDark}>
                    {modalContent}
                </StudioOverlayPresentationProvider>
            ) : modalContent}
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        // Position at 30% from top of viewport
        ...(Platform.OS === 'web' ? {
            paddingTop: '30vh',
        } as any : {
            paddingTop: 200, // Fallback for native
        })
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 15, 15, 0.75)',
    },
    nativeBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    backdropScrim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.14)',
    },
    content: {
        zIndex: 1,
        width: '90%',
        maxWidth: 800, // Increased from 640
    }
});
