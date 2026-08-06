import React from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { layout } from '@/components/layout';
import { Typography } from '@/constants/Typography';
import { useNewSessionDraft } from '@/hooks/useNewSessionDraft';
import { useAllSessions, useSettingMutable } from '@/sync/storage';
import {
    addProjectTodo,
    collectProjectTodoContexts,
    createProjectTodoDraft,
    deleteProjectTodo,
    PROJECT_TODO_CONTENT_LIMIT,
    selectProjectTodoContext,
    setProjectTodoCompleted,
    updateProjectTodo,
    type ProjectTodoItem,
} from '@/sync/projectTodos';
import { t } from '@/text';

type TodoFilter = 'all' | 'open' | 'completed';

export default function ProjectTodosScreen() {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const safeArea = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ projectKey?: string }>();
    const allSessions = useAllSessions();
    const [projectTodos, setProjectTodos] = useSettingMutable('projectTodos');
    const draft = useNewSessionDraft();
    const [selectedKey, setSelectedKey] = React.useState<string | null>(params.projectKey ?? null);
    const [filter, setFilter] = React.useState<TodoFilter>('all');
    const [newContent, setNewContent] = React.useState('');
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editingContent, setEditingContent] = React.useState('');

    const contexts = React.useMemo(() => collectProjectTodoContexts(
        allSessions.map((session) => ({
            projectId: session.metadata?.project?.id ?? null,
            projectName: session.metadata?.project?.name ?? null,
            machineId: session.metadata?.machineId ?? null,
            path: session.metadata?.path ?? null,
            homeDir: session.metadata?.homeDir ?? null,
            updatedAt: session.updatedAt,
        })),
        projectTodos,
    ), [allSessions, projectTodos]);

    const selectedContext = selectProjectTodoContext(contexts, selectedKey);
    React.useEffect(() => {
        if (selectedContext?.key !== selectedKey) setSelectedKey(selectedContext?.key ?? null);
    }, [selectedContext?.key, selectedKey]);

    const todos = selectedContext ? projectTodos[selectedContext.key] ?? [] : [];
    const filteredTodos = todos.filter((todo) => (
        filter === 'all' || (filter === 'completed' ? todo.completed : !todo.completed)
    ));
    const pendingCount = todos.filter((todo) => !todo.completed).length;

    const updateTodos = React.useCallback((next: typeof projectTodos) => {
        if (next !== projectTodos) setProjectTodos(next);
    }, [projectTodos, setProjectTodos]);

    const handleAdd = React.useCallback(() => {
        if (!selectedContext) return;
        const next = addProjectTodo(projectTodos, selectedContext.key, newContent);
        updateTodos(next);
        if (next !== projectTodos) setNewContent('');
    }, [newContent, projectTodos, selectedContext, updateTodos]);

    const handleToggle = React.useCallback((todo: ProjectTodoItem) => {
        if (!selectedContext) return;
        updateTodos(setProjectTodoCompleted(projectTodos, selectedContext.key, todo.id, !todo.completed));
    }, [projectTodos, selectedContext, updateTodos]);

    const handleDelete = React.useCallback((todoId: string) => {
        if (!selectedContext) return;
        updateTodos(deleteProjectTodo(projectTodos, selectedContext.key, todoId));
        if (editingId === todoId) setEditingId(null);
    }, [editingId, projectTodos, selectedContext, updateTodos]);

    const handleBeginEdit = React.useCallback((todo: ProjectTodoItem) => {
        setEditingId(todo.id);
        setEditingContent(todo.content);
    }, []);

    const handleSaveEdit = React.useCallback(() => {
        if (!selectedContext || !editingId) return;
        const next = updateProjectTodo(projectTodos, selectedContext.key, editingId, editingContent);
        updateTodos(next);
        if (editingContent.trim()) setEditingId(null);
    }, [editingContent, editingId, projectTodos, selectedContext, updateTodos]);

    const handleProcess = React.useCallback((todo: ProjectTodoItem) => {
        if (!selectedContext?.target) return;
        const values = createProjectTodoDraft(selectedContext.target, todo);
        draft.setMachineId(values.selectedMachineId);
        draft.setPath(values.selectedPath);
        draft.setSessionType(values.sessionType);
        draft.setWorktreeKey(values.worktreeKey);
        draft.setInput(values.input);
        router.navigate('/new');
    }, [draft, router, selectedContext]);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: safeArea.bottom + 32 }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.intro}>
                    <View style={styles.privacyRow}>
                        <Ionicons name="lock-closed-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.privacyText}>{t('projectTodos.privacy')}</Text>
                    </View>
                </View>

                {contexts.length > 0 ? (
                    <>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.projectPicker}
                        >
                            {contexts.map((context) => {
                                const selected = context.key === selectedContext?.key;
                                const count = (projectTodos[context.key] ?? []).filter((todo) => !todo.completed).length;
                                return (
                                    <Pressable
                                        key={context.key}
                                        onPress={() => {
                                            setSelectedKey(context.key);
                                            setEditingId(null);
                                        }}
                                        style={[styles.projectChip, selected && styles.projectChipSelected]}
                                    >
                                        <Text style={[styles.projectChipText, selected && styles.projectChipTextSelected]}>
                                            {context.name}{count > 0 ? `  ${count}` : ''}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.projectSummary}>
                            <View style={styles.projectSummaryText}>
                                <Text style={styles.projectName}>{selectedContext?.name}</Text>
                                <Text style={styles.projectCount}>{pendingCount} {t('projectTodos.open')}</Text>
                            </View>
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

                        <View style={styles.filters}>
                            {(['all', 'open', 'completed'] as const).map((value) => (
                                <Pressable
                                    key={value}
                                    onPress={() => setFilter(value)}
                                    style={[styles.filterButton, filter === value && styles.filterButtonSelected]}
                                >
                                    <Text style={[styles.filterText, filter === value && styles.filterTextSelected]}>
                                        {t(`projectTodos.${value}`)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.list}>
                            {filteredTodos.length === 0 ? (
                                <View style={styles.empty}>
                                    <Ionicons name="checkbox-outline" size={30} color={theme.colors.textSecondary} />
                                    <Text style={styles.emptyText}>{t('projectTodos.empty')}</Text>
                                </View>
                            ) : filteredTodos.map((todo) => (
                                <View key={todo.id} style={styles.todoRow}>
                                    <Pressable onPress={() => handleToggle(todo)} hitSlop={8} style={styles.checkboxButton}>
                                        <Ionicons
                                            name={todo.completed ? 'checkbox' : 'square-outline'}
                                            size={22}
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
                                                    <Pressable
                                                        onPress={() => handleProcess(todo)}
                                                        disabled={!selectedContext?.target}
                                                        hitSlop={6}
                                                    >
                                                        <Text style={[styles.processText, !selectedContext?.target && styles.disabledText]}>
                                                            {t('projectTodos.process')}
                                                        </Text>
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
                                        {!selectedContext?.target && (
                                            <Text style={styles.unavailableText}>{t('projectTodos.projectUnavailable')}</Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <View style={styles.emptyPage}>
                        <Ionicons name="folder-open-outline" size={34} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>{t('projectTodos.noProjects')}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: { flex: 1, backgroundColor: theme.colors.groupped.background },
    content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingTop: 16 },
    intro: { paddingHorizontal: 20, paddingBottom: 12 },
    privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    privacyText: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default() },
    projectPicker: { paddingHorizontal: 16, gap: 8, paddingBottom: 14 },
    projectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: theme.colors.surface },
    projectChipSelected: { backgroundColor: theme.colors.button.primary.background },
    projectChipText: { color: theme.colors.textSecondary, fontSize: 13, ...Typography.default('semiBold') },
    projectChipTextSelected: { color: theme.colors.button.primary.tint },
    projectSummary: { marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
    projectSummaryText: { flex: 1 },
    projectName: { color: theme.colors.text, fontSize: 18, ...Typography.default('semiBold') },
    projectCount: { marginTop: 2, color: theme.colors.textSecondary, fontSize: 12, ...Typography.default() },
    addRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 12 },
    input: { flex: 1, minHeight: 42, borderRadius: 10, paddingHorizontal: 12, backgroundColor: theme.colors.input.background, color: theme.colors.input.text, ...Typography.default() },
    addButton: { minHeight: 42, paddingHorizontal: 17, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.button.primary.background },
    addButtonText: { color: theme.colors.button.primary.tint, ...Typography.default('semiBold') },
    disabled: { opacity: 0.45 },
    disabledText: { opacity: 0.45 },
    filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
    filterButton: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: theme.colors.surface },
    filterButtonSelected: { backgroundColor: theme.colors.surfaceSelected },
    filterText: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    filterTextSelected: { color: theme.colors.text },
    list: { paddingHorizontal: 16, gap: 8 },
    empty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyPage: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
    emptyText: { color: theme.colors.textSecondary, textAlign: 'center', ...Typography.default() },
    todoRow: { flexDirection: 'row', padding: 14, borderRadius: Platform.select({ web: 12, default: 18 }), backgroundColor: theme.colors.surface, borderWidth: Platform.select({ web: 0, default: StyleSheet.hairlineWidth }), borderColor: theme.colors.divider },
    checkboxButton: { paddingTop: 1, paddingRight: 11 },
    todoBody: { flex: 1, minWidth: 0 },
    todoText: { color: theme.colors.text, fontSize: 15, lineHeight: 21, ...Typography.default() },
    todoCompleted: { color: theme.colors.textSecondary, textDecorationLine: 'line-through' },
    editInput: { minHeight: 38, paddingHorizontal: 10, borderRadius: 8, backgroundColor: theme.colors.input.background, color: theme.colors.input.text, ...Typography.default() },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 },
    processText: { color: theme.colors.textLink, fontSize: 12, ...Typography.default('semiBold') },
    actionText: { color: theme.colors.textSecondary, fontSize: 12, ...Typography.default('semiBold') },
    deleteText: { color: theme.colors.textDestructive, fontSize: 12, ...Typography.default('semiBold') },
    unavailableText: { marginTop: 6, color: theme.colors.textSecondary, fontSize: 11, ...Typography.default() },
}));
