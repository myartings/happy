import React from 'react';
import { Platform, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { useLocalSetting } from '@/sync/storage';
import { sessionBash } from '@/sync/ops';
import { parseGithubRepository } from '@/features/github-issues/githubRepository';
import { isTauri } from '@/utils/isTauri';

export const GithubIssuesButton = React.memo(({ showLabel = false, style, tintColor, sessionId, cwd }: {
    showLabel?: boolean; style?: StyleProp<ViewStyle>; tintColor?: string; sessionId?: string; cwd?: string;
}) => {
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const router = useRouter();
    const { theme } = useUnistyles();
    const color = tintColor ?? theme.colors.textSecondary;
    const openIssues = React.useCallback(async () => {
        if (sessionId && cwd) {
            const result = await sessionBash(sessionId, { command: 'git remote get-url origin', cwd, timeout: 5000 });
            const repository = result.success ? parseGithubRepository(result.stdout.trim()) : null;
            if (repository) {
                router.push({ pathname: '/github-issues', params: repository } as any);
                return;
            }
        }
        router.push('/github-issues' as any);
    }, [cwd, router, sessionId]);
    if (!enabled || (Platform.OS === 'web' && !isTauri())) return null;
    return (
        <Pressable accessibilityRole="button" accessibilityLabel="GitHub Issues" onPress={() => void openIssues()}
            style={({ pressed }) => [styles.button, showLabel && styles.labeled, pressed && styles.pressed, style]}>
            <Ionicons name="logo-github" size={showLabel ? 17 : 20} color={color} />
            {showLabel && <Text style={[styles.label, { color }]}>Issues</Text>}
        </Pressable>
    );
});

const styles = StyleSheet.create((theme) => ({
    button: { minWidth: 36, height: 36, paddingHorizontal: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
    labeled: { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.divider, backgroundColor: theme.colors.surface },
    pressed: { backgroundColor: theme.colors.surfacePressed },
    label: { fontSize: 13, ...Typography.default('semiBold') },
}));
