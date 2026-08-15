import { describe, expect, it, vi } from 'vitest';
import {
    getStudioRightPanelVisible,
    setStudioRightPanelVisible,
    subscribeStudioRightPanelVisible,
} from './studioPanelResizeVisibility';

describe('Studio right-panel visibility signal', () => {
    it('notifies the left host only when actual visibility changes', () => {
        setStudioRightPanelVisible(false);
        const listener = vi.fn();
        const unsubscribe = subscribeStudioRightPanelVisible(listener);

        setStudioRightPanelVisible(true);
        setStudioRightPanelVisible(true);
        expect(getStudioRightPanelVisible()).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        setStudioRightPanelVisible(false);
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
