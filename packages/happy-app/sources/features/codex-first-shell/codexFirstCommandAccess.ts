type ResolveDesktopCommandPaletteAccessInput = {
    codexFirstEnabled: boolean;
    isAuthenticated: boolean;
    platformOS: string;
    settingEnabled: boolean;
};

export function resolveDesktopCommandPaletteAccess({
    codexFirstEnabled,
    isAuthenticated,
    platformOS,
    settingEnabled,
}: ResolveDesktopCommandPaletteAccessInput): boolean {
    return platformOS === 'web'
        && isAuthenticated
        && (codexFirstEnabled || settingEnabled);
}
