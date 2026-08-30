export type HardwareReturnAction = 'send' | 'select-suggestion' | 'ignore';

export function resolveHardwareReturnAction({
    platform,
    hasSuggestions,
}: {
    platform: string;
    hasSuggestions: boolean;
}): HardwareReturnAction {
    if (platform !== 'ios') {
        return 'ignore';
    }

    return hasSuggestions ? 'select-suggestion' : 'send';
}
