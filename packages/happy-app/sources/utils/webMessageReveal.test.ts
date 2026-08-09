import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { revealWebMessage } from './webMessageReveal';

describe('revealWebMessage', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('keeps retrying until a delayed virtualized row mounts', () => {
        const scrollIntoView = vi.fn();
        const getElementById = vi.fn()
            .mockReturnValueOnce(null)
            .mockReturnValueOnce(null)
            .mockReturnValue({ scrollIntoView });
        vi.stubGlobal('document', { getElementById });

        const cancel = revealWebMessage('message-target-delayed');
        vi.advanceTimersByTime(200);

        expect(getElementById).toHaveBeenCalledTimes(3);
        expect(scrollIntoView).toHaveBeenCalledWith({
            behavior: 'auto',
            block: 'center',
            inline: 'nearest',
        });

        cancel();
    });

    it('cancels stale retries when a newer navigation supersedes them', () => {
        const oldScrollIntoView = vi.fn();
        const newScrollIntoView = vi.fn();
        vi.stubGlobal('document', {
            getElementById: vi.fn((id: string) => ({
                scrollIntoView: id === 'message-target-old' ? oldScrollIntoView : newScrollIntoView,
            })),
        });

        const cancelOld = revealWebMessage('message-target-old');
        vi.advanceTimersByTime(100);
        cancelOld();
        const cancelNew = revealWebMessage('message-target-new');
        vi.runAllTimers();

        expect(oldScrollIntoView).toHaveBeenCalledTimes(2);
        expect(newScrollIntoView).toHaveBeenCalledTimes(30);

        cancelNew();
    });
});
