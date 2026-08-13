import {
    resolveDesktopSessionRowStyle,
    type DesktopSessionRowStyle,
    type VisualStyle,
} from './studioVisualStyle';

export type StudioSidebarGroupPresentation = 'card' | 'unboxed';

export function resolveStudioSidebarGroupPresentation(
    sessionRowStyle: Pick<DesktopSessionRowStyle, 'showCardSurface'>,
): StudioSidebarGroupPresentation {
    return sessionRowStyle.showCardSurface ? 'card' : 'unboxed';
}

type ResolveSidebarSessionRowStyleInput = {
    sidebarVisualStyle?: VisualStyle;
    isTauriRuntime: boolean;
    requestedStyle: VisualStyle;
    previewStyle?: string;
};

export function resolveSidebarSessionRowStyle({
    sidebarVisualStyle,
    isTauriRuntime,
    requestedStyle,
    previewStyle,
}: ResolveSidebarSessionRowStyleInput): DesktopSessionRowStyle {
    if (sidebarVisualStyle) {
        return resolveDesktopSessionRowStyle({
            isTauriRuntime: sidebarVisualStyle === 'studio',
            requestedStyle: sidebarVisualStyle,
        });
    }

    return resolveDesktopSessionRowStyle({
        isTauriRuntime,
        requestedStyle,
        previewStyle,
    });
}

export type StudioSidebarRowChrome = {
    useDefaultContainerSurface: boolean;
    useGroupPositionShape: boolean;
    clipToRowShape: boolean;
    showDivider: boolean;
    backgroundRole: 'default' | 'transparent' | 'selected';
    cornerRadius: number | null;
};

export function resolveStudioSidebarRowChrome(
    sessionRowStyle: DesktopSessionRowStyle,
    { selected, showDivider }: { selected: boolean; showDivider: boolean },
): StudioSidebarRowChrome {
    if (sessionRowStyle.visualStyle === 'studio') {
        return {
            useDefaultContainerSurface: false,
            useGroupPositionShape: false,
            clipToRowShape: false,
            showDivider: false,
            backgroundRole: selected ? 'selected' : 'transparent',
            cornerRadius: selected ? sessionRowStyle.cornerRadius : 0,
        };
    }

    return {
        useDefaultContainerSurface: true,
        useGroupPositionShape: true,
        clipToRowShape: true,
        showDivider,
        backgroundRole: selected ? 'selected' : 'default',
        cornerRadius: null,
    };
}
