import * as React from 'react';
// @ts-expect-error react-test-renderer has no declarations in this workspace.
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    allow: vi.fn(),
    deny: vi.fn(),
    modes: vi.fn(),
    presence: 'online' as 'online' | number,
}));

vi.mock('react-native', async () => {
    const ReactModule = await import('react');
    const host = (name: string) => (props: any) => ReactModule.createElement(name, props, props.children);
    class AnimatedValue {
        interpolate() { return 1; }
        setValue() {}
        stopAnimation() {}
    }
    return {
        Animated: {
            View: host('AnimatedView'),
            Value: AnimatedValue,
            loop: () => ({ start() {}, stop() {} }),
            sequence: (value: unknown) => value,
            timing: (value: unknown) => value,
        },
        Easing: { inOut: (value: unknown) => value, quad: 'quad' },
        Platform: { OS: 'web', select: (values: any) => values.web ?? values.default },
        ScrollView: host('ScrollView'),
        StyleSheet: { absoluteFillObject: {}, create: (styles: unknown) => styles },
        Text: host('Text'),
        TouchableOpacity: host('TouchableOpacity'),
        View: host('View'),
        useWindowDimensions: () => ({ height: 900, width: 1200, scale: 1, fontScale: 1 }),
    };
});

vi.mock('react-native-unistyles', () => ({
    useUnistyles: () => ({ theme: { colors: {
        divider: '#ddd', surface: '#fff', surfaceHighest: '#eee', text: '#111', textSecondary: '#666',
    } } }),
}));
vi.mock('@/sync/storage', () => ({
    storage: {},
    useSession: () => ({ presence: state.presence }),
}));
vi.mock('@/sync/ops', () => ({
    sessionAllow: state.allow,
    sessionDeny: state.deny,
    sessionSetAgentModes: state.modes,
}));
vi.mock('@/text', () => ({ t: (key: string) => key }));
vi.mock('@/utils/responsive', () => ({ useIsTablet: () => true }));

import { PermissionFooter } from './PermissionFooter';

const originalConsoleError = console.error;
beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.spyOn(console, 'error').mockImplementation((message?: unknown, ...args: unknown[]) => {
        if (typeof message === 'string' && message.startsWith('react-test-renderer is deprecated')) return;
        originalConsoleError(message, ...args);
    });
});
afterAll(() => vi.restoreAllMocks());
beforeEach(() => {
    state.allow.mockReset().mockResolvedValue(undefined);
    state.deny.mockReset().mockResolvedValue(undefined);
    state.modes.mockReset();
    state.presence = 'online';
});

function renderPermission(toolName: string, flavor: string | undefined = undefined): ReactTestRenderer {
    let renderer!: ReactTestRenderer;
    act(() => {
        renderer = create(React.createElement(PermissionFooter, {
            metadata: flavor ? { flavor } : null,
            permission: { id: 'permission-1', status: 'pending' },
            sessionId: 'session-1',
            toolInput: toolName === 'Bash' ? { command: 'pnpm test --filter app' } : { value: 1 },
            toolName,
        }));
    });
    return renderer;
}

function button(renderer: ReactTestRenderer, label: string) {
    return renderer.root.findAllByType('TouchableOpacity' as any)
        .find((node: { props: { accessibilityLabel?: string } }) => node.props.accessibilityLabel === label)!;
}

async function press(renderer: ReactTestRenderer, label: string) {
    await act(async () => {
        await button(renderer, label).props.onPress();
    });
}

describe('PermissionFooter decision lifecycle', () => {
    it('preserves every Codex permission payload', async () => {
        let renderer = renderPermission('CodexBash', 'codex');
        await press(renderer, 'common.yes');
        expect(state.allow).toHaveBeenLastCalledWith(
            'session-1', 'permission-1', undefined, undefined, 'approved',
        );
        act(() => renderer.unmount());

        renderer = renderPermission('CodexBash', 'codex');
        await press(renderer, 'codex.permissions.yesForSession');
        expect(state.allow).toHaveBeenLastCalledWith(
            'session-1', 'permission-1', undefined, undefined, 'approved_for_session',
        );
        act(() => renderer.unmount());

        renderer = renderPermission('CodexBash', 'codex');
        await press(renderer, 'codex.permissions.stopAndExplain');
        expect(state.deny).toHaveBeenLastCalledWith(
            'session-1', 'permission-1', undefined, undefined, 'abort',
        );
        act(() => renderer.unmount());
    });

    it('preserves Claude allow, session, mode, and deny payloads', async () => {
        let renderer = renderPermission('Bash');
        await press(renderer, 'common.yes');
        expect(state.allow).toHaveBeenLastCalledWith('session-1', 'permission-1');
        act(() => renderer.unmount());

        renderer = renderPermission('Bash');
        await press(renderer, 'claude.permissions.yesForTool');
        expect(state.allow).toHaveBeenLastCalledWith(
            'session-1', 'permission-1', undefined, ['Bash(pnpm test --filter app)'],
        );
        act(() => renderer.unmount());

        renderer = renderPermission('Edit');
        await press(renderer, 'claude.permissions.yesAllowAllEdits');
        expect(state.allow).toHaveBeenLastCalledWith('session-1', 'permission-1', 'acceptEdits');
        expect(state.modes).toHaveBeenLastCalledWith('session-1', { permissionMode: 'acceptEdits' });
        act(() => renderer.unmount());

        renderer = renderPermission('ExitPlanMode');
        await press(renderer, 'claude.permissions.yesAllowEverything');
        expect(state.allow).toHaveBeenLastCalledWith('session-1', 'permission-1', 'bypassPermissions');
        expect(state.modes).toHaveBeenLastCalledWith('session-1', { permissionMode: 'bypassPermissions' });
        act(() => renderer.unmount());

        renderer = renderPermission('Bash');
        await press(renderer, 'claude.permissions.noTellClaude');
        expect(state.deny).toHaveBeenLastCalledWith('session-1', 'permission-1');
        act(() => renderer.unmount());
    });

    it('allows only one synchronous submission and keeps the chosen action disabled after success', async () => {
        let release!: () => void;
        state.allow.mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }));
        const renderer = renderPermission('CodexBash', 'codex');
        const approve = button(renderer, 'common.yes');

        let first!: Promise<void>;
        let duplicate!: Promise<void>;
        act(() => {
            first = approve.props.onPress();
            duplicate = approve.props.onPress();
        });
        expect(state.allow).toHaveBeenCalledOnce();
        release();
        await act(async () => { await Promise.all([first, duplicate]); });

        expect(button(renderer, 'common.yes').props.accessibilityState).toMatchObject({
            disabled: true,
            selected: true,
        });
        await act(async () => { await button(renderer, 'common.yes').props.onPress(); });
        expect(state.allow).toHaveBeenCalledOnce();
    });

    it('disables all pending actions while the Session is disconnected', () => {
        state.presence = Date.now();
        const renderer = renderPermission('CodexBash', 'codex');
        expect(renderer.root.findAllByType('TouchableOpacity' as any).every(
            (node: { props: { disabled?: boolean } }) => node.props.disabled === true,
        )).toBe(true);
        const text = renderer.root.findAllByType('Text' as any)
            .flatMap((node: { props: { children?: unknown } }) => node.props.children)
            .join(' ');
        expect(text).toContain('codexFirst.decisionDisconnected');
    });
});
