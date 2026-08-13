import { describe, expect, it } from 'vitest';
import {
    resolveDesktopSectionHeaderStyle,
    resolveDesktopSidebarFooterStyle,
    resolveDesktopSessionRowStyle,
    resolveDesktopTodoRowStyle,
    resolveDesktopTopControlsStyle,
    resolveDesktopVisualStyle,
    resolveDesktopSidebarFrame,
} from './studioVisualStyle';

describe('Studio desktop visual style', () => {
    it('keeps the existing Default sidebar formula unchanged', () => {
        expect(resolveDesktopSidebarFrame({
            windowWidth: 1470,
            isTauriRuntime: true,
            requestedStyle: 'default',
        })).toMatchObject({
            visualStyle: 'default',
            width: 360,
            sidebarBackground: '#FFFFFF',
            canvasBackground: '#FFFFFF',
            dividerWidth: 0,
        });
    });

    it('resolves the accepted 316 point Studio frame at the review width', () => {
        expect(resolveDesktopSidebarFrame({
            windowWidth: 1470,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            width: 316,
            sidebarBackground: '#F6F7F7',
            canvasBackground: '#FFFFFF',
            dividerColor: '#E5E5E6',
            dividerWidth: 1,
        });
    });

    it('keeps Studio responsive within the existing desktop bounds', () => {
        expect(resolveDesktopSidebarFrame({
            windowWidth: 900,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        }).width).toBe(250);
        expect(resolveDesktopSidebarFrame({
            windowWidth: 1800,
            isTauriRuntime: true,
            requestedStyle: 'studio',
        }).width).toBe(360);
    });

    it('forces standalone web and native clients back to Default', () => {
        expect(resolveDesktopVisualStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        })).toBe('default');
    });

    it('allows an explicit packaged-desktop preview to override persistence', () => {
        expect(resolveDesktopVisualStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
            previewStyle: 'studio',
        })).toBe('studio');
    });

    it('resolves the accepted fill-only 62 point Studio session row', () => {
        expect(resolveDesktopSessionRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            height: 62,
            horizontalInset: 12,
            horizontalPadding: 12,
            verticalPadding: 6,
            gap: 4,
            leadingIndicatorWidth: 10,
            leadingIndicatorGap: 6,
            metadataInset: 16,
            titleFontSize: 13,
            titleLineHeight: 17,
            titleFontWeight: '600',
            primaryMetadataFontSize: 11,
            secondaryMetadataFontSize: 10,
            cornerRadius: 9,
            selectedBackground: '#E8EAEA',
            showCardSurface: false,
            showGroupShellBoundary: false,
            showRowDividers: false,
            showShadow: false,
        });
    });

    it('keeps Default and non-Tauri session rows on their existing style path', () => {
        expect(resolveDesktopSessionRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
        })).toMatchObject({
            visualStyle: 'default',
            leadingIndicatorWidth: null,
            leadingIndicatorGap: null,
            metadataInset: null,
            titleFontSize: null,
            secondaryMetadataFontSize: null,
            showGroupShellBoundary: true,
        });
        expect(resolveDesktopSessionRowStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });

    it('resolves the accepted compact Studio top-control geometry', () => {
        expect(resolveDesktopTopControlsStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            controlHeight: 38,
            archiveWidth: 38,
            cornerRadius: 10,
            groupGap: 6,
            contentGap: 6,
            horizontalPadding: 12,
            showShadow: false,
        });
    });

    it('keeps Default and non-Tauri top controls on their existing style path', () => {
        expect(resolveDesktopTopControlsStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
        }).controlHeight).toBeNull();
        expect(resolveDesktopTopControlsStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });

    it('resolves the accepted compact Studio Todo utility geometry', () => {
        expect(resolveDesktopTodoRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            height: 36,
            cornerRadius: 10,
            horizontalPadding: 12,
            contentGap: 4,
            showShadow: false,
        });
    });

    it('keeps Default and non-Tauri Todo rows on their existing style path', () => {
        expect(resolveDesktopTodoRowStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
        }).height).toBeNull();
        expect(resolveDesktopTodoRowStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });

    it('resolves the accepted compact Studio section-header geometry', () => {
        expect(resolveDesktopSectionHeaderStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            fontSize: 12,
            lineHeight: 16,
            fontWeight: '500',
            horizontalPadding: 18,
            topPadding: 14,
            bottomPadding: 6,
        });
    });

    it('keeps Default and non-Tauri section headers on their existing style path', () => {
        expect(resolveDesktopSectionHeaderStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
        }).fontSize).toBeNull();
        expect(resolveDesktopSectionHeaderStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });

    it('resolves the compact Studio sidebar footer hierarchy', () => {
        expect(resolveDesktopSidebarFooterStyle({
            isTauriRuntime: true,
            requestedStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            height: 44,
            horizontalPadding: 18,
            contentGap: 9,
            iconSize: 17,
            labelFontSize: 13,
        });
    });

    it('keeps Default and non-Tauri sidebar footers on their existing style path', () => {
        expect(resolveDesktopSidebarFooterStyle({
            isTauriRuntime: true,
            requestedStyle: 'default',
        }).height).toBeNull();
        expect(resolveDesktopSidebarFooterStyle({
            isTauriRuntime: false,
            requestedStyle: 'studio',
            previewStyle: 'studio',
        }).visualStyle).toBe('default');
    });
});
