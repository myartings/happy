import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Studio desktop build configuration', () => {
    it('clears the Expo export cache before Tauri embeds the frontend', () => {
        const config = JSON.parse(readFileSync(
            new URL('../../../src-tauri/tauri.conf.json', import.meta.url),
            'utf8',
        ));

        expect(config.build.beforeBuildCommand).toBe(
            'pnpm exec expo export --platform web --output-dir dist --clear',
        );
    });
});
