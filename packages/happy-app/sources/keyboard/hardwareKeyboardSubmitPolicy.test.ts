import { describe, expect, it } from 'vitest';
import { resolveHardwareReturnAction } from './hardwareKeyboardSubmitPolicy';

describe('resolveHardwareReturnAction', () => {
    it('routes an Apple-native hardware Return to send', () => {
        expect(resolveHardwareReturnAction({ platform: 'ios', hasSuggestions: false })).toBe('send');
    });

    it('selects autocomplete before sending', () => {
        expect(resolveHardwareReturnAction({ platform: 'ios', hasSuggestions: true })).toBe('select-suggestion');
    });

    it.each(['android', 'web', 'windows', 'macos'] as const)(
        'leaves %s behavior unchanged',
        (platform) => {
            expect(resolveHardwareReturnAction({ platform, hasSuggestions: false })).toBe('ignore');
        },
    );
});
