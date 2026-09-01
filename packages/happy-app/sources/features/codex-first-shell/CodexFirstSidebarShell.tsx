import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Typography } from '@/constants/Typography';
import { t } from '@/text';
import {
    resolveStudioSidebarInteractionPresentation,
    resolveStudioSidebarStateBackground,
} from '@/features/studio-visual-style/studioSidebarInteractionPresentation';
import { useStudioInteractionState } from '@/features/studio-visual-style/useStudioInteractionState';

import type { CodexFirstDesktopContract, CodexFirstDestination } from './codexFirstDesktopContract';
import {
    isCodexFirstDestinationSelected,
    projectCodexFirstSidebarDestinations,
    type CodexFirstSidebarDestination,
} from './codexFirstSidebarNavigation';

type CommandPaletteFocusTarget = View & { focus?: () => void };

type CodexFirstSidebarShellProps = {
    attentionCount: number;
    contract: CodexFirstDesktopContract;
    githubIssuesEnabled: boolean;
    hasArchivedSessions: boolean;
    hideArchivedSessions: boolean;
    onNavigate: (destination: CodexFirstSidebarDestination) => void;
    onOpenNotifications: () => void;
    onOpenProduct: () => void;
    onOpenSearch: (restoreFocusTarget?: CommandPaletteFocusTarget | null) => void;
    onToggleArchive: () => void;
    pathname: string;
    pendingProjectTodos: number;
    projectTodosEnabled: boolean;
    searchAvailable: boolean;
};

const stylesheet = StyleSheet.create((theme) => ({
    shell: {
        paddingTop: 8,
        paddingHorizontal: 12,
        paddingBottom: 5,
        gap: 5,
    },
    productRow: {
        height: 34,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    productButton: {
        flex: 1,
        minWidth: 0,
        height: 32,
        paddingHorizontal: 5,
        borderRadius: 7,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    productMark: {
        width: 22,
        height: 22,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.dark ? '#F1F1F1' : '#1F2022',
    },
    productMarkText: {
        color: theme.dark ? '#1F2022' : '#FFFFFF',
        fontSize: 11,
        lineHeight: 14,
        ...Typography.default('semiBold'),
    },
    productName: {
        flexShrink: 1,
        color: theme.colors.text,
        fontSize: 13,
        lineHeight: 18,
        ...Typography.default('semiBold'),
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
    },
    iconButton: {
        width: 30,
        height: 30,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    destinations: {
        gap: 1,
    },
    destinationRow: {
        height: 34,
        paddingHorizontal: 9,
        borderRadius: 7,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    destinationLabel: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 13,
        lineHeight: 18,
        ...Typography.default(),
    },
    destinationLabelSelected: {
        ...Typography.default('semiBold'),
    },
    countBadge: {
        minWidth: 20,
        height: 18,
        paddingHorizontal: 5,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceHighest,
    },
    countText: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        lineHeight: 13,
        ...Typography.default('semiBold'),
    },
    attentionBadge: {
        position: 'absolute',
        top: 2,
        right: 1,
        minWidth: 14,
        height: 14,
        paddingHorizontal: 3,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.warningCritical,
        borderWidth: 1,
        borderColor: theme.dark ? '#202123' : '#F6F7F7',
    },
    attentionBadgeText: {
        color: '#FFFFFF',
        fontSize: 8,
        lineHeight: 10,
        ...Typography.default('semiBold'),
    },
}));

function destinationLabel(id: CodexFirstDestination['id']): string {
    switch (id) {
        case 'new-session':
            return t('sidebar.newSession');
        case 'tasks':
            return t('projectTodos.shortTitle');
        case 'issues':
            return t('githubIssues.title');
        case 'artifacts':
            return t('artifacts.title');
        case 'machines-agents':
            return t('codexFirst.machinesAndAgents');
    }
}

function focusRing(focused: boolean, color: string) {
    return Platform.OS === 'web' && focused
        ? {
            outlineColor: color,
            outlineOffset: -2,
            outlineStyle: 'solid',
            outlineWidth: 2,
        } as any
        : null;
}

const HeaderAction = React.memo(({
    accessibilityLabel,
    badgeCount = 0,
    buttonRef,
    disabled = false,
    icon,
    onPress,
    selected,
}: {
    accessibilityLabel: string;
    badgeCount?: number;
    buttonRef?: React.RefObject<CommandPaletteFocusTarget | null>;
    disabled?: boolean;
    icon: 'archive' | 'archive-outline' | 'notifications-outline' | 'search-outline';
    onPress: () => void;
    selected?: boolean;
}) => {
    const { theme } = useUnistyles();
    const interaction = useStudioInteractionState(true);
    const accessibilityState = selected === undefined
        ? { disabled }
        : { disabled, selected };
    const presentation = React.useMemo(() => resolveStudioSidebarInteractionPresentation({
        isDark: theme.dark,
        isTauriRuntime: true,
        requestedStyle: 'studio',
    }), [theme.dark]);

    return (
        <Pressable
            ref={buttonRef}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={accessibilityState}
            accessibilityValue={badgeCount > 0 ? { text: String(badgeCount) } : undefined}
            disabled={disabled}
            hitSlop={4}
            onPress={onPress}
            {...interaction.interactionProps}
            style={({ pressed }) => [
                stylesheet.iconButton,
                {
                    opacity: disabled ? 0.38 : 1,
                    backgroundColor: resolveStudioSidebarStateBackground(presentation, {
                        hovered: interaction.hovered,
                        pressed,
                        selected: selected === true,
                    }),
                },
                focusRing(interaction.focused, presentation.focusRingColor),
            ]}
        >
            <Ionicons name={icon} size={17} color={theme.colors.textSecondary} />
            {badgeCount > 0 && (
                <View style={stylesheet.attentionBadge}>
                    <Text style={stylesheet.attentionBadgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
                </View>
            )}
        </Pressable>
    );
});

const DestinationRow = React.memo(({
    destination,
    onNavigate,
    pathname,
    pendingProjectTodos,
}: {
    destination: CodexFirstSidebarDestination;
    onNavigate: (destination: CodexFirstSidebarDestination) => void;
    pathname: string;
    pendingProjectTodos: number;
}) => {
    const { theme } = useUnistyles();
    const interaction = useStudioInteractionState(true);
    const presentation = React.useMemo(() => resolveStudioSidebarInteractionPresentation({
        isDark: theme.dark,
        isTauriRuntime: true,
        requestedStyle: 'studio',
    }), [theme.dark]);
    const selected = isCodexFirstDestinationSelected(destination.id, pathname);
    const label = destinationLabel(destination.id);
    const count = destination.id === 'tasks' ? pendingProjectTodos : 0;

    return (
        <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onNavigate(destination)}
            {...interaction.interactionProps}
            style={({ pressed }) => [
                stylesheet.destinationRow,
                {
                    backgroundColor: resolveStudioSidebarStateBackground(presentation, {
                        hovered: interaction.hovered,
                        pressed,
                        selected,
                    }),
                },
                focusRing(interaction.focused, presentation.focusRingColor),
            ]}
        >
            <Ionicons name={destination.icon} size={17} color={selected ? theme.colors.text : theme.colors.textSecondary} />
            <Text numberOfLines={1} style={[
                stylesheet.destinationLabel,
                selected && stylesheet.destinationLabelSelected,
            ]}>
                {label}
            </Text>
            {count > 0 && (
                <View style={stylesheet.countBadge}>
                    <Text style={stylesheet.countText}>{count > 99 ? '99+' : count}</Text>
                </View>
            )}
        </Pressable>
    );
});

export const CodexFirstSidebarShell = React.memo(({
    attentionCount,
    contract,
    githubIssuesEnabled,
    hasArchivedSessions,
    hideArchivedSessions,
    onNavigate,
    onOpenNotifications,
    onOpenProduct,
    onOpenSearch,
    onToggleArchive,
    pathname,
    pendingProjectTodos,
    projectTodosEnabled,
    searchAvailable,
}: CodexFirstSidebarShellProps) => {
    const { theme } = useUnistyles();
    const searchButtonRef = React.useRef<CommandPaletteFocusTarget | null>(null);
    const productInteraction = useStudioInteractionState(true);
    const presentation = React.useMemo(() => resolveStudioSidebarInteractionPresentation({
        isDark: theme.dark,
        isTauriRuntime: true,
        requestedStyle: 'studio',
    }), [theme.dark]);
    const destinations = React.useMemo(() => projectCodexFirstSidebarDestinations({
        contract,
        githubIssuesEnabled,
        projectTodosEnabled,
    }), [contract, githubIssuesEnabled, projectTodosEnabled]);
    const handleOpenSearch = React.useCallback(() => {
        onOpenSearch(searchButtonRef.current);
    }, [onOpenSearch]);

    return (
        <View style={stylesheet.shell}>
            <View style={stylesheet.productRow}>
                <Pressable
                    accessibilityLabel={contract.product.name}
                    accessibilityRole="button"
                    onPress={onOpenProduct}
                    {...productInteraction.interactionProps}
                    style={({ pressed }) => [
                        stylesheet.productButton,
                        {
                            backgroundColor: resolveStudioSidebarStateBackground(presentation, {
                                hovered: productInteraction.hovered,
                                pressed,
                                selected: false,
                            }),
                        },
                        focusRing(productInteraction.focused, presentation.focusRingColor),
                    ]}
                >
                    <View style={stylesheet.productMark}>
                        <Text style={stylesheet.productMarkText}>H</Text>
                    </View>
                    <Text numberOfLines={1} style={stylesheet.productName}>{contract.product.name}</Text>
                    <Ionicons name="chevron-down" size={13} color={theme.colors.textSecondary} />
                </Pressable>
                <View style={stylesheet.headerActions}>
                    {contract.navigation.searchVisible && (
                        <HeaderAction
                            accessibilityLabel={t('commandPalette.placeholder')}
                            buttonRef={searchButtonRef}
                            disabled={!searchAvailable}
                            icon="search-outline"
                            onPress={handleOpenSearch}
                        />
                    )}
                    {contract.navigation.notificationsVisible && (
                        <HeaderAction
                            accessibilityLabel={t('tabs.inbox')}
                            badgeCount={attentionCount}
                            icon="notifications-outline"
                            onPress={onOpenNotifications}
                        />
                    )}
                    {hasArchivedSessions && (
                        <HeaderAction
                            accessibilityLabel={hideArchivedSessions
                                ? t('sidebar.showArchived')
                                : t('sidebar.hideArchived')}
                            icon={hideArchivedSessions ? 'archive-outline' : 'archive'}
                            onPress={onToggleArchive}
                            selected={!hideArchivedSessions}
                        />
                    )}
                </View>
            </View>
            <View style={stylesheet.destinations}>
                {destinations.map((destination) => (
                    <DestinationRow
                        key={destination.id}
                        destination={destination}
                        onNavigate={onNavigate}
                        pathname={pathname}
                        pendingProjectTodos={pendingProjectTodos}
                    />
                ))}
            </View>
        </View>
    );
});
