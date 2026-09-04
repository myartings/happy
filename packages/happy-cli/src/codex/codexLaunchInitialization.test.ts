import { describe, expect, it, vi } from 'vitest';

import {
    assertCodexDaemonRoutePublished,
    createCodexLaunchInitialization,
    initializeCodexBeforeMessages,
} from './codexLaunchInitialization';
import { CodexRemoteModeState } from './remoteModeState';

describe('createCodexLaunchInitialization', () => {
    it('holds a pre-arriving first message until the one cold-start initializer completes', async () => {
        const launch = createCodexLaunchInitialization();
        let releaseLaunch!: () => void;
        const durableRoute = new Promise<void>((resolve) => {
            releaseLaunch = resolve;
        });
        const startThread = vi.fn(async () => {
            await durableRoute;
        });
        const handleFirstMessage = vi.fn();

        const firstMessage = launch.waitUntilReady().then(handleFirstMessage);
        const initializing = launch.run(startThread);
        await Promise.resolve();

        expect(startThread).toHaveBeenCalledOnce();
        expect(handleFirstMessage).not.toHaveBeenCalled();

        releaseLaunch();
        await initializing;
        await firstMessage;
        expect(handleFirstMessage).toHaveBeenCalledOnce();
        await expect(launch.run(startThread)).rejects.toThrow('already started');
        expect(startThread).toHaveBeenCalledOnce();
    });

    it('fails closed for waiting messages when launch initialization fails', async () => {
        const launch = createCodexLaunchInitialization();
        const waitingMessage = launch.waitUntilReady();
        const initializing = launch.run(async () => {
            throw new Error('route publication failed');
        });

        await expect(initializing).rejects.toThrow('route publication failed');
        await expect(waitingMessage).rejects.toThrow('route publication failed');
    });

    it('runs the production cold-start seam once before applying a first-message override', async () => {
        const launch = createCodexLaunchInitialization();
        const remoteModeState = new CodexRemoteModeState({
            permissionMode: 'auto',
            model: 'gpt-5.6-luna',
            effort: 'max',
        });
        let activeThread = false;
        let releasePublication!: () => void;
        const routePublished = new Promise<void>((resolve) => {
            releasePublication = resolve;
        });
        const startFreshThread = vi.fn(async () => {
            activeThread = true;
            await routePublished;
        });
        const firstMessageRoute = launch.waitUntilReady().then(() => (
            remoteModeState.resolve({ model: 'gpt-5.6-terra', effort: 'high' })
        ));

        const initializing = initializeCodexBeforeMessages({
            launch,
            connectAndRestore: vi.fn().mockResolvedValue(undefined),
            hasActiveThread: () => activeThread,
            startFreshThread,
        });
        await Promise.resolve();
        expect(startFreshThread).toHaveBeenCalledOnce();

        releasePublication();
        await initializing;
        await expect(firstMessageRoute).resolves.toMatchObject({
            model: 'gpt-5.6-terra',
            effort: 'high',
        });
        expect(startFreshThread).toHaveBeenCalledOnce();
    });

    it('reuses a restored active thread instead of creating another one', async () => {
        const startFreshThread = vi.fn();
        await initializeCodexBeforeMessages({
            launch: createCodexLaunchInitialization(),
            connectAndRestore: vi.fn().mockResolvedValue(undefined),
            hasActiveThread: () => true,
            startFreshThread,
        });
        expect(startFreshThread).not.toHaveBeenCalled();
    });

    it('propagates an explicit daemon route rejection at the launch boundary', () => {
        expect(() => assertCodexDaemonRoutePublished({ error: 'generation mismatch' }))
            .toThrow('generation mismatch');
        expect(() => assertCodexDaemonRoutePublished({})).not.toThrow();
    });
});
