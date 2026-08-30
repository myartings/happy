import { describe, expect, it } from 'vitest';

import { resolveCodexFirstDesktopRuntime } from './codexFirstDesktopRuntime';

describe('resolveCodexFirstDesktopRuntime', () => {
    it('composes Tauri, host, appearance, and build rollback signals', () => {
        expect(resolveCodexFirstDesktopRuntime({
            isTauriRuntime: true,
            navigatorPlatform: 'MacIntel',
            requestedVisualStyle: 'default',
        })).toMatchObject({
            enabled: true,
            hostPlatform: 'macos',
            presentation: { visualStyle: 'studio' },
            rollback: { active: false },
        });

        expect(resolveCodexFirstDesktopRuntime({
            isTauriRuntime: true,
            navigatorPlatform: 'MacIntel',
            requestedVisualStyle: 'studio',
            rollbackBuildValue: '0',
        })).toMatchObject({
            enabled: false,
            experience: 'legacy-happy',
            rollback: { active: true },
        });
    });
});
