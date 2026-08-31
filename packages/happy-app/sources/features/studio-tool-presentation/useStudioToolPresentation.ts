import * as React from 'react';
import { useUnistyles } from 'react-native-unistyles';

import { resolveCurrentCodexFirstDesktopRuntime } from '@/features/codex-first-shell/resolveCurrentCodexFirstDesktopRuntime';
import { useLocalSetting } from '@/sync/storage';

import { resolveStudioToolPresentation } from './studioToolPresentation';

export function useStudioToolPresentation() {
    const requestedStyle = useLocalSetting('visualStyle');
    const { theme } = useUnistyles();
    const runtime = React.useMemo(
        () => resolveCurrentCodexFirstDesktopRuntime(requestedStyle),
        [requestedStyle],
    );

    return React.useMemo(() => resolveStudioToolPresentation({
        dark: theme.dark,
        isTauriRuntime: runtime.presentation.usesStudioPrimitives,
        previewStyle: process.env.EXPO_PUBLIC_HAPPY_VISUAL_STYLE,
        requestedStyle: runtime.presentation.visualStyle,
    }), [runtime.presentation.usesStudioPrimitives, runtime.presentation.visualStyle, theme.dark]);
}
