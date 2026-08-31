import * as React from 'react';
import {
    ActivityIndicator,
    Modal as RNModal,
    Platform,
    Pressable,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { Octicons } from '@expo/vector-icons';
import Svg, { Line, Rect } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Typography } from '@/constants/Typography';
import { t } from '@/text';
import { useStudioOverlayPresentation } from '@/features/studio-overlays/useStudioOverlayPresentation';
import { resolveSessionActionsMenuPosition } from '@/features/studio-overlays/studioOverlayPresentation';
import { resolveCodexFirstWorkspaceMenuKey } from '@/features/codex-first-shell/codexFirstWorkspaceChrome';
import { useStudioInteractionState } from '@/features/studio-visual-style/useStudioInteractionState';

type MenuAnchor = {
    height: number;
    width: number;
    x: number;
    y: number;
};

export const SideChatQuickPanelControls = React.memo(function SideChatQuickPanelControls({
    activePanel,
    changedFilesCount = 0,
    codexFirstEnabled = false,
    creating,
    expanded,
    onOpenAllFiles,
    onOpenChanges,
    onToggle,
    showFileActions,
    showSideChatAction = true,
}: {
    activePanel: 'changes' | 'allFiles' | 'sideChat' | 'issues' | null;
    changedFilesCount?: number;
    codexFirstEnabled?: boolean;
    creating: boolean;
    expanded: boolean;
    onOpenAllFiles: () => void;
    onOpenChanges: () => void;
    onToggle: () => void;
    showFileActions: boolean;
    showSideChatAction?: boolean;
}) {
    const { theme } = useUnistyles();
    const overlayPresentation = useStudioOverlayPresentation();
    const codexFirstPresentation = codexFirstEnabled && overlayPresentation.isStudio;
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const menuButtonRef = React.useRef<(View & { focus?: () => void }) | null>(null);
    const menuItemRefs = React.useRef<Array<(View & { focus?: () => void }) | null>>([]);
    const [menuAnchor, setMenuAnchor] = React.useState<MenuAnchor | null>(null);
    const [selectedMenuIndex, setSelectedMenuIndex] = React.useState(0);
    const menuButtonInteraction = useStudioInteractionState(
        codexFirstEnabled && Platform.OS === 'web',
    );
    const sideChatButtonInteraction = useStudioInteractionState(
        codexFirstEnabled && Platform.OS === 'web',
    );

    const closeMenu = React.useCallback(() => {
        setMenuAnchor(null);
        if (Platform.OS === 'web' && typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => menuButtonRef.current?.focus?.());
        }
    }, []);

    const openMenu = React.useCallback(() => {
        menuButtonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
            setSelectedMenuIndex(activePanel === 'allFiles' ? 1 : 0);
            setMenuAnchor({ x, y, width, height });
        });
    }, [activePanel]);

    const selectMenuItem = React.useCallback((action: () => void) => {
        closeMenu();
        action();
    }, [closeMenu]);

    const menuWidth = 210;
    const menuPosition = menuAnchor
        ? codexFirstEnabled
            ? resolveSessionActionsMenuPosition({
                actionCount: 2,
                anchor: { type: 'rect', ...menuAnchor },
                itemHeight: 42,
                margin: 12,
                menuWidth,
                windowHeight,
                windowWidth,
            })
            : {
                left: Math.max(12, Math.min(windowWidth - menuWidth - 12, menuAnchor.x + menuAnchor.width - menuWidth)),
                top: Math.min(windowHeight - 116, menuAnchor.y + menuAnchor.height + 8),
            }
        : { left: 12, top: 12 };

    React.useEffect(() => {
        if (!menuAnchor || Platform.OS !== 'web' || typeof window === 'undefined') return;
        const handleKeyDown = (event: KeyboardEvent) => {
            const result = resolveCodexFirstWorkspaceMenuKey({
                itemCount: 2,
                key: event.key,
                selectedIndex: selectedMenuIndex,
            });
            if (!result.handled) return;
            event.preventDefault();
            event.stopPropagation();
            if (result.outcome === 'close') {
                closeMenu();
                return;
            }
            if (result.outcome === 'select') {
                setSelectedMenuIndex(result.nextIndex);
                return;
            }
            if (result.outcome === 'activate') {
                selectMenuItem(result.nextIndex === 0 ? onOpenChanges : onOpenAllFiles);
            }
        };
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [closeMenu, menuAnchor, onOpenAllFiles, onOpenChanges, selectMenuItem, selectedMenuIndex]);

    React.useEffect(() => {
        if (!menuAnchor || Platform.OS !== 'web' || typeof requestAnimationFrame !== 'function') return;
        const frame = requestAnimationFrame(() => menuItemRefs.current[selectedMenuIndex]?.focus?.());
        return () => cancelAnimationFrame(frame);
    }, [menuAnchor, selectedMenuIndex]);

    return (
        <View style={styles.controls}>
            {showFileActions ? (
                <Pressable
                    ref={menuButtonRef}
                    accessibilityLabel={t('codexFirst.openSidebarTools')}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: !!menuAnchor }}
                    onPress={openMenu}
                    {...menuButtonInteraction.interactionProps}
                    style={({ pressed, hovered }: any) => [
                        styles.iconButton,
                        (pressed || (codexFirstEnabled ? menuButtonInteraction.hovered : hovered) || !!menuAnchor) && styles.iconButtonHovered,
                        codexFirstPresentation && menuButtonInteraction.focused && ({
                            outlineColor: overlayPresentation.focusRingColor,
                            outlineOffset: 1,
                            outlineStyle: 'solid',
                            outlineWidth: 2,
                        } as any),
                    ]}
                >
                    <Octicons name="kebab-horizontal" size={16} color={theme.colors.textSecondary} />
                </Pressable>
            ) : null}

            {showSideChatAction ? (
                <Pressable
                    accessibilityLabel={expanded ? t('codexFirst.collapseSideChat') : t('codexFirst.openSideChat')}
                    accessibilityRole="button"
                    accessibilityState={{ busy: creating, expanded }}
                    disabled={creating}
                    onPress={onToggle}
                    {...sideChatButtonInteraction.interactionProps}
                    style={({ pressed, hovered }: any) => [
                        styles.iconButton,
                        expanded && styles.iconButtonSelected,
                        (pressed || (codexFirstEnabled ? sideChatButtonInteraction.hovered : hovered)) && styles.iconButtonHovered,
                        creating && styles.iconButtonDisabled,
                        codexFirstPresentation && sideChatButtonInteraction.focused && ({
                            outlineColor: overlayPresentation.focusRingColor,
                            outlineOffset: 1,
                            outlineStyle: 'solid',
                            outlineWidth: 2,
                        } as any),
                    ]}
                >
                    {creating ? (
                        <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                    ) : (
                        <CodexRightSidebarIcon
                            color={expanded ? theme.colors.text : theme.colors.textSecondary}
                        />
                    )}
                </Pressable>
            ) : null}

            <RNModal
                transparent
                visible={!!menuAnchor}
                animationType="none"
                onRequestClose={closeMenu}
            >
                <View style={styles.modalRoot}>
                    <Pressable
                        accessible={false}
                        onPress={closeMenu}
                        style={[
                            StyleSheet.absoluteFill,
                            codexFirstPresentation && { backgroundColor: overlayPresentation.floating.clickAwayColor },
                        ]}
                    />
                    <View style={[
                        styles.menu,
                        { left: menuPosition.left, top: menuPosition.top, width: menuWidth },
                        codexFirstPresentation && {
                            backgroundColor: overlayPresentation.floating.surfaceColor,
                            borderColor: overlayPresentation.floating.borderColor,
                            borderRadius: overlayPresentation.floating.radius,
                            borderWidth: overlayPresentation.floating.borderWidth,
                            shadowOffset: { width: 0, height: overlayPresentation.floating.shadowOffsetY },
                            shadowOpacity: overlayPresentation.floating.shadowOpacity,
                            shadowRadius: overlayPresentation.floating.shadowRadius,
                        },
                    ]}
                        accessibilityRole="menu"
                        accessibilityLabel={t('codexFirst.sidebarTools')}
                        accessibilityViewIsModal
                    >
                        <Pressable
                            ref={(node) => { menuItemRefs.current[0] = node; }}
                            accessibilityRole="menuitem"
                            accessibilityLabel={t('files.changes')}
                            accessibilityState={{ selected: activePanel === 'changes' }}
                            onHoverIn={() => setSelectedMenuIndex(0)}
                            onPress={() => selectMenuItem(onOpenChanges)}
                            style={({ pressed, hovered }: any) => [
                                styles.menuItem,
                                activePanel === 'changes' && styles.menuItemSelected,
                                (pressed || hovered) && styles.menuItemHovered,
                                codexFirstPresentation && selectedMenuIndex === 0 && {
                                    backgroundColor: overlayPresentation.selectedColor,
                                },
                            ]}
                        >
                            <Octicons name="diff" size={15} color={theme.colors.textSecondary} />
                            <Text style={[
                                styles.menuLabel,
                                codexFirstPresentation && { color: overlayPresentation.textColor },
                            ]}>{t('files.changes')}</Text>
                            {changedFilesCount > 0 ? (
                                <Text style={styles.menuBadge}>{changedFilesCount}</Text>
                            ) : null}
                        </Pressable>
                        <Pressable
                            ref={(node) => { menuItemRefs.current[1] = node; }}
                            accessibilityRole="menuitem"
                            accessibilityLabel={t('files.allFiles')}
                            accessibilityState={{ selected: activePanel === 'allFiles' }}
                            onHoverIn={() => setSelectedMenuIndex(1)}
                            onPress={() => selectMenuItem(onOpenAllFiles)}
                            style={({ pressed, hovered }: any) => [
                                styles.menuItem,
                                activePanel === 'allFiles' && styles.menuItemSelected,
                                (pressed || hovered) && styles.menuItemHovered,
                                codexFirstPresentation && selectedMenuIndex === 1 && {
                                    backgroundColor: overlayPresentation.selectedColor,
                                },
                            ]}
                        >
                            <Octicons name="file-directory" size={15} color={theme.colors.textSecondary} />
                            <Text style={[
                                styles.menuLabel,
                                codexFirstPresentation && { color: overlayPresentation.textColor },
                            ]}>{t('files.allFiles')}</Text>
                        </Pressable>
                    </View>
                </View>
            </RNModal>
        </View>
    );
});

function CodexRightSidebarIcon({ color }: { color: string }) {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Rect
                x={3}
                y={3}
                width={18}
                height={18}
                rx={2}
                stroke={color}
                strokeWidth={2}
            />
            <Line
                x1={15}
                y1={3}
                x2={15}
                y2={21}
                stroke={color}
                strokeWidth={2}
            />
        </Svg>
    );
}

const styles = StyleSheet.create((theme) => ({
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconButton: {
        width: 34,
        height: 34,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonHovered: {
        backgroundColor: theme.colors.surface,
    },
    iconButtonSelected: {
        backgroundColor: theme.colors.surfaceSelected,
    },
    iconButtonDisabled: {
        opacity: 0.55,
    },
    modalRoot: {
        flex: 1,
    },
    menu: {
        position: 'absolute',
        padding: 6,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        shadowColor: theme.colors.shadow.color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: theme.colors.shadow.opacity,
        shadowRadius: 18,
        elevation: 10,
    },
    menuItem: {
        minHeight: 42,
        paddingHorizontal: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuItemHovered: {
        backgroundColor: theme.colors.surfaceSelected,
    },
    menuItemSelected: {
        backgroundColor: theme.colors.groupped.background,
    },
    menuLabel: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
        ...Typography.default(),
    },
    menuBadge: {
        minWidth: 22,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
        overflow: 'hidden',
        textAlign: 'center',
        color: theme.colors.textSecondary,
        backgroundColor: theme.colors.groupped.background,
        fontSize: 11,
        ...Typography.default('semiBold'),
    },
}));
