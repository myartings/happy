import { describe, expect, it, vi } from 'vitest';

import {
    CodexLivePermissionModeController,
    registerCodexLivePermissionModeRpc,
    registerCodexLivePermissionModeRpcForSession,
    resolveCodexApprovalDecision,
    runWithCodexLivePermissionModeAbortGuard,
    selectCodexApprovalPermissionMode,
    withCodexLivePermissionModeMetadata,
} from '../livePermissionModeController';
import { CodexRemoteModeState } from '../remoteModeState';

describe('CodexLivePermissionModeController', () => {
    it('applies an explicit YOLO request and approves the already-pending snapshot', () => {
        const remoteModeState = new CodexRemoteModeState({ permissionMode: 'auto' });
        const approveAllPending = vi.fn(() => 2);
        const controller = new CodexLivePermissionModeController({
            remoteModeState,
            approveAllPending,
            sandboxManagedByHappy: false,
            generation: 'generation-1',
        });

        expect(controller.apply({
            requestId: 'mode-request-1',
            permissionMode: 'yolo',
            generation: 'generation-1',
        })).toEqual({
            requestId: 'mode-request-1',
            permissionMode: 'yolo',
            pendingApprovalsResolved: 2,
            revision: 1,
            generation: 'generation-1',
        });
        expect(remoteModeState.currentPermissionMode).toBe('yolo');
        expect(remoteModeState.currentPermissionModeExplicitlySet).toBe(true);
        expect(approveAllPending).toHaveBeenCalledTimes(1);
    });

    it('returns the original acknowledgement for a duplicate request without approving twice', () => {
        const remoteModeState = new CodexRemoteModeState({ permissionMode: 'auto' });
        const approveAllPending = vi.fn(() => 1);
        const controller = new CodexLivePermissionModeController({
            remoteModeState,
            approveAllPending,
            sandboxManagedByHappy: false,
            generation: 'generation-1',
        });
        const request = { requestId: 'mode-request-duplicate', permissionMode: 'yolo', generation: 'generation-1' };

        const first = controller.apply(request);
        const duplicate = controller.apply(request);

        expect(duplicate).toEqual(first);
        expect(approveAllPending).toHaveBeenCalledTimes(1);
    });

    it('registers the session RPC and returns the applied live mode acknowledgement', async () => {
        const handlers = new Map<string, (request: any) => any>();
        const registrar = {
            registerHandler: vi.fn((method: string, handler: (request: any) => any) => {
                handlers.set(method, handler);
            }),
        };
        const controller = new CodexLivePermissionModeController({
            remoteModeState: new CodexRemoteModeState({ permissionMode: 'auto' }),
            approveAllPending: () => 0,
            sandboxManagedByHappy: false,
            generation: 'generation-1',
        });

        registerCodexLivePermissionModeRpc(registrar, controller);

        expect(registrar.registerHandler).toHaveBeenCalledWith('permission-mode', expect.any(Function));
        await expect(handlers.get('permission-mode')?.({
            requestId: 'mode-request-rpc',
            permissionMode: 'yolo',
            generation: 'generation-1',
        })).resolves.toMatchObject({
            requestId: 'mode-request-rpc',
            permissionMode: 'yolo',
        });
    });

    it('lets an explicit latest Auto selection override a YOLO mode pinned to the active turn', () => {
        const remoteModeState = new CodexRemoteModeState({ permissionMode: 'yolo' });
        remoteModeState.applyExplicitPermissionMode('auto');

        expect(selectCodexApprovalPermissionMode('yolo', remoteModeState)).toBe('auto');
    });

    it('switches back to Auto without resolving pending approvals', () => {
        const remoteModeState = new CodexRemoteModeState({ permissionMode: 'yolo' });
        const approveAllPending = vi.fn(() => 3);
        const controller = new CodexLivePermissionModeController({
            remoteModeState,
            approveAllPending,
            sandboxManagedByHappy: false,
            generation: 'generation-1',
        });

        expect(controller.apply({
            requestId: 'mode-request-auto',
            permissionMode: 'auto',
            generation: 'generation-1',
        })).toMatchObject({
            permissionMode: 'auto',
            pendingApprovalsResolved: 0,
        });
        expect(approveAllPending).not.toHaveBeenCalled();
    });

    it('rejects an unknown mode without changing live authority', () => {
        const remoteModeState = new CodexRemoteModeState({ permissionMode: 'auto' });
        const controller = new CodexLivePermissionModeController({
            remoteModeState,
            approveAllPending: () => 0,
            sandboxManagedByHappy: false,
            generation: 'generation-1',
        });

        expect(() => controller.apply({
            requestId: 'mode-request-invalid',
            permissionMode: 'bypassPermissions',
            generation: 'generation-1',
        })).toThrow('Unsupported Codex permission mode');
        expect(remoteModeState.currentPermissionMode).toBe('auto');
        expect(remoteModeState.currentPermissionModeExplicitlySet).toBe(false);
    });

    it('rejects live mode changes during abort and does not replay a pre-abort acknowledgement', () => {
        const remoteModeState = new CodexRemoteModeState({ permissionMode: 'auto' });
        const controller = new CodexLivePermissionModeController({
            remoteModeState,
            approveAllPending: () => 0,
            sandboxManagedByHappy: false,
            generation: 'generation-1',
        });
        const request = { requestId: 'mode-request-before-abort', permissionMode: 'yolo', generation: 'generation-1' };

        expect(controller.apply(request)).toMatchObject({ revision: 1 });
        controller.beginAbort();

        expect(() => controller.apply({
            requestId: 'mode-request-during-abort',
            permissionMode: 'auto',
            generation: 'generation-1',
        })).toThrow('abort');

        controller.finishAbort();
        expect(() => controller.apply(request)).toThrow('generation');
        const generationAfterAbort = controller.getState().generation;
        expect(controller.apply({
            requestId: 'mode-request-after-abort',
            permissionMode: 'auto',
            generation: generationAfterAbort,
        })).toMatchObject({ revision: 3 });
    });

    it('auto-approves an approval that arrives after the explicit YOLO state is installed', async () => {
        const remoteModeState = new CodexRemoteModeState({ permissionMode: 'auto' });
        const controller = new CodexLivePermissionModeController({
            remoteModeState,
            approveAllPending: () => 0,
            sandboxManagedByHappy: false,
            generation: 'generation-1',
        });
        const requestDecision = vi.fn(async () => 'denied' as const);

        controller.apply({
            requestId: 'mode-before-new-approval',
            permissionMode: 'yolo',
            generation: 'generation-1',
        });

        await expect(resolveCodexApprovalDecision({
            activeTurnPermissionMode: 'auto',
            remoteModeState,
            sandboxManagedByHappy: false,
            requestDecision,
        })).resolves.toBe('approved');
        expect(requestDecision).not.toHaveBeenCalled();
    });

    it('keeps the live-mode RPC closed across the awaited abort and opens it only after reset', async () => {
        const controller = new CodexLivePermissionModeController({
            remoteModeState: new CodexRemoteModeState({ permissionMode: 'auto' }),
            approveAllPending: () => 0,
            sandboxManagedByHappy: false,
            generation: 'generation-1',
        });
        let finishAbortWork!: () => void;
        const abortWork = new Promise<void>((resolve) => {
            finishAbortWork = resolve;
        });
        const reset = vi.fn();

        const abort = runWithCodexLivePermissionModeAbortGuard(
            controller,
            () => abortWork,
            reset,
        );
        expect(() => controller.apply({
            requestId: 'mode-mid-abort',
            permissionMode: 'yolo',
            generation: 'generation-1',
        })).toThrow('abort');

        finishAbortWork();
        await abort;

        expect(reset).toHaveBeenCalledOnce();
        const generationAfterAbort = controller.getState().generation;
        expect(controller.apply({
            requestId: 'mode-after-awaited-abort',
            permissionMode: 'yolo',
            generation: generationAfterAbort,
        })).toMatchObject({ revision: 2 });
    });

    it('retains same-generation idempotency after more than 64 later requests', () => {
        const approveAllPending = vi.fn(() => 1);
        const controller = new CodexLivePermissionModeController({
            remoteModeState: new CodexRemoteModeState({ permissionMode: 'auto' }),
            approveAllPending,
            sandboxManagedByHappy: false,
            generation: 'generation-1',
        });
        const original = {
            requestId: 'original-request',
            permissionMode: 'yolo',
            generation: 'generation-1',
        };
        const originalResponse = controller.apply(original);
        for (let index = 0; index < 65; index += 1) {
            controller.apply({
                requestId: `later-request-${index}`,
                permissionMode: 'auto',
                generation: 'generation-1',
            });
        }

        expect(controller.apply(original)).toEqual(originalResponse);
        expect(approveAllPending).toHaveBeenCalledTimes(1);
    });

    it('advances the next acknowledgement revision from reconnected metadata', () => {
        const controller = new CodexLivePermissionModeController({
            remoteModeState: new CodexRemoteModeState({ permissionMode: 'auto' }),
            approveAllPending: () => 0,
            sandboxManagedByHappy: false,
            initialRevision: 1,
            generation: 'generation-reconnect',
        });

        controller.advanceRevision(12);

        expect(controller.apply({
            requestId: 'request-after-reconnect',
            permissionMode: 'yolo',
            generation: 'generation-reconnect',
        })).toMatchObject({ revision: 13 });
    });

    it('advances revision before registering RPCs on a reconnected session', async () => {
        const handlers = new Map<string, (request: any) => any>();
        const controller = new CodexLivePermissionModeController({
            remoteModeState: new CodexRemoteModeState({ permissionMode: 'auto' }),
            approveAllPending: () => 0,
            sandboxManagedByHappy: false,
            initialRevision: 1,
            generation: 'generation-session-swap',
        });
        const session = {
            getMetadata: () => ({ permissionModeRevision: 20 }),
            updateMetadata: vi.fn(),
            rpcHandlerManager: {
                registerHandler: vi.fn((method: string, handler: (request: any) => any) => {
                    handlers.set(method, handler);
                }),
            },
        };

        registerCodexLivePermissionModeRpcForSession(session, controller);

        await expect(handlers.get('permission-mode-state')?.({})).resolves.toMatchObject({
            revision: 20,
            generation: 'generation-session-swap',
        });
        await expect(handlers.get('permission-mode')?.({
            requestId: 'request-after-session-swap',
            permissionMode: 'yolo',
            generation: 'generation-session-swap',
        })).resolves.toMatchObject({ revision: 21 });
    });

    it('publishes the reset mode with the abort revision into encrypted metadata', () => {
        const controller = new CodexLivePermissionModeController({
            remoteModeState: new CodexRemoteModeState({ permissionMode: 'auto' }),
            approveAllPending: () => 0,
            sandboxManagedByHappy: false,
            initialRevision: 4,
            generation: 'generation-before-reset',
        });

        controller.beginAbort();

        expect(withCodexLivePermissionModeMetadata(
            { unrelated: 'preserved' },
            controller.getState(),
        )).toEqual({
            unrelated: 'preserved',
            permissionMode: 'auto',
            permissionModeRevision: 5,
        });
    });

    it('does not let an older abort publication overwrite a greater revision', () => {
        expect(withCodexLivePermissionModeMetadata(
            { permissionMode: 'yolo', permissionModeRevision: 7, unrelated: 'preserved' },
            { permissionMode: 'auto', revision: 6, generation: 'generation-after-abort' },
        )).toEqual({
            permissionMode: 'yolo',
            permissionModeRevision: 7,
            unrelated: 'preserved',
        });
    });

    it('atomically publishes only a still-current acknowledgement during confirmation', async () => {
        const handlers = new Map<string, (request: any) => any>();
        const published: unknown[] = [];
        const controller = new CodexLivePermissionModeController({
            remoteModeState: new CodexRemoteModeState({ permissionMode: 'auto' }),
            approveAllPending: () => 0,
            sandboxManagedByHappy: false,
            generation: 'generation-confirm',
        });
        registerCodexLivePermissionModeRpc({
            registerHandler: (method, handler) => handlers.set(method, handler),
        }, controller, (state) => published.push(state));
        const acknowledgement = controller.apply({
            requestId: 'request-confirm',
            permissionMode: 'yolo',
            generation: 'generation-confirm',
        });

        await expect(handlers.get('permission-mode-confirm')?.(acknowledgement)).resolves.toEqual({
            permissionMode: 'yolo',
            revision: 1,
            generation: 'generation-confirm',
        });
        expect(published).toEqual([{ permissionMode: 'yolo', revision: 1, generation: 'generation-confirm' }]);

        controller.beginAbort();
        await expect(handlers.get('permission-mode-confirm')?.(acknowledgement)).rejects.toThrow('no longer current');
        expect(published).toHaveLength(1);
    });
});
