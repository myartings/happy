import { describe, expect, it, vi } from 'vitest';

import { resolveCodexUncertainDelivery, routeCodexUserText } from './codexUserMessageRouter';

describe('routeCodexUserText', () => {
    it('reconciles again after recovery and suppresses a message already accepted by Codex', async () => {
        const reconcile = vi.fn()
            .mockResolvedValueOnce({ messageDelivery: 'unknown' })
            .mockResolvedValueOnce({ messageDelivery: 'delivered' });
        const recover = vi.fn().mockResolvedValue(true);

        await expect(resolveCodexUncertainDelivery({
            clientUserMessageId: 'accepted-before-timeout',
            reconcile,
            recover,
        })).resolves.toBe('delivered');
        expect(reconcile).toHaveBeenCalledTimes(2);
        expect(recover).toHaveBeenCalledTimes(1);
    });

    it('keeps delivery unknown when recovery fails', async () => {
        const reconcile = vi.fn().mockResolvedValue({ messageDelivery: 'unknown' });

        await expect(resolveCodexUncertainDelivery({
            clientUserMessageId: 'preserved-on-recovery-error',
            reconcile,
            recover: vi.fn().mockRejectedValue(new Error('connect failed')),
        })).resolves.toBe('unknown');
        expect(reconcile).toHaveBeenCalledTimes(1);
    });

    it('does not infer absence when the runtime cannot correlate client IDs', async () => {
        const reconcile = vi.fn().mockResolvedValue({ messageDelivery: 'absent' });
        const recover = vi.fn();

        await expect(resolveCodexUncertainDelivery({
            clientUserMessageId: 'unsupported-id',
            canCorrelate: false,
            reconcile,
            recover,
        })).resolves.toBe('unknown');
        expect(reconcile).not.toHaveBeenCalled();
        expect(recover).not.toHaveBeenCalled();
    });


    it('steers ordinary input into the active turn without queueing it', async () => {
        const queue = {
            push: vi.fn(),
            pushIsolateAndClear: vi.fn(),
        };
        const steer = vi.fn().mockResolvedValue(undefined);
        const attachments = [{
            data: new Uint8Array([0x89, 0x50]),
            mimeType: 'image/png',
            name: 'follow-up.png',
        }];

        const result = await routeCodexUserText({
            text: 'answer this while continuing',
            mode: { permissionMode: 'default' },
            attachments,
            activeTurnId: 'turn-active',
            queue,
            steer,
        });

        expect(result).toBe('steered');
        expect(steer).toHaveBeenCalledWith({
            text: 'answer this while continuing',
            attachments,
            expectedTurnId: 'turn-active',
        });
        expect(queue.push).not.toHaveBeenCalled();
        expect(queue.pushIsolateAndClear).not.toHaveBeenCalled();
    });

    it('queues the original input exactly once when steering is rejected', async () => {
        const queue = {
            push: vi.fn(),
            pushIsolateAndClear: vi.fn(),
        };
        const steer = vi.fn().mockRejectedValue(new Error('active turn changed'));
        const mode = { permissionMode: 'read-only' };
        const attachments = [{
            data: new Uint8Array([0xff, 0xd8, 0xff]),
            mimeType: 'image/jpeg',
            name: 'race.jpg',
        }];

        const result = await routeCodexUserText({
            text: 'do not lose this',
            mode,
            attachments,
            activeTurnId: 'turn-ended',
            queue,
            steer,
        });

        expect(result).toBe('queued');
        expect(steer).toHaveBeenCalledTimes(1);
        expect(queue.push).toHaveBeenCalledTimes(1);
        expect(queue.push).toHaveBeenCalledWith('do not lose this', mode, attachments);
        expect(queue.pushIsolateAndClear).not.toHaveBeenCalled();
    });

    it('does not queue an uncertain steer that reconciliation finds in Codex history', async () => {
        const queue = {
            push: vi.fn(),
            pushIsolateAndClear: vi.fn(),
        };
        const timeout = new Error('turn/steer timed out after 5000ms');
        const steer = vi.fn().mockRejectedValue(timeout);
        const reconcileSteerFailure = vi.fn().mockResolvedValue('delivered');

        const result = await routeCodexUserText({
            text: 'please keep this exactly once',
            mode: { permissionMode: 'default' },
            clientUserMessageId: 'message-correlated',
            activeTurnId: 'turn-active',
            queue,
            steer,
            reconcileSteerFailure,
        });

        expect(result).toBe('steered');
        expect(steer).toHaveBeenCalledWith({
            text: 'please keep this exactly once',
            attachments: undefined,
            expectedTurnId: 'turn-active',
            clientUserMessageId: 'message-correlated',
        });
        expect(reconcileSteerFailure).toHaveBeenCalledWith({
            error: timeout,
            clientUserMessageId: 'message-correlated',
        });
        expect(queue.push).not.toHaveBeenCalled();
    });

    it('preserves the client message ID when a confirmed-absent steer is queued', async () => {
        const queue = {
            push: vi.fn(),
            pushIsolateAndClear: vi.fn(),
        };
        const steer = vi.fn().mockRejectedValue(new Error('turn/steer timed out after 5000ms'));

        await routeCodexUserText({
            text: 'retry me after recovery',
            mode: { permissionMode: 'default' },
            clientUserMessageId: 'message-to-queue',
            activeTurnId: 'turn-active',
            queue,
            steer,
            reconcileSteerFailure: vi.fn().mockResolvedValue('queue'),
        });

        expect(queue.push).toHaveBeenCalledWith(
            'retry me after recovery',
            { permissionMode: 'default' },
            undefined,
            'message-to-queue',
        );
    });

    it('preserves an unknown steer for later reconciliation without normal queueing', async () => {
        const queue = {
            push: vi.fn(),
            pushUncertain: vi.fn(),
            pushIsolateAndClear: vi.fn(),
        };
        const mode = { permissionMode: 'default' };
        const attachments = [{
            data: new Uint8Array([0x89, 0x50]),
            mimeType: 'image/png',
            name: 'uncertain.png',
        }];

        const result = await routeCodexUserText({
            text: 'preserve this until delivery is known',
            mode,
            attachments,
            clientUserMessageId: 'message-unknown',
            activeTurnId: 'turn-active',
            queue,
            steer: vi.fn().mockRejectedValue(new Error('turn/steer timed out')),
            reconcileSteerFailure: vi.fn().mockResolvedValue('unknown'),
        });

        expect(result).toBe('pending');
        expect(queue.push).not.toHaveBeenCalled();
        expect(queue.pushUncertain).toHaveBeenCalledWith(
            'preserve this until delivery is known',
            mode,
            attachments,
            'message-unknown',
        );
    });

    it('preserves input when reconciliation itself fails', async () => {
        const queue = {
            push: vi.fn(),
            pushUncertain: vi.fn(),
            pushIsolateAndClear: vi.fn(),
        };
        const mode = { permissionMode: 'default' };

        const result = await routeCodexUserText({
            text: 'do not drop me on recovery failure',
            mode,
            clientUserMessageId: 'message-recovery-error',
            activeTurnId: 'turn-active',
            queue,
            steer: vi.fn().mockRejectedValue(new Error('turn/steer timed out')),
            reconcileSteerFailure: vi.fn().mockRejectedValue(new Error('reconnect failed')),
        });

        expect(result).toBe('pending');
        expect(queue.push).not.toHaveBeenCalled();
        expect(queue.pushUncertain).toHaveBeenCalledWith(
            'do not drop me on recovery failure',
            mode,
            undefined,
            'message-recovery-error',
        );
    });

    it('keeps clear isolated even while a turn is active', async () => {
        const queue = {
            push: vi.fn(),
            pushIsolateAndClear: vi.fn(),
        };
        const steer = vi.fn().mockResolvedValue(undefined);
        const mode = { permissionMode: 'default' };

        const result = await routeCodexUserText({
            text: '/clear',
            mode,
            activeTurnId: 'turn-active',
            queue,
            steer,
        });

        expect(result).toBe('clear');
        expect(steer).not.toHaveBeenCalled();
        expect(queue.pushIsolateAndClear).toHaveBeenCalledWith('/clear', mode, undefined);
    });

    it('keeps idle and host-control input on the existing queue', async () => {
        const queue = {
            push: vi.fn(),
            pushIsolateAndClear: vi.fn(),
        };
        const steer = vi.fn().mockResolvedValue(undefined);
        const mode = { permissionMode: 'default' };

        await routeCodexUserText({
            text: 'start normally',
            mode,
            activeTurnId: null,
            queue,
            steer,
        });
        await routeCodexUserText({
            text: '/goal finish the release',
            mode,
            activeTurnId: 'turn-active',
            forceQueue: true,
            queue,
            steer,
        });

        expect(steer).not.toHaveBeenCalled();
        expect(queue.push).toHaveBeenNthCalledWith(1, 'start normally', mode, undefined);
        expect(queue.push).toHaveBeenNthCalledWith(2, '/goal finish the release', mode, undefined);
    });
});
