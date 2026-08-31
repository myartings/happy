const RIGHT_SIDEBAR_MIN_WINDOW_WIDTH = 1100;
const RIGHT_SIDEBAR_MIN_WIDTH = 250;
const RIGHT_SIDEBAR_MAX_WIDTH = 360;
const MAIN_CONTENT_MIN_WIDTH = 600;

type NewSessionSidebarLayoutInput = {
    codexFirstEnabled?: boolean;
    platform: 'web' | 'ios' | 'android' | 'macos' | 'windows';
    isMac: boolean;
    fileDiffsSidebarEnabled: boolean;
    zenMode: boolean;
    windowWidth: number;
    leftSidebarWidth?: number;
};

export function getNewSessionSidebarLayout(input: NewSessionSidebarLayoutInput) {
    const leftSidebarWidth = Math.max(
        0,
        Number.isFinite(input.leftSidebarWidth) ? input.leftSidebarWidth ?? 0 : 0,
    );
    const desiredSidebarWidth = Math.min(
        Math.max(Math.floor(input.windowWidth * 0.3), RIGHT_SIDEBAR_MIN_WIDTH),
        RIGHT_SIDEBAR_MAX_WIDTH,
    );
    const availableSidebarWidth = input.windowWidth - leftSidebarWidth - MAIN_CONTENT_MIN_WIDTH;
    const sidebarWidth = Math.min(
        desiredSidebarWidth,
        Math.max(RIGHT_SIDEBAR_MIN_WIDTH, availableSidebarWidth),
    );
    const canShowSidebar = (input.codexFirstEnabled || input.fileDiffsSidebarEnabled)
        && (input.isMac || input.platform === 'web')
        && input.windowWidth >= RIGHT_SIDEBAR_MIN_WINDOW_WIDTH
        && availableSidebarWidth >= RIGHT_SIDEBAR_MIN_WIDTH;
    const showSidebar = canShowSidebar && !input.zenMode;

    return { canShowSidebar, showSidebar, sidebarWidth };
}
