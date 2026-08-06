import { describe, expect, it } from 'vitest';
import { resolveSessionRuntimeDisplay } from './sessionRuntimeDisplay';

describe('resolveSessionRuntimeDisplay', () => {
    it('describes a Windows Codex session with its explicitly selected model', () => {
        expect(resolveSessionRuntimeDisplay({
            metadata: {
                os: 'win32',
                flavor: 'codex',
                modelMode: 'gpt-5.6-sol',
            },
        })).toEqual({
            platformKind: 'windows',
            agentKind: 'codex',
            agentLabel: 'Codex',
            modelLabel: 'gpt-5.6-sol',
        });
    });

    it('uses the advertised model name instead of an opaque model code', () => {
        expect(resolveSessionRuntimeDisplay({
            metadata: {
                os: 'darwin',
                flavor: 'claude',
                modelMode: 'opus',
                models: [{ code: 'opus', value: 'Claude Opus 4.6', description: null }],
            },
        })).toEqual({
            platformKind: 'macos',
            agentKind: 'claude',
            agentLabel: 'Claude',
            modelLabel: 'Claude Opus 4.6',
        });
    });

    it('falls back to the linked machine platform and hides an unknown default model', () => {
        expect(resolveSessionRuntimeDisplay({
            metadata: { flavor: 'gemini' },
            machinePlatform: 'linux',
            modelMode: 'default',
        })).toEqual({
            platformKind: 'linux',
            agentKind: 'gemini',
            agentLabel: 'Gemini',
            modelLabel: null,
        });
    });
});
