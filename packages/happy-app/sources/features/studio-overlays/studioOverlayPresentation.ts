import {
    resolveDesktopVisualStyle,
    type VisualStyle,
} from '@/features/studio-visual-style/studioVisualStyle';

export type StudioOverlayLevelStyle = {
    borderColor: string;
    borderWidth: number;
    radius: number;
    shadowOffsetY: number;
    shadowOpacity: number;
    shadowRadius: number;
    surfaceColor: string;
};

export type StudioOverlayPresentation = {
    commandPalette: {
        backdropPeakOpacity: number;
        categoryFontSize: number;
        categoryPaddingBottom: number;
        categoryPaddingHorizontal: number;
        categoryPaddingTop: number;
        contentMaxWidth: number;
        emptyPadding: number;
        inputFontSize: number;
        inputPaddingHorizontal: number;
        inputPaddingVertical: number;
        itemBorderWidth: number;
        itemIconContainerSize: number;
        itemIconMarginRight: number;
        itemIconSize: number;
        itemMarginVertical: number;
        itemPaddingHorizontal: number;
        itemPaddingVertical: number;
        itemSubtitleFontSize: number;
        itemTitleFontSize: number;
        resultsMaxHeightWeb: string;
        resultsPaddingVertical: number;
        shellMaxHeightWeb: string;
        shortcutPaddingHorizontal: number;
        shortcutPaddingVertical: number;
    };
    dividerColor: string;
    floating: StudioOverlayLevelStyle & { clickAwayColor: 'transparent' };
    focusRingColor: string;
    hoverColor: string;
    inputSurfaceColor: string;
    isStudio: boolean;
    modal: StudioOverlayLevelStyle & { scrimColor: string };
    pressedColor: string;
    selectedBorderColor: string;
    selectedColor: string;
    textColor: string;
    textSecondaryColor: string;
};

export function resolveStudioOverlayDarkMode({
    runtimeThemeName,
    themePreference,
}: {
    runtimeThemeName: string | null | undefined;
    themePreference: 'adaptive' | 'dark' | 'light';
}): boolean {
    if (themePreference === 'dark') {
        return true;
    }
    if (themePreference === 'light') {
        return false;
    }
    return runtimeThemeName === 'dark';
}

export function resolveCommandPaletteDarkSnapshot({
    currentThemeIsDark,
    themePreference,
}: {
    currentThemeIsDark: boolean;
    themePreference: 'adaptive' | 'dark' | 'light';
}): boolean {
    return themePreference === 'dark'
        || (themePreference === 'adaptive' && currentThemeIsDark);
}

type ResolveStudioOverlayPresentationInput = {
    isDark: boolean;
    isTauriRuntime: boolean;
    previewStyle?: string;
    requestedStyle: VisualStyle;
};

const DEFAULT_PRESENTATION: StudioOverlayPresentation = {
    commandPalette: {
        backdropPeakOpacity: 0,
        categoryFontSize: 0,
        categoryPaddingBottom: 0,
        categoryPaddingHorizontal: 0,
        categoryPaddingTop: 0,
        contentMaxWidth: 0,
        emptyPadding: 0,
        inputFontSize: 0,
        inputPaddingHorizontal: 0,
        inputPaddingVertical: 0,
        itemBorderWidth: 0,
        itemIconContainerSize: 0,
        itemIconMarginRight: 0,
        itemIconSize: 0,
        itemMarginVertical: 0,
        itemPaddingHorizontal: 0,
        itemPaddingVertical: 0,
        itemSubtitleFontSize: 0,
        itemTitleFontSize: 0,
        resultsMaxHeightWeb: '',
        resultsPaddingVertical: 0,
        shellMaxHeightWeb: '',
        shortcutPaddingHorizontal: 0,
        shortcutPaddingVertical: 0,
    },
    dividerColor: 'transparent',
    floating: {
        borderColor: 'transparent',
        borderWidth: 0,
        clickAwayColor: 'transparent',
        radius: 0,
        shadowOffsetY: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
        surfaceColor: 'transparent',
    },
    focusRingColor: 'transparent',
    hoverColor: 'transparent',
    inputSurfaceColor: 'transparent',
    isStudio: false,
    modal: {
        borderColor: 'transparent',
        borderWidth: 0,
        radius: 0,
        scrimColor: 'transparent',
        shadowOffsetY: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
        surfaceColor: 'transparent',
    },
    pressedColor: 'transparent',
    selectedBorderColor: 'transparent',
    selectedColor: 'transparent',
    textColor: 'transparent',
    textSecondaryColor: 'transparent',
};

export function resolveStudioOverlayPresentation({
    isDark,
    isTauriRuntime,
    previewStyle,
    requestedStyle,
}: ResolveStudioOverlayPresentationInput): StudioOverlayPresentation {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        previewStyle,
        requestedStyle,
    });

    if (visualStyle !== 'studio') {
        return DEFAULT_PRESENTATION;
    }

    const palette = isDark
        ? {
            border: 'rgba(255, 255, 255, 0.14)',
            divider: 'rgba(255, 255, 255, 0.10)',
            floating: 'rgba(35, 36, 38, 0.96)',
            focusRing: 'rgba(132, 168, 255, 0.88)',
            hover: 'rgba(255, 255, 255, 0.07)',
            input: '#292A2D',
            modal: '#232426',
            pressed: 'rgba(255, 255, 255, 0.12)',
            selectedBorder: 'rgba(132, 168, 255, 0.52)',
            selected: 'rgba(255, 255, 255, 0.10)',
            text: '#F5F5F5',
            textSecondary: '#A4A7AC',
        }
        : {
            border: '#DDDDDE',
            divider: '#E4E4E5',
            floating: 'rgba(255, 255, 255, 0.96)',
            focusRing: 'rgba(70, 111, 226, 0.82)',
            hover: 'rgba(26, 28, 31, 0.05)',
            input: '#FAFAFA',
            modal: '#FFFFFF',
            pressed: 'rgba(26, 28, 31, 0.10)',
            selectedBorder: 'rgba(70, 111, 226, 0.34)',
            selected: '#F0F1F1',
            text: '#1A1C1F',
            textSecondary: '#6F7277',
        };

    return {
        commandPalette: {
            backdropPeakOpacity: 1,
            categoryFontSize: 11,
            categoryPaddingBottom: 6,
            categoryPaddingHorizontal: 20,
            categoryPaddingTop: 12,
            contentMaxWidth: 640,
            emptyPadding: 32,
            inputFontSize: 16,
            inputPaddingHorizontal: 20,
            inputPaddingVertical: 16,
            itemBorderWidth: 1,
            itemIconContainerSize: 28,
            itemIconMarginRight: 10,
            itemIconSize: 18,
            itemMarginVertical: 1,
            itemPaddingHorizontal: 16,
            itemPaddingVertical: 8,
            itemSubtitleFontSize: 12,
            itemTitleFontSize: 14,
            resultsMaxHeightWeb: '38vh',
            resultsPaddingVertical: 6,
            shellMaxHeightWeb: '52vh',
            shortcutPaddingHorizontal: 8,
            shortcutPaddingVertical: 3,
        },
        dividerColor: palette.divider,
        floating: {
            borderColor: palette.border,
            borderWidth: 1,
            clickAwayColor: 'transparent',
            radius: 17,
            shadowOffsetY: 8,
            shadowOpacity: 0.1,
            shadowRadius: 24,
            surfaceColor: palette.floating,
        },
        focusRingColor: palette.focusRing,
        hoverColor: palette.hover,
        inputSurfaceColor: palette.input,
        isStudio: true,
        modal: {
            borderColor: palette.border,
            borderWidth: 1,
            radius: 16,
            scrimColor: isDark ? 'rgba(0, 0, 0, 0.24)' : 'rgba(0, 0, 0, 0.10)',
            shadowOffsetY: 18,
            shadowOpacity: isDark ? 0.32 : 0.16,
            shadowRadius: 42,
            surfaceColor: palette.modal,
        },
        pressedColor: palette.pressed,
        selectedBorderColor: palette.selectedBorder,
        selectedColor: palette.selected,
        textColor: palette.text,
        textSecondaryColor: palette.textSecondary,
    };
}

export type SessionActionsMenuAnchor =
    | { type: 'point'; x: number; y: number }
    | { type: 'rect'; x: number; y: number; width: number; height: number };

type ResolveSessionActionsMenuPositionInput = {
    actionCount: number;
    anchor: SessionActionsMenuAnchor;
    itemHeight: number;
    margin: number;
    menuWidth: number;
    windowHeight: number;
    windowWidth: number;
};

export function resolveSessionActionsMenuPosition({
    actionCount,
    anchor,
    itemHeight,
    margin,
    menuWidth,
    windowHeight,
    windowWidth,
}: ResolveSessionActionsMenuPositionInput): { left: number; top: number } {
    const estimatedHeight = actionCount * itemHeight;
    const leftBase = anchor.type === 'point'
        ? anchor.x
        : anchor.x + anchor.width - menuWidth;

    let topBase = anchor.type === 'point'
        ? anchor.y
        : anchor.y + anchor.height + 8;

    if (anchor.type === 'rect' && topBase + estimatedHeight > windowHeight - margin) {
        topBase = anchor.y - estimatedHeight - 8;
    }

    return {
        left: Math.max(margin, Math.min(windowWidth - menuWidth - margin, leftBase)),
        top: Math.max(margin, Math.min(windowHeight - estimatedHeight - margin, topBase)),
    };
}
