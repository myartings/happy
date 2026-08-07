import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { useLocalSetting, useSetting } from '@/sync/storage';
import { t } from '@/text';

interface ProjectTodoButtonProps {
    projectKey?: string;
    showLabel?: boolean;
    style?: StyleProp<ViewStyle>;
    tintColor?: string;
}

export const ProjectTodoButton = React.memo(({
    projectKey,
    showLabel = false,
    style,
    tintColor,
}: ProjectTodoButtonProps) => {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const router = useRouter();
    const projectTodos = useSetting('projectTodos');
    const enabled = useLocalSetting('devProjectTodosEnabled');
    const todos = projectKey ? projectTodos[projectKey] ?? [] : Object.values(projectTodos).flat();
    const pendingCount = todos.filter((todo) => !todo.completed).length;
    const color = tintColor ?? theme.colors.textSecondary;

    const openProjectTodos = React.useCallback((event: { stopPropagation?: () => void }) => {
        event.stopPropagation?.();
        if (projectKey) {
            router.push({ pathname: '/project-todos', params: { projectKey } } as any);
        } else {
            router.push('/project-todos' as any);
        }
    }, [projectKey, router]);

    if (!enabled) return null;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('projectTodos.title')}
            onPress={openProjectTodos}
            hitSlop={8}
            style={({ pressed }) => [
                styles.button,
                showLabel && styles.labeledButton,
                pressed && styles.pressed,
                style,
            ]}
        >
            <Ionicons name="checkbox-outline" size={showLabel ? 17 : 20} color={color} />
            {showLabel && <Text style={[styles.label, { color }]}>{t('projectTodos.shortTitle')}</Text>}
            {pendingCount > 0 && (
                <Text style={[styles.count, { color }]}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
            )}
        </Pressable>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    button: {
        minWidth: 36,
        height: 36,
        paddingHorizontal: 8,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    labeledButton: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.divider,
        backgroundColor: theme.colors.surface,
    },
    pressed: {
        backgroundColor: theme.colors.surfacePressed,
    },
    label: {
        fontSize: 13,
        ...Typography.default('semiBold'),
    },
    count: {
        fontSize: 11,
        ...Typography.default('semiBold'),
    },
}));
