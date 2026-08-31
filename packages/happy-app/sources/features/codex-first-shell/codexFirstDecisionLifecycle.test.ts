import { describe, expect, it, vi } from 'vitest';

import {
    createCodexFirstDecisionSubmissionGate,
    resolveCodexFirstDecisionPresentation,
    submitCodexFirstDecisionOnce,
} from './codexFirstDecisionLifecycle';

describe('Codex-first decision lifecycle', () => {
    it('projects pending, submitting, disconnected, resolved, and expired states', () => {
        expect(resolveCodexFirstDecisionPresentation({
            connected: true,
            requestStatus: 'pending',
            submitting: false,
            submitted: false,
        })).toEqual({
            accessibilityState: { busy: false, disabled: false },
            canInteract: true,
            state: 'pending',
        });
        expect(resolveCodexFirstDecisionPresentation({
            connected: true,
            requestStatus: 'pending',
            submitting: true,
            submitted: false,
        })).toMatchObject({ state: 'submitting', canInteract: false });
        expect(resolveCodexFirstDecisionPresentation({
            connected: false,
            requestStatus: 'pending',
            submitting: false,
            submitted: false,
        })).toMatchObject({ state: 'disconnected', canInteract: false });
        expect(resolveCodexFirstDecisionPresentation({
            connected: false,
            requestStatus: 'resolved',
            submitting: false,
            submitted: false,
        })).toMatchObject({ state: 'resolved', canInteract: false });
        expect(resolveCodexFirstDecisionPresentation({
            connected: true,
            requestStatus: 'expired',
            submitting: false,
            submitted: false,
        })).toMatchObject({ state: 'expired', canInteract: false });
        expect(resolveCodexFirstDecisionPresentation({
            connected: true,
            requestStatus: 'pending',
            submitting: false,
            submitted: true,
        })).toMatchObject({ state: 'resolved', canInteract: false });
    });

    it('submits one action once while a request remains locally pending', async () => {
        const gate = createCodexFirstDecisionSubmissionGate();
        let release!: () => void;
        const submit = vi.fn(() => new Promise<void>(resolve => { release = resolve; }));

        const first = submitCodexFirstDecisionOnce(gate, {
            action: 'approve',
            requestId: 'permission-1',
            submit,
        });
        const concurrent = await submitCodexFirstDecisionOnce(gate, {
            action: 'deny',
            requestId: 'permission-1',
            submit,
        });
        expect(concurrent).toBe('duplicate');
        expect(submit).toHaveBeenCalledOnce();

        release();
        await expect(first).resolves.toBe('submitted');
        await expect(submitCodexFirstDecisionOnce(gate, {
            action: 'deny',
            requestId: 'permission-1',
            submit,
        })).resolves.toBe('duplicate');
        expect(submit).toHaveBeenCalledOnce();
    });

    it('allows retry after failure and resets for a different request', async () => {
        const gate = createCodexFirstDecisionSubmissionGate();
        const failed = vi.fn().mockRejectedValueOnce(new Error('offline'));
        await expect(submitCodexFirstDecisionOnce(gate, {
            action: 'approve',
            requestId: 'permission-1',
            submit: failed,
        })).rejects.toThrow('offline');

        const retried = vi.fn().mockResolvedValue(undefined);
        await expect(submitCodexFirstDecisionOnce(gate, {
            action: 'approve',
            requestId: 'permission-1',
            submit: retried,
        })).resolves.toBe('submitted');
        await expect(submitCodexFirstDecisionOnce(gate, {
            action: 'approve',
            requestId: 'permission-2',
            submit: retried,
        })).resolves.toBe('submitted');
        expect(retried).toHaveBeenCalledTimes(2);
    });
});
