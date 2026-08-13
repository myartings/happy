import {
    resolveDesktopVisualStyle,
    type VisualStyle,
} from '@/features/studio-visual-style/studioVisualStyle';

export type DesktopComposerStyle = {
    visualStyle: VisualStyle;
    maxWidth: number | null;
    shellMinHeight: number | null;
    shellRadius: number | null;
    shellBackground: string | null;
    shellBorder: string | null;
    shellBorderWidth: number | null;
    shellHorizontalPadding: number | null;
    shellTopPadding: number | null;
    shellBottomPadding: number | null;
    inputMinHeight: number | null;
    actionHeight: number | null;
    actionRadius: number | null;
    attachmentSize: number | null;
    autocompleteRowHeight: number | null;
    autocompleteRadius: number | null;
    showElevation: boolean;
};

type ResolveDesktopComposerStyleInput = {
    isTauriRuntime: boolean;
    requestedStyle: VisualStyle;
    previewStyle?: string;
};

export function resolveDesktopComposerStyle({
    isTauriRuntime,
    requestedStyle,
    previewStyle,
}: ResolveDesktopComposerStyleInput): DesktopComposerStyle {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        requestedStyle,
        previewStyle,
    });

    if (visualStyle === 'studio') {
        return {
            visualStyle,
            maxWidth: 800,
            shellMinHeight: 110,
            shellRadius: 20,
            shellBackground: '#FFFFFF',
            shellBorder: '#DDDDDE',
            shellBorderWidth: 1,
            shellHorizontalPadding: 12,
            shellTopPadding: 8,
            shellBottomPadding: 10,
            inputMinHeight: 56,
            actionHeight: 32,
            actionRadius: 8,
            attachmentSize: 52,
            autocompleteRowHeight: 40,
            autocompleteRadius: 12,
            showElevation: true,
        };
    }

    return {
        visualStyle,
        maxWidth: null,
        shellMinHeight: null,
        shellRadius: null,
        shellBackground: null,
        shellBorder: null,
        shellBorderWidth: null,
        shellHorizontalPadding: null,
        shellTopPadding: null,
        shellBottomPadding: null,
        inputMinHeight: null,
        actionHeight: null,
        actionRadius: null,
        attachmentSize: null,
        autocompleteRowHeight: null,
        autocompleteRadius: null,
        showElevation: false,
    };
}
