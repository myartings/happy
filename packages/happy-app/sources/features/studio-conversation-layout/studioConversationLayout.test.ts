import { describe, expect, it } from 'vitest';
import { resolveStudioConversationLayout } from './studioConversationLayout';

describe('Studio conversation layout', () => {
    it('returns the accepted v2 geometry for packaged Studio desktop', () => {
        expect(resolveStudioConversationLayout({
            isTauriRuntime: true,
            visualStyle: 'studio',
        })).toEqual({
            visualStyle: 'studio',
            headerHeight: 54,
            headerHorizontalPadding: 20,
            messageViewportMaxWidth: 832,
            messageTopGap: 28,
            messageBottomGap: 16,
        });
    });

    it('leaves Default and non-Tauri clients on their existing geometry', () => {
        expect(resolveStudioConversationLayout({
            isTauriRuntime: true,
            visualStyle: 'default',
        })).toEqual({
            visualStyle: 'default',
            headerHeight: null,
            headerHorizontalPadding: null,
            messageViewportMaxWidth: null,
            messageTopGap: null,
            messageBottomGap: null,
        });
        expect(resolveStudioConversationLayout({
            isTauriRuntime: false,
            visualStyle: 'studio',
        }).visualStyle).toBe('default');
    });
});
