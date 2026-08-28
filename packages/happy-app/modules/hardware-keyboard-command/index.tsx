import { requireNativeViewManager, requireOptionalNativeModule } from 'expo-modules-core';
import type { PropsWithChildren } from 'react';
import type { ViewProps } from 'react-native';

export type HardwareKeyboardCommandViewProps = PropsWithChildren<ViewProps & {
    onHardwareReturn?: () => void;
}>;

export const HardwareKeyboardCommandView = requireOptionalNativeModule('HardwareKeyboardCommand')
    ? requireNativeViewManager<HardwareKeyboardCommandViewProps>('HardwareKeyboardCommand')
    : null;
