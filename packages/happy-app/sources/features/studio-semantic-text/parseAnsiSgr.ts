import type { AnsiColor, AnsiTextStyle, ParsedSemanticText, StyledSemanticTextRun } from './semanticText';

type MutableAnsiTextStyle = {
    foreground?: AnsiColor;
    background?: AnsiColor;
    bold?: true;
    dim?: true;
    italic?: true;
    underline?: true;
};

function snapshotStyle(style: MutableAnsiTextStyle): AnsiTextStyle | undefined {
    return Object.keys(style).length > 0 ? { ...style } : undefined;
}

function stylesEqual(left: AnsiTextStyle | undefined, right: AnsiTextStyle | undefined): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

function findCsiEnd(input: string, start: number): number {
    for (let index = start; index < input.length; index += 1) {
        const code = input.charCodeAt(index);
        if (code >= 0x40 && code <= 0x7E) {
            return index;
        }
    }
    return input.length;
}

function findOscEnd(input: string, start: number): number {
    for (let index = start; index < input.length; index += 1) {
        if (input.charCodeAt(index) === 0x07) {
            return index + 1;
        }
        if (input[index] === '\u001B' && input[index + 1] === '\\') {
            return index + 2;
        }
    }
    return input.length;
}

function applySgrCodes(style: MutableAnsiTextStyle, codes: readonly number[]): MutableAnsiTextStyle {
    let next = { ...style };

    for (let index = 0; index < codes.length; index += 1) {
        const code = codes[index];
        if (code === 0) {
            next = {};
        } else if (code === 1) {
            next.bold = true;
        } else if (code === 2) {
            next.dim = true;
        } else if (code === 3) {
            next.italic = true;
        } else if (code === 4) {
            next.underline = true;
        } else if (code === 22) {
            delete next.bold;
            delete next.dim;
        } else if (code === 23) {
            delete next.italic;
        } else if (code === 24) {
            delete next.underline;
        } else if (code === 38 || code === 48) {
            const target = code === 38 ? 'foreground' : 'background';
            const colorMode = codes[index + 1];

            if (colorMode === 5) {
                const colorIndex = codes[index + 2];
                if (Number.isInteger(colorIndex) && colorIndex >= 0 && colorIndex <= 255) {
                    next[target] = { mode: 'indexed', index: colorIndex };
                }
                index += 2;
            } else if (colorMode === 2) {
                const [red, green, blue] = codes.slice(index + 2, index + 5);
                if ([red, green, blue].every((channel) => (
                    Number.isInteger(channel) && channel >= 0 && channel <= 255
                ))) {
                    next[target] = { mode: 'rgb', red, green, blue };
                }
                index += 4;
            }
        } else if (code >= 30 && code <= 37) {
            next.foreground = { mode: 'standard', index: code - 30 };
        } else if (code >= 90 && code <= 97) {
            next.foreground = { mode: 'standard', index: code - 90 + 8 };
        } else if (code === 39) {
            delete next.foreground;
        } else if (code >= 40 && code <= 47) {
            next.background = { mode: 'standard', index: code - 40 };
        } else if (code >= 100 && code <= 107) {
            next.background = { mode: 'standard', index: code - 100 + 8 };
        } else if (code === 49) {
            delete next.background;
        }
    }

    return next;
}

export function parseAnsiSgr(input: string): ParsedSemanticText {
    const runs: StyledSemanticTextRun[] = [];
    let style: MutableAnsiTextStyle = {};
    let readableText = '';
    let inputOffset = 0;

    const appendText = (text: string) => {
        if (text.length > 0) {
            readableText += text;
            const styleSnapshot = snapshotStyle(style);
            const previousRun = runs.at(-1);
            if (previousRun && stylesEqual(previousRun.style, styleSnapshot)) {
                runs[runs.length - 1] = { ...previousRun, text: previousRun.text + text };
            } else {
                runs.push(styleSnapshot
                    ? { text, role: 'body', style: styleSnapshot }
                    : { text, role: 'body' });
            }
        }
    };

    while (inputOffset < input.length) {
        const escapeOffset = input.indexOf('\u001B', inputOffset);
        if (escapeOffset === -1) {
            appendText(input.slice(inputOffset));
            break;
        }

        appendText(input.slice(inputOffset, escapeOffset));
        const introducer = input[escapeOffset + 1];

        if (introducer === '[') {
            const finalOffset = findCsiEnd(input, escapeOffset + 2);
            if (finalOffset === input.length) {
                break;
            }

            const parameters = input.slice(escapeOffset + 2, finalOffset);
            if (input[finalOffset] === 'm' && /^[0-9;]*$/.test(parameters)) {
                const codes = parameters.length === 0
                    ? [0]
                    : parameters.split(';').map(Number);
                style = applySgrCodes(style, codes);
            }
            inputOffset = finalOffset + 1;
            continue;
        }

        if (introducer === ']') {
            inputOffset = findOscEnd(input, escapeOffset + 2);
            continue;
        }

        inputOffset = Math.min(escapeOffset + 2, input.length);
    }

    return {
        text: readableText,
        runs,
    };
}
