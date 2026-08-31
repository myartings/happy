import { describe, expect, it } from 'vitest';

import { resolveCodexFirstUserMessagePresentation } from './codexFirstConversationPresentation';

describe('Codex-first conversation presentation', () => {
    it('uses the observed neutral compact bubble for the default light preset', () => {
        expect(resolveCodexFirstUserMessagePresentation({
            enabled: true,
            isDark: false,
            selectedColor: 'gray',
        })).toEqual({
            backgroundColor: '#F3F3F4',
            borderColor: '#F3F3F4',
            borderRadius: 16,
            contentMaxWidth: '82%',
            marginBottom: 8,
            paddingHorizontal: 14,
            paddingVertical: 7,
        });
    });

    it('preserves a Happy-selected custom bubble color inside the Codex geometry', () => {
        expect(resolveCodexFirstUserMessagePresentation({
            enabled: true,
            isDark: false,
            selectedColor: 'blue',
        })).toMatchObject({
            backgroundColor: '#E8F2FF',
            borderColor: '#9CC9FF',
            contentMaxWidth: '82%',
        });
    });

    it('leaves legacy and standalone message presentation untouched', () => {
        expect(resolveCodexFirstUserMessagePresentation({
            enabled: false,
            isDark: false,
            selectedColor: 'gray',
        })).toBeNull();
    });
});
