import { describe, expect, it } from 'vitest';
import type { Metadata } from '@/api/types';
import { withCodexRuntimeModelMetadata } from './codexRuntimeModelMetadata';

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
