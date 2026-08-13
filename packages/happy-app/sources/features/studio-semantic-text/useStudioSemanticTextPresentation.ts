import * as React from 'react';
import { useUnistyles } from 'react-native-unistyles';

import { useLocalSetting } from '@/sync/storage';
import { isTauri } from '@/utils/isTauri';

import { resolveStudioSemanticTextPresentation } from './studioSemanticTextPresentation';

export function useStudioSemanticTextPresentation() {
    const requestedStyle = useLocalSetting('visualStyle');
    const { theme } = useUnistyles();
    const isTauriRuntime = isTauri();

    return React.useMemo(() => resolveStudioSemanticTextPresentation({
        isTauriRuntime,
        requestedStyle,
        previewStyle: process.env.EXPO_PUBLIC_HAPPY_VISUAL_STYLE,
        dark: theme.dark,
    }), [isTauriRuntime, requestedStyle, theme.dark]);
}
