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

export function resolveStudioComposerStatePresentation({
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
        shellBorder: shellIsEngaged ? '#D2D2D4' : '#E1E1E2',
        shellBackground: '#FFFFFF',
        shellShadowOpacity: shellIsEngaged ? 0.11 : 0.08,
        shellShadowRadius: shellIsEngaged ? 24 : 20,
        primaryActionBackground: isSending
            ? '#4C4C50'
            : isSendBlocked && hasReadyContent
                ? '#F0F0F1'
                : readyPrimaryAction
                    ? '#242426'
                    : '#E7E7E8',
        primaryActionForeground: readyPrimaryAction || isSending ? '#FFFFFF' : '#858589',
        primaryActionBorder: isSendBlocked && hasReadyContent ? '#D7D7D9' : 'transparent',
        secondaryActiveBackground: '#EEEEEF',
        attachmentBackground: '#F6F6F6',
        attachmentBorder: '#E4E4E5',
        autocompleteSelectedBackground: '#ECEDEE',
        autocompletePressedBackground: '#E5E6E7',
        abortActionBackground: '#F2ECEB',
        abortActionForeground: '#8E3F37',
    };
}
