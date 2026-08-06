import React from 'react';
import { Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { useNewSessionDraft } from '@/hooks/useNewSessionDraft';
import { useSettingMutable } from '@/sync/storage';
import {
    addProjectTodo,
    createProjectTodoDraft,
    deleteProjectTodo,
    PROJECT_TODO_CONTENT_LIMIT,
    setProjectTodoCompleted,
    updateProjectTodo,
    type ProjectTodoDraftTarget,
    type ProjectTodoItem,
} from '@/sync/projectTodos';
import { t } from '@/text';

interface ProjectTodoButtonProps {
    projectKey: string;
    projectName: string;
    target: ProjectTodoDraftTarget | null;
    alwaysVisible?: boolean;
}

export const ProjectTodoButton = React.memo(({ projectKey, projectName, target, alwaysVisible }: ProjectTodoButtonProps) => {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const safeArea = useSafeAreaInsets();
    const router = useRouter();
    const draft = useNewSessionDraft();
    const [projectTodos, setProjectTodos] = useSettingMutable('projectTodos');
    const [visible, setVisible] = React.useState(false);
    const [newContent, setNewContent] = React.useState('');
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editingContent, setEditingContent] = React.useState('');

    const todos = projectTodos[projectKey] ?? [];
    const pendingCount = todos.filter((todo) => !todo.completed).length;

    const updateTodos = React.useCallback((next: typeof projectTodos) => {
        if (next !== projectTodos) setProjectTodos(next);
    }, [projectTodos, setProjectTodos]);

    const handleAdd = React.useCallback(() => {
        const next = addProjectTodo(projectTodos, projectKey, newContent);
        updateTodos(next);
        if (next !== projectTodos) setNewContent('');
    }, [newContent, projectKey, projectTodos, updateTodos]);

    const handleToggle = React.useCallback((todo: ProjectTodoItem) => {
        updateTodos(setProjectTodoCompleted(projectTodos, projectKey, todo.id, !todo.completed));
    }, [projectKey, projectTodos, updateTodos]);

    const handleDelete = React.useCallback((todoId: string) => {
        updateTodos(deleteProjectTodo(projectTodos, projectKey, todoId));
        if (editingId === todoId) setEditingId(null);
    }, [editingId, projectKey, projectTodos, updateTodos]);

    const handleBeginEdit = React.useCallback((todo: ProjectTodoItem) => {
        setEditingId(todo.id);
        setEditingContent(todo.content);
    }, []);

    const handleSaveEdit = React.useCallback(() => {
        if (!editingId) return;
        const next = updateProjectTodo(projectTodos, projectKey, editingId, editingContent);
        updateTodos(next);
        if (editingContent.trim()) setEditingId(null);
    }, [editingContent, editingId, projectKey, projectTodos, updateTodos]);

    const handleProcess = React.useCallback((todo: ProjectTodoItem) => {
        if (!target) return;
        const values = createProjectTodoDraft(target, todo);
        draft.setMachineId(values.selectedMachineId);
        draft.setPath(values.selectedPath);
        draft.setSessionType(values.sessionType);
        draft.setWorktreeKey(values.worktreeKey);
        draft.setInput(values.input);
        setVisible(false);
        router.navigate('/new');
    }, [draft, router, target]);

    const close = React.useCallback(() => {
        setVisible(false);
        setEditingId(null);
    }, []);

    return (
        <>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('projectTodos.title')}
                onPress={(event) => {
                    event.stopPropagation();
                    setVisible(true);
                }}
                hitSlop={10}
                style={({ pressed }) => [
                    styles.trigger,
                    pressed && styles.triggerPressed,
                    Platform.OS === 'web' && styles.triggerWeb,
                    !alwaysVisible && pendingCount === 0 && Platform.OS === 'web' && styles.triggerHidden,
                ]}
            >
                <Ionicons name="checkbox-outline" size={15} color={theme.colors.textSecondary} />
                {pendingCount > 0 && <Text style={styles.badge}>{pendingCount > 99 ? '99+' : pendingCount}</Text>}
            </Pressable>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
                <Pressable style={styles.backdrop} onPress={close}>
                    <Pressable
                        style={[styles.modal, { marginTop: safeArea.top + 16, marginBottom: safeArea.bottom + 16 }]}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={styles.header}>
                            <View style={styles.headerText}>
                                <Text style={styles.title}>{t('projectTodos.title')}</Text>
                                <Text style={styles.projectName} numberOfLines={1}>{projectName}</Text>
                            </View>
                            <Pressable onPress={close} hitSlop={12} style={styles.iconButton}>
                                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                            </Pressable>
                        </View>

                        <View style={styles.addRow}>
                            <TextInput
                                value={newContent}
                                onChangeText={setNewContent}
                                onSubmitEditing={handleAdd}
                                placeholder={t('projectTodos.addPlaceholder')}
                                placeholderTextColor={theme.colors.input.placeholder}
                                maxLength={PROJECT_TODO_CONTENT_LIMIT}
                                style={styles.input}
                                returnKeyType="done"
                            />
                            <Pressable
                                onPress={handleAdd}
                                disabled={!newContent.trim()}
                                style={[styles.addButton, !newContent.trim() && styles.disabled]}
                            >
                                <Text style={styles.addButtonText}>{t('projectTodos.add')}</Text>
                            </Pressable>
                        </View>

                        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
                            {todos.length === 0 ? (
                                <View style={styles.empty}>
                                    <Ionicons name="checkbox-outline" size={28} color={theme.colors.textSecondary} />
                                    <Text style={styles.emptyText}>{t('projectTodos.empty')}</Text>
                                </View>
                            ) : todos.map((todo) => (
                                <View key={todo.id} style={styles.todoRow}>
                                    <Pressable onPress={() => handleToggle(todo)} hitSlop={8} style={styles.checkboxButton}>
                                        <Ionicons
                                            name={todo.completed ? 'checkbox' : 'square-outline'}
                                            size={21}
                                            color={todo.completed ? theme.colors.success : theme.colors.textSecondary}
                                        />
                                    </Pressable>
                                    <View style={styles.todoBody}>
                                        {editingId === todo.id ? (
                                            <TextInput
                                                value={editingContent}
                                                onChangeText={setEditingContent}
                                                onSubmitEditing={handleSaveEdit}
                                                maxLength={PROJECT_TODO_CONTENT_LIMIT}
                                                autoFocus
                                                style={styles.editInput}
                                            />
                                        ) : (
                                            <Text style={[styles.todoText, todo.completed && styles.todoCompleted]}>{todo.content}</Text>
                                        )}
                                        <View style={styles.actions}>
                                            {editingId === todo.id ? (
                                                <Pressable onPress={handleSaveEdit} hitSlop={6}>
                                                    <Text style={styles.actionText}>{t('common.save')}</Text>
                                                </Pressable>
                                            ) : (
                                                <>
                                                    <Pressable onPress={() => handleProcess(todo)} disabled={!target} hitSlop={6}>
                                                        <Text style={[styles.processText, !target && styles.disabledText]}>{t('projectTodos.process')}</Text>
                                                    </Pressable>
                                                    <Pressable onPress={() => handleBeginEdit(todo)} hitSlop={6}>
                                                        <Text style={styles.actionText}>{t('projectTodos.edit')}</Text>
                                                    </Pressable>
                                                </>
                                            )}
                                            <Pressable onPress={() => handleDelete(todo.id)} hitSlop={6}>
                                                <Text style={styles.deleteText}>{t('common.delete')}</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    trigger: { minWidth: 28, height: 28, paddingHorizontal: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
    triggerPressed: { backgroundColor: theme.colors.surfacePressed },
    triggerWeb: { cursor: 'pointer' },
    triggerHidden: { opacity: 0 },
    badge: { fontSize: 10, color: theme.colors.textSecondary, ...Typography.default('semiBold') },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
    modal: { width: '100%', maxWidth: 620, maxHeight: '85%', backgroundColor: theme.colors.surface, borderRadius: 16, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider },
    headerText: { flex: 1, minWidth: 0 },
    title: { fontSize: 18, color: theme.colors.text, ...Typography.default('semiBold') },
    projectName: { marginTop: 2, fontSize: 12, color: theme.colors.textSecondary, ...Typography.default() },
    iconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    addRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
    input: { flex: 1, minHeight: 40, borderRadius: 10, paddingHorizontal: 12, backgroundColor: theme.colors.input.background, color: theme.colors.input.text, ...Typography.default() },
    addButton: { minHeight: 40, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.button.primary.background },
    addButtonText: { color: theme.colors.button.primary.tint, ...Typography.default('semiBold') },
    disabled: { opacity: 0.45 },
    disabledText: { opacity: 0.45 },
    list: { minHeight: 180 },
    listContent: { padding: 16, paddingTop: 8, gap: 8 },
    empty: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyText: { color: theme.colors.textSecondary, ...Typography.default() },
    todoRow: { flexDirection: 'row', padding: 12, borderRadius: 12, backgroundColor: theme.colors.surfaceHigh },
    checkboxButton: { paddingTop: 1, paddingRight: 10 },
    todoBody: { flex: 1, minWidth: 0 },
    todoText: { color: theme.colors.text, fontSize: 14, lineHeight: 20, ...Typography.default() },
    todoCompleted: { color: theme.colors.textSecondary, textDecorationLine: 'line-through' },
    editInput: { minHeight: 36, paddingHorizontal: 10, borderRadius: 8, backgroundColor: theme.colors.input.background, color: theme.colors.input.text, ...Typography.default() },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 9 },
    processText: { color: theme.colors.textLink, fontSize: 12, ...Typography.default('semiBold') },
    actionText: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    deleteText: { color: theme.colors.textDestructive, fontSize: 12, ...Typography.default('semiBold') },
}));
