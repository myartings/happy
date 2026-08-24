import { describe, expect, it, vi } from 'vitest';

import { routeCodexUserText } from './codexUserMessageRouter';

describe('routeCodexUserText', () => {
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
