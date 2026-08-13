import { useLocalSetting } from '@/sync/storage';
import { isTauri } from '@/utils/isTauri';
import { useUnistyles } from 'react-native-unistyles';

import { resolveStudioOverlayPresentation } from './studioOverlayPresentation';

export function useStudioOverlayPresentation() {
    const requestedStyle = useLocalSetting('visualStyle');
    const { theme } = useUnistyles();

    return resolveStudioOverlayPresentation({
        isDark: theme.dark,
        isTauriRuntime: isTauri(),
        previewStyle: process.env.EXPO_PUBLIC_HAPPY_VISUAL_STYLE,
        requestedStyle,
    });
}
