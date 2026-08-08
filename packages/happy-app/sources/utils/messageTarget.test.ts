import { describe, expect, it } from 'vitest';
import { createMessageTargetRequest, getMessageTargetNativeId, resolveMessageTargetAction } from './messageTarget';

describe('createMessageTargetRequest', () => {
    it('assigns a new request key when the same prompt is selected repeatedly', () => {
        const first = createMessageTargetRequest('target', 'local-target', 123, 0);
        const second = createMessageTargetRequest('target', 'local-target', 123, first.revision);

        expect(first).toMatchObject({ messageId: 'target', localId: 'local-target', createdAt: 123, revision: 1, renderAll: true });
        expect(second).toMatchObject({ messageId: 'target', localId: 'local-target', createdAt: 123, revision: 2, renderAll: true });
        expect(second.requestKey).not.toBe(first.requestKey);
    });
});

describe('resolveMessageTargetAction', () => {
    const items = [{ id: 'newest' }, { id: 'target', localId: 'local-target', createdAt: 123 }, { id: 'oldest' }];

    it('returns the exact display index when the target is loaded', () => {
        expect(resolveMessageTargetAction(items, 'target', undefined, undefined, true, false)).toEqual({
            type: 'scroll', index: 1, messageId: 'target',
        });
        expect(resolveMessageTargetAction(items, 'server-id', 'local-target', undefined, true, false)).toEqual({
            type: 'scroll', index: 1, messageId: 'target',
        });
        expect(resolveMessageTargetAction(items, 'server-id', undefined, 123, true, false)).toEqual({
            type: 'scroll', index: 1, messageId: 'target',
        });
    });

    it('loads older pages until a missing target can be resolved', () => {
        expect(resolveMessageTargetAction(items, 'missing', undefined, undefined, true, false)).toEqual({ type: 'load-older' });
        expect(resolveMessageTargetAction(items, 'missing', undefined, undefined, true, true)).toEqual({ type: 'wait' });
    });

    it('stops when the full retained history has been searched', () => {
        expect(resolveMessageTargetAction(items, 'missing', undefined, undefined, false, false)).toEqual({ type: 'not-found' });
        expect(resolveMessageTargetAction(items, undefined, undefined, undefined, true, false)).toEqual({ type: 'none' });
    });
});

describe('getMessageTargetNativeId', () => {
    it('creates a stable DOM/native anchor from the message id', () => {
        expect(getMessageTargetNativeId('message-123')).toBe('message-target-message-123');
    });
});
