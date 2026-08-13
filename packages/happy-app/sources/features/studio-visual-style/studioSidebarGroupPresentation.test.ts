import { describe, expect, it } from 'vitest';
import { resolveDesktopSessionRowStyle } from './studioVisualStyle';
import { resolveStudioSidebarGroupPresentation } from './studioSidebarGroupPresentation';

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
});
