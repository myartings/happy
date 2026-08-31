import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Command } from './types';

vi.mock('react-native', () => ({ TextInput: function TextInput() {} }));

import { useCommandPalette } from './useCommandPalette';

const originalConsoleError = console.error;
beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});
afterAll(() => vi.restoreAllMocks());

function renderHook(commands: Command[], onClose = vi.fn()) {
    let current!: ReturnType<typeof useCommandPalette>;
    function Harness() {
        current = useCommandPalette(commands, onClose);
        return null;
    }
    act(() => { create(React.createElement(Harness)); });
    return { current: () => current, onClose };
}

function command(id: string, title: string, searchOnly = false, action = vi.fn()): Command {
    return { action, category: 'Sessions', id, searchOnly, title } as Command;
}

describe('useCommandPalette', () => {
    it('keeps the blank palette bounded while allowing search-only entries through queries', () => {
        const recent = command('recent', 'Recent Session');
        const historical = command('historical', 'Historical Session', true);
        const hook = renderHook([recent, historical]);

        expect(hook.current().filteredCategories.flatMap(category => category.commands).map(item => item.id))
            .toEqual(['recent']);
        act(() => hook.current().handleSearchChange('  historical  '));
        expect(hook.current().filteredCategories.flatMap(category => category.commands).map(item => item.id))
            .toEqual(['historical']);
    });

    it('activates at most one command while the palette is closing', () => {
        const action = vi.fn();
        const only = command('only', 'Only', false, action);
        const hook = renderHook([only]);

        act(() => {
            hook.current().handleSelectCommand(only);
            hook.current().handleSelectCommand(only);
        });

        expect(action).toHaveBeenCalledOnce();
        expect(hook.onClose).toHaveBeenCalledOnce();
    });
});
