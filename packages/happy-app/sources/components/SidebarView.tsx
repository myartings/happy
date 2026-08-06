import * as React from 'react';
import { Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { useHeaderHeight } from '@/utils/responsive';
import { VoiceAssistantStatusBar } from './VoiceAssistantStatusBar';
import { useRealtimeStatus } from '@/sync/storage';
import { MainView } from './MainView';
import { StyleSheet } from 'react-native-unistyles';
import { t } from '@/text';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { ShortcutHintBadge, useShortcutHints } from './ShortcutHints';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        borderStyle: 'solid',
        backgroundColor: theme.colors.groupped.background,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
    },
    newSessionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surface,
        gap: 8,
    },
    newSessionButtonPressed: {
        backgroundColor: theme.colors.surfacePressed,
    },
    shortcutTargetActive: {
        backgroundColor: theme.colors.surfacePressed,
    },
    newSessionText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        ...Typography.default('semiBold'),
    },
    navigationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 4,
        marginBottom: 4,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        gap: 9,
    },
    navigationButtonSelected: {
        backgroundColor: theme.colors.surfaceSelected,
    },
    navigationText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        ...Typography.default('semiBold'),
    },
    navigationTextSelected: {
        color: theme.colors.text,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.divider,
        gap: 10,
    },
    settingsText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        ...Typography.default(),
    },
    shortcutBadgeInline: {
        marginLeft: 'auto',
    },
}));

export const SidebarView = React.memo(() => {
    const styles = stylesheet;
    const safeArea = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();
    const headerHeight = useHeaderHeight();
    const realtimeStatus = useRealtimeStatus();
    const { visible: shortcutHintsVisible } = useShortcutHints();

    const handleNewSession = React.useCallback(() => {
        router.navigate('/new');
    }, [router]);
    const promptHistorySelected = pathname === '/prompts';

    return (
        <View style={[styles.container, { paddingTop: safeArea.top + headerHeight }]}>
            {/* New Session button */}
            <Pressable
                onPress={handleNewSession}
                style={({ pressed }) => [
                    styles.newSessionButton,
                    shortcutHintsVisible && styles.shortcutTargetActive,
                    pressed && styles.newSessionButtonPressed,
                ]}
            >
                <Ionicons name="create-outline" size={16} color={stylesheet.newSessionText.color} />
                <Text style={styles.newSessionText}>{t('sidebar.newSession')}</Text>
                <ShortcutHintBadge shortcutKey="N" style={styles.shortcutBadgeInline} />
            </Pressable>

            <Pressable
                onPress={() => router.push('/prompts' as never)}
                style={({ pressed }) => [
                    styles.navigationButton,
                    promptHistorySelected && styles.navigationButtonSelected,
                    pressed && styles.newSessionButtonPressed,
                ]}
            >
                <Ionicons
                    name="document-text-outline"
                    size={17}
                    color={promptHistorySelected ? stylesheet.navigationTextSelected.color : stylesheet.navigationText.color}
                />
                <Text style={[styles.navigationText, promptHistorySelected && styles.navigationTextSelected]}>
                    {t('promptHistory.title')}
                </Text>
            </Pressable>

            {realtimeStatus !== 'disconnected' && (
                <VoiceAssistantStatusBar variant="sidebar" />
            )}

            {/* Sessions list */}
            <MainView variant="sidebar" />

            {/* Settings at bottom */}
            <Pressable
                onPress={() => router.push('/settings')}
                style={[
                    styles.settingsRow,
                    shortcutHintsVisible && styles.shortcutTargetActive,
                ]}
            >
                <Ionicons name="settings-outline" size={18} color={stylesheet.settingsText.color} />
                <Text style={styles.settingsText}>{t('settings.title')}</Text>
                <ShortcutHintBadge shortcutKey="," style={styles.shortcutBadgeInline} />
            </Pressable>
        </View>
    );
});
