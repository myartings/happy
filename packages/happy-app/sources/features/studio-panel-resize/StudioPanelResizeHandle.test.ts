import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return { Platform: { OS: 'web' }, View: host('View') };
});

import { StudioPanelResizeHandle } from './StudioPanelResizeHandle';

const originalConsoleError = console.error;

beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});

afterAll(() => vi.restoreAllMocks());

function renderHandle(side: 'left' | 'right', onWidthChange = vi.fn()) {
    let renderer!: ReturnType<typeof create>;
    act(() => {
        renderer = create(React.createElement(StudioPanelResizeHandle, {
            side,
            width: side === 'left' ? 275 : 360,
            windowWidth: 1470,
            oppositeWidth: side === 'left' ? 360 : 275,
            oppositeVisible: true,
            label: `${side} panel width`,
            onWidthChange,
        }));
    });
    return { handle: renderer.root.findByType('View' as any), onWidthChange };
}

describe('Studio panel resize handle', () => {
    it('exposes an adjustable separator with current bounds and quiet resting style', () => {
        const { handle } = renderHandle('left');
        expect(handle.props).toMatchObject({
            accessibilityRole: 'adjustable',
            accessibilityLabel: 'left panel width',
            accessibilityValue: { min: 220, max: 420, now: 275 },
            role: 'separator',
            tabIndex: 0,
        });
        expect(handle.props.style).toEqual(expect.arrayContaining([
            expect.objectContaining({ cursor: 'col-resize', width: 8 }),
        ]));
    });

    it('projects captured pointer movement continuously and resets on double-click', () => {
        const onWidthChange = vi.fn();
        const { handle } = renderHandle('right', onWidthChange);
        const pointerTarget = { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() };

        act(() => handle.props.onPointerDown({ pointerId: 7, clientX: 1000, currentTarget: pointerTarget }));
        act(() => handle.props.onPointerMove({ pointerId: 7, clientX: 960, currentTarget: pointerTarget }));
        expect(onWidthChange).toHaveBeenLastCalledWith(400);
        act(() => handle.props.onPointerUp({ pointerId: 7, currentTarget: pointerTarget }));
        expect(pointerTarget.setPointerCapture).toHaveBeenCalledWith(7);
        expect(pointerTarget.releasePointerCapture).toHaveBeenCalledWith(7);

        act(() => handle.props.onDoubleClick({ preventDefault: vi.fn() }));
        expect(onWidthChange).toHaveBeenLastCalledWith(360);
    });

    it('supports keyboard adjustment and Home reset', () => {
        const onWidthChange = vi.fn();
        const { handle } = renderHandle('left', onWidthChange);
        const preventDefault = vi.fn();

        act(() => handle.props.onKeyDown({ key: 'ArrowRight', preventDefault }));
        expect(onWidthChange).toHaveBeenLastCalledWith(291);
        act(() => handle.props.onKeyDown({ key: 'Home', preventDefault }));
        expect(onWidthChange).toHaveBeenLastCalledWith(275);
        expect(preventDefault).toHaveBeenCalledTimes(2);
    });
});
