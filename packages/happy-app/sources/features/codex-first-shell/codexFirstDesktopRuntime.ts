import type { VisualStyle } from '../studio-visual-style/studioVisualStyle';

import {
    resolveCodexFirstDesktopContract,
    resolveCodexFirstRollbackRequested,
    resolveDesktopHostPlatform,
    type CodexFirstDesktopContract,
} from './codexFirstDesktopContract';

export const CODEX_FIRST_ROLLBACK_BUILD_VARIABLE = 'EXPO_PUBLIC_HAPPY_CODEX_FIRST';

type ResolveCodexFirstDesktopRuntimeInput = {
    isTauriRuntime: boolean;
    navigatorPlatform?: string | null;
    requestedVisualStyle: VisualStyle;
    rollbackBuildValue?: string;
    userAgent?: string | null;
};

export function resolveCodexFirstDesktopRuntime({
    isTauriRuntime,
    navigatorPlatform,
    requestedVisualStyle,
    rollbackBuildValue,
    userAgent,
}: ResolveCodexFirstDesktopRuntimeInput): CodexFirstDesktopContract {
    return resolveCodexFirstDesktopContract({
        hostPlatform: resolveDesktopHostPlatform({ navigatorPlatform, userAgent }),
        isTauriRuntime,
        requestedVisualStyle,
        rollbackRequested: resolveCodexFirstRollbackRequested(rollbackBuildValue),
    });
}
