import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create } from 'react-test-renderer';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    return {
        ActivityIndicator: host('ActivityIndicator'),
        Platform: { OS: 'web' },
        Pressable: host('Pressable'),
        Text: host('Text'),
        View: host('View'),
    };
});

vi.mock('@expo/vector-icons', async () => {
    const ReactModule = await import('react');
    const Ionicons = (props: any) => ReactModule.createElement('Ionicons', props);
    Ionicons.glyphMap = {};
    return { Ionicons };
});

vi.mock('expo-router', () => ({
    useRouter: () => ({ navigate: vi.fn(), push: vi.fn() }),
}));

vi.mock('react-native-unistyles', () => ({
    StyleSheet: {
        create: (factory: any) => typeof factory === 'function' ? factory({
            colors: {
                button: { primary: { background: 'primary', tint: 'primary-text' } },
                divider: 'divider',
                groupped: { background: 'background' },
                surface: 'surface',
                surfaceHigh: 'surface-high',
                surfacePressedOverlay: 'pressed',
                text: 'text',
                textSecondary: 'secondary',
            },
        }) : factory,
        hairlineWidth: 1,
    },
    useUnistyles: () => ({
        theme: {
            colors: {
                button: { primary: { tint: 'primary-text' } },
                text: 'text',
                textSecondary: 'secondary',
            },
        },
    }),
}));

vi.mock('@/constants/Typography', () => ({ Typography: { default: () => ({}) } }));
vi.mock('@/hooks/useVisibleSessionListViewData', () => ({
    useHasArchivedSessions: () => false,
    useVisibleSessionListViewData: () => [{
        type: 'session',
        session: { id: 'session-1', lastActivityAt: 1 },
    }],
}));
vi.mock('@/hooks/useNavigateToSession', () => ({ useNavigateToSession: () => vi.fn() }));
vi.mock('@/hooks/useOfflineMachineTroubleshooting', () => ({ useOfflineMachineTroubleshooting: () => vi.fn() }));
vi.mock('@/hooks/useConnectTerminal', () => ({
    useConnectTerminal: () => ({ connectWithUrl: vi.fn(), isLoading: false }),
}));
vi.mock('@/modal', () => ({ Modal: { prompt: vi.fn() } }));
vi.mock('@/sync/machineChoices', () => ({
    collectMachineChoices: () => [{ id: 'machine-1', machineIds: ['machine-1'], name: 'Windows', online: true }],
}));
vi.mock('@/sync/sync', () => ({
    sync: { refreshMachines: vi.fn(), refreshSessions: vi.fn() },
}));
vi.mock('@/sync/storage', () => ({
    useAllMachines: () => [{ id: 'machine-1' }],
    useRealtimeStatus: () => 'disconnected',
    useSettingMutable: () => [true, vi.fn()],
    useSocketStatus: () => ({ status: 'connected' }),
}));
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('@/track', () => ({ trackConnectAttempt: vi.fn() }));

import { CodexFirstHomeCanvas } from './CodexFirstHomeCanvas';

const originalConsoleError = console.error;

beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});

afterAll(() => vi.restoreAllMocks());

describe('CodexFirstHomeCanvas connection state', () => {
    it('shows the ready home when sync is connected even while voice realtime is disconnected', () => {
        let renderer: ReturnType<typeof create>;
        act(() => {
            renderer = create(React.createElement(CodexFirstHomeCanvas));
        });

        const visibleText = renderer!.root
            .findAllByType('Text' as any)
            .map((node: { props: { children?: unknown } }) => node.props.children)
            .filter((value: unknown): value is string => typeof value === 'string');

        expect(visibleText).toContain('codexFirst.homeReadyTitle');
        expect(visibleText).not.toContain('codexFirst.homeConnectionErrorTitle');
    });
});
