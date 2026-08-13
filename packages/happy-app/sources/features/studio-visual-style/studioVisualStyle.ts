export type VisualStyle = 'default' | 'studio';

export type DesktopSidebarFrame = {
    visualStyle: VisualStyle;
    width: number;
    sidebarBackground: string;
    canvasBackground: string;
    dividerColor: string;
    dividerWidth: number;
};

export type DesktopSessionRowStyle = {
    visualStyle: VisualStyle;
    height: number | null;
    horizontalInset: number | null;
    horizontalPadding: number | null;
    verticalPadding: number | null;
    gap: number | null;
    leadingIndicatorWidth: number | null;
    leadingIndicatorGap: number | null;
    metadataInset: number | null;
    titleFontSize: number | null;
    titleLineHeight: number | null;
    titleFontWeight: '400' | '600' | null;
    primaryMetadataFontSize: number | null;
    secondaryMetadataFontSize: number | null;
    cornerRadius: number | null;
    selectedBackground: string | null;
    showCardSurface: boolean;
    showGroupShellBoundary: boolean;
    showRowDividers: boolean;
    showShadow: boolean;
};

export type DesktopTopControlsStyle = {
    visualStyle: VisualStyle;
    controlHeight: number | null;
    archiveWidth: number | null;
    cornerRadius: number | null;
    groupGap: number | null;
    contentGap: number | null;
    horizontalPadding: number | null;
    showRestingBorder: boolean;
    showRestingSurface: boolean;
    showShadow: boolean;
};

export type DesktopTodoRowStyle = {
    visualStyle: VisualStyle;
    height: number | null;
    cornerRadius: number | null;
    horizontalPadding: number | null;
    contentGap: number | null;
    showRestingBorder: boolean;
    showRestingSurface: boolean;
    showShadow: boolean;
};

export type DesktopSectionHeaderStyle = {
    visualStyle: VisualStyle;
    fontSize: number | null;
    lineHeight: number | null;
    fontWeight: '500' | null;
    horizontalPadding: number | null;
    topPadding: number | null;
    bottomPadding: number | null;
};

export type DesktopSidebarFooterStyle = {
    visualStyle: VisualStyle;
    height: number | null;
    horizontalPadding: number | null;
    contentGap: number | null;
    iconSize: number | null;
    labelFontSize: number | null;
};

type ResolveDesktopVisualStyleInput = {
    isTauriRuntime: boolean;
    requestedStyle: VisualStyle;
    previewStyle?: string;
};

type ResolveDesktopSidebarFrameInput = ResolveDesktopVisualStyleInput & {
    windowWidth: number;
};

const DEFAULT_MIN_SIDEBAR_WIDTH = 250;
const DEFAULT_MAX_SIDEBAR_WIDTH = 360;
const DEFAULT_SIDEBAR_RATIO = 0.3;
const STUDIO_REFERENCE_WINDOW_WIDTH = 1470;
const STUDIO_REFERENCE_SIDEBAR_WIDTH = 316;
const STUDIO_SIDEBAR_RATIO = STUDIO_REFERENCE_SIDEBAR_WIDTH / STUDIO_REFERENCE_WINDOW_WIDTH;

function clampSidebarWidth(width: number): number {
    return Math.min(Math.max(Math.floor(width), DEFAULT_MIN_SIDEBAR_WIDTH), DEFAULT_MAX_SIDEBAR_WIDTH);
}

export function resolveDesktopVisualStyle({
    isTauriRuntime,
    requestedStyle,
    previewStyle,
}: ResolveDesktopVisualStyleInput): VisualStyle {
    if (!isTauriRuntime) return 'default';
    if (previewStyle === 'studio') return 'studio';
    if (previewStyle === 'default') return 'default';
    return requestedStyle;
}

export function resolveDesktopSidebarFrame({
    windowWidth,
    isTauriRuntime,
    requestedStyle,
    previewStyle,
}: ResolveDesktopSidebarFrameInput): DesktopSidebarFrame {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        requestedStyle,
        previewStyle,
    });

    if (visualStyle === 'studio') {
        return {
            visualStyle,
            width: clampSidebarWidth(windowWidth * STUDIO_SIDEBAR_RATIO),
            sidebarBackground: '#F6F7F7',
            canvasBackground: '#FFFFFF',
            dividerColor: '#E5E5E6',
            dividerWidth: 1,
        };
    }

    return {
        visualStyle,
        width: clampSidebarWidth(windowWidth * DEFAULT_SIDEBAR_RATIO),
        sidebarBackground: '#FFFFFF',
        canvasBackground: '#FFFFFF',
        dividerColor: 'transparent',
        dividerWidth: 0,
    };
}

export function resolveDesktopSessionRowStyle({
    isTauriRuntime,
    requestedStyle,
    previewStyle,
}: ResolveDesktopVisualStyleInput): DesktopSessionRowStyle {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        requestedStyle,
        previewStyle,
    });

    if (visualStyle === 'studio') {
        return {
            visualStyle,
            height: 58,
            horizontalInset: 12,
            horizontalPadding: 12,
            verticalPadding: 4,
            gap: 2,
            leadingIndicatorWidth: 10,
            leadingIndicatorGap: 6,
            metadataInset: 16,
            titleFontSize: 13,
            titleLineHeight: 17,
            titleFontWeight: '400',
            primaryMetadataFontSize: 11,
            secondaryMetadataFontSize: 10,
            cornerRadius: 7,
            selectedBackground: '#E8EAEA',
            showCardSurface: false,
            showGroupShellBoundary: false,
            showRowDividers: false,
            showShadow: false,
        };
    }

    return {
        visualStyle,
        height: null,
        horizontalInset: null,
        horizontalPadding: null,
        verticalPadding: null,
        gap: null,
        leadingIndicatorWidth: null,
        leadingIndicatorGap: null,
        metadataInset: null,
        titleFontSize: null,
        titleLineHeight: null,
        titleFontWeight: null,
        primaryMetadataFontSize: null,
        secondaryMetadataFontSize: null,
        cornerRadius: null,
        selectedBackground: null,
        showCardSurface: true,
        showGroupShellBoundary: true,
        showRowDividers: true,
        showShadow: true,
    };
}

export function resolveDesktopTopControlsStyle({
    isTauriRuntime,
    requestedStyle,
    previewStyle,
}: ResolveDesktopVisualStyleInput): DesktopTopControlsStyle {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        requestedStyle,
        previewStyle,
    });

    if (visualStyle === 'studio') {
        return {
            visualStyle,
            controlHeight: 36,
            archiveWidth: 36,
            cornerRadius: 7,
            groupGap: 2,
            contentGap: 6,
            horizontalPadding: 12,
            showRestingBorder: false,
            showRestingSurface: false,
            showShadow: false,
        };
    }

    return {
        visualStyle,
        controlHeight: null,
        archiveWidth: null,
        cornerRadius: null,
        groupGap: null,
        contentGap: null,
        horizontalPadding: null,
        showRestingBorder: true,
        showRestingSurface: true,
        showShadow: true,
    };
}

export function resolveDesktopTodoRowStyle({
    isTauriRuntime,
    requestedStyle,
    previewStyle,
}: ResolveDesktopVisualStyleInput): DesktopTodoRowStyle {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        requestedStyle,
        previewStyle,
    });

    if (visualStyle === 'studio') {
        return {
            visualStyle,
            height: 36,
            cornerRadius: 7,
            horizontalPadding: 12,
            contentGap: 4,
            showRestingBorder: false,
            showRestingSurface: false,
            showShadow: false,
        };
    }

    return {
        visualStyle,
        height: null,
        cornerRadius: null,
        horizontalPadding: null,
        contentGap: null,
        showRestingBorder: true,
        showRestingSurface: true,
        showShadow: true,
    };
}

export function resolveDesktopSectionHeaderStyle({
    isTauriRuntime,
    requestedStyle,
    previewStyle,
}: ResolveDesktopVisualStyleInput): DesktopSectionHeaderStyle {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        requestedStyle,
        previewStyle,
    });

    if (visualStyle === 'studio') {
        return {
            visualStyle,
            fontSize: 11,
            lineHeight: 15,
            fontWeight: '500',
            horizontalPadding: 18,
            topPadding: 10,
            bottomPadding: 4,
        };
    }

    return {
        visualStyle,
        fontSize: null,
        lineHeight: null,
        fontWeight: null,
        horizontalPadding: null,
        topPadding: null,
        bottomPadding: null,
    };
}

export function resolveDesktopSidebarFooterStyle({
    isTauriRuntime,
    requestedStyle,
    previewStyle,
}: ResolveDesktopVisualStyleInput): DesktopSidebarFooterStyle {
    const visualStyle = resolveDesktopVisualStyle({
        isTauriRuntime,
        requestedStyle,
        previewStyle,
    });

    if (visualStyle === 'studio') {
        return {
            visualStyle,
            height: 44,
            horizontalPadding: 18,
            contentGap: 9,
            iconSize: 17,
            labelFontSize: 13,
        };
    }

    return {
        visualStyle,
        height: null,
        horizontalPadding: null,
        contentGap: null,
        iconSize: null,
        labelFontSize: null,
    };
}
