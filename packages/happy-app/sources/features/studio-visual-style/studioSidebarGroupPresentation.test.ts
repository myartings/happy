import { describe, expect, it } from 'vitest';
import { resolveDesktopSessionRowStyle } from './studioVisualStyle';
import {
    resolveSidebarSessionRowStyle,
    resolveStudioSidebarGroupPresentation,
    resolveStudioSidebarRowChrome,
} from './studioSidebarGroupPresentation';

describe('Studio sidebar group presentation', () => {
    it('uses an unboxed group only for packaged-desktop Studio', () => {
        const studioStyle = resolveDesktopSessionRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });

        expect(resolveStudioSidebarGroupPresentation(studioStyle)).toBe('unboxed');
    });

    it('keeps the existing card group for Default and non-Tauri clients', () => {
        const defaultStyle = resolveDesktopSessionRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
        });
        const standaloneWebStyle = resolveDesktopSessionRowStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        });

        expect(resolveStudioSidebarGroupPresentation(defaultStyle)).toBe('card');
        expect(resolveStudioSidebarGroupPresentation(standaloneWebStyle)).toBe('card');
    });

    it('inherits the authoritative Studio frame style even when local row inputs disagree', () => {
        expect(resolveSidebarSessionRowStyle({
            sidebarVisualStyle: 'studio',
            isTauriRuntime: false,
            requestedStyle: 'default',
        }).visualStyle).toBe('studio');
    });

    it('preserves standalone non-Tauri gating when no sidebar frame style is supplied', () => {
        expect(resolveSidebarSessionRowStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });

    it('prevents an ordinary Studio row from recomposing group-card chrome', () => {
        const studioStyle = resolveDesktopSessionRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });

        expect(resolveStudioSidebarRowChrome(studioStyle, {
            selected: false,
            showDivider: true,
        })).toEqual({
            useDefaultContainerSurface: false,
            useGroupPositionShape: false,
            clipToRowShape: false,
            showDivider: false,
            backgroundRole: 'transparent',
            cornerRadius: 0,
        });
    });

    it('keeps the Studio selected fill bounded to one local row', () => {
        const studioStyle = resolveDesktopSessionRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });

        expect(resolveStudioSidebarRowChrome(studioStyle, {
            selected: true,
            showDivider: true,
        })).toMatchObject({
            backgroundRole: 'selected',
            cornerRadius: 7,
            showDivider: false,
        });
    });

    it('retains Default container, position shape, clipping, and divider behavior', () => {
        const defaultStyle = resolveDesktopSessionRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
        });

        expect(resolveStudioSidebarRowChrome(defaultStyle, {
            selected: false,
            showDivider: true,
        })).toEqual({
            useDefaultContainerSurface: true,
            useGroupPositionShape: true,
            clipToRowShape: true,
            showDivider: true,
            backgroundRole: 'default',
            cornerRadius: null,
        });
    });
});
