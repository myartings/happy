import React from 'react';
import { ActivityIndicator, Platform, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { useLocalSetting } from '@/sync/storage';
import {
    githubIssuesApi,
    githubIssuesRepositoryResolver,
    type GithubRepositoryResolution,
} from '@/features/github-issues/githubIssuesApi';
import { GithubRepositoryPicker } from '@/features/github-issues/GithubRepositoryPicker';
import { GithubIssuesQuickPopover, type GithubIssuesPopoverAnchor } from '@/features/github-issues/GithubIssuesSessionPanel';
import { isTauri } from '@/utils/isTauri';
import { openExternalUrl } from '@/utils/openExternalUrl';
import type { GithubIssuesWorkspaceSelection } from '@/features/github-issues/githubIssuesWorkspace';

export const GithubIssuesButton = React.memo(({ showLabel = false, style, tintColor, sessionId, cwd, onOpenIssue, onNewIssue, onViewAll }: {
    showLabel?: boolean;
    style?: StyleProp<ViewStyle>;
    tintColor?: string;
    sessionId?: string;
    cwd?: string;
    onOpenIssue?: (selection: GithubIssuesWorkspaceSelection) => void;
    onNewIssue?: (selection: GithubIssuesWorkspaceSelection) => void;
    onViewAll?: (selection: GithubIssuesWorkspaceSelection) => void;
}) => {
    const enabled = useLocalSetting('devGithubIssuesEnabled');
    const router = useRouter();
    const { theme } = useUnistyles();
    const color = tintColor ?? theme.colors.textSecondary;
    const buttonRef = React.useRef<any>(null);
    const [resolving, setResolving] = React.useState(false);
    const [picker, setPicker] = React.useState<
        Extract<GithubRepositoryResolution, { status: 'picker' }> | null
    >(null);
    const [contextRepository, setContextRepository] = React.useState<{ owner: string; repo: string } | null>(null);
    const [contextVisible, setContextVisible] = React.useState(false);
    const [popoverAnchor, setPopoverAnchor] = React.useState<GithubIssuesPopoverAnchor | null>(null);
    const pathSegments = cwd?.split(/[\\/]/).filter(Boolean) ?? [];
    const contextLabel = contextRepository
        ? `${contextRepository.owner}/${contextRepository.repo}`
        : pathSegments[pathSegments.length - 1] ?? 'Repository';
    const openRepository = React.useCallback((owner: string, repo: string) => {
        setPicker(null);
        if (sessionId) {
            setContextRepository({ owner, repo });
            buttonRef.current?.measureInWindow?.((x: number, y: number, width: number, height: number) => {
                setPopoverAnchor({ x, y, width, height });
            });
            setContextVisible(true);
            return;
        }
        router.push({ pathname: '/github-issues', params: { owner, repo, ...(sessionId ? { sourceSessionId: sessionId } : {}) } } as any);
    }, [router, sessionId]);
    const openIssues = React.useCallback(async () => {
        if (resolving) return;
        if (sessionId && contextRepository) {
            setContextVisible(true);
            return;
        }
        setResolving(true);
        try {
            const resolution = await githubIssuesRepositoryResolver.resolve({ sessionId, path: cwd });
            if (resolution.status === 'resolved') {
                openRepository(resolution.repository.owner, resolution.repository.name);
                return;
            }
            setPicker(resolution);
        } catch {
            if (sessionId) {
                setPicker({
                    status: 'picker',
                    reason: 'lookup-failed',
                    repositories: [],
                    suggestedRepository: null,
                    selectionRemoteFingerprint: null,
                    association: null,
                });
            } else {
                router.push('/github-issues' as any);
            }
        } finally {
            setResolving(false);
        }
    }, [contextRepository, cwd, openRepository, resolving, router, sessionId]);
    if (!enabled || (Platform.OS === 'web' && !isTauri())) return null;
    return (
        <>
            <Pressable
                ref={buttonRef}
                accessibilityRole="button"
                accessibilityLabel="GitHub Issues"
                accessibilityState={{ busy: resolving, disabled: resolving }}
                disabled={resolving}
                onPress={() => void openIssues()}
                style={({ pressed }) => [styles.button, showLabel && styles.labeled, pressed && styles.pressed, style]}
            >
                {resolving
                    ? <ActivityIndicator size="small" color={color} />
                    : <Ionicons name="logo-github" size={showLabel ? 17 : 20} color={color} />}
                {showLabel && <Text style={[styles.label, { color }]}>{sessionId ? contextLabel : 'Issues'}</Text>}
            </Pressable>
            <GithubRepositoryPicker
                visible={!!picker}
                repositories={picker?.repositories ?? []}
                selectedRepository={picker?.suggestedRepository
                    ? { owner: picker.suggestedRepository.owner, repo: picker.suggestedRepository.name }
                    : null}
                reason={picker?.reason}
                onClose={() => setPicker(null)}
                onSelect={(repository) => {
                    githubIssuesRepositoryResolver.remember(
                        repository,
                        picker?.selectionRemoteFingerprint !== null
                            && picker?.selectionRemoteFingerprint !== undefined
                            ? {
                                identity: { sessionId, path: cwd },
                                remoteFingerprint: picker.selectionRemoteFingerprint,
                            }
                            : undefined,
                    );
                    openRepository(repository.owner, repository.name);
                }}
                onManageAccess={githubIssuesApi.installationUrl
                    ? () => void openExternalUrl(githubIssuesApi.installationUrl!)
                    : undefined}
            />
            <GithubIssuesQuickPopover
                visible={contextVisible}
                repository={contextRepository}
                anchor={popoverAnchor}
                onClose={() => setContextVisible(false)}
                onOpenIssue={(issueNumber) => {
                    if (!contextRepository) return;
                    setContextVisible(false);
                    if (onOpenIssue) {
                        onOpenIssue({ repository: contextRepository, issueNumber, mode: 'detail' });
                        return;
                    }
                    router.push({ pathname: '/github-issues/[number]', params: { owner: contextRepository.owner, repo: contextRepository.repo, number: issueNumber, sourceSessionId: sessionId } } as any);
                }}
                onNewIssue={() => {
                    if (!contextRepository) return;
                    setContextVisible(false);
                    if (onNewIssue) {
                        onNewIssue({ repository: contextRepository, mode: 'new' });
                        return;
                    }
                    router.push({ pathname: '/github-issues/new', params: { owner: contextRepository.owner, repo: contextRepository.repo, sourceSessionId: sessionId } } as any);
                }}
                onViewAll={() => {
                    if (!contextRepository) return;
                    setContextVisible(false);
                    if (onViewAll) {
                        onViewAll({ repository: contextRepository, mode: 'list' });
                        return;
                    }
                    router.push({ pathname: '/github-issues', params: { owner: contextRepository.owner, repo: contextRepository.repo, sourceSessionId: sessionId } } as any);
                }}
            />
        </>
    );
});

const styles = StyleSheet.create((theme) => ({
    button: { minWidth: 36, height: 36, paddingHorizontal: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
    labeled: { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.divider, backgroundColor: theme.colors.surface },
    pressed: { backgroundColor: theme.colors.surfacePressed },
    label: { fontSize: 13, ...Typography.default('semiBold') },
}));
