export type StudioPanelSide = 'left' | 'right';

type PanelBounds = {
    defaultWidth: number;
    minWidth: number;
    maxWidth: number;
};

export const STUDIO_PANEL_GEOMETRY = {
    left: { defaultWidth: 275, minWidth: 220, maxWidth: 420 },
    right: { defaultWidth: 360, minWidth: 280, maxWidth: 520 },
    minMainWidth: 600,
    keyboardStep: 16,
} as const satisfies Record<StudioPanelSide, PanelBounds> & {
    minMainWidth: number;
    keyboardStep: number;
};

type PanelProjectionInput = {
    side: StudioPanelSide;
    requestedWidth: number;
    windowWidth: number;
    oppositeWidth: number;
    oppositeVisible: boolean;
};

function finiteOr(value: number, fallback: number): number {
    return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
}

export function projectPanelWidth({
    side,
    requestedWidth,
    windowWidth,
    oppositeWidth,
    oppositeVisible,
}: PanelProjectionInput): number {
    const bounds = STUDIO_PANEL_GEOMETRY[side];
    const oppositeSide: StudioPanelSide = side === 'left' ? 'right' : 'left';
    const oppositeBounds = STUDIO_PANEL_GEOMETRY[oppositeSide];
    const safeWindowWidth = Math.max(0, finiteOr(windowWidth, 0));
    const reservedOppositeWidth = oppositeVisible
        ? clamp(
            finiteOr(oppositeWidth, oppositeBounds.defaultWidth),
            oppositeBounds.minWidth,
            oppositeBounds.maxWidth,
        )
        : 0;
    const mainProtectedMaximum = safeWindowWidth
        - reservedOppositeWidth
        - STUDIO_PANEL_GEOMETRY.minMainWidth;
    const effectiveMaximum = Math.max(
        bounds.minWidth,
        Math.min(bounds.maxWidth, mainProtectedMaximum),
    );
    const safeRequestedWidth = finiteOr(requestedWidth, bounds.defaultWidth);
    return Math.round(clamp(safeRequestedWidth, bounds.minWidth, effectiveMaximum));
}

type PanelDragInput = Omit<PanelProjectionInput, 'requestedWidth'> & {
    startWidth: number;
    startPointerX: number;
    pointerX: number;
};

export function projectPanelDrag({
    side,
    startWidth,
    startPointerX,
    pointerX,
    ...projection
}: PanelDragInput): number {
    const pointerDelta = finiteOr(pointerX, startPointerX) - finiteOr(startPointerX, 0);
    const directionalDelta = side === 'left' ? pointerDelta : -pointerDelta;
    return projectPanelWidth({
        side,
        requestedWidth: finiteOr(startWidth, STUDIO_PANEL_GEOMETRY[side].defaultWidth) + directionalDelta,
        ...projection,
    });
}

export function resetPanelWidth(
    input: Omit<PanelProjectionInput, 'requestedWidth'>,
): number {
    return projectPanelWidth({
        ...input,
        requestedWidth: STUDIO_PANEL_GEOMETRY[input.side].defaultWidth,
    });
}
