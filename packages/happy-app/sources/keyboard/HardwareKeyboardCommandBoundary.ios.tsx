import { HardwareKeyboardCommandView } from '../../modules/hardware-keyboard-command';
import type { HardwareKeyboardCommandBoundaryProps } from './HardwareKeyboardCommandBoundary';

export function HardwareKeyboardCommandBoundary({
    children,
    onHardwareReturn,
}: HardwareKeyboardCommandBoundaryProps) {
    if (!HardwareKeyboardCommandView) {
        return <>{children}</>;
    }

    return (
        <HardwareKeyboardCommandView
            collapsable={false}
            onHardwareReturn={onHardwareReturn}
            style={{ width: '100%' }}
        >
            {children}
        </HardwareKeyboardCommandView>
    );
}
