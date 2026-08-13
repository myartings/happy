import { resolveDesktopVisualStyle, type VisualStyle } from './studioVisualStyle';

export type StudioSidebarInteractionPresentation = {
    controlHoverColor: string;
    controlPressedColor: string;
    controlSurfaceColor: string;
    dividerColor: string;
    focusRingColor: string;
    isStudio: boolean;
    rowHoverColor: string;
    rowPressedColor: string;
    rowSelectedColor: string;
    rowSelectedHoverColor: string;
    surfaceColor: string;
};

type ResolveStudioSidebarInteractionPresentationInput = {
    isDark: boolean;
    isTauriRuntime: boolean;
    previewStyle?: string;
    requestedStyle: VisualStyle;
};

const DEFAULT_PRESENTATION: StudioSidebarInteractionPresentation = {
    controlHoverColor: 'transparent',
    controlPressedColor: 'transparent',
    controlSurfaceColor: 'transparent',
    dividerColor: 'transparent',
    focusRingColor: 'transparent',
    isStudio: false,
    rowHoverColor: 'transparent',
    rowPressedColor: 'transparent',
    rowSelectedColor: 'transparent',
    rowSelectedHoverColor: 'transparent',
    surfaceColor: 'transparent',
};

export function resolveStudioSidebarInteractionPresentation({
    isDark,
    isTauriRuntime,
    previewStyle,
    requestedStyle,
}: ResolveStudioSidebarInteractionPresentationInput): StudioSidebarInteractionPresentation {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        previewStyle,
        requestedStyle,
    });

    if (visualStyle !== 'studio') {
        return DEFAULT_PRESENTATION;
    }

    return isDark
        ? {
            controlHoverColor: 'rgba(255, 255, 255, 0.08)',
            controlPressedColor: 'rgba(255, 255, 255, 0.13)',
            controlSurfaceColor: '#292A2D',
            dividerColor: 'rgba(255, 255, 255, 0.10)',
            focusRingColor: 'rgba(132, 168, 255, 0.88)',
            isStudio: true,
            rowHoverColor: 'rgba(255, 255, 255, 0.065)',
            rowPressedColor: 'rgba(255, 255, 255, 0.12)',
            rowSelectedColor: '#35373A',
            rowSelectedHoverColor: '#3B3D40',
            surfaceColor: '#202123',
        }
        : {
            controlHoverColor: 'rgba(26, 28, 31, 0.055)',
            controlPressedColor: 'rgba(26, 28, 31, 0.105)',
            controlSurfaceColor: '#FFFFFF',
            dividerColor: '#E5E5E6',
            focusRingColor: 'rgba(70, 111, 226, 0.82)',
            isStudio: true,
            rowHoverColor: 'rgba(26, 28, 31, 0.048)',
            rowPressedColor: 'rgba(26, 28, 31, 0.095)',
            rowSelectedColor: '#E8EAEA',
            rowSelectedHoverColor: '#E1E3E3',
            surfaceColor: '#F6F7F7',
        };
}

export function resolveStudioSidebarStateBackground(
    presentation: StudioSidebarInteractionPresentation,
    {
        hovered,
        pressed,
        selected,
    }: {
        hovered: boolean;
        pressed: boolean;
        selected: boolean;
    },
): string {
    if (!presentation.isStudio) return 'transparent';
    if (pressed) return presentation.rowPressedColor;
    if (selected && hovered) return presentation.rowSelectedHoverColor;
    if (selected) return presentation.rowSelectedColor;
    if (hovered) return presentation.rowHoverColor;
    return 'transparent';
}
