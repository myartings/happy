import { describe, expect, it } from 'vitest';

import {
    resolveCodexFirstDesktopContract,
    resolveCodexFirstRollbackRequested,
    resolveDesktopHostPlatform,
} from './codexFirstDesktopContract';

describe('resolveCodexFirstDesktopContract', () => {
    it('makes the customized Codex shell the default for packaged macOS', () => {
        expect(resolveCodexFirstDesktopContract({
            hostPlatform: 'macos',
            isTauriRuntime: true,
        })).toMatchObject({
            enabled: true,
            experience: 'codex-first',
            product: {
                name: 'Happy Codex',
                customization: 'Happy',
                reference: 'Codex',
            },
            navigation: {
                defaultSessionOrganization: 'project-first',
                notificationsVisible: true,
                searchVisible: true,
            },
            rollback: {
                active: false,
                available: true,
            },
        });
    });

    it('enables Codex-first for packaged Windows without changing Linux or standalone clients', () => {
        expect(resolveCodexFirstDesktopContract({
            hostPlatform: 'linux',
            isTauriRuntime: true,
        })).toMatchObject({
            enabled: false,
            experience: 'legacy-happy',
            rollback: {
                active: false,
                available: false,
            },
        });

        expect(resolveCodexFirstDesktopContract({
            hostPlatform: 'macos',
            isTauriRuntime: false,
        })).toMatchObject({
            enabled: false,
            experience: 'legacy-happy',
            rollback: {
                active: false,
                available: false,
            },
        });

        expect(resolveCodexFirstDesktopContract({
            hostPlatform: 'windows',
            isTauriRuntime: true,
        })).toMatchObject({
            enabled: true,
            experience: 'codex-first',
            product: {
                name: 'Happy Codex',
            },
            rollback: {
                active: false,
                available: true,
            },
        });
    });

    it('reuses Studio primitives on packaged desktop without leaking them to standalone clients', () => {
        expect(resolveCodexFirstDesktopContract({
            hostPlatform: 'macos',
            isTauriRuntime: true,
            requestedVisualStyle: 'default',
        })).toMatchObject({
            presentation: {
                usesStudioPrimitives: true,
                visualStyle: 'studio',
            },
        });

        expect(resolveCodexFirstDesktopContract({
            hostPlatform: 'linux',
            isTauriRuntime: true,
            requestedVisualStyle: 'default',
        })).toMatchObject({
            enabled: false,
            experience: 'legacy-happy',
            presentation: {
                usesStudioPrimitives: true,
                visualStyle: 'studio',
            },
        });

        expect(resolveCodexFirstDesktopContract({
            hostPlatform: 'macos',
            isTauriRuntime: false,
            requestedVisualStyle: 'studio',
        })).toMatchObject({
            enabled: false,
            experience: 'legacy-happy',
            presentation: {
                usesStudioPrimitives: false,
                visualStyle: 'default',
            },
        });
    });

    it('identifies the native Tauri host from browser platform signals', () => {
        expect(resolveDesktopHostPlatform({ navigatorPlatform: 'MacIntel' })).toBe('macos');
        expect(resolveDesktopHostPlatform({ navigatorPlatform: 'Win32' })).toBe('windows');
        expect(resolveDesktopHostPlatform({ navigatorPlatform: 'Linux x86_64' })).toBe('linux');
        expect(resolveDesktopHostPlatform({
            navigatorPlatform: '',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        })).toBe('macos');
        expect(resolveDesktopHostPlatform({ navigatorPlatform: 'iPhone' })).toBe('unknown');
    });

    it('supports an explicit development rollback without changing stored presentation data', () => {
        expect(resolveCodexFirstRollbackRequested('0')).toBe(true);
        expect(resolveCodexFirstRollbackRequested(undefined)).toBe(false);
        expect(resolveCodexFirstRollbackRequested('1')).toBe(false);

        expect(resolveCodexFirstDesktopContract({
            hostPlatform: 'macos',
            isTauriRuntime: true,
            requestedVisualStyle: 'studio',
            rollbackRequested: true,
        })).toMatchObject({
            enabled: false,
            experience: 'legacy-happy',
            presentation: {
                usesStudioPrimitives: true,
                visualStyle: 'studio',
            },
            product: {
                name: 'Happy',
            },
            rollback: {
                active: true,
                available: true,
            },
        });
    });

    it('defines a truthful Happy destination family for the Codex-first shell', () => {
        const contract = resolveCodexFirstDesktopContract({
            hostPlatform: 'macos',
            isTauriRuntime: true,
        });

        expect(contract.navigation.destinations).toEqual([
            { availability: 'always', id: 'new-session' },
            { availability: 'project-todos', id: 'tasks' },
            { availability: 'github-issues', id: 'issues' },
            { availability: 'always', id: 'artifacts' },
            { availability: 'always', id: 'machines-agents' },
        ]);
    });

    it('reuses the accepted resizable panel geometry for the Codex-like regions', () => {
        expect(resolveCodexFirstDesktopContract({
            hostPlatform: 'macos',
            isTauriRuntime: true,
        }).regions).toEqual({
            leftNavigation: {
                defaultWidth: 275,
                maxWidth: 420,
                minWidth: 220,
                persistentAtStandardWidth: true,
                resizable: true,
            },
            main: {
                minUsableWidth: 600,
            },
            rightWorkspace: {
                defaultWidth: 360,
                maxWidth: 520,
                minWidth: 280,
                optional: true,
                resizable: true,
            },
            titleBarSafeAreaOwner: 'shell',
        });
    });
});
