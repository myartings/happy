import React from 'react';
import { useLocalSetting } from '@/sync/storage';
import { isTauri } from '@/utils/isTauri';
import { useUnistyles } from 'react-native-unistyles';

import {
    resolveStudioOverlayDarkMode,
    resolveStudioOverlayPresentation,
} from './studioOverlayPresentation';

type StudioOverlayPresentation = ReturnType<typeof resolveStudioOverlayPresentation>;
const StudioOverlayPresentationContext = React.createContext<StudioOverlayPresentation | null>(null);

export function StudioOverlayPresentationProvider({
    children,
    isDark,
}: {
    children: React.ReactNode;
    isDark: boolean;
}) {
    const requestedStyle = useLocalSetting('visualStyle');
    const value = resolveStudioOverlayPresentation({
        isDark,
        isTauriRuntime: isTauri(),
        previewStyle: process.env.EXPO_PUBLIC_HAPPY_VISUAL_STYLE,
        requestedStyle,
    });

    return React.createElement(
        StudioOverlayPresentationContext.Provider,
        { value },
        children,
    );
}

export function StudioOverlayPresentationSnapshotProvider({
    children,
    presentation,
}: {
    children: React.ReactNode;
    presentation: StudioOverlayPresentation;
}) {
    return React.createElement(
        StudioOverlayPresentationContext.Provider,
        { value: presentation },
        children,
    );
}

export function useStudioOverlayPresentation(isDarkOverride?: boolean) {
    const inheritedPresentation = React.useContext(StudioOverlayPresentationContext);
    const requestedStyle = useLocalSetting('visualStyle');
    const themePreference = useLocalSetting('themePreference');
    const { theme } = useUnistyles();

    const resolvedPresentation = resolveStudioOverlayPresentation({
        isDark: isDarkOverride ?? resolveStudioOverlayDarkMode({
            runtimeThemeName: theme.dark ? 'dark' : 'light',
            themePreference,
        }),
        isTauriRuntime: isTauri(),
        previewStyle: process.env.EXPO_PUBLIC_HAPPY_VISUAL_STYLE,
        requestedStyle,
    });

    return inheritedPresentation ?? resolvedPresentation;
}
