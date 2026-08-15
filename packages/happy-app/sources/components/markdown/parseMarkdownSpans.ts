import type { MarkdownSpan, ParseMarkdownOptions } from "./parseMarkdown";

// Updated pattern to handle nested markdown and asterisks
const defaultPattern = /(\*\*(.*?)(?:\*\*|$))|(\*(.*?)(?:\*|$))|(\[([^\]]+)\](?:\(([^)]+)\))?)|(`(.*?)(?:`|$))/g;
const studioPattern = /(\*\*(.*?)(?:\*\*|$))|(~~(.*?)(?:~~|$))|(\*(.*?)(?:\*|$))|(\[([^\]]+)\](?:\(([^)]+)\))?)|(`(.*?)(?:`|$))/g;

function pushTextWithAutoLinks(spans: MarkdownSpan[], text: string, styles: MarkdownSpan['styles']) {
    const urlPattern = /https?:\/\/[^\s<]+/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = urlPattern.exec(text)) !== null) {
        const plainText = text.slice(lastIndex, match.index);
        if (plainText) {
            spans.push({ styles, text: plainText, url: null });
        }

        let url = match[0];
        let trailing = '';
        while (/[),.;:!?]$/.test(url)) {
            trailing = url.slice(-1) + trailing;
            url = url.slice(0, -1);
        }

        if (url) {
            spans.push({ styles, text: url, url });
        }
        if (trailing) {
            spans.push({ styles, text: trailing, url: null });
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        spans.push({ styles, text: text.slice(lastIndex), url: null });
    }
}

export function parseMarkdownSpans(markdown: string, header: boolean, options: ParseMarkdownOptions = {}) {
    const spans: MarkdownSpan[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const pattern = options.enableStudioExtensions ? studioPattern : defaultPattern;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(markdown)) !== null) {
        // Capture the text between the end of the last match and the start of this match as plain text
        const plainText = markdown.slice(lastIndex, match.index);
        if (plainText) {
            pushTextWithAutoLinks(spans, plainText, []);
        }

        if (match[1]) {
            // Bold
            if (header) {
                pushTextWithAutoLinks(spans, match[2], []);
            } else {
                pushTextWithAutoLinks(spans, match[2], ['bold']);
            }
        } else if (options.enableStudioExtensions && match[3]) {
            // Strikethrough
            pushTextWithAutoLinks(spans, match[4], ['strikethrough']);
        } else if (match[options.enableStudioExtensions ? 5 : 3]) {
            // Italic
            const italicText = match[options.enableStudioExtensions ? 6 : 4];
            if (header) {
                pushTextWithAutoLinks(spans, italicText, []);
            } else {
                pushTextWithAutoLinks(spans, italicText, ['italic']);
            }
        } else if (match[options.enableStudioExtensions ? 7 : 5]) {
            // Link - handle incomplete links (no URL part)
            const linkText = match[options.enableStudioExtensions ? 8 : 6];
            const linkUrl = match[options.enableStudioExtensions ? 9 : 7];
            if (linkUrl) {
                spans.push({ styles: [], text: linkText, url: linkUrl });
            } else {
                // If no URL part, treat as plain text with brackets
                pushTextWithAutoLinks(spans, `[${linkText}]`, []);
            }
        } else if (match[options.enableStudioExtensions ? 10 : 8]) {
            // Inline code
            spans.push({ styles: ['code'], text: match[options.enableStudioExtensions ? 11 : 9], url: null });
        }

        lastIndex = pattern.lastIndex;
    }

    // If there's any text remaining after the last match, treat it as plain
    if (lastIndex < markdown.length) {
        pushTextWithAutoLinks(spans, markdown.slice(lastIndex), []);
    }

    return spans;
}
