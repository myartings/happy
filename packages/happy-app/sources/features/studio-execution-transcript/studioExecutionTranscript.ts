import type { ToolCall } from '@/sync/typesMessage';
import type { AnsiColor, AnsiTextStyle, ParsedSemanticText } from '@/features/studio-semantic-text/semanticText';
import { parseAnsiSgr } from '@/features/studio-semantic-text/parseAnsiSgr';

const terminalToolNames = new Set([
    'Bash', 'CodexBash', 'GeminiBash', 'shell', 'execute', 'exec_command',
    'run_terminal_command', 'write_stdin',
]);

export type StudioExecutionTranscript = Readonly<{
    command: string;
    cwd: string | null;
    state: ToolCall['state'];
    durationMs: number | null;
    stdout: ParsedSemanticText | null;
    stderr: ParsedSemanticText | null;
    error: ParsedSemanticText | null;
}>;

type StudioAnsiRunStyle = Readonly<{
    color?: string;
    backgroundColor?: string;
    fontWeight?: '600';
    opacity?: number;
    fontStyle?: 'italic';
    textDecorationLine?: 'underline';
}>;

const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001A\u001C-\u001F\u007F-\u009F]/g;
const maximumTranscriptCodeUnits = 100_000;

function boundOutput(value: string): string {
    if (value.length <= maximumTranscriptCodeUnits) return value;
    let boundary = maximumTranscriptCodeUnits;
    const previousCodeUnit = value.charCodeAt(boundary - 1);
    if (previousCodeUnit >= 0xD800 && previousCodeUnit <= 0xDBFF) boundary -= 1;
    return value.slice(0, boundary);
}

function parseOutput(value: unknown): ParsedSemanticText | null {
    if (typeof value !== 'string' || value.length === 0) return null;
    const truncated = value.length > maximumTranscriptCodeUnits;
    const parsed = parseAnsiSgr(boundOutput(value).replace(/\r\n?/g, '\n'));
    const readableSuffix = truncated ? '\n…' : '';
    const text = parsed.text.replace(controlCharacters, '') + readableSuffix;
    if (!text) return null;

    const runs = parsed.runs.flatMap((run) => {
        const sanitized = run.text.replace(controlCharacters, '');
        return sanitized ? [{ ...run, text: sanitized }] : [];
    });
    if (truncated) runs.push({ text: readableSuffix, role: 'body' });
    return { text, runs };
}

function extractCwd(tool: ToolCall): string | null {
    const direct = tool.input?.cwd ?? tool.input?.working_directory ?? tool.input?.workdir;
    if (typeof direct === 'string' && direct.trim()) return direct.trim();

    const title = tool.input?.toolCall?.title;
    if (typeof title === 'string') {
        const match = title.match(/\[(?:current working directory|cwd)\s+([^\]]+)\]/i);
        if (match?.[1]) return match[1].trim();
    }
    return null;
}

function stringifyCommand(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (Array.isArray(value)) {
        const parts = value.filter((part): part is string => typeof part === 'string' && part.length > 0);
        return parts.length ? parts.join(' ') : null;
    }
    return null;
}

function extractCommand(tool: ToolCall): string | null {
    const parsedCmd = tool.input?.parsed_cmd;
    if (Array.isArray(parsedCmd)) {
        const command = parsedCmd.find((item) => typeof item?.cmd === 'string' && item.cmd.trim())?.cmd;
        if (command) return command.trim();
    }
    const direct = stringifyCommand(tool.input?.command ?? tool.input?.cmd);
    if (direct) return direct;
    const title = tool.input?.toolCall?.title;
    if (typeof title === 'string') {
        const bracketOffset = title.indexOf(' [');
        const command = (bracketOffset > 0 ? title.slice(0, bracketOffset) : title).trim();
        return command || null;
    }
    return null;
}

function outputFields(tool: ToolCall): { stdout: unknown; stderr: unknown; error: unknown } {
    if (tool.result && typeof tool.result === 'object' && !Array.isArray(tool.result)) {
        return {
            stdout: tool.result.stdout ?? tool.result.output,
            stderr: tool.result.stderr,
            error: tool.state === 'error' ? tool.result.error ?? tool.result.message : null,
        };
    }
    return tool.state === 'error'
        ? { stdout: null, stderr: null, error: tool.result }
        : { stdout: tool.result, stderr: null, error: null };
}

export function resolveStudioExecutionTranscript(tool: ToolCall): StudioExecutionTranscript | null {
    if (!terminalToolNames.has(tool.name)) return null;
    const command = extractCommand(tool);
    if (!command) return null;
    const output = outputFields(tool);
    const providerDurationMs = tool.result && typeof tool.result === 'object' && !Array.isArray(tool.result)
        && typeof tool.result.durationMs === 'number' && Number.isFinite(tool.result.durationMs) && tool.result.durationMs >= 0
        ? tool.result.durationMs
        : null;
    return {
        command,
        cwd: extractCwd(tool),
        state: tool.state,
        durationMs: providerDurationMs ?? (tool.startedAt !== null && tool.completedAt !== null
            ? Math.max(0, tool.completedAt - tool.startedAt)
            : null),
        stdout: parseOutput(output.stdout),
        stderr: parseOutput(output.stderr),
        error: parseOutput(output.error),
    };
}

const lightStandard = ['#5C5C5C', '#A23D3D', '#2E6A4F', '#8A6428', '#3F6B8F', '#76558B', '#327078', '#707070', '#8A8A8A', '#C65C54', '#4B8768', '#A77B35', '#5B83A5', '#9170A3', '#4E8B91', '#2D2D2D'];
const darkStandard = ['#A6A6A6', '#DC8A8A', '#80B99D', '#D2AD6E', '#8DB6D7', '#C8AED9', '#85C1C7', '#D0D0D0', '#777777', '#F09A93', '#9BCDB1', '#E4C589', '#A7CAE5', '#D7BEE5', '#A2D6DB', '#F0F0F0'];

function indexedColor(index: number, dark: boolean): string {
    if (index < 16) return (dark ? darkStandard : lightStandard)[index];
    if (index >= 232) {
        const channel = 8 + (index - 232) * 10;
        const adjusted = dark && channel < 92 ? 92 : !dark && channel > 188 ? 188 : channel;
        return `rgb(${adjusted}, ${adjusted}, ${adjusted})`;
    }
    const value = (part: number) => part === 0 ? 0 : 55 + part * 40;
    const offset = index - 16;
    return `rgb(${value(Math.floor(offset / 36))}, ${value(Math.floor(offset / 6) % 6)}, ${value(offset % 6)})`;
}

type Rgb = readonly [number, number, number];

function relativeLuminance([red, green, blue]: Rgb): number {
    const channel = (value: number) => {
        const normalized = value / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function contrast(left: Rgb, right: Rgb): number {
    const a = relativeLuminance(left);
    const b = relativeLuminance(right);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function ensureForegroundContrast(rgb: Rgb, dark: boolean): Rgb {
    const surface: Rgb = dark ? [35, 35, 35] : [250, 250, 249];
    if (contrast(rgb, surface) >= 4.5) return rgb;
    const target: Rgb = dark ? [255, 255, 255] : [0, 0, 0];
    for (let step = 1; step <= 10; step += 1) {
        const amount = step / 10;
        const candidate = rgb.map((value, index) => Math.round(value + (target[index] - value) * amount)) as unknown as Rgb;
        if (contrast(candidate, surface) >= 4.5) return candidate;
    }
    return target;
}

function rgbString(rgb: Rgb): string {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function indexedRgb(index: number): Rgb | null {
    if (index < 16 || index > 255) return null;
    if (index >= 232) {
        const channel = 8 + (index - 232) * 10;
        return [channel, channel, channel];
    }
    const value = (part: number) => part === 0 ? 0 : 55 + part * 40;
    const offset = index - 16;
    return [value(Math.floor(offset / 36)), value(Math.floor(offset / 6) % 6), value(offset % 6)];
}

function resolveAnsiColor(color: AnsiColor, dark: boolean): string {
    if (color.mode === 'standard') return (dark ? darkStandard : lightStandard)[color.index] ?? (dark ? '#E7E7E7' : '#2D2D2D');
    if (color.mode === 'indexed') {
        const rgb = indexedRgb(color.index);
        return rgb ? rgbString(ensureForegroundContrast(rgb, dark)) : indexedColor(color.index, dark);
    }
    const { red, green, blue } = color;
    if (red > green * 1.45 && red > blue * 1.45) return dark ? '#DC8A8A' : '#A23D3D';
    if (green > red * 1.35 && green > blue * 1.2) return dark ? '#80B99D' : '#2E6A4F';
    return rgbString(ensureForegroundContrast([red, green, blue], dark));
}

function resolveAnsiBackground(color: AnsiColor, dark: boolean): string {
    if (color.mode === 'standard' || color.mode === 'indexed') {
        const index = color.mode === 'standard' ? color.index : color.index;
        if (index === 1 || index === 9 || index === 196) return dark ? 'rgba(220, 138, 138, 0.20)' : 'rgba(162, 61, 61, 0.16)';
        if (index === 2 || index === 10 || index === 46) return dark ? 'rgba(128, 185, 157, 0.20)' : 'rgba(46, 106, 79, 0.14)';
    }
    if (color.mode === 'rgb') {
        if (color.red > color.green * 1.45 && color.red > color.blue * 1.45) return dark ? 'rgba(220, 138, 138, 0.20)' : 'rgba(162, 61, 61, 0.16)';
        if (color.green > color.red * 1.35 && color.green > color.blue * 1.2) return dark ? 'rgba(128, 185, 157, 0.20)' : 'rgba(46, 106, 79, 0.14)';
    }
    return dark ? 'rgba(166, 166, 166, 0.18)' : 'rgba(112, 112, 112, 0.12)';
}

export function resolveStudioAnsiRunStyle(style: AnsiTextStyle | undefined, dark: boolean): StudioAnsiRunStyle {
    if (!style) return {};
    return {
        ...(style.foreground ? { color: resolveAnsiColor(style.foreground, dark) } : {}),
        ...(style.background ? { backgroundColor: resolveAnsiBackground(style.background, dark) } : {}),
        ...(style.bold ? { fontWeight: '600' as const } : {}),
        ...(style.dim ? { opacity: 0.72 } : {}),
        ...(style.italic ? { fontStyle: 'italic' as const } : {}),
        ...(style.underline ? { textDecorationLine: 'underline' as const } : {}),
    };
}
