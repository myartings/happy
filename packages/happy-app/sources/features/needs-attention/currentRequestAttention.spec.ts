import { describe, expect, it } from 'vitest';
import type { AgentState } from '@/sync/storageTypes';
import {
    deriveCurrentSessionAttention,
    resolveCurrentRequestRowAttention,
    resolveCurrentRequestReasonKind,
} from './currentRequestAttention';

function state(overrides: Partial<AgentState>): AgentState {
    return {
        controlledByUser: false,
        requests: {},
        communications: {},
        completedCommunications: {},
        ...overrides,
    };
}

describe('deriveCurrentSessionAttention', () => {
    it('retains every current request while choosing permission as the primary reason', () => {
        const result = deriveCurrentSessionAttention(state({
            requests: {
                'permission-newer': { tool: 'Bash', arguments: { secret: 'not row data' }, createdAt: 20 },
                'permission-missing-time': { tool: 'Read', arguments: { path: '/private' } },
            },
            communications: {
                'answer-supported': {
                    kind: 'form',
                    createdAt: 5,
                    form: {
                        questions: [{
                            id: 'q1',
                            header: 'Secret header',
                            question: 'Secret question',
                            options: [{ label: 'Yes', description: 'Secret description' }],
                            multiSelect: false,
                        }],
                    },
                },
                'answer-unsupported': { kind: 'file_pick', createdAt: 1, title: 'Secret title' },
            },
        }), 7);

        expect(result).toEqual({
            primaryReason: {
                kind: 'permission_required',
                sourceId: 'permission-missing-time',
                observedAgentStateVersion: 7,
            },
            reasons: [
                {
                    kind: 'permission_required',
                    sourceId: 'permission-missing-time',
                    observedAgentStateVersion: 7,
                },
                {
                    kind: 'permission_required',
                    sourceId: 'permission-newer',
                    observedAgentStateVersion: 7,
                },
                {
                    kind: 'answer_required',
                    sourceId: 'answer-unsupported',
                    observedAgentStateVersion: 7,
                    detailKind: 'unsupported',
                },
                {
                    kind: 'answer_required',
                    sourceId: 'answer-supported',
                    observedAgentStateVersion: 7,
                    detailKind: 'form',
                },
            ],
        });
        expect(JSON.stringify(result)).not.toContain('Secret');
        expect(JSON.stringify(result)).not.toContain('/private');
    });

    it('keeps an offline row answer-required when its current projection says so', () => {
        expect(resolveCurrentRequestReasonKind({
            state: 'disconnected',
            attention: {
                primaryReason: { kind: 'answer_required', sourceId: 'answer-1' },
                reasons: [{ kind: 'answer_required', sourceId: 'answer-1' }],
            },
        })).toBe('answer_required');
    });

    it('restores ordinary row presentation and navigation when Needs Attention is disabled', () => {
        expect(resolveCurrentRequestRowAttention({
            state: 'disconnected',
            attention: {
                primaryReason: { kind: 'answer_required', sourceId: 'answer-1' },
                reasons: [{ kind: 'answer_required', sourceId: 'answer-1' }],
            },
        }, false)).toEqual({
            kind: null,
            reasonTextKey: null,
            actionTextKey: null,
            focusHint: null,
        });
    });

    it('provides localized Review and Answer affordance keys for enabled rows', () => {
        const permission = { kind: 'permission_required' as const, sourceId: 'permission-1' };
        const answer = { kind: 'answer_required' as const, sourceId: 'answer-1' };

        expect(resolveCurrentRequestRowAttention({
            state: 'disconnected',
            attention: { primaryReason: permission, reasons: [permission] },
        }, true)).toEqual({
            kind: 'permission_required',
            reasonTextKey: 'status.permissionRequired',
            actionTextKey: 'status.reviewRequest',
            focusHint: permission,
        });
        expect(resolveCurrentRequestRowAttention({
            state: 'disconnected',
            attention: { primaryReason: answer, reasons: [answer] },
        }, true)).toEqual({
            kind: 'answer_required',
            reasonTextKey: 'status.inputRequired',
            actionTextKey: 'status.answerRequest',
            focusHint: answer,
        });
    });

    it('omits completed sources and never advertises an invalid observed version', () => {
        expect(deriveCurrentSessionAttention(state({
            requests: {
                completed: { tool: 'Read', arguments: {} },
                pending: { tool: 'Write', arguments: {} },
            },
            completedRequests: {
                completed: {
                    tool: 'Read',
                    arguments: {},
                    status: 'approved',
                },
            },
        }), 1.5)).toEqual({
            primaryReason: { kind: 'permission_required', sourceId: 'pending' },
            reasons: [{ kind: 'permission_required', sourceId: 'pending' }],
        });
        expect(deriveCurrentSessionAttention(state({}), 1)).toBeNull();
    });

    it('projects a pending answer when the only retained permission is completed', () => {
        expect(deriveCurrentSessionAttention(state({
            requests: {
                completed: { tool: 'Read', arguments: {} },
            },
            completedRequests: {
                completed: {
                    tool: 'Read',
                    arguments: {},
                    status: 'approved',
                },
            },
            communications: {
                answer: {
                    kind: 'form',
                    form: {
                        questions: [{
                            id: 'q1',
                            header: 'Header',
                            question: 'Question',
                            options: [],
                        }],
                    },
                },
            },
        }), 4)).toEqual({
            primaryReason: {
                kind: 'answer_required',
                sourceId: 'answer',
                observedAgentStateVersion: 4,
                detailKind: 'form',
            },
            reasons: [{
                kind: 'answer_required',
                sourceId: 'answer',
                observedAgentStateVersion: 4,
                detailKind: 'form',
            }],
        });
    });
});
