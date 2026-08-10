import * as React from 'react';
import {
    ActivityIndicator,
    Modal as RNModal,
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

type MenuAnchor = {
    height: number;
    width: number;
    x: number;
    y: number;
};

export const SideChatQuickPanelControls = React.memo(function SideChatQuickPanelControls({
    activePanel,
    changedFilesCount = 0,
    creating,
    expanded,
    onOpenAllFiles,
    onOpenChanges,
    onToggle,
    showFileActions,
}: {
    activePanel: 'changes' | 'allFiles' | 'sideChat' | null;
    changedFilesCount?: number;
    creating: boolean;
    expanded: boolean;
    onOpenAllFiles: () => void;
    onOpenChanges: () => void;
    onToggle: () => void;
    showFileActions: boolean;
}) {
    const { theme } = useUnistyles();
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const menuButtonRef = React.useRef<View>(null);
    const [menuAnchor, setMenuAnchor] = React.useState<MenuAnchor | null>(null);

    const openMenu = React.useCallback(() => {
        menuButtonRef.current?.measureInWindow((x, y, width, height) => {
            setMenuAnchor({ x, y, width, height });
        });
    }, []);

    const selectMenuItem = React.useCallback((action: () => void) => {
        setMenuAnchor(null);
        action();
    }, []);

    const menuWidth = 210;
    const menuLeft = menuAnchor
        ? Math.max(12, Math.min(windowWidth - menuWidth - 12, menuAnchor.x + menuAnchor.width - menuWidth))
        : 12;
    const menuTop = menuAnchor
        ? Math.min(windowHeight - 116, menuAnchor.y + menuAnchor.height + 8)
        : 12;

    return (
        <View style={styles.controls}>
            {showFileActions ? (
                <Pressable
                    ref={menuButtonRef}
                    accessibilityLabel="Open sidebar tools"
                    onPress={openMenu}
                    style={({ pressed, hovered }: any) => [
                        styles.iconButton,
                        (pressed || hovered || !!menuAnchor) && styles.iconButtonHovered,
                    ]}
                >
                    <Octicons name="kebab-horizontal" size={16} color={theme.colors.textSecondary} />
                </Pressable>
            ) : null}

            <Pressable
                accessibilityLabel={expanded ? 'Collapse side chat' : 'Open side chat'}
                accessibilityRole="button"
                accessibilityState={{ busy: creating, expanded }}
                disabled={creating}
                onPress={onToggle}
                style={({ pressed, hovered }: any) => [
                    styles.iconButton,
                    expanded && styles.iconButtonSelected,
                    (pressed || hovered) && styles.iconButtonHovered,
                    creating && styles.iconButtonDisabled,
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

            <RNModal
                transparent
                visible={!!menuAnchor}
                animationType="none"
                onRequestClose={() => setMenuAnchor(null)}
            >
                <View style={styles.modalRoot}>
                    <Pressable
                        accessibilityLabel="Close sidebar tools"
                        onPress={() => setMenuAnchor(null)}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={[styles.menu, { left: menuLeft, top: menuTop, width: menuWidth }]}>
                        <Pressable
                            accessibilityRole="menuitem"
                            onPress={() => selectMenuItem(onOpenChanges)}
                            style={({ pressed, hovered }: any) => [
                                styles.menuItem,
                                activePanel === 'changes' && styles.menuItemSelected,
                                (pressed || hovered) && styles.menuItemHovered,
                            ]}
                        >
                            <Octicons name="diff" size={15} color={theme.colors.textSecondary} />
                            <Text style={styles.menuLabel}>{t('files.changes')}</Text>
                            {changedFilesCount > 0 ? (
                                <Text style={styles.menuBadge}>{changedFilesCount}</Text>
                            ) : null}
                        </Pressable>
                        <Pressable
                            accessibilityRole="menuitem"
                            onPress={() => selectMenuItem(onOpenAllFiles)}
                            style={({ pressed, hovered }: any) => [
                                styles.menuItem,
                                activePanel === 'allFiles' && styles.menuItemSelected,
                                (pressed || hovered) && styles.menuItemHovered,
                            ]}
                        >
                            <Octicons name="file-directory" size={15} color={theme.colors.textSecondary} />
                            <Text style={styles.menuLabel}>{t('files.allFiles')}</Text>
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
