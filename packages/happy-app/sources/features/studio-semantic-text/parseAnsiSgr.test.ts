import { describe, expect, it } from 'vitest';

import { parseAnsiSgr } from './parseAnsiSgr';

describe('parseAnsiSgr', () => {
    it('returns plain input as readable body text', () => {
        expect(parseAnsiSgr('plain text')).toEqual({
            text: 'plain text',
            runs: [{ text: 'plain text', role: 'body' }],
        });
    });

    it('applies standard colors and emphasis until reset', () => {
        expect(parseAnsiSgr('\u001B[1;31merror\u001B[0m plain')).toEqual({
            text: 'error plain',
            runs: [
                {
                    text: 'error',
                    role: 'body',
                    style: {
                        foreground: { mode: 'standard', index: 1 },
                        bold: true,
                    },
                },
                { text: ' plain', role: 'body' },
            ],
        });
    });

    it('represents indexed and truecolor values and resets them independently', () => {
        expect(parseAnsiSgr(
            '\u001B[38;5;208;48;2;12;34;56mstyled'
            + '\u001B[39m background'
            + '\u001B[49m plain',
        )).toEqual({
            text: 'styled background plain',
            runs: [
                {
                    text: 'styled',
                    role: 'body',
                    style: {
                        foreground: { mode: 'indexed', index: 208 },
                        background: { mode: 'rgb', red: 12, green: 34, blue: 56 },
                    },
                },
                {
                    text: ' background',
                    role: 'body',
                    style: {
                        background: { mode: 'rgb', red: 12, green: 34, blue: 56 },
                    },
                },
                { text: ' plain', role: 'body' },
            ],
        });
    });

    it.each([
        ['cursor and erase CSI', 'before\u001B[2J\u001B[10;4Hafter', 'beforeafter'],
        [
            'OSC 8 hyperlink',
            'open \u001B]8;;https://example.com\u001B\\label\u001B]8;;\u001B\\ safely',
            'open label safely',
        ],
        ['OSC 52 clipboard', 'before\u001B]52;c;c2VjcmV0\u0007after', 'beforeafter'],
    ])('neutralizes %s controls', (_name, input, text) => {
        expect(parseAnsiSgr(input)).toEqual({
            text,
            runs: text.length > 0 ? [{ text, role: 'body' }] : [],
        });
    });

    it('recovers safely from malformed and truncated SGR input', () => {
        expect(parseAnsiSgr('safe\u001B[38;2;999;0;0m text\u001B[31')).toEqual({
            text: 'safe text',
            runs: [{ text: 'safe text', role: 'body' }],
        });
    });

    it('bounds run growth by merging repeated equivalent styles', () => {
        const input = Array.from({ length: 1_000 }, () => '\u001B[31mX\u001B[31m').join('');

        const parsed = parseAnsiSgr(input);

        expect(parsed.text).toBe('X'.repeat(1_000));
        expect(parsed.runs).toEqual([{
            text: 'X'.repeat(1_000),
            role: 'body',
            style: { foreground: { mode: 'standard', index: 1 } },
        }]);
        expect(parsed.runs.length).toBeLessThanOrEqual(parsed.text.length);
    });
});
