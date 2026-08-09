import { describe, expect, it, vi } from 'vitest';
import { createGithubIssuesAuthorizationSession } from './githubIssuesAuthorizationSession';
import type { DeviceVerificationPrompt, GithubConnectedAccount } from './githubIssuesClient';

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

describe('GitHub Issues authorization session', () => {
    it('keeps Device Flow and its verification prompt alive across screen subscriptions', async () => {
        const result = deferred<GithubConnectedAccount>();
        let publishPrompt!: (prompt: DeviceVerificationPrompt) => void;
        const connector = {
            connect: vi.fn(async (options: { onVerification: (prompt: DeviceVerificationPrompt) => void }) => {
                publishPrompt = options.onVerification;
                return result.promise;
            }),
        };
        const session = createGithubIssuesAuthorizationSession(connector);
        const firstScreen = vi.fn();
        const unsubscribe = session.subscribe(firstScreen);

        const inFlight = session.start();
        publishPrompt({
            userCode: 'ABCD-EFGH',
            verificationUri: 'https://github.com/login/device',
            expiresAt: 10_000,
        });
        unsubscribe();

        expect(session.getSnapshot()).toMatchObject({
            status: 'connecting',
            prompt: { userCode: 'ABCD-EFGH' },
        });
        const secondScreen = vi.fn();
        session.subscribe(secondScreen);
        expect(secondScreen).toHaveBeenLastCalledWith(expect.objectContaining({
            status: 'connecting',
            prompt: expect.objectContaining({ userCode: 'ABCD-EFGH' }),
        }));

        result.resolve({ id: 42, login: 'octocat', avatarUrl: '' });
        await inFlight;
        expect(session.getSnapshot()).toEqual({
            status: 'connected',
            account: { id: 42, login: 'octocat', avatarUrl: '' },
        });
    });

    it('cancels only when explicitly requested', async () => {
        let signal!: AbortSignal;
        const connector = {
            connect: vi.fn((options: { signal: AbortSignal; onVerification: (prompt: DeviceVerificationPrompt) => void }) => {
                signal = options.signal;
                return new Promise<GithubConnectedAccount>((_resolve, reject) => {
                    options.signal.addEventListener('abort', () => reject(new Error('cancelled')), { once: true });
                });
            }),
        };
        const session = createGithubIssuesAuthorizationSession(connector);

        const inFlight = session.start();
        expect(signal.aborted).toBe(false);
        session.cancel();
        await inFlight;

        expect(signal.aborted).toBe(true);
        expect(session.getSnapshot()).toEqual({ status: 'idle' });
    });
});
