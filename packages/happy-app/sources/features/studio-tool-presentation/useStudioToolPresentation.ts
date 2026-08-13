import * as React from 'react';
import { useUnistyles } from 'react-native-unistyles';

import { useLocalSetting } from '@/sync/storage';
import { isTauri } from '@/utils/isTauri';

import { resolveStudioToolPresentation } from './studioToolPresentation';

export function useStudioToolPresentation() {
    const requestedStyle = useLocalSetting('visualStyle');
    const { theme } = useUnistyles();
    const isTauriRuntime = isTauri();

    return React.useMemo(() => resolveStudioToolPresentation({
        dark: theme.dark,
        isTauriRuntime,
        previewStyle: process.env.EXPO_PUBLIC_HAPPY_VISUAL_STYLE,
        requestedStyle,
    }), [isTauriRuntime, requestedStyle, theme.dark]);
}
