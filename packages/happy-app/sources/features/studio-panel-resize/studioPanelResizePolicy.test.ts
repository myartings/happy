import { describe, expect, it } from 'vitest';
import {
    STUDIO_PANEL_GEOMETRY,
    projectPanelDrag,
    projectPanelKeyboardTarget,
    projectStudioPanelWidths,
    projectPanelWidth,
    resetPanelWidth,
} from './studioPanelResizePolicy';

describe('Studio panel resize policy', () => {
    it('owns the accepted defaults and bounds', () => {
        expect(STUDIO_PANEL_GEOMETRY).toEqual({
            left: { defaultWidth: 275, minWidth: 220, maxWidth: 420 },
            right: { defaultWidth: 360, minWidth: 280, maxWidth: 520 },
            minMainWidth: 600,
            keyboardStep: 16,
        });
    });

    it('projects persisted widths through side bounds', () => {
        expect(projectPanelWidth({
            side: 'left',
            requestedWidth: 100,
            windowWidth: 1470,
            oppositeWidth: 360,
            oppositeVisible: true,
        })).toBe(220);
        expect(projectPanelWidth({
            side: 'right',
            requestedWidth: 900,
            windowWidth: 1470,
            oppositeWidth: 275,
            oppositeVisible: true,
        })).toBe(520);
    });

    it('protects 600pt of conversation width when both panels are visible', () => {
        expect(projectPanelWidth({
            side: 'left',
            requestedWidth: 420,
            windowWidth: 1200,
            oppositeWidth: 360,
            oppositeVisible: true,
        })).toBe(240);
        expect(projectPanelWidth({
            side: 'right',
            requestedWidth: 520,
            windowWidth: 1200,
            oppositeWidth: 275,
            oppositeVisible: true,
        })).toBe(325);
    });

    it('projects both persisted targets together without wasting constrained panel space', () => {
        expect(projectStudioPanelWidths({
            storedLeftWidth: 420,
            storedRightWidth: 520,
            windowWidth: 1200,
            leftVisible: true,
            rightVisible: true,
        })).toEqual({ leftWidth: 261, rightWidth: 339 });
    });

    it('closes the constrained drag loop in the requested direction', () => {
        const before = projectStudioPanelWidths({
            storedLeftWidth: 420, storedRightWidth: 520, windowWidth: 1200,
            leftVisible: true, rightVisible: true, activeSide: null,
        });
        const storedLeftWidth = projectPanelDrag({
            side: 'left', startWidth: before.leftWidth, startPointerX: 500,
            pointerX: 510, windowWidth: 1200, oppositeWidth: before.rightWidth,
            oppositeVisible: true,
        });
        const after = projectStudioPanelWidths({
            storedLeftWidth, storedRightWidth: 520, windowWidth: 1200,
            leftVisible: true, rightVisible: true, activeSide: 'left',
        });

        expect(storedLeftWidth).toBe(271);
        expect(after).toEqual({ leftWidth: 271, rightWidth: 329 });
        expect(after.leftWidth).toBeGreaterThan(before.leftWidth);
    });

    it('closes keyboard, reset, and collapse/reopen loops with active-side priority', () => {
        const initial = projectStudioPanelWidths({
            storedLeftWidth: 420, storedRightWidth: 520, windowWidth: 1200,
            leftVisible: true, rightVisible: true, activeSide: null,
        });
        const keyboardTarget = projectPanelKeyboardTarget('left', initial.leftWidth, 1);
        const keyboard = projectStudioPanelWidths({
            storedLeftWidth: keyboardTarget, storedRightWidth: 520, windowWidth: 1200,
            leftVisible: true, rightVisible: true, activeSide: 'left',
        });
        expect(keyboard).toEqual({ leftWidth: 277, rightWidth: 323 });

        const reset = projectStudioPanelWidths({
            storedLeftWidth: resetPanelWidth('left'), storedRightWidth: 520, windowWidth: 1200,
            leftVisible: true, rightVisible: true, activeSide: 'left',
        });
        expect(reset).toEqual({ leftWidth: 275, rightWidth: 325 });

        expect(projectStudioPanelWidths({
            storedLeftWidth: keyboardTarget, storedRightWidth: 520, windowWidth: 900,
            leftVisible: true, rightVisible: false, activeSide: 'left',
        })).toEqual({ leftWidth: 277, rightWidth: 0 });
        expect(projectStudioPanelWidths({
            storedLeftWidth: keyboardTarget, storedRightWidth: 520, windowWidth: 1200,
            leftVisible: true, rightVisible: true, activeSide: 'left',
        })).toEqual(keyboard);
    });

    it('keeps both panel bounds while a persisted active side follows window changes', () => {
        expect(projectStudioPanelWidths({
            storedLeftWidth: 275, storedRightWidth: 520, windowWidth: 1470,
            leftVisible: true, rightVisible: true, activeSide: 'left',
        })).toEqual({ leftWidth: 275, rightWidth: 520 });
        expect(projectStudioPanelWidths({
            storedLeftWidth: 275, storedRightWidth: 520, windowWidth: 1540,
            leftVisible: true, rightVisible: true, activeSide: 'left',
        })).toEqual({ leftWidth: 275, rightWidth: 520 });

        const narrow = projectStudioPanelWidths({
            storedLeftWidth: 420, storedRightWidth: 520, windowWidth: 1200,
            leftVisible: true, rightVisible: true, activeSide: 'left',
        });
        const restored = projectStudioPanelWidths({
            storedLeftWidth: 420, storedRightWidth: 520, windowWidth: 1540,
            leftVisible: true, rightVisible: true, activeSide: 'left',
        });
        expect(narrow).toEqual({ leftWidth: 320, rightWidth: 280 });
        expect(restored).toEqual({ leftWidth: 420, rightWidth: 520 });
    });

    it('balances containable defaults instead of pinning reset at a minimum', () => {
        expect(projectStudioPanelWidths({
            storedLeftWidth: 275,
            storedRightWidth: 360,
            windowWidth: 1200,
            leftVisible: true,
            rightVisible: true,
        })).toEqual({ leftWidth: 261, rightWidth: 339 });
        expect(resetPanelWidth('left')).toBe(275);
        expect(resetPanelWidth('right')).toBe(360);
    });

    it('projects only the visible target while preserving collapse restoration inputs', () => {
        expect(projectStudioPanelWidths({
            storedLeftWidth: 420,
            storedRightWidth: 520,
            windowWidth: 900,
            leftVisible: true,
            rightVisible: false,
        })).toEqual({ leftWidth: 300, rightWidth: 0 });
    });

    it('does not reserve a collapsed opposite panel', () => {
        expect(projectPanelWidth({
            side: 'left',
            requestedWidth: 420,
            windowWidth: 900,
            oppositeWidth: 520,
            oppositeVisible: false,
        })).toBe(300);
    });

    it('projects pointer drag direction from the panel edge', () => {
        expect(projectPanelDrag({
            side: 'left', startWidth: 275, startPointerX: 500, pointerX: 540,
            windowWidth: 1470, oppositeWidth: 360, oppositeVisible: true,
        })).toBe(315);
        expect(projectPanelDrag({
            side: 'right', startWidth: 360, startPointerX: 1000, pointerX: 960,
            windowWidth: 1470, oppositeWidth: 275, oppositeVisible: true,
        })).toBe(400);
    });

    it('resets each side to its accepted default projected for the window', () => {
        expect(resetPanelWidth('left')).toBe(275);
        expect(resetPanelWidth('right')).toBe(360);
    });
});
