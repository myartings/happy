import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const draftHarness = vi.hoisted(() => ({
    addAppStateListener: vi.fn(),
    appStateHandler: null as ((state: string) => void) | null,
    clearDraft: null as (() => void) | null,
    removeAppStateListener: vi.fn(),
    sessions: {} as Record<string, { draft?: string | null }>,
    updateSessionDraft: vi.fn(),
}));

vi.mock('@/sync/storage', () => ({
    storage: {
        getState: () => ({
            sessions: draftHarness.sessions,
            updateSessionDraft: draftHarness.updateSessionDraft,
        }),
    },
}));

vi.mock('@react-navigation/native', () => ({
    useIsFocused: () => true,
}));

vi.mock('react-native', () => ({
    AppState: {
        addEventListener: (event: string, handler: (state: string) => void) => {
            draftHarness.addAppStateListener(event, handler);
            draftHarness.appStateHandler = handler;
            return { remove: draftHarness.removeAppStateListener };
        },
    },
}));

import { useDraft } from './useDraft';

const originalConsoleError = console.error;
let renderer: ReactTestRenderer | null = null;

function DraftHarness({
    sessionId = 'session-1',
    value,
    onChange,
}: {
    sessionId?: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const { clearDraft } = useDraft(sessionId, value, onChange, { autoSaveInterval: 2_000 });
    draftHarness.clearDraft = clearDraft;
    return null;
}

beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    console.error = (...args: unknown[]) => {
        if (typeof args[0] === 'string' && args[0].startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(...args);
    };
});

afterAll(() => {
    console.error = originalConsoleError;
});

beforeEach(() => {
    vi.useFakeTimers();
    draftHarness.sessions = { 'session-1': { draft: null } };
    draftHarness.appStateHandler = null;
    draftHarness.clearDraft = null;
});

afterEach(() => {
    if (renderer) {
        act(() => renderer?.unmount());
        renderer = null;
    }
    vi.clearAllMocks();
    vi.useRealTimers();
});

describe('useDraft', () => {
    it('does not flush an intermediate value while the mounted composer keeps changing', () => {
        const onChange = vi.fn();

        act(() => {
            renderer = create(React.createElement(DraftHarness, { value: '', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'a', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'ab', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'abc', onChange }));
        });

        expect(draftHarness.updateSessionDraft.mock.calls).toEqual([
            ['session-1', 'a'],
        ]);
    });

    it('flushes the latest old-Session value without writing the new Session value into it', () => {
        const onChange = vi.fn();

        act(() => {
            renderer = create(React.createElement(DraftHarness, { value: '', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'draft A', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'draft A latest', onChange }));
        });

        draftHarness.sessions['session-2'] = { draft: 'saved B' };
        act(() => {
            renderer?.update(React.createElement(DraftHarness, {
                sessionId: 'session-2',
                value: 'saved B',
                onChange,
            }));
        });

        expect(draftHarness.updateSessionDraft.mock.calls).toEqual([
            ['session-1', 'draft A'],
            ['session-1', 'draft A latest'],
        ]);
    });

    it('keeps pending values with their own Session during rapid A to B to A navigation', () => {
        const onChange = vi.fn();

        act(() => {
            renderer = create(React.createElement(DraftHarness, { value: '', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'A', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'A latest', onChange }));
        });

        draftHarness.sessions['session-2'] = { draft: 'B saved' };
        act(() => {
            renderer?.update(React.createElement(DraftHarness, {
                sessionId: 'session-2',
                value: 'B saved',
                onChange,
            }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, {
                sessionId: 'session-2',
                value: 'B edited',
                onChange,
            }));
        });

        draftHarness.sessions['session-1'] = { draft: 'A latest' };
        act(() => {
            renderer?.update(React.createElement(DraftHarness, {
                value: 'A latest',
                onChange,
            }));
        });
        act(() => {
            vi.runAllTimers();
        });

        expect(draftHarness.updateSessionDraft.mock.calls).toEqual([
            ['session-1', 'A'],
            ['session-1', 'A latest'],
            ['session-2', 'B edited'],
        ]);
    });

    it('cancels a pending trailing save when the caller clears the draft', () => {
        const onChange = vi.fn();

        act(() => {
            renderer = create(React.createElement(DraftHarness, { value: '', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'a', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'ab', onChange }));
        });
        act(() => {
            draftHarness.clearDraft?.();
        });
        act(() => {
            draftHarness.appStateHandler?.('background');
        });
        act(() => {
            vi.advanceTimersByTime(2_000);
        });

        expect(draftHarness.updateSessionDraft.mock.calls).toEqual([
            ['session-1', 'a'],
            ['session-1', null],
        ]);
    });

    it.each(['background', 'inactive'] as const)(
        'flushes the latest value once when the app becomes %s during a debounce',
        (appState) => {
            const onChange = vi.fn();

            act(() => {
                renderer = create(React.createElement(DraftHarness, { value: '', onChange }));
            });
            act(() => {
                renderer?.update(React.createElement(DraftHarness, { value: 'a', onChange }));
            });
            act(() => {
                renderer?.update(React.createElement(DraftHarness, { value: 'ab', onChange }));
            });
            act(() => {
                draftHarness.appStateHandler?.(appState);
            });
            act(() => {
                vi.advanceTimersByTime(2_000);
            });

            expect(draftHarness.updateSessionDraft.mock.calls).toEqual([
                ['session-1', 'a'],
                ['session-1', 'ab'],
            ]);
        },
    );

    it('hydrates a persisted draft without rewriting the initial empty value', () => {
        const onChange = vi.fn();
        draftHarness.sessions['session-1'] = { draft: 'persisted draft' };

        act(() => {
            renderer = create(React.createElement(DraftHarness, { value: '', onChange }));
        });

        expect(onChange).toHaveBeenCalledWith('persisted draft');
        expect(draftHarness.updateSessionDraft).not.toHaveBeenCalled();
    });

    it('persists a 100-character burst only on the initial transition and trailing edge', () => {
        const onChange = vi.fn();

        act(() => {
            renderer = create(React.createElement(DraftHarness, { value: '', onChange }));
        });
        for (let length = 1; length <= 100; length += 1) {
            act(() => {
                renderer?.update(React.createElement(DraftHarness, {
                    value: 'x'.repeat(length),
                    onChange,
                }));
            });
        }

        expect(draftHarness.updateSessionDraft.mock.calls).toEqual([
            ['session-1', 'x'],
        ]);

        act(() => {
            vi.advanceTimersByTime(1_999);
        });
        expect(draftHarness.updateSessionDraft).toHaveBeenCalledTimes(1);

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(draftHarness.updateSessionDraft.mock.calls).toEqual([
            ['session-1', 'x'],
            ['session-1', 'x'.repeat(100)],
        ]);
    });

    it('flushes the exact latest value once on true unmount', () => {
        const onChange = vi.fn();

        act(() => {
            renderer = create(React.createElement(DraftHarness, { value: '', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'a', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'ab', onChange }));
        });
        act(() => {
            renderer?.unmount();
            renderer = null;
        });
        act(() => {
            vi.runAllTimers();
        });

        expect(draftHarness.updateSessionDraft.mock.calls).toEqual([
            ['session-1', 'a'],
            ['session-1', 'ab'],
        ]);
    });

    it('keeps one AppState subscription while values change in a mounted Session', () => {
        const onChange = vi.fn();

        act(() => {
            renderer = create(React.createElement(DraftHarness, { value: '', onChange }));
        });
        for (const value of ['a', 'ab', 'abc']) {
            act(() => {
                renderer?.update(React.createElement(DraftHarness, { value, onChange }));
            });
        }

        expect(draftHarness.addAppStateListener).toHaveBeenCalledTimes(1);
        expect(draftHarness.removeAppStateListener).not.toHaveBeenCalled();

        act(() => {
            renderer?.unmount();
            renderer = null;
        });
        expect(draftHarness.removeAppStateListener).toHaveBeenCalledTimes(1);
    });

    it('retries the latest value after a lifecycle persistence failure', () => {
        const onChange = vi.fn();
        draftHarness.sessions['session-1'] = { draft: 'a' };
        draftHarness.updateSessionDraft
            .mockImplementationOnce(() => {
                throw new Error('draft write failed');
            })
            .mockImplementation(() => undefined);

        act(() => {
            renderer = create(React.createElement(DraftHarness, { value: 'a', onChange }));
        });
        act(() => {
            renderer?.update(React.createElement(DraftHarness, { value: 'ab', onChange }));
        });

        expect(() => {
            act(() => {
                draftHarness.appStateHandler?.('background');
            });
        }).toThrow('draft write failed');

        act(() => {
            draftHarness.appStateHandler?.('inactive');
        });
        expect(draftHarness.updateSessionDraft.mock.calls).toEqual([
            ['session-1', 'ab'],
            ['session-1', 'ab'],
        ]);
    });
});
