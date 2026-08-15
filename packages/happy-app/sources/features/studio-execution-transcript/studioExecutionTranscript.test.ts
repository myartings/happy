import { describe, expect, it } from 'vitest';

import type { ToolCall } from '@/sync/typesMessage';

import {
    resolveStudioAnsiRunStyle,
    resolveStudioExecutionTranscript,
} from './studioExecutionTranscript';

function tool(overrides: Partial<ToolCall> = {}): ToolCall {
    return {
        name: 'Bash',
        state: 'completed',
        input: { command: 'pnpm typecheck', cwd: '/tmp/happy' },
        result: { stdout: '\u001B[32m通过\u001B[0m 128 files 👋', stderr: '' },
        createdAt: 1,
        startedAt: 2,
        completedAt: 3,
        description: null,
        ...overrides,
    };
}

describe('Studio execution transcript model', () => {
    it('extracts real structured command, cwd, stdout, and readable ANSI-free text', () => {
        expect(resolveStudioExecutionTranscript(tool())).toMatchObject({
            command: 'pnpm typecheck',
            cwd: '/tmp/happy',
            state: 'completed',
            durationMs: 1,
            stdout: {
                text: '通过 128 files 👋',
                runs: [
                    { text: '通过', style: { foreground: { mode: 'standard', index: 2 } } },
                    { text: ' 128 files 👋' },
                ],
            },
            stderr: null,
            error: null,
        });
    });

    it('supports Codex and Gemini command/result shapes without inventing fields', () => {
        expect(resolveStudioExecutionTranscript(tool({
            name: 'CodexBash',
            input: { command: ['git', 'status'], cwd: '/repo', parsed_cmd: [{ type: 'bash', cmd: 'git status' }] },
            result: '\u001B[31mfailed\u001B[0m',
            state: 'error',
        }))).toMatchObject({ command: 'git status', cwd: '/repo', error: { text: 'failed' } });

        expect(resolveStudioExecutionTranscript(tool({
            name: 'execute',
            input: { toolCall: { title: 'swift test [current working directory /repo] (tests)' } },
            result: { stdout: 'ok', stderr: 'warning' },
        }))).toMatchObject({ command: 'swift test', cwd: '/repo', stdout: { text: 'ok' }, stderr: { text: 'warning' } });
    });

    it('prefers provider command duration and preserved aggregated output', () => {
        expect(resolveStudioExecutionTranscript(tool({
            name: 'CodexBash',
            state: 'error',
            startedAt: 100,
            completedAt: 200,
            result: {
                output: '\u001B[31m1 failed\u001B[0m\n',
                exitCode: 1,
                durationMs: 1250,
                status: 'failed',
                truncated: false,
            },
        }))).toMatchObject({
            state: 'error',
            durationMs: 1250,
            stdout: { text: '1 failed\n' },
        });
    });

    it('preserves the producer truncation marker without truncating it again', () => {
        const marker = '\n… output truncated';
        const output = `${'a'.repeat(100_000 - marker.length)}${marker}`;
        const transcript = resolveStudioExecutionTranscript(tool({
            name: 'CodexBash',
            result: { output, truncated: true },
        }));

        expect(transcript?.stdout?.text).toHaveLength(100_000);
        expect(transcript?.stdout?.text.endsWith(marker)).toBe(true);
    });

    it('preserves tabs, newlines, CJK, emoji, and long paths while removing unsafe controls', () => {
        const transcript = resolveStudioExecutionTranscript(tool({
            result: { stdout: '列一\t/very/long/path\nemoji 👩🏽‍💻\u0000hidden\u0007\u009Bunsafe', stderr: '' },
        }));
        expect(transcript?.stdout?.text).toBe('列一\t/very/long/path\nemoji 👩🏽‍💻hiddennsafe');
    });

    it('normalizes carriage-return progress output into readable transcript lines', () => {
        const transcript = resolveStudioExecutionTranscript(tool({
            result: { stdout: 'step 1\rstep 2\r\ndone', stderr: '' },
        }));
        expect(transcript?.stdout?.text).toBe('step 1\nstep 2\ndone');
    });

    it('bounds pathological output without splitting a surrogate pair', () => {
        const transcript = resolveStudioExecutionTranscript(tool({
            result: { stdout: `${'x'.repeat(99_999)}👩tail`, stderr: '' },
        }));
        expect(transcript?.stdout?.text).toHaveLength(100_001);
        expect(transcript?.stdout?.text.endsWith('x\n…')).toBe(true);
        expect(transcript?.stdout?.text).not.toContain('\uFFFD');
    });
});

describe('Studio ANSI presentation', () => {
    it('maps standard, indexed, RGB, and emphasis styles for light and dark Studio', () => {
        expect(resolveStudioAnsiRunStyle({
            foreground: { mode: 'standard', index: 2 },
            background: { mode: 'indexed', index: 196 },
            bold: true,
            italic: true,
            underline: true,
        }, false)).toMatchObject({
            color: '#2E6A4F', backgroundColor: 'rgba(162, 61, 61, 0.16)', fontWeight: '600',
            fontStyle: 'italic', textDecorationLine: 'underline',
        });
        expect(resolveStudioAnsiRunStyle({
            foreground: { mode: 'rgb', red: 255, green: 0, blue: 0 },
            dim: true,
        }, true)).toMatchObject({ color: '#DC8A8A', opacity: 0.72 });
        expect(resolveStudioAnsiRunStyle({
            background: { mode: 'rgb', red: 255, green: 255, blue: 0 },
        }, true)).toEqual({ backgroundColor: 'rgba(166, 166, 166, 0.18)' });
        expect(resolveStudioAnsiRunStyle({
            foreground: { mode: 'rgb', red: 255, green: 255, blue: 0 },
        }, false)).toEqual({ color: 'rgb(102, 102, 0)' });
        expect(resolveStudioAnsiRunStyle({
            foreground: { mode: 'indexed', index: 16 },
        }, true)).toEqual({ color: 'rgb(153, 153, 153)' });
    });
});
