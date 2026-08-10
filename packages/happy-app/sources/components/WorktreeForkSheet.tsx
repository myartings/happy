import * as React from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Modal } from '@/modal';
import { t } from '@/text';
import { useHappyAction } from '@/hooks/useHappyAction';
import { useSession } from '@/sync/storage';
import {
    forkInWorktreeAndSpawn,
    inspectSessionWorktree,
    type ForkSource,
    type WorktreeSnapshotInspection,
} from '@/sync/ops';
import { getSessionForkSource } from '@/utils/sessionFork';
import { getDuplicateSheetFrame } from '@/utils/duplicateSheetLayout';
import { MobileGlassSurface } from './MobileGlass';

export interface WorktreeForkSheetProps {
    sessionId: string;
    onClose?: () => void;
}

export function formatWorktreeBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const WorktreeForkSheet = React.memo(function WorktreeForkSheet(props: WorktreeForkSheetProps) {
    const { sessionId, onClose } = props;
    const session = useSession(sessionId);
    const router = useRouter();
    const { theme } = useUnistyles();
    const windowSize = useWindowDimensions();
    const sheetFrame = React.useMemo(() => getDuplicateSheetFrame(windowSize), [windowSize.width, windowSize.height]);
    const source = React.useMemo(() => session ? getSessionForkSource(session) : null, [
        session?.id,
        session?.metadata?.flavor,
        session?.metadata?.machineId,
        session?.metadata?.path,
        session?.metadata?.claudeSessionId,
        session?.metadata?.codexThreadId,
    ]);
    const [inspection, setInspection] = React.useState<WorktreeSnapshotInspection | null>(null);
    const [inspectionError, setInspectionError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        async function inspect() {
            if (!source) {
                setInspectionError(t('session.forkErrorMissingMetadata'));
                return;
            }
            try {
                const result = await inspectSessionWorktree(source.machineId, source.directory);
                if (!cancelled) setInspection(result);
            } catch (error) {
                if (!cancelled) {
                    setInspectionError(error instanceof Error ? error.message : t('session.worktreeForkInspectError'));
                }
            }
        }
        void inspect();
        return () => { cancelled = true; };
    }, [source]);

    const runFork = React.useCallback(async (inheritChanges: boolean) => {
        if (!source) {
            Modal.alert(t('common.error'), t('session.forkErrorMissingMetadata'));
            return;
        }
        const result = await forkInWorktreeAndSpawn(source as ForkSource, inheritChanges);
        if (result.type !== 'success') {
            Modal.alert(t('common.error'), result.type === 'error' ? result.errorMessage : t('session.forkErrorGeneric'));
            return;
        }
        onClose?.();
        router.replace(`/session/${result.sessionId}`);
    }, [onClose, router, source]);
    const [forkingWithChanges, performForkWithChanges] = useHappyAction(async () => runFork(true));
    const [forkingFromHead, performForkFromHead] = useHappyAction(async () => runFork(false));
    const forking = forkingWithChanges || forkingFromHead;

    return (
        <MobileGlassSurface
            enabled={Platform.OS !== 'web'}
            nativeEffect
            glassEffectStyle="regular"
            intensity={88}
            tintColor={theme.colors.glass.overlayTint}
            style={[styles.sheet, sheetFrame]}
        >
            <View style={styles.header}>
                <Text style={styles.title}>{t('session.worktreeForkTitle')}</Text>
                <Text style={styles.subtitle}>
                    {!inspection
                        ? t('common.loading')
                        : inspection.isDirty
                            ? t('session.worktreeForkDirtySubtitle')
                            : t('session.worktreeForkCleanSubtitle')}
                </Text>
            </View>

            <View style={styles.content}>
                {!inspection && !inspectionError ? (
                    <View style={styles.loading}><ActivityIndicator /></View>
                ) : inspectionError ? (
                    <Text style={styles.errorText}>{inspectionError}</Text>
                ) : inspection ? (
                    <>
                        <View style={styles.baseRow}>
                            <Text style={styles.baseLabel}>{t('session.worktreeForkBase')}</Text>
                            <Text style={styles.baseValue} numberOfLines={1}>
                                {inspection.branch ?? inspection.head.slice(0, 8)}
                            </Text>
                        </View>
                        {inspection.isDirty && (
                            <View style={styles.summaryCard}>
                                <SummaryRow label={t('session.worktreeForkStaged')} value={String(inspection.stagedCount)} />
                                <SummaryRow label={t('session.worktreeForkUnstaged')} value={String(inspection.unstagedCount)} />
                                <SummaryRow
                                    label={t('session.worktreeForkUntracked')}
                                    value={`${inspection.untrackedCount} · ${formatWorktreeBytes(inspection.untrackedBytes)}`}
                                />
                            </View>
                        )}
                        <Text style={styles.notice}>{t('session.worktreeForkIgnoredNotice')}</Text>
                    </>
                ) : null}
            </View>

            <View style={styles.actions}>
                <Pressable
                    disabled={forking || !inspection}
                    onPress={inspection?.isDirty ? performForkWithChanges : performForkFromHead}
                    style={({ pressed }) => [styles.button, styles.buttonPrimary, (forking || !inspection) && styles.buttonDisabled, pressed && styles.buttonPressed]}
                >
                    <Text style={styles.buttonPrimaryText}>
                        {forking
                            ? t('common.loading')
                            : inspection?.isDirty
                                ? t('session.worktreeForkIncludeChanges')
                                : t('session.worktreeForkConfirmClean')}
                    </Text>
                </Pressable>
                {inspection?.isDirty && (
                    <Pressable
                        disabled={forking}
                        onPress={performForkFromHead}
                        style={({ pressed }) => [styles.button, styles.buttonSecondary, forking && styles.buttonDisabled, pressed && styles.buttonPressed]}
                    >
                        <Text style={styles.buttonSecondaryText}>{t('session.worktreeForkHeadOnly')}</Text>
                    </Pressable>
                )}
                <Pressable onPress={onClose} disabled={forking} style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}>
                    <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                </Pressable>
            </View>
        </MobileGlassSurface>
    );
});

function SummaryRow(props: { label: string; value: string }) {
    return (
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{props.label}</Text>
            <Text style={styles.summaryValue}>{props.value}</Text>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    sheet: {
        backgroundColor: Platform.select({ web: theme.colors.surface, ios: theme.colors.glass.overlay, android: theme.colors.glass.backgroundStrong, default: theme.colors.surface }),
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: Platform.OS === 'web' ? 0 : StyleSheet.hairlineWidth,
        borderColor: theme.colors.glass.border,
        alignSelf: 'center',
        minWidth: 0,
    },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider },
    title: { fontSize: 17, fontWeight: '600' as const, color: theme.colors.text },
    subtitle: { marginTop: 5, fontSize: 13, lineHeight: 18, color: theme.colors.textSecondary },
    content: { padding: 20, minHeight: 164 },
    loading: { minHeight: 124, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: theme.colors.textDestructive, fontSize: 14, lineHeight: 20 },
    baseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 },
    baseLabel: { fontSize: 13, color: theme.colors.textSecondary },
    baseValue: { flexShrink: 1, fontSize: 13, fontWeight: '600' as const, color: theme.colors.text },
    summaryCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.divider, borderRadius: 12, overflow: 'hidden' },
    summaryRow: { minHeight: 42, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider },
    summaryLabel: { fontSize: 14, color: theme.colors.text },
    summaryValue: { fontSize: 13, color: theme.colors.textSecondary, fontVariant: ['tabular-nums'] },
    notice: { marginTop: 12, fontSize: 12, lineHeight: 17, color: theme.colors.textSecondary },
    actions: { gap: 8, padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.divider },
    button: { minHeight: 44, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    buttonPrimary: { backgroundColor: theme.colors.button.primary.background },
    buttonSecondary: { backgroundColor: theme.colors.surfaceHigh },
    buttonPressed: { opacity: 0.7 },
    buttonDisabled: { opacity: 0.4 },
    buttonPrimaryText: { color: theme.colors.button.primary.tint, fontSize: 15, fontWeight: '600' as const },
    buttonSecondaryText: { color: theme.colors.text, fontSize: 15, fontWeight: '500' as const },
    cancelButton: { minHeight: 36, alignItems: 'center', justifyContent: 'center' },
    cancelText: { color: theme.colors.textSecondary, fontSize: 14 },
}));
