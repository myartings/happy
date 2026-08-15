import { describe, expect, it } from 'vitest';

import {
    resolveStudioSidebarInteractionPresentation,
    resolveStudioSidebarStateBackground,
} from './studioSidebarInteractionPresentation';

describe('Studio sidebar interaction presentation', () => {
    it('resolves coherent but distinct light and dark surfaces and state layers', () => {
        const light = resolveStudioSidebarInteractionPresentation({
            isDark: false,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });
        const dark = resolveStudioSidebarInteractionPresentation({
            isDark: true,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });

        expect(light).toMatchObject({
            isStudio: true,
            surfaceColor: '#F6F7F7',
            rowSelectedColor: '#E8EAEA',
        });
        expect(dark).toMatchObject({
            isStudio: true,
            surfaceColor: '#202123',
            rowSelectedColor: '#35373A',
        });
        expect(dark.controlSurfaceColor).not.toBe(light.controlSurfaceColor);
        expect(dark.focusRingColor).not.toBe(dark.rowSelectedColor);
    });

    it('keeps non-Tauri paths inert and ignores stale Tauri preferences', () => {
        expect(resolveStudioSidebarInteractionPresentation({
            isDark: true,
            isTauriRuntime: false,
            requestedStyle: 'studio',
        })).toMatchObject({ isStudio: false, surfaceColor: 'transparent' });
        expect(resolveStudioSidebarInteractionPresentation({
            isDark: false,
            isTauriRuntime: true,
            requestedStyle: 'default',
        })).toMatchObject({ isStudio: true, rowHoverColor: 'rgba(26, 28, 31, 0.048)' });
    });

    it('keeps selected state identifiable while layering hover and press', () => {
        const presentation = resolveStudioSidebarInteractionPresentation({
            isDark: true,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        });

        expect(resolveStudioSidebarStateBackground(presentation, {
            hovered: false,
            pressed: false,
            selected: true,
        })).toBe(presentation.rowSelectedColor);
        expect(resolveStudioSidebarStateBackground(presentation, {
            hovered: true,
            pressed: false,
            selected: true,
        })).toBe(presentation.rowSelectedHoverColor);
        expect(resolveStudioSidebarStateBackground(presentation, {
            hovered: true,
            pressed: true,
            selected: true,
        })).toBe(presentation.rowPressedColor);
    });
});
