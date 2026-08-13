import type { DesktopSessionRowStyle } from './studioVisualStyle';

export type StudioSidebarGroupPresentation = 'card' | 'unboxed';

export function resolveStudioSidebarGroupPresentation(
    sessionRowStyle: Pick<DesktopSessionRowStyle, 'showCardSurface'>,
): StudioSidebarGroupPresentation {
    return sessionRowStyle.showCardSurface ? 'card' : 'unboxed';
}
