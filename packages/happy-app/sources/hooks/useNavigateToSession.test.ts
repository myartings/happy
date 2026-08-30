import { describe, expect, it, vi } from 'vitest';

vi.mock('@/sync/storage', () => ({
    storage: { getState: () => ({ sessions: {} }) },
}));
vi.mock('@/track', () => ({ trackSessionSwitched: vi.fn() }));
vi.mock('expo-router', () => ({ useRouter: vi.fn() }));

import { navigateToSession } from './useNavigateToSession';

describe('navigateToSession', () => {
    it('carries only the bounded current-request focus hint through the existing route', () => {
        const push = vi.fn();

        navigateToSession({ push } as any, 'session/one', {
            kind: 'answer_required',
            sourceId: 'answer/one',
            observedAgentStateVersion: 5,
        });

        expect(push).toHaveBeenCalledWith({
            pathname: '/session/[id]',
            params: {
                id: 'session/one',
                attentionKind: 'answer_required',
                attentionSourceId: 'answer/one',
                attentionAgentStateVersion: '5',
            },
        });
    });
});
