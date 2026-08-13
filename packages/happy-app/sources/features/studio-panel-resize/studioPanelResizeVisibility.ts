import * as React from 'react';

let rightPanelVisible = false;
const listeners = new Set<() => void>();

export function getStudioRightPanelVisible(): boolean {
    return rightPanelVisible;
}

export function subscribeStudioRightPanelVisible(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function setStudioRightPanelVisible(visible: boolean): void {
    if (rightPanelVisible === visible) return;
    rightPanelVisible = visible;
    listeners.forEach((listener) => listener());
}

export function useStudioRightPanelVisible(): boolean {
    return React.useSyncExternalStore(
        subscribeStudioRightPanelVisible,
        getStudioRightPanelVisible,
        getStudioRightPanelVisible,
    );
}
