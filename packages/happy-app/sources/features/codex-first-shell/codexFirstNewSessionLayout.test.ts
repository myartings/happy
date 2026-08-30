import { describe, expect, it } from 'vitest';

import { getNewSessionSidebarLayout } from '@/utils/newSessionSidebarLayout';
import { projectPanelWidth } from '@/features/studio-panel-resize/studioPanelResizePolicy';

describe('Codex-first New Session panel composition', () => {
    it.each([
        { storedLeftWidth: 275, windowWidth: 1100, expectedRightWidth: 250, expectedVisible: false },
        { storedLeftWidth: 275, windowWidth: 1200, expectedRightWidth: 325, expectedVisible: true },
        { storedLeftWidth: 420, windowWidth: 1200, expectedRightWidth: 250, expectedVisible: false },
        { storedLeftWidth: 275, windowWidth: 1470, expectedRightWidth: 360, expectedVisible: true },
    ])('protects the main region at $windowWidth pt with a $storedLeftWidth pt stored left target', ({
        storedLeftWidth,
        windowWidth,
        expectedRightWidth,
        expectedVisible,
    }) => {
        const leftSidebarWidth = projectPanelWidth({
            side: 'left',
            requestedWidth: storedLeftWidth,
            windowWidth,
            oppositeWidth: 0,
            oppositeVisible: false,
        });
        const layout = getNewSessionSidebarLayout({
            codexFirstEnabled: true,
            platform: 'web',
            isMac: false,
            fileDiffsSidebarEnabled: false,
            zenMode: false,
            windowWidth,
            leftSidebarWidth,
        });

        expect(layout.showSidebar).toBe(expectedVisible);
        expect(layout.sidebarWidth).toBe(expectedRightWidth);
        if (layout.showSidebar) {
            expect(windowWidth - leftSidebarWidth - layout.sidebarWidth).toBeGreaterThanOrEqual(600);
        }
    });
});
