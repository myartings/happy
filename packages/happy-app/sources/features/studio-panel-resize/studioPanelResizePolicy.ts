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

type StudioPanelWidthsInput = {
    storedLeftWidth: number;
    storedRightWidth: number;
    windowWidth: number;
    leftVisible: boolean;
    rightVisible: boolean;
};

export type StudioPanelWidths = {
    leftWidth: number;
    rightWidth: number;
};

function finiteOr(value: number, fallback: number): number {
    return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
}

export function projectPanelTarget(side: StudioPanelSide, width: number): number {
    const bounds = STUDIO_PANEL_GEOMETRY[side];
    return Math.round(clamp(
        finiteOr(width, bounds.defaultWidth),
        bounds.minWidth,
        bounds.maxWidth,
    ));
}

function allocateProportionally(
    available: number,
    leftDemand: number,
    rightDemand: number,
): { left: number; right: number } {
    const distributable = Math.max(0, Math.min(available, leftDemand + rightDemand));
    const totalDemand = leftDemand + rightDemand;
    if (totalDemand <= 0 || distributable <= 0) return { left: 0, right: 0 };

    let left = Math.min(leftDemand, Math.round(distributable * leftDemand / totalDemand));
    let right = Math.min(rightDemand, distributable - left);
    const remainder = distributable - left - right;
    if (remainder > 0) {
        const leftCapacity = leftDemand - left;
        const leftRemainder = Math.min(remainder, leftCapacity);
        left += leftRemainder;
        right += remainder - leftRemainder;
    }
    return { left, right };
}

export function projectStudioPanelWidths({
    storedLeftWidth,
    storedRightWidth,
    windowWidth,
    leftVisible,
    rightVisible,
}: StudioPanelWidthsInput): StudioPanelWidths {
    if (!leftVisible && !rightVisible) return { leftWidth: 0, rightWidth: 0 };
    if (!rightVisible) {
        return {
            leftWidth: projectPanelWidth({
                side: 'left', requestedWidth: storedLeftWidth, windowWidth,
                oppositeWidth: 0, oppositeVisible: false,
            }),
            rightWidth: 0,
        };
    }
    if (!leftVisible) {
        return {
            leftWidth: 0,
            rightWidth: projectPanelWidth({
                side: 'right', requestedWidth: storedRightWidth, windowWidth,
                oppositeWidth: 0, oppositeVisible: false,
            }),
        };
    }

    const left = STUDIO_PANEL_GEOMETRY.left;
    const right = STUDIO_PANEL_GEOMETRY.right;
    const requestedLeft = projectPanelTarget('left', storedLeftWidth);
    const requestedRight = projectPanelTarget('right', storedRightWidth);
    const minimumTotal = left.minWidth + right.minWidth;
    const maximumTotal = left.maxWidth + right.maxWidth;
    const panelBudget = Math.round(clamp(
        Math.max(0, finiteOr(windowWidth, 0)) - STUDIO_PANEL_GEOMETRY.minMainWidth,
        minimumTotal,
        maximumTotal,
    ));
    const baseLeft = Math.min(requestedLeft, left.defaultWidth);
    const baseRight = Math.min(requestedRight, right.defaultWidth);
    const baseTotal = baseLeft + baseRight;

    if (baseTotal > panelBudget) {
        const baseAllocation = allocateProportionally(
            panelBudget - minimumTotal,
            baseLeft - left.minWidth,
            baseRight - right.minWidth,
        );
        return {
            leftWidth: left.minWidth + baseAllocation.left,
            rightWidth: right.minWidth + baseAllocation.right,
        };
    }

    const expansion = allocateProportionally(
        panelBudget - baseTotal,
        requestedLeft - baseLeft,
        requestedRight - baseRight,
    );
    return {
        leftWidth: baseLeft + expansion.left,
        rightWidth: baseRight + expansion.right,
    };
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
}: PanelDragInput): number {
    const pointerDelta = finiteOr(pointerX, startPointerX) - finiteOr(startPointerX, 0);
    const directionalDelta = side === 'left' ? pointerDelta : -pointerDelta;
    return projectPanelTarget(
        side,
        finiteOr(startWidth, STUDIO_PANEL_GEOMETRY[side].defaultWidth) + directionalDelta,
    );
}

export function resetPanelWidth(side: StudioPanelSide): number {
    return STUDIO_PANEL_GEOMETRY[side].defaultWidth;
}
