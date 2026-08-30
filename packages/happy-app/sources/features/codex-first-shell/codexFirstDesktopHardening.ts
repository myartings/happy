const RIGHT_WORKSPACE_MIN_WIDTH = 1100;
const REFERENCE_WINDOW_WIDTH = 1470;
const NARROW_LEFT_NAVIGATION_WIDTH = 220;
const STANDARD_MAIN_MINIMUM_WIDTH = 600;
const NARROW_MAIN_FLOOR = 320;

export type CodexFirstDesktopLayoutTier = 'narrow' | 'standard' | 'wide';

export type CodexFirstDesktopLayout = Readonly<{
    collapsePriority: readonly ['right-workspace', 'left-navigation'];
    desktopShell: boolean;
    leftNavigation: 'legacy' | 'persistent' | 'zen-collapsed';
    mainMinimumWidth: number;
    rightWorkspace: 'legacy' | 'unavailable' | 'collapsed' | 'visible' | 'zen-collapsed';
    tier: CodexFirstDesktopLayoutTier;
}>;

export function resolveCodexFirstDesktopLayout({
    codexFirstEnabled,
    legacyDesktopLayout,
    rightWorkspaceRequested,
    windowWidth,
    zenMode,
}: Readonly<{
    codexFirstEnabled: boolean;
    legacyDesktopLayout: boolean;
    rightWorkspaceRequested: boolean;
    windowWidth: number;
    zenMode: boolean;
}>): CodexFirstDesktopLayout {
    const safeWindowWidth = Math.max(0, Number.isFinite(windowWidth) ? windowWidth : 0);
    const tier: CodexFirstDesktopLayoutTier = safeWindowWidth >= REFERENCE_WINDOW_WIDTH
        ? 'wide'
        : safeWindowWidth >= RIGHT_WORKSPACE_MIN_WIDTH
            ? 'standard'
            : 'narrow';

    if (!codexFirstEnabled) {
        return {
            collapsePriority: ['right-workspace', 'left-navigation'],
            desktopShell: legacyDesktopLayout,
            leftNavigation: 'legacy',
            mainMinimumWidth: STANDARD_MAIN_MINIMUM_WIDTH,
            rightWorkspace: 'legacy',
            tier,
        };
    }

    const rightWorkspace = zenMode && rightWorkspaceRequested
        ? 'zen-collapsed'
        : tier === 'narrow'
            ? 'unavailable'
            : rightWorkspaceRequested
                ? 'visible'
                : 'collapsed';

    return {
        collapsePriority: ['right-workspace', 'left-navigation'],
        desktopShell: true,
        leftNavigation: zenMode ? 'zen-collapsed' : 'persistent',
        mainMinimumWidth: tier === 'narrow'
            ? Math.max(
                NARROW_MAIN_FLOOR,
                Math.min(STANDARD_MAIN_MINIMUM_WIDTH, safeWindowWidth - NARROW_LEFT_NAVIGATION_WIDTH),
            )
            : STANDARD_MAIN_MINIMUM_WIDTH,
        rightWorkspace,
        tier,
    };
}

export function resolveCodexFirstAppearanceEvidence({
    systemIsDark,
    themePreference,
}: Readonly<{
    systemIsDark: boolean;
    themePreference: 'light' | 'dark' | 'adaptive';
}>): Readonly<{
    evidence: 'codex-reference' | 'happy-adaptation';
    scheme: 'light' | 'dark';
}> {
    const scheme = themePreference === 'adaptive'
        ? systemIsDark ? 'dark' : 'light'
        : themePreference;
    return {
        evidence: scheme === 'light' ? 'codex-reference' : 'happy-adaptation',
        scheme,
    };
}

export function resolveCodexFirstMotionDuration({
    codexFirstEnabled,
    duration,
    reduceMotion,
}: Readonly<{
    codexFirstEnabled: boolean;
    duration: number;
    reduceMotion: boolean;
}>): number {
    if (codexFirstEnabled && reduceMotion) return 0;
    return Math.max(0, Number.isFinite(duration) ? duration : 0);
}

function relativeLuminance(hexColor: string): number {
    const normalized = hexColor.trim().replace(/^#/, '');
    if (!/^[0-9a-f]{6}$/i.test(normalized)) {
        throw new Error(`Expected a six-digit hex color, received ${hexColor}`);
    }
    const channels = [0, 2, 4].map((offset) => (
        Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255
    )).map((channel) => (
        channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4
    ));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function codexFirstContrastRatio(foreground: string, background: string): number {
    const foregroundLuminance = relativeLuminance(foreground);
    const backgroundLuminance = relativeLuminance(background);
    const lighter = Math.max(foregroundLuminance, backgroundLuminance);
    const darker = Math.min(foregroundLuminance, backgroundLuminance);
    return (lighter + 0.05) / (darker + 0.05);
}
