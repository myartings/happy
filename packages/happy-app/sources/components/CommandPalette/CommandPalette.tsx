import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CommandPaletteInput } from './CommandPaletteInput';
import { CommandPaletteResults } from './CommandPaletteResults';
import { useCommandPalette } from './useCommandPalette';
import { Command } from './types';
import {
    StudioOverlayPresentationProvider,
    StudioOverlayPresentationSnapshotProvider,
    useStudioOverlayPresentation,
} from '@/features/studio-overlays/useStudioOverlayPresentation';
import type { StudioOverlayPresentation } from '@/features/studio-overlays/studioOverlayPresentation';

interface CommandPaletteProps {
    commands: Command[];
    onClose: () => void;
    studioIsDark?: boolean;
    studioPresentation?: StudioOverlayPresentation;
}

export function CommandPalette({
    commands,
    onClose,
    studioIsDark,
    studioPresentation,
}: CommandPaletteProps) {
    const content = (
        <CommandPaletteContent
            commands={commands}
            onClose={onClose}
            presentation={studioPresentation}
        />
    );

    if (studioPresentation) {
        return (
            <StudioOverlayPresentationSnapshotProvider presentation={studioPresentation}>
                {content}
            </StudioOverlayPresentationSnapshotProvider>
        );
    }

    return typeof studioIsDark === 'boolean' ? (
        <StudioOverlayPresentationProvider isDark={studioIsDark}>
            {content}
        </StudioOverlayPresentationProvider>
    ) : content;
}

function CommandPaletteContent({
    commands,
    onClose,
    presentation,
}: Omit<CommandPaletteProps, 'studioIsDark' | 'studioPresentation'> & {
    presentation?: StudioOverlayPresentation;
}) {
    const resolvedPresentation = useStudioOverlayPresentation();
    const overlayPresentation = presentation ?? resolvedPresentation;
    const {
        searchQuery,
        selectedIndex,
        filteredCategories,
        inputRef,
        handleSearchChange,
        handleSelectCommand,
        handleKeyPress,
        setSelectedIndex,
    } = useCommandPalette(commands, onClose);

    // Only render on web
    if (Platform.OS !== 'web') {
        return null;
    }

    return (
        <View
            style={[
                styles.container,
                overlayPresentation.isStudio && {
                    backgroundColor: overlayPresentation.modal.surfaceColor,
                    borderColor: overlayPresentation.modal.borderColor,
                    borderRadius: overlayPresentation.modal.radius,
                    borderWidth: overlayPresentation.modal.borderWidth,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: overlayPresentation.modal.shadowOffsetY },
                    shadowOpacity: overlayPresentation.modal.shadowOpacity,
                    shadowRadius: overlayPresentation.modal.shadowRadius,
                    maxHeight: overlayPresentation.commandPalette.shellMaxHeightWeb,
                    maxWidth: overlayPresentation.commandPalette.contentMaxWidth,
                },
            ]}
        >
            <CommandPaletteInput
                value={searchQuery}
                onChangeText={handleSearchChange}
                onKeyPress={handleKeyPress}
                inputRef={inputRef}
                presentation={overlayPresentation}
            />
            <CommandPaletteResults
                categories={filteredCategories}
                selectedIndex={selectedIndex}
                onSelectCommand={handleSelectCommand}
                onSelectionChange={setSelectedIndex}
                presentation={overlayPresentation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxWidth: 800, // Increased from 640 for wider input
        // Use viewport-based height for better layout
        ...(Platform.OS === 'web' ? {
            maxHeight: '60vh', // Takes up to 60% of viewport height
        } as any : {
            maxHeight: 500, // Fallback for native
        }),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 20,
        },
        shadowOpacity: 0.25,
        shadowRadius: 40,
        elevation: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
    },
});
