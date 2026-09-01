import { useAuth } from '@/auth/AuthContext';
import * as React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useIsTablet, useHeaderHeight } from '@/utils/responsive';
import { SidebarView } from './SidebarView';
import { useWindowDimensions, View, Pressable, Platform } from 'react-native';
import { storage, useLocalSetting, useLocalSettingMutable } from '@/sync/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useUnistyles } from 'react-native-unistyles';
import { t } from '@/text';
import { isTauri } from '@/utils/isTauri';
import { useOverlayNav } from '@/-session/sessionOverlayNav';
import { DEFAULT_APP_ZOOM } from '@/hooks/useTauriZoom';
import { canRouteForward, canUseRouteBack, getNavigatorCanGoBack } from '@/navigation/browserNavigation';
import { useBrowserNavigationStore } from '@/navigation/browserNavigationStore';
import { resolveDesktopSidebarFrame } from '@/features/studio-visual-style/studioVisualStyle';
import { StudioPanelResizeHandle } from '@/features/studio-panel-resize/StudioPanelResizeHandle';
import { projectStudioPanelWidths } from '@/features/studio-panel-resize/studioPanelResizePolicy';
import { useStudioRightPanelVisible } from '@/features/studio-panel-resize/studioPanelResizeVisibility';
import { resolveCurrentCodexFirstDesktopRuntime } from '@/features/codex-first-shell/resolveCurrentCodexFirstDesktopRuntime';
import { resolveCodexFirstDesktopLayout } from '@/features/codex-first-shell/codexFirstDesktopHardening';
import { useStudioInteractionState } from '@/features/studio-visual-style/useStudioInteractionState';

const TAURI_HEADER_CONTROL_LEFT = Math.ceil(92 / DEFAULT_APP_ZOOM);

export const SidebarNavigator = React.memo(() => {
    const auth = useAuth();
    const isTablet = useIsTablet();
    const zenMode = useLocalSetting('zenMode');
    const { width: windowWidth } = useWindowDimensions();
    const requestedVisualStyle = useLocalSetting('visualStyle');
    const persistedLeftPanelWidth = useLocalSetting('studioLeftPanelWidth');
    const persistedRightPanelWidth = useLocalSetting('studioRightPanelWidth');
    const lastResizedPanel = useLocalSetting('studioLastResizedPanel');
    const rightPanelVisible = useStudioRightPanelVisible();
    const inTauri = isTauri();
    const codexFirstContract = React.useMemo(
        () => resolveCurrentCodexFirstDesktopRuntime(requestedVisualStyle),
        [requestedVisualStyle],
    );
    const responsiveLayout = React.useMemo(() => resolveCodexFirstDesktopLayout({
        codexFirstEnabled: codexFirstContract.enabled,
        legacyDesktopLayout: isTablet,
        rightWorkspaceRequested: rightPanelVisible,
        windowWidth,
        zenMode,
    }), [codexFirstContract.enabled, isTablet, rightPanelVisible, windowWidth, zenMode]);
    const isDesktopLayout = auth.isAuthenticated && responsiveLayout.desktopShell;
    const showSidebar = isDesktopLayout
        && (codexFirstContract.enabled
            ? responsiveLayout.leftNavigation === 'persistent'
            : !zenMode);
    const effectiveRightPanelVisible = codexFirstContract.enabled
        ? responsiveLayout.rightWorkspace === 'visible'
        : rightPanelVisible;

    const sidebarFrame = React.useMemo(() => resolveDesktopSidebarFrame({
        windowWidth,
        isTauriRuntime: inTauri,
        requestedStyle: requestedVisualStyle,
        previewStyle: process.env.EXPO_PUBLIC_HAPPY_VISUAL_STYLE,
    }), [inTauri, requestedVisualStyle, windowWidth]);
    const studioPanelResizeEnabled = isDesktopLayout
        && inTauri
        && sidebarFrame.visualStyle === 'studio';
    const panelWidths = React.useMemo(() => projectStudioPanelWidths({
        storedLeftWidth: persistedLeftPanelWidth,
        storedRightWidth: persistedRightPanelWidth,
        windowWidth,
        leftVisible: showSidebar,
        rightVisible: effectiveRightPanelVisible,
        activeSide: lastResizedPanel,
    }), [effectiveRightPanelVisible, lastResizedPanel, persistedLeftPanelWidth, persistedRightPanelWidth, showSidebar, windowWidth]);
    const fullDrawerWidth = isDesktopLayout
        ? studioPanelResizeEnabled
            ? panelWidths.leftWidth
            : sidebarFrame.width
        : 280;
    const drawerWidth = showSidebar ? fullDrawerWidth : 0;

    const drawerNavigationOptions = React.useMemo(() => {
        if (!isDesktopLayout) {
            // Non-tablet: use front drawer, hidden
            return {
                lazy: false,
                headerShown: false,
                drawerType: 'front' as const,
                swipeEnabled: false,
                drawerStyle: {
                    width: 0,
                    display: 'none' as const,
                },
            };
        }

        // Tablet: always permanent, just collapse width in zen mode.
        //
        // We deliberately do NOT animate `width` on web. A CSS transition on
        // the drawer width re-flowed the chat flex-1 sibling on every frame,
        // re-measuring the entire FlatList tree at ~15fps. Snapping the
        // width change makes the chat reflow exactly once. Native already
        // snaps because RN doesn't honor CSS transition properties.
        return {
            lazy: false,
            headerShown: false,
            drawerType: 'permanent' as const,
            drawerStyle: {
                backgroundColor: sidebarFrame.sidebarBackground,
                borderRightWidth: sidebarFrame.dividerWidth,
                borderRightColor: sidebarFrame.dividerColor,
                width: drawerWidth,
                overflow: 'hidden' as const,
            } as any,
            swipeEnabled: false,
            drawerActiveTintColor: 'transparent',
            drawerInactiveTintColor: 'transparent',
            drawerItemStyle: { display: 'none' as const },
            drawerLabelStyle: { display: 'none' as const },
        };
    }, [isDesktopLayout, drawerWidth, sidebarFrame]);

    const drawerContent = React.useCallback(
        () => <SidebarView sidebarFrame={sidebarFrame} codexFirstContract={codexFirstContract} />,
        [codexFirstContract, sidebarFrame]
    );

    return (
        <View style={{ flex: 1, backgroundColor: sidebarFrame.canvasBackground }}>
            <Drawer
                screenOptions={drawerNavigationOptions}
                drawerContent={isDesktopLayout ? drawerContent : undefined}
            />
            {studioPanelResizeEnabled && showSidebar && (
                <StudioPanelResizeHandle
                    side="left"
                    targetWidth={persistedLeftPanelWidth}
                    renderedWidth={panelWidths.leftWidth}
                    windowWidth={windowWidth}
                    oppositeWidth={panelWidths.rightWidth}
                    oppositeVisible={effectiveRightPanelVisible}
                    label={t('codexFirst.resizeNavigationPanel')}
                    onWidthChange={(width) => storage.getState().applyLocalSettings({
                        studioLeftPanelWidth: width,
                        studioLastResizedPanel: 'left',
                    })}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: fullDrawerWidth - 4,
                        zIndex: 1090,
                    }}
                />
            )}
            {/* Persistent header overlay — always visible on desktop, same position regardless of zen mode */}
            {isDesktopLayout && (
                <PersistentHeader codexFirstEnabled={codexFirstContract.enabled} />
            )}
        </View>
    );
});

function DesktopHeaderAction({
    accessibilityLabel,
    children,
    codexFirstEnabled,
    disabled = false,
    onPress,
    selected,
}: {
    accessibilityLabel: string;
    children: React.ReactNode;
    codexFirstEnabled: boolean;
    disabled?: boolean;
    onPress: () => void;
    selected?: boolean;
}) {
    const { theme } = useUnistyles();
    const interaction = useStudioInteractionState(codexFirstEnabled && Platform.OS === 'web');
    const accessibilityState = selected === undefined
        ? { disabled }
        : { disabled, selected };

    return (
        <Pressable
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={accessibilityState}
            disabled={disabled}
            hitSlop={10}
            onPress={onPress}
            {...interaction.interactionProps}
            style={({ pressed }) => [
                {
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.3 : 1,
                },
                codexFirstEnabled ? {
                    borderRadius: 7,
                    backgroundColor: pressed || interaction.hovered || selected === true
                        ? theme.colors.surfaceSelected
                        : 'transparent',
                } : null,
                codexFirstEnabled && Platform.OS === 'web' && interaction.focused ? ({
                    outlineColor: theme.colors.textLink,
                    outlineOffset: 1,
                    outlineStyle: 'solid',
                    outlineWidth: 2,
                } as any) : null,
            ]}
        >
            {children}
        </Pressable>
    );
}

// Header block that stays in the same position whether zen mode is on or off
const PersistentHeader = React.memo(({ codexFirstEnabled }: { codexFirstEnabled: boolean }) => {
    const { theme } = useUnistyles();
    const safeArea = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const router = useRouter();
    const [zenMode, setZenMode] = useLocalSettingMutable('zenMode');
    const inTauri = isTauri();
    const isMacTauri = inTauri && typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

    const routeHistory = useBrowserNavigationStore((s) => s.routeHistory);
    const canGoForward = useBrowserNavigationStore((s) => s.routeHistory ? canRouteForward(s.routeHistory) : false);
    const overlayCanBack = useOverlayNav((s) => s.canBack);
    const overlayCanForward = useOverlayNav((s) => s.canForward);
    const canGoBack = routeHistory
        ? canUseRouteBack(routeHistory, getNavigatorCanGoBack(router))
        : false;

    const handleZenToggle = React.useCallback(() => {
        setZenMode(!zenMode);
    }, [zenMode, setZenMode]);

    const handleBack = React.useCallback(() => {
        // Intra-session overlay (file diff / file view) consumes back first,
        // so the chat → diff → file flow can be unwound without a close X.
        if (useOverlayNav.getState().back()) return;
        const nav = useBrowserNavigationStore.getState();
        if (!nav.routeHistory || !canUseRouteBack(nav.routeHistory, getNavigatorCanGoBack(router))) return;
        nav.markRouteBack();
        router.back();
    }, [router]);

    const handleForward = React.useCallback(() => {
        if (useOverlayNav.getState().forward()) return;
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const nav = useBrowserNavigationStore.getState();
            if (!nav.routeHistory || !canRouteForward(nav.routeHistory)) return;
            nav.markRouteForward();
            window.history.forward();
        }
    }, []);

    const canGoBackEffective = canGoBack || overlayCanBack;
    const canGoForwardEffective = canGoForward || overlayCanForward;

    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                paddingTop: safeArea.top,
                paddingLeft: isMacTauri ? TAURI_HEADER_CONTROL_LEFT : 16,
                paddingRight: 16,
                height: safeArea.top + headerHeight,
                flexDirection: 'row',
                alignItems: 'center',
                zIndex: 1100,
            }}
            pointerEvents="box-none"
            {...(inTauri ? { dataSet: { tauriDragRegion: 'true' } } : {})}
        >
            {/* Zen / Back / Forward buttons */}
            <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                pointerEvents="auto"
                {...(inTauri ? { dataSet: { tauriDragRegion: 'false' } } : {})}
            >
                <DesktopHeaderAction
                    accessibilityLabel={t('zen.toggle')}
                    codexFirstEnabled={codexFirstEnabled}
                    onPress={handleZenToggle}
                    selected={zenMode}
                >
                    <Image
                        source={require('@/assets/images/zen-icon.png')}
                        contentFit="contain"
                        style={{ width: 18, height: 18 }}
                        tintColor={zenMode ? theme.colors.textLink : theme.colors.header.tint}
                    />
                </DesktopHeaderAction>
                <DesktopHeaderAction
                    accessibilityLabel={t('common.back')}
                    codexFirstEnabled={codexFirstEnabled}
                    disabled={!canGoBackEffective}
                    onPress={handleBack}
                >
                    <Ionicons name="chevron-back" size={20} color={theme.colors.header.tint} />
                </DesktopHeaderAction>
                {Platform.OS === 'web' && (
                    <DesktopHeaderAction
                        accessibilityLabel={t('codexFirst.forward')}
                        codexFirstEnabled={codexFirstEnabled}
                        disabled={!canGoForwardEffective}
                        onPress={handleForward}
                    >
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.header.tint} />
                    </DesktopHeaderAction>
                )}
            </View>
        </View>
    );
});
