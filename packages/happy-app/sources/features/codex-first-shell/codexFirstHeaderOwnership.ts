export type CodexFirstHeaderOwnership = Readonly<{
    hideRouteBackButton: boolean;
    routeHeadersAllowed: boolean;
    showPhoneInboxHeader: boolean;
}>;

export function resolveCodexFirstHeaderOwnership({
    codexFirstEnabled,
    legacyTabletLayout,
}: Readonly<{
    codexFirstEnabled: boolean;
    legacyTabletLayout: boolean;
}>): CodexFirstHeaderOwnership {
    return {
        hideRouteBackButton: codexFirstEnabled || legacyTabletLayout,
        routeHeadersAllowed: !codexFirstEnabled,
        showPhoneInboxHeader: !codexFirstEnabled && !legacyTabletLayout,
    };
}
