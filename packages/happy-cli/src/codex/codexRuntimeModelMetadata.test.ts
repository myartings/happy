import { describe, expect, it } from 'vitest';
import type { Metadata } from '@/api/types';
import {
    withCodexEffectiveRouteMetadata,
    withCodexPendingLaunchRouteMetadata,
    withCodexRuntimeModelMetadata,
    withCodexUnconfirmedRouteRequestMetadata,
} from './codexRuntimeModelMetadata';

const metadata = {
    path: '/workspace/project',
    host: 'machine',
    homeDir: '/home/user',
    happyHomeDir: '/home/user/.happy',
    happyLibDir: '/opt/happy',
    happyToolsDir: '/opt/happy/tools',
    flavor: 'codex',
} satisfies Metadata;

describe('withCodexRuntimeModelMetadata', () => {
    it('publishes the concrete model requested by the Codex runtime', () => {
        expect(withCodexRuntimeModelMetadata(metadata, 'gpt-5.6-sol')).toMatchObject({
            modelMode: 'gpt-5.6-sol',
        });
    });

    it('publishes an explicit default marker when the model is reset', () => {
        expect(withCodexRuntimeModelMetadata(metadata, undefined)).toMatchObject({
            modelMode: 'default',
        });
        expect(withCodexRuntimeModelMetadata(metadata, null)).toMatchObject({
            modelMode: 'default',
        });
    });

    it('returns the existing metadata when the published model is unchanged', () => {
        const current = { ...metadata, modelMode: 'gpt-5.6-sol' };
        expect(withCodexRuntimeModelMetadata(current, 'gpt-5.6-sol')).toBe(current);
    });
});

describe('withCodexPendingLaunchRouteMetadata', () => {
    it('marks requested launch state as pending until App Server confirms it', () => {
        const pending = withCodexPendingLaunchRouteMetadata(metadata, 'gpt-5.6-luna');
        expect(pending).toMatchObject({
            modelMode: 'gpt-5.6-luna',
            codexLaunchRoutePending: true,
        });

        const confirmed = withCodexEffectiveRouteMetadata(pending, {
            model: 'gpt-5.6-luna',
            reasoningEffort: 'max',
        });
        expect(confirmed).not.toHaveProperty('codexLaunchRoutePending');
        expect(confirmed).toMatchObject({
            effectiveModel: 'gpt-5.6-luna',
            effectiveReasoningEffort: 'max',
        });
    });
});

describe('withCodexUnconfirmedRouteRequestMetadata', () => {
    const confirmed = {
        ...metadata,
        modelMode: 'gpt-5.6-sol',
        effectiveModel: 'gpt-5.6-sol',
        effectiveReasoningEffort: 'medium',
    };

    it.each([
        {
            name: 'model-only update',
            change: { modelUpdated: true, model: 'gpt-5.6-luna', effortUpdated: false },
            modelMode: 'gpt-5.6-luna',
        },
        {
            name: 'effort-only update',
            change: { modelUpdated: false, effortUpdated: true },
            modelMode: 'gpt-5.6-sol',
        },
        {
            name: 'combined reset',
            change: { modelUpdated: true, model: null, effortUpdated: true },
            modelMode: 'default',
        },
    ])('clears confirmed authority for $name', ({ change, modelMode }) => {
        const next = withCodexUnconfirmedRouteRequestMetadata(confirmed, change);
        expect(next).toMatchObject({ modelMode });
        expect(next).not.toHaveProperty('effectiveModel');
        expect(next).not.toHaveProperty('effectiveReasoningEffort');
    });

    it('preserves identity when neither requested value changed', () => {
        expect(withCodexUnconfirmedRouteRequestMetadata(confirmed, {
            modelUpdated: false,
            effortUpdated: false,
        })).toBe(confirmed);
    });
});

describe('withCodexEffectiveRouteMetadata', () => {
    it('publishes one complete App Server-confirmed model and effort pair', () => {
        expect(withCodexEffectiveRouteMetadata(metadata, {
            model: 'gpt-5.6-luna',
            reasoningEffort: 'max',
        })).toMatchObject({
            effectiveModel: 'gpt-5.6-luna',
            effectiveReasoningEffort: 'max',
        });
    });

    it('clears both fields when App Server evidence is partial', () => {
        const current = {
            ...metadata,
            effectiveModel: 'gpt-5.6-sol',
            effectiveReasoningEffort: 'medium',
        };

        expect(withCodexEffectiveRouteMetadata(current, {
            model: 'gpt-5.6-terra',
            reasoningEffort: null,
        })).not.toHaveProperty('effectiveModel');
        expect(withCodexEffectiveRouteMetadata(current, {
            model: 'gpt-5.6-terra',
            reasoningEffort: null,
        })).not.toHaveProperty('effectiveReasoningEffort');
    });

    it.each([
        { model: 'default', reasoningEffort: 'medium' },
        { model: 'null', reasoningEffort: 'medium' },
        { model: 'garbage', reasoningEffort: 'medium' },
        { model: 'gpt-5.6-sol\nspoofed', reasoningEffort: 'medium' },
        { model: ' gpt-5.6-sol ', reasoningEffort: 'medium' },
        { model: 'gpt-5.6-sol', reasoningEffort: 'turbo' },
        { model: 'gpt-5.6-sol', reasoningEffort: ' medium ' },
        { model: 'gpt-5.6-sol' },
        { reasoningEffort: 'medium' },
    ])('clears both fields for non-authoritative evidence %#', (evidence) => {
        const current = {
            ...metadata,
            effectiveModel: 'gpt-5.6-sol',
            effectiveReasoningEffort: 'medium',
        };

        expect(withCodexEffectiveRouteMetadata(current, evidence)).not.toHaveProperty('effectiveModel');
        expect(withCodexEffectiveRouteMetadata(current, evidence)).not.toHaveProperty('effectiveReasoningEffort');
    });

    it('preserves metadata identity when the confirmed pair is unchanged', () => {
        const current = {
            ...metadata,
            effectiveModel: 'gpt-5.6-sol',
            effectiveReasoningEffort: 'medium',
        };

        expect(withCodexEffectiveRouteMetadata(current, {
            model: 'gpt-5.6-sol',
            reasoningEffort: 'medium',
        })).toBe(current);
    });
});
