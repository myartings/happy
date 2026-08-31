import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
    return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Studio composer state wiring', () => {
    it('feeds live composer state into the shell and primary/abort controls', () => {
        const input = readSource('../../components/AgentInput.tsx');

        expect(input).toContain('resolveStudioComposerStatePresentation({');
        expect(input).toContain('codexFirstEnabled: codexFirstContract.enabled,');
        expect(input).toContain('isDark: theme.dark,');
        expect(input).toContain('hasSuggestions: suggestions.length > 0,');
        expect(input).toContain('borderColor: composerStatePresentation.shellBorder');
        expect(input).toContain('backgroundColor: composerStatePresentation.primaryActionBackground');
        expect(input).toContain('composerStatePresentation?.abortActionBackground');
        expect(input).toContain("openPicker === 'permission'");
        expect(input).toContain('composerStatePresentation?.secondaryActiveBackground');
        expect(input).toContain('isStudioComposer ? hasComposerContent : hasText');
    });

    it('carries Studio state colors to attachment and autocomplete surfaces', () => {
        const input = readSource('../../components/AgentInput.tsx');
        const attachments = readSource('../../components/AgentInputAttachmentStrip.tsx');
        const autocomplete = readSource('../../components/AgentInputAutocomplete.tsx');

        expect(input).toContain('surfaceBackground={composerStatePresentation?.attachmentBackground}');
        expect(input).toContain('selectedBackground={composerStatePresentation?.autocompleteSelectedBackground}');
        expect(attachments).toContain('surfaceBackground?: string;');
        expect(autocomplete).toContain('selectedBackground?: string;');
        expect(autocomplete).toContain('selectedBackground ?? theme.colors.surfaceSelected');
    });
});
