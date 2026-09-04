import { describe, expect, it } from 'vitest';

import {
    resolveCodexDisplayCandidate,
    resolveCodexSessionDisplayRoute,
} from './codexEffectiveRoute';

describe('resolveCodexSessionDisplayRoute', () => {
    it('shows the runtime-confirmed launch pair before any per-session pick', () => {
        expect(resolveCodexSessionDisplayRoute({
            modelMode: null,
            effortLevel: null,
            metadata: {
                effectiveModel: 'gpt-5.6-luna',
                effectiveReasoningEffort: 'max',
            },
        }, {
            modelMode: 'gpt-5.6-sol',
            effortLevel: 'medium',
        })).toEqual({
            modelMode: 'gpt-5.6-luna',
            effortLevel: 'max',
        });
    });

    it('keeps explicit per-session picks ahead of confirmed and global values', () => {
        expect(resolveCodexSessionDisplayRoute({
            modelMode: 'gpt-5.6-terra',
            effortLevel: 'high',
            metadata: {
                effectiveModel: 'gpt-5.6-luna',
                effectiveReasoningEffort: 'max',
            },
        }, {
            modelMode: 'gpt-5.6-sol',
            effortLevel: 'medium',
        })).toEqual({
            modelMode: 'gpt-5.6-terra',
            effortLevel: 'high',
        });
    });

    it('uses global defaults when effective evidence is incomplete or malformed', () => {
        expect(resolveCodexSessionDisplayRoute({
            modelMode: null,
            effortLevel: null,
            metadata: {
                effectiveModel: 'gpt-5.6-luna',
                effectiveReasoningEffort: 'turbo',
            },
        }, {
            modelMode: 'gpt-5.6-sol',
            effortLevel: 'medium',
        })).toEqual({
            modelMode: 'gpt-5.6-sol',
            effortLevel: 'medium',
        });
    });

    it('does not present a global effort as session truth while launch confirmation is pending', () => {
        const route = resolveCodexSessionDisplayRoute({
            modelMode: 'gpt-5.6-luna',
            effortLevel: null,
            metadata: { codexLaunchRoutePending: true },
        }, {
            modelMode: 'gpt-5.6-sol',
            effortLevel: 'medium',
        });
        expect(route).toEqual({
            modelMode: 'gpt-5.6-luna',
            effortLevel: null,
        });
        expect(resolveCodexDisplayCandidate(route, 'effortLevel', 'medium')).toBeNull();
    });
});
