import { describe, expect, it } from 'vitest';
import type { AgentState } from '@/sync/storageTypes';
import type { Message } from '@/sync/typesMessage';
import {
    parseCurrentRequestAttentionRouteVersion,
    resolveCurrentRequestAttentionFocus,
    resolveCurrentRequestAttentionMessageId,
} from './currentRequestAttentionFocus';

function agentState(overrides: Partial<AgentState>): AgentState {
    return {
        controlledByUser: false,
        requests: {},
        communications: {},
        completedCommunications: {},
        ...overrides,
    };
}

describe('parseCurrentRequestAttentionRouteVersion', () => {
    it('accepts only canonical non-negative decimal safe integers', () => {
        expect(parseCurrentRequestAttentionRouteVersion('0')).toBe(0);
        expect(parseCurrentRequestAttentionRouteVersion('7')).toBe(7);
        expect(parseCurrentRequestAttentionRouteVersion(String(Number.MAX_SAFE_INTEGER)))
            .toBe(Number.MAX_SAFE_INTEGER);

        for (const value of [
            undefined,
            '',
            ' ',
            '01',
            '+1',
            '-1',
            '1.0',
            '0x7',
            '7e0',
            'version-7',
            String(Number.MAX_SAFE_INTEGER + 1),
            ['7'],
            7,
        ]) {
            expect(parseCurrentRequestAttentionRouteVersion(value)).toBeUndefined();
        }
    });
});

describe('resolveCurrentRequestAttentionFocus', () => {
    it('focuses only a source still current at the exact observed version', () => {
        const current = {
            agentStateVersion: 7,
            agentState: agentState({
                requests: {
                    'permission-1': {
                        tool: 'Bash',
                        arguments: { command: 'private command' },
                        toolUseId: 'tool-1',
                    },
                },
            }),
        };

        const focus = resolveCurrentRequestAttentionFocus(current, {
            kind: 'permission_required',
            sourceId: 'permission-1',
            observedAgentStateVersion: 7,
        });
        expect(focus).toEqual({ kind: 'tool', toolUseId: 'tool-1' });

        const messages: Message[] = [{
            kind: 'tool-call',
            id: 'message-7',
            localId: null,
            createdAt: 1,
            tool: {
                callId: 'tool-1',
                name: 'Bash',
                state: 'running',
                input: {},
                createdAt: 1,
                startedAt: null,
                completedAt: null,
                description: null,
            },
            children: [],
        }];
        expect(resolveCurrentRequestAttentionMessageId(messages, focus)).toBe('message-7');
        expect(resolveCurrentRequestAttentionMessageId([], focus)).toBeUndefined();

        expect(resolveCurrentRequestAttentionFocus({ ...current, agentStateVersion: 8 }, {
            kind: 'permission_required',
            sourceId: 'permission-1',
            observedAgentStateVersion: 7,
        })).toEqual({ kind: 'general' });

        for (const observedAgentStateVersion of [undefined, Number.NaN, 1.5, -1]) {
            expect(resolveCurrentRequestAttentionFocus(current, {
                kind: 'permission_required',
                sourceId: 'permission-1',
                observedAgentStateVersion,
            })).toEqual({ kind: 'general' });
        }

        expect(resolveCurrentRequestAttentionFocus({
            ...current,
            agentState: agentState({ requests: {} }),
        }, {
            kind: 'permission_required',
            sourceId: 'permission-1',
            observedAgentStateVersion: 7,
        })).toEqual({ kind: 'general' });
    });

    it('targets an existing fallback communication without carrying its draft or payload', () => {
        const result = resolveCurrentRequestAttentionFocus({
            agentStateVersion: 3,
            agentState: agentState({
                communications: {
                    'answer-1': {
                        kind: 'form',
                        form: {
                            questions: [{
                                id: 'q1',
                                header: 'Private header',
                                question: 'Private question',
                                options: [],
                            }],
                        },
                    },
                },
            }),
        }, {
            kind: 'answer_required',
            sourceId: 'answer-1',
            observedAgentStateVersion: 3,
        });

        expect(result).toEqual({ kind: 'communication', sourceId: 'answer-1' });
        expect(JSON.stringify(result)).not.toContain('Private');
    });

    it('joins an older inline form by communication ID before targeting its message', () => {
        const focus = resolveCurrentRequestAttentionFocus({
            agentStateVersion: 4,
            agentState: agentState({
                communications: {
                    'answer-legacy': {
                        kind: 'form',
                        form: {
                            questions: [{
                                id: 'q1',
                                header: 'Choose',
                                question: 'Continue?',
                                options: [{ label: 'Yes', description: 'Continue' }],
                            }],
                        },
                    },
                },
            }),
        }, {
            kind: 'answer_required',
            sourceId: 'answer-legacy',
            observedAgentStateVersion: 4,
        });

        expect(focus).toEqual({ kind: 'tool', toolUseId: 'answer-legacy' });
        expect(resolveCurrentRequestAttentionMessageId([{
            kind: 'tool-call',
            id: 'message-legacy',
            localId: null,
            createdAt: 1,
            tool: {
                callId: 'answer-legacy',
                name: 'Question',
                state: 'running',
                input: {},
                createdAt: 1,
                startedAt: null,
                completedAt: null,
                description: null,
            },
            children: [],
        }], focus)).toBe('message-legacy');
    });
});
