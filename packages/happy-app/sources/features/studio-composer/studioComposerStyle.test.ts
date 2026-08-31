import { describe, expect, it } from 'vitest';
import {
    resolveDesktopComposerStyle,
    resolveStudioComposerStatePresentation,
} from './studioComposerStyle';

describe('Studio desktop composer style', () => {
    it('aligns the packaged Codex-first composer to the measured 750 by 108pt surface', () => {
        expect(resolveDesktopComposerStyle({
            codexFirstEnabled: true,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toMatchObject({
            visualStyle: 'studio',
            maxWidth: 750,
            shellMinHeight: 108,
            shellRadius: 20,
            showElevation: true,
        });
    });

    it('resolves the accepted elevated composer geometry in packaged Studio', () => {
        expect(resolveDesktopComposerStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
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
        });
    });

    it('uses a coherent dark surface instead of retaining the light composer shell', () => {
        expect(resolveDesktopComposerStyle({
            codexFirstEnabled: true,
            isDark: true,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toMatchObject({
            shellBackground: '#292A2D',
            shellBorder: 'rgba(255, 255, 255, 0.14)',
        });

        expect(resolveStudioComposerStatePresentation({
            codexFirstEnabled: true,
            isDark: true,
            hasText: true,
            isStudio: true,
            hasAttachments: false,
            hasSuggestions: false,
            pickerOpen: false,
            isSending: false,
            showAbortButton: false,
            isAborting: false,
            isSendBlocked: false,
        })).toMatchObject({
            shellBackground: '#292A2D',
            shellBorder: 'rgba(255, 255, 255, 0.22)',
            primaryActionBackground: '#F5F5F5',
            primaryActionForeground: '#232426',
        });
    });

    it('keeps legacy packaged Studio on its established light tokens', () => {
        expect(resolveDesktopComposerStyle({
            codexFirstEnabled: false,
            isDark: true,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toMatchObject({
            shellBackground: '#FFFFFF',
            shellBorder: '#DDDDDE',
        });
        expect(resolveStudioComposerStatePresentation({
            codexFirstEnabled: false,
            isDark: true,
            hasText: true,
            isStudio: true,
            hasAttachments: false,
            hasSuggestions: false,
            pickerOpen: false,
            isSending: false,
            showAbortButton: false,
            isAborting: false,
            isSendBlocked: false,
        })).toMatchObject({
            shellBackground: '#FFFFFF',
            shellBorder: '#D2D2D4',
            primaryActionBackground: '#242426',
            primaryActionForeground: '#FFFFFF',
        });
    });

    it('keeps non-Tauri clients on the existing presentation path', () => {
        expect(resolveDesktopComposerStyle({
            isTauriRuntime: false,
            requestedStyle: 'default',
        })).toMatchObject({
            visualStyle: 'default',
            maxWidth: null,
            shellMinHeight: null,
            showElevation: false,
        });

        expect(resolveDesktopComposerStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });
});

describe('Studio composer interaction states', () => {
    const base = {
        isStudio: true,
        hasText: false,
        hasAttachments: false,
        hasSuggestions: false,
        pickerOpen: false,
        isSending: false,
        showAbortButton: false,
        isAborting: false,
        isSendBlocked: false,
    };

    it('keeps the empty shell quiet and makes text or attachments visibly ready', () => {
        expect(resolveStudioComposerStatePresentation(base)).toMatchObject({
            state: 'empty',
            shellBorder: '#E1E1E2',
            primaryActionBackground: '#E7E7E8',
            primaryActionForeground: '#858589',
        });
        expect(resolveStudioComposerStatePresentation({ ...base, hasText: true })).toMatchObject({
            state: 'ready',
            shellBorder: '#D2D2D4',
            primaryActionBackground: '#242426',
            primaryActionForeground: '#FFFFFF',
        });
        expect(resolveStudioComposerStatePresentation({ ...base, hasAttachments: true })).toMatchObject({
            state: 'attachment',
            attachmentBackground: '#F6F6F6',
            attachmentBorder: '#E4E4E5',
            primaryActionBackground: '#242426',
        });
    });

    it('prioritizes autocomplete, picker, sending, and abort feedback', () => {
        expect(resolveStudioComposerStatePresentation({ ...base, hasSuggestions: true })!.state).toBe('autocomplete');
        expect(resolveStudioComposerStatePresentation({ ...base, pickerOpen: true })!.state).toBe('picker');
        expect(resolveStudioComposerStatePresentation({ ...base, isSending: true })).toMatchObject({
            state: 'sending',
            primaryActionBackground: '#4C4C50',
        });
        expect(resolveStudioComposerStatePresentation({ ...base, showAbortButton: true })).toMatchObject({
            state: 'abort',
            abortActionBackground: '#F2ECEB',
            abortActionForeground: '#8E3F37',
        });
        expect(resolveStudioComposerStatePresentation({
            ...base,
            showAbortButton: true,
            isAborting: true,
        })!.state).toBe('aborting');
    });

    it('returns no state styling outside Studio', () => {
        expect(resolveStudioComposerStatePresentation({ ...base, isStudio: false })).toBeNull();
    });
});
