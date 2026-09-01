import { describe, expect, it } from 'vitest';
import { resolveDesktopCommandPaletteAccess } from './codexFirstCommandAccess';

describe('Codex-first command palette access', () => {
    it('makes search available by default in the authenticated Codex-first desktop shell', () => {
        expect(resolveDesktopCommandPaletteAccess({
            codexFirstEnabled: true,
            isAuthenticated: true,
            platformOS: 'web',
            settingEnabled: false,
        })).toBe(true);
    });

    it('preserves the existing opt-in outside the Codex-first shell', () => {
        expect(resolveDesktopCommandPaletteAccess({
            codexFirstEnabled: false,
            isAuthenticated: true,
            platformOS: 'web',
            settingEnabled: false,
        })).toBe(false);
        expect(resolveDesktopCommandPaletteAccess({
            codexFirstEnabled: false,
            isAuthenticated: true,
            platformOS: 'web',
            settingEnabled: true,
        })).toBe(true);
    });

    it('does not expose the desktop command surface before authentication or on native clients', () => {
        expect(resolveDesktopCommandPaletteAccess({
            codexFirstEnabled: true,
            isAuthenticated: false,
            platformOS: 'web',
            settingEnabled: true,
        })).toBe(false);
        expect(resolveDesktopCommandPaletteAccess({
            codexFirstEnabled: true,
            isAuthenticated: true,
            platformOS: 'ios',
            settingEnabled: true,
        })).toBe(false);
    });
});
