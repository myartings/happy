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

export type StudioComposerInteractionState =
    | 'empty'
    | 'ready'
    | 'attachment'
    | 'autocomplete'
    | 'picker'
    | 'blocked'
    | 'sending'
    | 'abort'
    | 'aborting';

export type StudioComposerStatePresentation = {
    state: StudioComposerInteractionState;
    shellBorder: string;
    shellBackground: string;
    shellShadowOpacity: number;
    shellShadowRadius: number;
    primaryActionBackground: string;
    primaryActionForeground: string;
    primaryActionBorder: string;
    secondaryActiveBackground: string;
    attachmentBackground: string;
    attachmentBorder: string;
    autocompleteSelectedBackground: string;
    autocompletePressedBackground: string;
    abortActionBackground: string;
    abortActionForeground: string;
};

type ResolveStudioComposerStatePresentationInput = {
    codexFirstEnabled?: boolean;
    isDark?: boolean;
    isStudio: boolean;
    hasText: boolean;
    hasAttachments: boolean;
    hasSuggestions: boolean;
    pickerOpen: boolean;
    isSending: boolean;
    showAbortButton: boolean;
    isAborting: boolean;
    isSendBlocked: boolean;
};

type ResolveDesktopComposerStyleInput = {
    codexFirstEnabled?: boolean;
    isDark?: boolean;
    isTauriRuntime: boolean;
    requestedStyle: VisualStyle;
    previewStyle?: string;
};

export function resolveDesktopComposerStyle({
    codexFirstEnabled = false,
    isDark = false,
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
        const dark = codexFirstEnabled && isDark;
        return {
            visualStyle,
            maxWidth: codexFirstEnabled ? 750 : 800,
            shellMinHeight: codexFirstEnabled ? 108 : 110,
            shellRadius: 20,
            shellBackground: dark ? '#292A2D' : '#FFFFFF',
            shellBorder: dark ? 'rgba(255, 255, 255, 0.14)' : '#DDDDDE',
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

export function resolveStudioComposerStatePresentation({
    codexFirstEnabled = false,
    isDark = false,
    isStudio,
    hasText,
    hasAttachments,
    hasSuggestions,
    pickerOpen,
    isSending,
    showAbortButton,
    isAborting,
    isSendBlocked,
}: ResolveStudioComposerStatePresentationInput): StudioComposerStatePresentation | null {
    if (!isStudio) return null;
    const dark = codexFirstEnabled && isDark;

    let state: StudioComposerInteractionState = 'empty';
    if (hasText) state = 'ready';
    if (hasAttachments) state = 'attachment';
    if (isSendBlocked && (hasText || hasAttachments)) state = 'blocked';
    if (hasSuggestions) state = 'autocomplete';
    if (pickerOpen) state = 'picker';
    if (isSending) state = 'sending';
    if (showAbortButton) state = 'abort';
    if (isAborting) state = 'aborting';

    const hasReadyContent = hasText || hasAttachments;
    const readyPrimaryAction = hasReadyContent && !isSendBlocked;
    const shellIsEngaged = state !== 'empty';

    return {
        state,
        shellBorder: dark
            ? shellIsEngaged ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.14)'
            : shellIsEngaged ? '#D2D2D4' : '#E1E1E2',
        shellBackground: dark ? '#292A2D' : '#FFFFFF',
        shellShadowOpacity: dark
            ? shellIsEngaged ? 0.30 : 0.26
            : shellIsEngaged ? 0.11 : 0.08,
        shellShadowRadius: dark
            ? shellIsEngaged ? 28 : 24
            : shellIsEngaged ? 24 : 20,
        primaryActionBackground: isSending
            ? dark ? '#D7D7D9' : '#4C4C50'
            : isSendBlocked && hasReadyContent
                ? dark ? '#303134' : '#F0F0F1'
                : readyPrimaryAction
                    ? dark ? '#F5F5F5' : '#242426'
                    : dark ? '#3B3D40' : '#E7E7E8',
        primaryActionForeground: readyPrimaryAction || isSending
            ? dark ? '#232426' : '#FFFFFF'
            : dark ? '#A4A7AC' : '#858589',
        primaryActionBorder: isSendBlocked && hasReadyContent
            ? dark ? 'rgba(255, 255, 255, 0.18)' : '#D7D7D9'
            : 'transparent',
        secondaryActiveBackground: dark ? 'rgba(255, 255, 255, 0.10)' : '#EEEEEF',
        attachmentBackground: dark ? '#232426' : '#F6F6F6',
        attachmentBorder: dark ? 'rgba(255, 255, 255, 0.14)' : '#E4E4E5',
        autocompleteSelectedBackground: dark ? 'rgba(255, 255, 255, 0.10)' : '#ECEDEE',
        autocompletePressedBackground: dark ? 'rgba(255, 255, 255, 0.12)' : '#E5E6E7',
        abortActionBackground: dark ? '#3A2D2D' : '#F2ECEB',
        abortActionForeground: dark ? '#E29A93' : '#8E3F37',
    };
}
