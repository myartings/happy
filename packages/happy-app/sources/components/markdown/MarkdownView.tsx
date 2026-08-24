import { MarkdownSpan, parseMarkdown } from './parseMarkdown';
import * as React from 'react';
import { Image, Pressable, View, Platform } from 'react-native';
import { HorizontalScrollView } from '../HorizontalScrollView';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from '../StyledText';
import { Typography } from '@/constants/Typography';
import { SimpleSyntaxHighlighter } from '../SimpleSyntaxHighlighter';
import { Modal } from '@/modal';
import { useLocalSetting } from '@/sync/storage';
import { storeTempText } from '@/sync/persistence';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { MermaidRenderer } from './MermaidRenderer';
import { t } from '@/text';
import { isHttpMarkdownLink } from './linkUtils';
import { openExternalUrl } from '@/utils/openExternalUrl';
import { resolveMarkdownSpanPresentationStyles, resolveStudioMarkdownOptionState, type StudioSemanticTextPresentation } from '@/features/studio-semantic-text/studioSemanticTextPresentation';
import { useStudioSemanticTextPresentation } from '@/features/studio-semantic-text/useStudioSemanticTextPresentation';
import { useStudioInteractionState } from '@/features/studio-visual-style/useStudioInteractionState';

// Option type for callback
export type Option = {
    title: string;
};

export const MarkdownView = React.memo((props: { 
    markdown: string;
    onOptionPress?: (option: Option) => void;
    sessionId?: string;
    /**
     * The parent owns long-press copy (see LongPressCopyable). Suppresses native
     * selection and the built-in copy gesture so only one of them fires.
     */
    externalCopyHandler?: boolean;
}) => {
    // Backwards compatibility: The original version just returned the view, wrapping the list of blocks.
    // It made each of the individual text elements selectable. When we enable the markdownCopyV2 feature,
    // we disable the selectable property on individual text segments on mobile only. Instead, the long press
    // will be handled by a wrapper Pressable. If we don't disable the selectable property, then you will see
    // the native copy modal come up at the same time as the long press handler is fired.
    const markdownCopyV2 = useLocalSetting('markdownCopyV2');
    const selectable = Platform.OS === 'web' || !(markdownCopyV2 || props.externalCopyHandler);
    const router = useRouter();
    const studioPresentation = useStudioSemanticTextPresentation();
    const enableStudioExtensions = studioPresentation !== null;
    const blocks = React.useMemo(() => parseMarkdown(props.markdown, {
        enableStudioExtensions,
    }), [props.markdown, enableStudioExtensions]);

    const handleLinkPress = React.useCallback((url: string) => {
        if (!isHttpMarkdownLink(url)) {
            return;
        }

        void openExternalUrl(url);
    }, []);

    const handleLongPress = React.useCallback(() => {
        try {
            const textId = storeTempText(props.markdown);
            router.push(`/text-selection?textId=${textId}`);
        } catch (error) {
            console.error('Error storing text for selection:', error);
            Modal.alert('Error', 'Failed to open text selection. Please try again.');
        }
    }, [props.markdown, router]);
    const renderContent = () => {
        return (
            <View style={{ width: '100%' }}>
                {blocks.map((block, index) => {
                    if (block.type === 'text') {
                        return <RenderTextBlock spans={block.content} key={index} first={index === 0} last={index === blocks.length - 1} selectable={selectable} onLinkPress={handleLinkPress} studioPresentation={studioPresentation} />;
                    } else if (block.type === 'header') {
                        return <RenderHeaderBlock level={block.level} spans={block.content} key={index} first={index === 0} last={index === blocks.length - 1} selectable={selectable} onLinkPress={handleLinkPress} studioPresentation={studioPresentation} />;
                    } else if (block.type === 'blockquote') {
                        return <RenderBlockquoteBlock spans={block.content} key={index} first={index === 0} last={index === blocks.length - 1} selectable={selectable} onLinkPress={handleLinkPress} studioPresentation={studioPresentation} />;
                    } else if (block.type === 'horizontal-rule') {
                        return <View style={[style.horizontalRule, studioPresentation?.horizontalRule && {
                            backgroundColor: studioPresentation.horizontalRule.backgroundColor,
                            marginTop: studioPresentation.horizontalRule.marginVertical,
                            marginBottom: studioPresentation.horizontalRule.marginVertical,
                        }]} key={index} />;
                    } else if (block.type === 'list') {
                        return <RenderListBlock items={block.items} key={index} first={index === 0} last={index === blocks.length - 1} selectable={selectable} onLinkPress={handleLinkPress} studioPresentation={studioPresentation} />;
                    } else if (block.type === 'numbered-list') {
                        return <RenderNumberedListBlock items={block.items} key={index} first={index === 0} last={index === blocks.length - 1} selectable={selectable} onLinkPress={handleLinkPress} studioPresentation={studioPresentation} />;
                    } else if (block.type === 'code-block') {
                        return <RenderCodeBlock content={block.content} language={block.language} key={index} first={index === 0} last={index === blocks.length - 1} selectable={selectable} studioPresentation={studioPresentation} />;
                    } else if (block.type === 'mermaid') {
                        return <MermaidRenderer content={block.content} key={index} />;
                    } else if (block.type === 'options') {
                        return <RenderOptionsBlock items={block.items} key={index} first={index === 0} last={index === blocks.length - 1} selectable={selectable} onOptionPress={props.onOptionPress} studioPresentation={studioPresentation} />;
                    } else if (block.type === 'table') {
                        return <RenderTableBlock headers={block.headers} rows={block.rows} onLinkPress={handleLinkPress} selectable={selectable} key={index} first={index === 0} last={index === blocks.length - 1} studioPresentation={studioPresentation} />;
                    } else if (block.type === 'image') {
                        return <RenderImageBlock url={block.url} alt={block.alt} key={index} first={index === 0} last={index === blocks.length - 1} />;
                    } else {
                        return null;
                    }
                })}
            </View>
        );
    }

    if (props.externalCopyHandler || !markdownCopyV2) {
        return renderContent();
    }
    
    if (Platform.OS === 'web') {
        return renderContent();
    }
    
    // Use GestureDetector with LongPress gesture - it doesn't block pan gestures
    // so horizontal scrolling in code blocks and tables still works
    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
            handleLongPress();
        })
        .runOnJS(true);

    return (
        <GestureDetector gesture={longPressGesture}>
            <View style={{ width: '100%' }}>
                {renderContent()}
            </View>
        </GestureDetector>
    );
});

type RenderSpanProps = {
    spans: MarkdownSpan[];
    baseStyle?: any;
    selectable: boolean;
    onLinkPress: (url: string) => void;
    studioPresentation: StudioSemanticTextPresentation | null;
};

function RenderTextBlock(props: { spans: MarkdownSpan[], first: boolean, last: boolean, selectable: boolean, onLinkPress: (url: string) => void, studioPresentation: StudioSemanticTextPresentation | null }) {
    const textStyle = [style.text, props.studioPresentation?.body, props.studioPresentation?.roles.body];
    return <Text selectable={props.selectable} style={[textStyle, props.first && style.first, props.last && style.last]}><RenderSpans spans={props.spans} baseStyle={textStyle} selectable={props.selectable} onLinkPress={props.onLinkPress} studioPresentation={props.studioPresentation} /></Text>;
}

function RenderHeaderBlock(props: { level: 1 | 2 | 3 | 4 | 5 | 6, spans: MarkdownSpan[], first: boolean, last: boolean, selectable: boolean, onLinkPress: (url: string) => void, studioPresentation: StudioSemanticTextPresentation | null }) {
    const s = (style as any)[`header${props.level}`];
    const headerStyle = [style.header, s, props.studioPresentation?.roles.heading, props.studioPresentation?.headings[props.level], props.first && style.first, props.last && style.last];
    return <Text selectable={props.selectable} style={headerStyle}><RenderSpans spans={props.spans} baseStyle={headerStyle} selectable={props.selectable} onLinkPress={props.onLinkPress} studioPresentation={props.studioPresentation} /></Text>;
}

function RenderBlockquoteBlock(props: { spans: MarkdownSpan[], first: boolean, last: boolean, selectable: boolean, onLinkPress: (url: string) => void, studioPresentation: StudioSemanticTextPresentation | null }) {
    const textStyle = [style.text, style.blockquoteText, props.studioPresentation?.body, props.studioPresentation?.roles.body];
    const quotePresentation = props.studioPresentation?.blockquote;
    return (
        <View style={[style.blockquote, quotePresentation, quotePresentation && { borderLeftColor: quotePresentation.borderColor }, props.first && style.first, props.last && style.last]}>
            <Text selectable={props.selectable} style={textStyle}>
                <RenderSpans spans={props.spans} baseStyle={textStyle} selectable={props.selectable} onLinkPress={props.onLinkPress} studioPresentation={props.studioPresentation} />
            </Text>
        </View>
    );
}

const BULLETS = ['•', '◦', '▪'] as const;

function RenderListBlock(props: { items: { depth: number, spans: MarkdownSpan[] }[], first: boolean, last: boolean, selectable: boolean, onLinkPress: (url: string) => void, studioPresentation: StudioSemanticTextPresentation | null }) {
    const listStyle = [style.text, style.list, props.studioPresentation?.body, props.studioPresentation?.roles.body];
    const listPresentation = props.studioPresentation?.list;
    return (
        <View style={[style.listContainer, listPresentation && { gap: listPresentation.gap }]}>
            {props.items.map((item, index) => (
                <View key={index} style={[style.listRow, { paddingLeft: item.depth * (listPresentation?.indent ?? 16) }]}>
                    <Text selectable={false} style={[listStyle, style.listMarker, listPresentation && { color: listPresentation.markerColor }]}>{BULLETS[Math.min(item.depth, BULLETS.length - 1)]}</Text>
                    <Text selectable={props.selectable} style={[listStyle, { flex: 1 }]}><RenderSpans spans={item.spans} baseStyle={listStyle} selectable={props.selectable} onLinkPress={props.onLinkPress} studioPresentation={props.studioPresentation} /></Text>
                </View>
            ))}
        </View>
    );
}

function RenderNumberedListBlock(props: { items: { number: number, depth: number, spans: MarkdownSpan[] }[], first: boolean, last: boolean, selectable: boolean, onLinkPress: (url: string) => void, studioPresentation: StudioSemanticTextPresentation | null }) {
    const listStyle = [style.text, style.list, props.studioPresentation?.body, props.studioPresentation?.roles.body];
    const listPresentation = props.studioPresentation?.list;
    return (
        <View style={[style.listContainer, listPresentation && { gap: listPresentation.gap }]}>
            {props.items.map((item, index) => (
                <View key={index} style={[style.listRow, { paddingLeft: item.depth * (listPresentation?.indent ?? 16) }]}>
                    <Text selectable={false} style={[listStyle, style.listMarker, listPresentation && { color: listPresentation.markerColor }]}>{item.number}.</Text>
                    <Text selectable={props.selectable} style={[listStyle, { flex: 1 }]}><RenderSpans spans={item.spans} baseStyle={listStyle} selectable={props.selectable} onLinkPress={props.onLinkPress} studioPresentation={props.studioPresentation} /></Text>
                </View>
            ))}
        </View>
    );
}

function RenderCodeBlock(props: { content: string, language: string | null, first: boolean, last: boolean, selectable: boolean, studioPresentation: StudioSemanticTextPresentation | null }) {
    const [isHovered, setIsHovered] = React.useState(false);
    const codeChrome = props.studioPresentation?.codeChrome;

    const copyCode = React.useCallback(async () => {
        try {
            await Clipboard.setStringAsync(props.content);
            Modal.alert(t('common.success'), t('markdown.codeCopied'), [{ text: t('common.ok'), style: 'cancel' }]);
        } catch (error) {
            console.error('Failed to copy code:', error);
            Modal.alert(t('common.error'), t('markdown.copyFailed'), [{ text: t('common.ok'), style: 'cancel' }]);
        }
    }, [props.content]);

    return (
        <View
            style={[style.codeBlock, props.studioPresentation?.codeBlock, props.first && style.first, props.last && style.last]}
            // @ts-ignore - Web only events
            onMouseEnter={() => setIsHovered(true)}
            // @ts-ignore - Web only events
            onMouseLeave={() => setIsHovered(false)}
        >
            {props.language && <Text selectable={props.selectable} style={[style.codeLanguage, props.studioPresentation?.roles.statusSecondary, props.studioPresentation?.metadata, codeChrome && { color: codeChrome.labelColor }]}>{props.language}</Text>}
            <HorizontalScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            >
                <SimpleSyntaxHighlighter
                    code={props.content}
                    language={props.language}
                    selectable={props.selectable}
                />
            </HorizontalScrollView>
            <View
                style={[style.copyButtonWrapper, isHovered && style.copyButtonWrapperVisible]}
                {...(Platform.OS === 'web' ? ({ className: 'copy-button-wrapper' } as any) : {})}
            >
                <Pressable
                    style={[style.copyButton, codeChrome && { backgroundColor: codeChrome.copyBackgroundColor, borderColor: codeChrome.copyBorderColor }]}
                    onPress={copyCode}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.copy')}
                >
                    <Text style={[style.copyButtonText, codeChrome && { color: codeChrome.copyTextColor }]}>{t('common.copy')}</Text>
                </Pressable>
            </View>
        </View>
    );
}

function RenderImageBlock(props: { url: string, alt: string, first: boolean, last: boolean }) {
    const accessibleLabel = props.alt || 'Markdown image';

    return (
        <View style={[style.imageBlock, props.first && style.first, props.last && style.last]}>
            <Image
                source={{ uri: props.url }}
                style={style.image}
                accessibilityLabel={accessibleLabel}
                resizeMode="contain"
            />
            {props.alt ? (
                <Text style={style.imageCaption}>{props.alt}</Text>
            ) : null}
        </View>
    );
}

function RenderOptionsBlock(props: { 
    items: string[], 
    first: boolean, 
    last: boolean, 
    selectable: boolean,
    onOptionPress?: (option: Option) => void,
    studioPresentation: StudioSemanticTextPresentation | null,
}) {
    const optionPresentation = props.studioPresentation?.options;
    const containerPresentation = optionPresentation ? {
        gap: optionPresentation.gap,
        marginVertical: optionPresentation.marginVertical,
    } : null;
    const itemPresentation = optionPresentation ? {
        minHeight: optionPresentation.minHeight,
        justifyContent: 'center' as const,
        paddingHorizontal: optionPresentation.paddingHorizontal,
        paddingVertical: optionPresentation.paddingVertical,
        borderRadius: optionPresentation.borderRadius,
        borderWidth: optionPresentation.borderWidth,
        borderColor: optionPresentation.borderColor,
        backgroundColor: optionPresentation.backgroundColor,
    } : null;
    const textPresentation = optionPresentation ? {
        color: optionPresentation.textColor,
        fontSize: optionPresentation.fontSize,
        lineHeight: optionPresentation.lineHeight,
    } : null;

    return (
        <View style={[style.optionsContainer, containerPresentation, props.first && style.first, props.last && style.last]}>
            {props.items.map((item, index) => {
                if (props.onOptionPress) {
                    return (
                        <StudioMarkdownOption
                            item={item}
                            key={index}
                            selectable={props.selectable}
                            studioPresentation={props.studioPresentation}
                            onPress={() => props.onOptionPress?.({ title: item })}
                        />
                    );
                } else {
                    return (
                        <View key={index} style={[style.optionItem, itemPresentation]}>
                            <Text selectable={props.selectable} style={[style.optionText, textPresentation]}>{item}</Text>
                        </View>
                    );
                }
            })}
        </View>
    );
}

function StudioMarkdownOption(props: {
    item: string;
    selectable: boolean;
    studioPresentation: StudioSemanticTextPresentation | null;
    onPress: () => void;
}) {
    const optionPresentation = props.studioPresentation?.options;
    const interaction = useStudioInteractionState(optionPresentation !== undefined);

    return (
        <Pressable
            {...interaction.interactionProps}
            accessibilityRole={optionPresentation ? 'button' : undefined}
            style={({ pressed }) => [
                style.optionPressable,
                style.optionItem,
                optionPresentation && {
                    minHeight: optionPresentation.minHeight,
                    justifyContent: 'center' as const,
                    paddingHorizontal: optionPresentation.paddingHorizontal,
                    paddingVertical: optionPresentation.paddingVertical,
                    borderRadius: optionPresentation.borderRadius,
                    borderWidth: optionPresentation.borderWidth,
                },
                pressed && !optionPresentation && style.optionItemPressed,
                optionPresentation && resolveStudioMarkdownOptionState(props.studioPresentation!, {
                    focused: interaction.focused,
                    hovered: interaction.hovered,
                    pressed,
                }),
            ]}
            onPress={props.onPress}
        >
            <Text selectable={props.selectable} style={[
                style.optionText,
                optionPresentation && {
                    color: optionPresentation.textColor,
                    fontSize: optionPresentation.fontSize,
                    lineHeight: optionPresentation.lineHeight,
                },
            ]}>{props.item}</Text>
        </Pressable>
    );
}

function RenderSpans(props: RenderSpanProps) {
    return (<>
        {props.spans.map((span, index) => {
            const isExternalLink = span.url ? isHttpMarkdownLink(span.url) : false;
            const semanticStyles = resolveMarkdownSpanPresentationStyles(
                span,
                isExternalLink,
                props.studioPresentation,
            );
            if (span.url) {
                return (
                    <Text
                        key={index}
                        selectable={props.selectable}
                        accessibilityRole={isExternalLink ? 'link' : undefined}
                        style={[props.baseStyle, isExternalLink && style.link, span.styles.map(s => style[s]), semanticStyles]}
                        {...(isExternalLink && Platform.OS === 'web' ? { onClick: () => props.onLinkPress(span.url!) } as any : {})}
                        onPress={isExternalLink && Platform.OS !== 'web'
                            ? () => props.onLinkPress(span.url!)
                            : undefined}
                    >
                        {span.text}
                    </Text>
                );
            } else {
                return <Text key={index} selectable={props.selectable} style={[props.baseStyle, span.styles.map(s => style[s]), semanticStyles]}>{span.text}</Text>
            }
        })}
    </>)
}

// Plain-text length of a span array — used to estimate column widths.
function spansLength(spans: MarkdownSpan[]): number {
    let n = 0;
    for (const s of spans) n += s.text.length;
    return n;
}

const TABLE_MIN_COL_WIDTH = 80;
const TABLE_MAX_COL_WIDTH = 360;
const TABLE_CHAR_WIDTH = 8.5;  // approx px per char at 16px default font
const TABLE_CELL_H_PADDING = 24;

// Row-first layout with content-estimated column widths.
//
// - Each column's width is picked from the widest text in that column (header +
//   rows), clamped to [MIN, MAX]. This gives column-alignment across rows and
//   lets narrow columns (like "1, 2, 3") stay narrow.
// - Each row is a flex row — default `alignItems: 'stretch'` makes all cells in
//   a row match the tallest cell's height.
// - Wrapped in a horizontal ScrollView so wide tables still scroll instead of
//   being squashed unreadably.
function RenderTableBlock(props: {
    headers: MarkdownSpan[][],
    rows: MarkdownSpan[][][],
    onLinkPress: (url: string) => void,
    selectable: boolean,
    first: boolean,
    last: boolean,
    studioPresentation: StudioSemanticTextPresentation | null,
}) {
    const columnCount = props.headers.length;
    const rowCount = props.rows.length;
    const isLastCol = (colIndex: number) => colIndex === columnCount - 1;
    const isLastRow = (rowIndex: number) => rowIndex === rowCount - 1;
    const tablePresentation = props.studioPresentation?.table;
    const bottomBorderStyle = tablePresentation && { borderBottomColor: tablePresentation.borderColor };
    const rightBorderStyle = tablePresentation && { borderRightColor: tablePresentation.borderColor };
    const cellStyle = tablePresentation && {
        paddingHorizontal: tablePresentation.cellPaddingHorizontal,
        paddingVertical: tablePresentation.cellPaddingVertical,
    };

    const columnWidths = React.useMemo(() => {
        const widths = new Array(columnCount).fill(0);
        for (let c = 0; c < columnCount; c++) {
            widths[c] = Math.max(widths[c], spansLength(props.headers[c] ?? []));
        }
        for (const row of props.rows) {
            for (let c = 0; c < columnCount; c++) {
                widths[c] = Math.max(widths[c], spansLength(row[c] ?? []));
            }
        }
        return widths.map(len => Math.min(TABLE_MAX_COL_WIDTH, Math.max(TABLE_MIN_COL_WIDTH, len * TABLE_CHAR_WIDTH + TABLE_CELL_H_PADDING)));
    }, [props.headers, props.rows, columnCount]);

    return (
        <View style={[style.tableContainer, tablePresentation && { borderColor: tablePresentation.borderColor, borderRadius: tablePresentation.borderRadius }, props.first && style.first, props.last && style.last]}>
            {/* flexGrow:0 stops iOS from stretching the horizontal ScrollView
                vertically to fill the parent — the cause of the table's frame
                extending down past the last row into empty space. */}
            <HorizontalScrollView style={{ flexGrow: 0 }}>
                <View>
                    {/* Header row */}
                    <View style={[style.tableRow, style.tableHeaderRow, bottomBorderStyle]}>
                        {props.headers.map((header, colIndex) => (
                            <View
                                key={`header-${colIndex}`}
                                style={[style.tableCell, style.tableHeaderCell, cellStyle, tablePresentation && { backgroundColor: tablePresentation.headerBackgroundColor }, { width: columnWidths[colIndex] }, !isLastCol(colIndex) && style.tableCellBorderRight, !isLastCol(colIndex) && rightBorderStyle]}
                            >
                                <Text style={[style.tableHeaderText, tablePresentation && { fontSize: tablePresentation.headerFontSize, lineHeight: tablePresentation.lineHeight }]}>
                                    <RenderSpans spans={header} baseStyle={[style.tableHeaderText, tablePresentation && { fontSize: tablePresentation.headerFontSize, lineHeight: tablePresentation.lineHeight }, props.studioPresentation?.roles.heading]} onLinkPress={props.onLinkPress} selectable={props.selectable} studioPresentation={props.studioPresentation} />
                                </Text>
                            </View>
                        ))}
                    </View>
                    {/* Data rows */}
                    {props.rows.map((row, rowIndex) => (
                        <View
                            key={`row-${rowIndex}`}
                            style={[style.tableRow, !isLastRow(rowIndex) && style.tableRowBorderBottom, !isLastRow(rowIndex) && bottomBorderStyle]}
                        >
                            {props.headers.map((_, colIndex) => (
                                <View
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    style={[style.tableCell, cellStyle, { width: columnWidths[colIndex] }, !isLastCol(colIndex) && style.tableCellBorderRight, !isLastCol(colIndex) && rightBorderStyle]}
                                >
                                    <Text style={[style.tableCellText, tablePresentation && { fontSize: tablePresentation.bodyFontSize, lineHeight: tablePresentation.lineHeight }]}>
                                        <RenderSpans spans={row[colIndex] ?? []} baseStyle={[style.tableCellText, tablePresentation && { fontSize: tablePresentation.bodyFontSize, lineHeight: tablePresentation.lineHeight }, props.studioPresentation?.roles.body]} onLinkPress={props.onLinkPress} selectable={props.selectable} studioPresentation={props.studioPresentation} />
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </HorizontalScrollView>
        </View>
    );
}


const style = StyleSheet.create((theme) => ({

    // Plain text

    text: {
        ...Typography.default(),
        fontSize: 16,
        lineHeight: 25,
        marginTop: 8,
        marginBottom: 10,
        color: theme.colors.text,
        fontWeight: '400',
    },

    italic: {
        fontStyle: 'italic',
    },
    bold: {
        ...Typography.default('semiBold'),
        fontWeight: '700',
    },
    semibold: {
        ...Typography.default('semiBold'),
        fontWeight: '600',
    },
    strikethrough: {
        textDecorationLine: 'line-through',
    },
    code: {
        ...Typography.mono(),
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.text,
    },
    link: {
        ...Typography.default(),
        color: theme.colors.text,
        fontWeight: '400',
        textDecorationLine: 'underline',
        cursor: 'pointer',
    },

    // Headers

    header: {
        ...Typography.default('semiBold'),
        color: theme.colors.text,
    },
    header1: {
        fontSize: 16,
        lineHeight: 24,  // Reduced from 36 to 24
        fontWeight: '900',
        marginTop: 16,
        marginBottom: 8
    },
    header2: {
        fontSize: 20,
        lineHeight: 24,  // Reduced from 36 to 32
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8
    },
    header3: {
        fontSize: 16,
        lineHeight: 28,  // Reduced from 32 to 28
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    header4: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 8,
    },
    header5: {
        fontSize: 16,
        lineHeight: 24,  // Reduced from 28 to 24
        fontWeight: '600'
    },
    header6: {
        fontSize: 16,
        lineHeight: 24, // Reduced from 28 to 24
        fontWeight: '600'
    },

    //
    // List
    //

    list: {
        ...Typography.default(),
        color: theme.colors.text,
        marginTop: 0,
        marginBottom: 0,
    },
    listContainer: {
        flexDirection: 'column',
        marginBottom: 8,
        gap: 6,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    listMarker: {
        marginRight: 8,
        marginTop: 1,
    },

    blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.divider,
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    blockquoteText: {
        marginTop: 0,
        marginBottom: 0,
    },

    //
    // Common
    //

    first: {
        // marginTop: 0
    },
    last: {
        // marginBottom: 0
    },

    //
    // Code Block
    //

    codeBlock: {
        backgroundColor: theme.colors.surfaceHighest,
        borderRadius: 8,
        marginVertical: 8,
        position: 'relative',
        zIndex: 1,
        width: '100%',
    },
    copyButtonWrapper: {
        position: 'absolute',
        top: 8,
        right: 8,
        opacity: 0,
        zIndex: 10,
        elevation: 10,
        pointerEvents: 'none',
    },
    copyButtonWrapperVisible: {
        opacity: 1,
        pointerEvents: 'auto',
    },
    codeLanguage: {
        ...Typography.mono(),
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 8,
        paddingHorizontal: 16,
        marginBottom: 0,
    },
    codeText: {
        ...Typography.mono(),
        color: theme.colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    horizontalRule: {
        height: 1,
        backgroundColor: theme.colors.divider,
        marginTop: 8,
        marginBottom: 8,
    },
    imageBlock: {
        width: '100%',
        maxWidth: 520,
        marginVertical: 8,
        alignSelf: 'flex-start',
        gap: 8,
    },
    image: {
        width: '100%',
        minHeight: 160,
        height: 240,
        borderRadius: 12,
        backgroundColor: theme.colors.surfaceHighest,
    },
    imageCaption: {
        ...Typography.default(),
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.textSecondary,
    },
    copyButtonContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        elevation: 10,
        opacity: 1,
    },
    copyButtonContainerHidden: {
        opacity: 0,
    },
    copyButton: {
        backgroundColor: theme.colors.surfaceHighest,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.divider,
        cursor: 'pointer',
    },
    copyButtonHidden: {
        display: 'none',
    },
    copyButtonCopied: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
        opacity: 1,
    },
    copyButtonText: {
        ...Typography.default(),
        color: theme.colors.text,
        fontSize: 12,
        lineHeight: 16,
    },

    //
    // Options Block
    //

    optionsContainer: {
        flexDirection: 'column',
        gap: 8,
        marginVertical: 8,
    },
    optionPressable: {
        borderRadius: Platform.select({ web: 8, default: 18 }),
    },
    optionItem: {
        backgroundColor: Platform.select({ web: theme.colors.surfaceHighest, default: theme.colors.surface }),
        borderRadius: Platform.select({ web: 8, default: 18 }),
        paddingHorizontal: 16,
        paddingVertical: Platform.select({ web: 12, default: 14 }),
        borderWidth: Platform.select({ web: 1, default: StyleSheet.hairlineWidth }),
        borderColor: theme.colors.divider,
        overflow: 'hidden',
    },
    optionItemPressed: {
        backgroundColor: Platform.select({ web: theme.colors.surfaceHigh, default: theme.colors.surfacePressed }),
        opacity: Platform.select({ web: 0.7, default: 1 }),
    },
    optionText: {
        ...Typography.default(),
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.text,
    },

    //
    // Table
    //

    tableContainer: {
        marginVertical: 8,
        borderWidth: 1,
        borderColor: theme.colors.divider,
        borderRadius: 8,
        overflow: 'hidden',
        maxWidth: '100%',
        alignSelf: 'flex-start',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    tableRowBorderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    tableHeaderRow: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    tableCell: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'flex-start',
    },
    tableCellBorderRight: {
        borderRightWidth: 1,
        borderRightColor: theme.colors.divider,
    },
    tableHeaderCell: {
        backgroundColor: theme.colors.surfaceHigh,
    },
    tableHeaderText: {
        ...Typography.default('semiBold'),
        color: theme.colors.text,
        fontSize: 16,
        lineHeight: 24,
    },
    tableCellText: {
        ...Typography.default(),
        color: theme.colors.text,
        fontSize: 16,
        lineHeight: 24,
    },

    // Add global style for Web platform (Unistyles supports this via compiler plugin)
    ...(Platform.OS === 'web' ? {
        // Web-only CSS styles
        _____web_global_styles: {}
    } : {}),
}));
