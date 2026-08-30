import type { PropsWithChildren } from 'react';

export type HardwareKeyboardCommandBoundaryProps = PropsWithChildren<{
    onHardwareReturn: () => void;
}>;

export function HardwareKeyboardCommandBoundary({ children }: HardwareKeyboardCommandBoundaryProps) {
    return <>{children}</>;
}
