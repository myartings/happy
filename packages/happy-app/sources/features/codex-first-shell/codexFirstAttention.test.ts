import { describe, expect, it } from 'vitest';
import {
    countCodexFirstAttentionSessions,
    resolveCodexFirstNotificationTarget,
} from './codexFirstAttention';

describe('Codex-first attention count', () => {
    it('counts unread, permission, and Agent-input attention without duplicates', () => {
        expect(countCodexFirstAttentionSessions([
            {
                type: 'attention-sessions',
                sessions: [
                    { id: 'permission', archived: false, hasUnread: true, state: 'permission_required' },
                    { id: 'input', archived: false, hasUnread: false, state: 'input_required' },
                ],
            },
            {
                type: 'active-sessions',
                sessions: [
                    { id: 'permission', archived: false, hasUnread: true, state: 'permission_required' },
                    { id: 'unread', archived: false, hasUnread: true, state: 'waiting' },
                    { id: 'ordinary', archived: false, hasUnread: false, state: 'waiting' },
                ],
            },
        ] as any)).toBe(3);
    });

    it('ignores archived work and handles loading state', () => {
        expect(countCodexFirstAttentionSessions(null)).toBe(0);
        expect(countCodexFirstAttentionSessions([
            {
                type: 'session',
                session: { id: 'archived', archived: true, hasUnread: true, state: 'waiting' },
            },
        ] as any)).toBe(0);
    });

    it('opens an affected Session and keeps the social Inbox as the no-attention fallback', () => {
        expect(resolveCodexFirstNotificationTarget([
            {
                type: 'attention-sessions',
                sessions: [
                    { id: 'permission', archived: false, hasUnread: true, state: 'permission_required' },
                    { id: 'ordinary', archived: false, hasUnread: false, state: 'waiting' },
                ],
            },
        ] as any)).toEqual({ kind: 'session', sessionId: 'permission' });

        expect(resolveCodexFirstNotificationTarget([
            {
                type: 'session',
                session: { id: 'ordinary', archived: false, hasUnread: false, state: 'waiting' },
            },
        ] as any)).toEqual({ kind: 'inbox' });
        expect(resolveCodexFirstNotificationTarget(null)).toEqual({ kind: 'inbox' });
    });
});
