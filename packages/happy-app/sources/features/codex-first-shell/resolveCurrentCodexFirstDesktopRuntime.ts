import { isTauri } from '@/utils/isTauri';
import type { VisualStyle } from '../studio-visual-style/studioVisualStyle';

import type { CodexFirstDesktopContract } from './codexFirstDesktopContract';
import { resolveCodexFirstDesktopRuntime } from './codexFirstDesktopRuntime';

export function resolveCurrentCodexFirstDesktopRuntime(
    requestedVisualStyle: VisualStyle,
): CodexFirstDesktopContract {
    const currentNavigator = typeof navigator === 'undefined' ? undefined : navigator;

    return resolveCodexFirstDesktopRuntime({
        isTauriRuntime: isTauri(),
        navigatorPlatform: currentNavigator?.platform,
        requestedVisualStyle,
        rollbackBuildValue: process.env.EXPO_PUBLIC_HAPPY_CODEX_FIRST,
        userAgent: currentNavigator?.userAgent,
    });
}
