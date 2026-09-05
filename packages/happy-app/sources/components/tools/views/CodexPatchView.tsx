import * as React from 'react';
import { Pressable, View, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { ToolCall } from '@/sync/typesMessage';
import { ToolSectionView } from '../ToolSectionView';
import { Metadata } from '@/sync/storageTypes';
import { resolvePath } from '@/utils/pathUtils';
import { ToolDiffView } from '@/components/tools/ToolDiffView';
import { countContentStats, countPatchStats } from '@/components/diff/engine/stats';
import { materializeUnifiedDiffPatch } from '@/utils/codexUnifiedDiff';
import { t } from '@/text';
import { useStudioToolPresentation } from '@/features/studio-tool-presentation/useStudioToolPresentation';

interface CodexPatchViewProps {
    tool: ToolCall;
    metadata: Metadata | null;
    sessionId?: string;
    messageId?: string;
    focusFile?: string;
    permissionFooter?: React.ReactNode;
}

type CodexPatchEntry = {
    diff?: string;
    unified_diff?: string;
    type?: string;
    content?: string;
    move_path?: string | null;
    oldContent?: string;
    newContent?: string;
    old_content?: string;
    new_content?: string;
    kind?: {
        type?: string;
        move_path?: string | null;
    };
    add?: {
        content?: string;
    };
    modify?: {
        old_content?: string;
        new_content?: string;
    };
    delete?: {
        content?: string;
    };
};

function getPatchChanges(input: any): Record<string, CodexPatchEntry> | null {
    if (Array.isArray(input?.changes)) {
        return normalizePatchChangeList(input.changes);
    }
    if (input?.changes && typeof input.changes === 'object') {
        return normalizePatchChangeRecord(input.changes as Record<string, unknown>);
    }
    if (Array.isArray(input?.fileChanges)) {
        return normalizePatchChangeList(input.fileChanges);
    }
    if (input?.fileChanges && typeof input.fileChanges === 'object') {
        return normalizePatchChangeRecord(input.fileChanges as Record<string, unknown>);
    }
    return null;
}

function normalizePatchChangeRecord(changes: Record<string, unknown>): Record<string, CodexPatchEntry> | null {
    const normalized: Record<string, CodexPatchEntry> = {};

    for (const [path, value] of Object.entries(changes)) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
        const entry = value as CodexPatchEntry;
        if (hasRenderablePatchInput(entry)) normalized[path] = entry;
    }

    return Object.keys(normalized).length > 0 ? normalized : null;
}

function normalizePatchChangeList(changes: unknown[]): Record<string, CodexPatchEntry> | null {
    const normalized: Record<string, CodexPatchEntry> = {};

    for (const change of changes) {
        if (!change || typeof change !== 'object' || Array.isArray(change)) {
            continue;
        }

        const changeRecord = change as Record<string, unknown>;
        const path = typeof changeRecord.path === 'string' ? changeRecord.path : null;
        if (!path) {
            continue;
        }

        const kind = changeRecord.kind && typeof changeRecord.kind === 'object' && !Array.isArray(changeRecord.kind)
            ? changeRecord.kind as { type?: string; move_path?: string | null }
            : null;
        const type = typeof changeRecord.type === 'string' ? changeRecord.type : (kind?.type ?? null);
        const entry: CodexPatchEntry = {
            ...(kind ? { kind } : type ? { kind: { type, move_path: null } } : {}),
        };

        if (typeof changeRecord.diff === 'string') {
            entry.diff = changeRecord.diff;
        } else if (typeof changeRecord.unified_diff === 'string') {
            entry.unified_diff = changeRecord.unified_diff;
        }

        if (changeRecord.add && typeof changeRecord.add === 'object' && !Array.isArray(changeRecord.add)) {
            entry.add = changeRecord.add as { content?: string };
        }
        if (changeRecord.modify && typeof changeRecord.modify === 'object' && !Array.isArray(changeRecord.modify)) {
            entry.modify = changeRecord.modify as { old_content?: string; new_content?: string };
        }
        if (changeRecord.delete && typeof changeRecord.delete === 'object' && !Array.isArray(changeRecord.delete)) {
            entry.delete = changeRecord.delete as { content?: string };
        }

        if (type === 'add' && typeof changeRecord.content === 'string') {
            entry.add = { content: changeRecord.content };
        }
        if (type === 'delete' && typeof changeRecord.content === 'string') {
            entry.delete = { content: changeRecord.content };
        }

        if (hasRenderablePatchInput(entry)) normalized[path] = entry;
    }

    return Object.keys(normalized).length > 0 ? normalized : null;
}

type PatchInput =
    | { kind: 'patch'; patch: string }
    | { kind: 'pair'; oldText: string; newText: string };

function getPatchInput(change: CodexPatchEntry): PatchInput | null {
    if (typeof change.diff === 'string') {
        return { kind: 'patch', patch: change.diff };
    }
    if (typeof change.unified_diff === 'string') {
        return { kind: 'patch', patch: change.unified_diff };
    }
    if (change.modify) {
        if (typeof change.modify !== 'object' || Array.isArray(change.modify)) return null;
        const oldText = change.modify.old_content;
        const newText = change.modify.new_content;
        if ((oldText !== undefined && typeof oldText !== 'string')
            || (newText !== undefined && typeof newText !== 'string')) return null;
        return { kind: 'pair', oldText: oldText ?? '', newText: newText ?? '' };
    }
    if (change.oldContent !== undefined || change.newContent !== undefined) {
        if ((change.oldContent !== undefined && typeof change.oldContent !== 'string')
            || (change.newContent !== undefined && typeof change.newContent !== 'string')) return null;
        return { kind: 'pair', oldText: change.oldContent ?? '', newText: change.newContent ?? '' };
    }
    if (change.old_content !== undefined || change.new_content !== undefined) {
        if ((change.old_content !== undefined && typeof change.old_content !== 'string')
            || (change.new_content !== undefined && typeof change.new_content !== 'string')) return null;
        return { kind: 'pair', oldText: change.old_content ?? '', newText: change.new_content ?? '' };
    }
    if (change.add) {
        if (typeof change.add !== 'object' || Array.isArray(change.add)) return null;
        if (change.add.content !== undefined && typeof change.add.content !== 'string') return null;
        return { kind: 'pair', oldText: '', newText: change.add.content ?? '' };
    }
    if (getPatchKindType(change) === 'add' && typeof change.content === 'string') {
        return { kind: 'pair', oldText: '', newText: change.content };
    }
    if (change.delete) {
        if (typeof change.delete !== 'object' || Array.isArray(change.delete)) return null;
        if (change.delete.content !== undefined && typeof change.delete.content !== 'string') return null;
        return { kind: 'pair', oldText: change.delete.content ?? '', newText: '' };
    }
    if (getPatchKindType(change) === 'delete' && typeof change.content === 'string') {
        return { kind: 'pair', oldText: change.content, newText: '' };
    }
    return null;
}

function hasRenderablePatchInput(change: CodexPatchEntry): boolean {
    const input = getPatchInput(change);
    if (!input) return false;
    if (input.kind === 'patch') return input.patch.trim().length > 0;
    return input.oldText.length > 0 || input.newText.length > 0;
}

function getPatchKindType(change: CodexPatchEntry): string | null {
    return change.kind?.type ?? change.type ?? null;
}

function getPatchKindLabel(change: CodexPatchEntry): string | null {
    switch (getPatchKindType(change)) {
        case 'add':
            return 'new';
        case 'delete':
            return 'delete';
        case 'update':
            return getPatchMovePath(change) ? 'move' : 'edit';
        default:
            return null;
    }
}

function getPatchMovePath(change: CodexPatchEntry): string | null {
    if (typeof change.kind?.move_path === 'string') return change.kind.move_path;
    if (typeof change.move_path === 'string') return change.move_path;
    return null;
}

export function hasRenderableCodexPatchInput(input: unknown): boolean {
    return getPatchChanges(input) !== null;
}

export const CodexPatchView = React.memo<CodexPatchViewProps>(({ tool, metadata, permissionFooter }) => {
    const { input } = tool;
    const changes = getPatchChanges(input);

    const entries = changes ? Object.entries(changes) : [];

    if (entries.length === 0) {
        return null;
    }

    return (
        <>
            {entries.map(([file, change], index) => (
                <CodexPatchFileView
                    key={file}
                    file={file}
                    change={change}
                    metadata={metadata}
                    permissionFooter={index === entries.length - 1 ? permissionFooter : null}
                />
            ))}
        </>
    );
});

export const CodexPatchViewFull = React.memo<CodexPatchViewProps>(({ tool, metadata, focusFile }) => {
    const changes = getPatchChanges(tool.input);
    const allEntries = changes ? Object.entries(changes) : [];
    const focused = focusFile ? allEntries.filter(([file]) => file === focusFile) : [];
    const entries = focused.length > 0 ? focused : allEntries;

    if (entries.length === 0) return null;

    return (
        <View style={styles.fullViewContainer}>
            {entries.map(([file, change]) => (
                <CodexPatchFileContent key={file} file={file} change={change} metadata={metadata} />
            ))}
        </View>
    );
});

const CodexPatchFileContent = React.memo(function CodexPatchFileContent(props: {
    file: string;
    change: CodexPatchEntry;
    metadata: Metadata | null;
}) {
    const { file, change, metadata } = props;
    const { theme } = useUnistyles();
    const filePath = resolvePath(file, metadata);
    const diffInput = getPatchInput(change);
    const kindLabel = getPatchKindLabel(change);
    const rawMovePath = getPatchMovePath(change);
    const movePath = rawMovePath ? resolvePath(rawMovePath, metadata) : null;
    const fileName = file.split('/').pop() ?? file;
    const displayPatch = diffInput?.kind === 'patch'
        ? materializeUnifiedDiffPatch(diffInput.patch, file, getPatchKindType(change))
        : null;
    const stats = !diffInput
        ? null
        : diffInput.kind === 'patch'
            ? countPatchStats(displayPatch ?? diffInput.patch)
            : countContentStats(diffInput.oldText, diffInput.newText);

    return (
        <View style={styles.fullViewFile}>
            <View style={styles.fileHeader}>
                <View style={styles.fileHeaderMain}>
                    <Octicons name="file-diff" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.filePath}>{filePath}</Text>
                    {kindLabel ? <Text style={styles.kindLabel}>{kindLabel}</Text> : null}
                    {stats && (stats.additions > 0 || stats.deletions > 0) ? (
                        <View style={styles.stats}>
                            {stats.additions > 0 ? <Text style={styles.added}>+{stats.additions}</Text> : null}
                            {stats.deletions > 0 ? <Text style={styles.removed}>-{stats.deletions}</Text> : null}
                        </View>
                    ) : null}
                </View>
                {movePath ? <Text style={styles.movePath}>{movePath}</Text> : null}
            </View>
            {displayPatch ? (
                <ToolDiffView patch={displayPatch} fileName={fileName} />
            ) : diffInput?.kind === 'pair' && (diffInput.oldText.length > 0 || diffInput.newText.length > 0) ? (
                <ToolDiffView oldText={diffInput.oldText} newText={diffInput.newText} fileName={fileName} />
            ) : null}
        </View>
    );
});

const CodexPatchFileView = React.memo(function CodexPatchFileView(props: {
    file: string;
    change: CodexPatchEntry;
    metadata: Metadata | null;
    permissionFooter?: React.ReactNode;
}) {
    const { file, change, metadata, permissionFooter } = props;
    const { theme } = useUnistyles();
    const studioPresentation = useStudioToolPresentation();
    const [expanded, setExpanded] = React.useState(() => studioPresentation !== null);

    const filePath = resolvePath(file, metadata);
    const diffInput = getPatchInput(change);
    const kindLabel = getPatchKindLabel(change);
    const rawMovePath = getPatchMovePath(change);
    const movePath = rawMovePath ? resolvePath(rawMovePath, metadata) : null;
    const fileName = file.split('/').pop() ?? file;
    const displayPatch = diffInput?.kind === 'patch'
        ? materializeUnifiedDiffPatch(diffInput.patch, file, getPatchKindType(change))
        : null;
    const stats = !diffInput
        ? null
        : diffInput.kind === 'patch'
            ? countPatchStats(displayPatch ?? diffInput.patch)
            : countContentStats(diffInput.oldText, diffInput.newText);

    return (
        <ToolSectionView fullWidth>
            <View style={styles.editedFileGroup}>
                <Pressable
                    onPress={() => setExpanded((value) => !value)}
                    style={({ pressed }) => [
                        styles.editToggle,
                        studioPresentation && {
                            minHeight: studioPresentation.disclosureRow.minHeight,
                            paddingHorizontal: studioPresentation.disclosureRow.paddingHorizontal,
                            paddingVertical: studioPresentation.disclosureRow.paddingVertical,
                        },
                        pressed && styles.editTogglePressed,
                    ]}
                >
                    {studioPresentation ? (
                        <View style={[styles.fileHeaderMain, styles.studioToggleMain]}>
                            <Octicons name="file-diff" size={15} color={studioPresentation.diff.metadataColor} />
                            <Text
                                style={[styles.filePath, { color: studioPresentation.diff.pathColor }]}
                                numberOfLines={1}
                            >
                                {filePath}
                            </Text>
                            {kindLabel ? <Text style={[styles.kindLabel, { color: studioPresentation.diff.metadataColor }]}>{kindLabel}</Text> : null}
                            {stats && (stats.additions > 0 || stats.deletions > 0) ? (
                                <View style={styles.stats}>
                                    {stats.additions > 0 ? <Text style={[styles.added, { color: studioPresentation.diff.addedColor }]}>+{stats.additions}</Text> : null}
                                    {stats.deletions > 0 ? <Text style={[styles.removed, { color: studioPresentation.diff.removedColor }]}>-{stats.deletions}</Text> : null}
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        <Text style={styles.editToggleText} numberOfLines={1}>
                            {t('toolGroup.edited')}
                        </Text>
                    )}
                    <Ionicons
                        name={studioPresentation && expanded ? 'chevron-down' : 'chevron-forward'}
                        size={14}
                        color={theme.colors.textSecondary}
                    />
                </Pressable>
                {expanded ? (
                    <View style={[styles.patchContainer, studioPresentation && {
                        backgroundColor: studioPresentation.diff.backgroundColor,
                        borderRadius: studioPresentation.diff.borderRadius,
                        borderWidth: 0,
                    }]}>
                        {!studioPresentation ? (
                            <View style={styles.fileHeader}>
                                <View style={styles.fileHeaderMain}>
                                    <Octicons name="file-diff" size={16} color={theme.colors.textSecondary} />
                                    <Text style={styles.filePath}>{filePath}</Text>
                                    {kindLabel ? <Text style={styles.kindLabel}>{kindLabel}</Text> : null}
                                    {stats && (stats.additions > 0 || stats.deletions > 0) ? (
                                        <View style={styles.stats}>
                                            {stats.additions > 0 ? <Text style={styles.added}>+{stats.additions}</Text> : null}
                                            {stats.deletions > 0 ? <Text style={styles.removed}>-{stats.deletions}</Text> : null}
                                        </View>
                                    ) : null}
                                </View>
                                {movePath ? <Text style={styles.movePath}>{movePath}</Text> : null}
                            </View>
                        ) : movePath ? (
                            <Text style={[styles.movePath, styles.studioMovePath, { color: studioPresentation.diff.metadataColor }]}>{movePath}</Text>
                        ) : null}
                        {displayPatch ? (
                            <ToolDiffView patch={displayPatch} fileName={fileName} />
                        ) : diffInput?.kind === 'pair' && (diffInput.oldText.length > 0 || diffInput.newText.length > 0) ? (
                            <ToolDiffView
                                oldText={diffInput.oldText}
                                newText={diffInput.newText}
                                fileName={fileName}
                            />
                        ) : null}
                        {permissionFooter ? (
                            <View style={styles.permissionFooterContainer}>
                                {permissionFooter}
                            </View>
                        ) : null}
                    </View>
                ) : null}
            </View>
        </ToolSectionView>
    );
});

const styles = StyleSheet.create((theme) => ({
    editedFileGroup: {
        gap: 6,
    },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        maxWidth: '100%',
        paddingHorizontal: 14,
        paddingTop: 2,
        paddingBottom: 4,
    },
    editTogglePressed: {
        opacity: 0.6,
    },
    editToggleText: {
        flexShrink: 1,
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    studioToggleMain: {
        flex: 1,
        minWidth: 0,
    },
    patchContainer: {
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        marginHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.divider,
    },
    permissionFooterContainer: {
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    fileHeader: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: theme.colors.surfaceHigh,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        gap: 4,
    },
    fileHeaderMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    filePath: {
        fontSize: 13,
        color: theme.colors.text,
        fontFamily: 'monospace',
        flex: 1,
    },
    kindLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    movePath: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
    },
    studioMovePath: {
        paddingHorizontal: 12,
        paddingBottom: 6,
    },
    stats: {
        flexDirection: 'row',
        gap: 8,
    },
    fullViewContainer: {
        gap: 16,
        paddingHorizontal: 12,
        marginBottom: 28,
    },
    fullViewFile: {
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.divider,
    },
    added: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#34C759',
    },
    removed: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#FF3B30',
    },
}));
