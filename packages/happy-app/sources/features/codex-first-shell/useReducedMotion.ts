import * as React from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

function readWebReducedMotion(): boolean {
    return Platform.OS === 'web'
        && typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * A small platform adapter that keeps packaged Web/Tauri checks synchronous
 * while following the native accessibility setting on iOS and Android.
 */
export function useReducedMotion(): boolean {
    const [reduceMotion, setReduceMotion] = React.useState(readWebReducedMotion);

    React.useEffect(() => {
        if (Platform.OS === 'web') {
            if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            const handleChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
            setReduceMotion(mediaQuery.matches);
            mediaQuery.addEventListener?.('change', handleChange);
            return () => mediaQuery.removeEventListener?.('change', handleChange);
        }

        let active = true;
        AccessibilityInfo?.isReduceMotionEnabled?.().then((enabled) => {
            if (active) setReduceMotion(enabled);
        });
        const subscription = AccessibilityInfo?.addEventListener?.(
            'reduceMotionChanged',
            setReduceMotion,
        );
        return () => {
            active = false;
            subscription?.remove?.();
        };
    }, []);

    return reduceMotion;
}
