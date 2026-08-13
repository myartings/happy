import { describe, expect, it } from 'vitest';
import {
    STUDIO_PANEL_GEOMETRY,
    projectPanelDrag,
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
        expect(resetPanelWidth({
            side: 'left', windowWidth: 1470, oppositeWidth: 360, oppositeVisible: true,
        })).toBe(275);
        expect(resetPanelWidth({
            side: 'right', windowWidth: 1470, oppositeWidth: 275, oppositeVisible: true,
        })).toBe(360);
    });
});
