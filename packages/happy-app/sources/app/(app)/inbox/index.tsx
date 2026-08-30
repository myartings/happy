import * as React from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import { InboxView } from "@/components/InboxView";
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useIsTablet } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { t } from '@/text';
import { Header } from '@/components/navigation/Header';
import { useLocalSetting } from '@/sync/storage';
import { resolveCurrentCodexFirstDesktopRuntime } from '@/features/codex-first-shell/resolveCurrentCodexFirstDesktopRuntime';
import { resolveCodexFirstHeaderOwnership } from '@/features/codex-first-shell/codexFirstHeaderOwnership';

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        pointerEvents: 'none',
    },
    tabletHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    tabletTitle: {
        fontSize: 34,
        fontWeight: '700',
        color: theme.colors.text,
        ...Typography.default('semiBold'),
    },
    addFriendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Platform.select({ web: theme.colors.surface, default: theme.colors.glass.backgroundStrong }),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.shadow.color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.colors.shadow.opacity,
        shadowRadius: 4,
        elevation: 4,
    },
    headerTitle: {
        fontSize: 16,
        color: theme.colors.header.tint,
        ...Typography.default('semiBold'),
    },
}));

export default function InboxPage() {
    const { theme } = useUnistyles();
    const isTablet = useIsTablet();
    const router = useRouter();
    const requestedVisualStyle = useLocalSetting('visualStyle');
    const codexFirstContract = React.useMemo(
        () => resolveCurrentCodexFirstDesktopRuntime(requestedVisualStyle),
        [requestedVisualStyle],
    );
    const headerOwnership = React.useMemo(() => resolveCodexFirstHeaderOwnership({
        codexFirstEnabled: codexFirstContract.enabled,
        legacyTabletLayout: isTablet,
    }), [codexFirstContract.enabled, isTablet]);

    // In phone mode, show header; in tablet mode, show gradient
    if (headerOwnership.showPhoneInboxHeader) {
        // Phone mode: render with header
        return (
            <View style={styles.container}>
                <Header
                    title={<Text style={styles.headerTitle}>{t('tabs.inbox')}</Text>}
                    headerLeft={() => (
                        <Pressable
                            onPress={() => router.back()}
                            hitSlop={12}
                            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Ionicons
                                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                                size={24}
                                color={theme.colors.header.tint}
                            />
                        </Pressable>
                    )}
                    headerLeftGlass
                    headerShadowVisible={false}
                    headerTransparent
                />
                <InboxView />
            </View>
        );
    }

    // Tablet mode: render with header and friend button
    return (
        <InboxView />
    );
}
