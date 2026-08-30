import { describe, expect, it } from 'vitest';

import {
    codexFirstContrastRatio,
    resolveCodexFirstAppearanceEvidence,
    resolveCodexFirstDesktopLayout,
    resolveCodexFirstMotionDuration,
} from './codexFirstDesktopHardening';

describe('Codex-first responsive desktop layout', () => {
    it('keeps the packaged desktop shell at the configured 720pt minimum and collapses right first', () => {
        expect(resolveCodexFirstDesktopLayout({
            codexFirstEnabled: true,
            legacyDesktopLayout: false,
            rightWorkspaceRequested: true,
            windowWidth: 720,
            zenMode: false,
        })).toEqual({
            collapsePriority: ['right-workspace', 'left-navigation'],
            desktopShell: true,
            leftNavigation: 'persistent',
            mainMinimumWidth: 500,
            rightWorkspace: 'unavailable',
            tier: 'narrow',
        });
    });

    it('admits the requested right workspace at the exact standard threshold', () => {
        expect(resolveCodexFirstDesktopLayout({
            codexFirstEnabled: true,
            legacyDesktopLayout: false,
            rightWorkspaceRequested: true,
            windowWidth: 1100,
            zenMode: false,
        })).toMatchObject({
            desktopShell: true,
            leftNavigation: 'persistent',
            mainMinimumWidth: 600,
            rightWorkspace: 'visible',
            tier: 'standard',
        });
    });

    it('uses the reference tier at 1470pt and preserves requested panels through zen collapse', () => {
        expect(resolveCodexFirstDesktopLayout({
            codexFirstEnabled: true,
            legacyDesktopLayout: false,
            rightWorkspaceRequested: true,
            windowWidth: 1470,
            zenMode: true,
        })).toMatchObject({
            leftNavigation: 'zen-collapsed',
            rightWorkspace: 'zen-collapsed',
            tier: 'wide',
        });
    });

    it('defers unchanged standalone Web/mobile layout to the legacy device decision', () => {
        expect(resolveCodexFirstDesktopLayout({
            codexFirstEnabled: false,
            legacyDesktopLayout: false,
            rightWorkspaceRequested: true,
            windowWidth: 1470,
            zenMode: false,
        })).toMatchObject({
            desktopShell: false,
            leftNavigation: 'legacy',
            rightWorkspace: 'legacy',
        });
    });
});

describe('Codex-first appearance and motion evidence', () => {
    it('labels light as reference-backed and dark/adaptive-dark as a Happy adaptation', () => {
        expect(resolveCodexFirstAppearanceEvidence({
            systemIsDark: true,
            themePreference: 'light',
        })).toEqual({ evidence: 'codex-reference', scheme: 'light' });
        expect(resolveCodexFirstAppearanceEvidence({
            systemIsDark: true,
            themePreference: 'adaptive',
        })).toEqual({ evidence: 'happy-adaptation', scheme: 'dark' });
        expect(resolveCodexFirstAppearanceEvidence({
            systemIsDark: false,
            themePreference: 'dark',
        })).toEqual({ evidence: 'happy-adaptation', scheme: 'dark' });
    });

    it('suppresses packaged Codex-first motion when the system requests it without changing legacy timing', () => {
        expect(resolveCodexFirstMotionDuration({
            codexFirstEnabled: true,
            duration: 200,
            reduceMotion: true,
        })).toBe(0);
        expect(resolveCodexFirstMotionDuration({
            codexFirstEnabled: true,
            duration: 200,
            reduceMotion: false,
        })).toBe(200);
        expect(resolveCodexFirstMotionDuration({
            codexFirstEnabled: false,
            duration: 200,
            reduceMotion: true,
        })).toBe(200);
    });

    it('keeps primary and secondary light/dark text pairs above WCAG AA normal-text contrast', () => {
        expect(codexFirstContrastRatio('#1A1C1F', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
        expect(codexFirstContrastRatio('#6F7277', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
        expect(codexFirstContrastRatio('#F5F5F5', '#232426')).toBeGreaterThanOrEqual(4.5);
        expect(codexFirstContrastRatio('#A4A7AC', '#232426')).toBeGreaterThanOrEqual(4.5);
    });
});
