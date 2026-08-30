import React from 'react';
import { BaseModal } from './BaseModal';
import { CustomModalConfig } from '../types';
import { CommandPaletteModal } from '@/components/CommandPalette/CommandPaletteModal';
import { CommandPalette } from '@/components/CommandPalette';

interface CustomModalProps {
    config: CustomModalConfig;
    onClose: () => void;
}

export function CustomModal({ config, onClose }: CustomModalProps) {
    const Component = config.component;
    
    // Use special modal wrapper for CommandPalette with animation support
    if (Component === CommandPalette) {
        return <CommandPaletteWithAnimation config={config} onClose={onClose} />;
    }
    
    return (
        <BaseModal visible={true} onClose={onClose}>
            <Component {...config.props} onClose={onClose} />
        </BaseModal>
    );
}

// Helper component to manage CommandPalette animation state
function CommandPaletteWithAnimation({ config, onClose }: CustomModalProps) {
    const [isClosing, setIsClosing] = React.useState(false);
    const restoreFocusTarget = config.props?.restoreFocusTarget as ({ focus?: () => void } | null | undefined);
    
    const handleClose = React.useCallback(() => {
        setIsClosing(true);
    }, []);

    const handleClosed = React.useCallback(() => {
        onClose();
        if (restoreFocusTarget?.focus && typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => restoreFocusTarget.focus?.());
        }
    }, [onClose, restoreFocusTarget]);
    
    return (
        <CommandPaletteModal
            visible={!isClosing}
            onClose={handleClosed}
            studioIsDark={config.props?.studioIsDark}
            studioPresentation={config.props?.studioPresentation}
        >
            <CommandPalette {...config.props} onClose={handleClose} />
        </CommandPaletteModal>
    );
}
