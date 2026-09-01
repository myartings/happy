import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '@/components/StyledText';
import { Typography } from '@/constants/Typography';
import { t } from '@/text';
import { useSession, useSessionPendingCommunications } from '@/sync/storage';
import {
    shouldUseAgentQuestionFallback,
    type PendingAgentCommunication,
} from '@/sync/agentCommunications';
import { sessionCancelCommunication } from '@/sync/ops';
import { AgentQuestionModal } from './AgentQuestionModal';
import {
    createCodexFirstDecisionSubmissionGate,
    resolveCodexFirstDecisionPresentation,
    submitCodexFirstDecisionOnce,
} from '@/features/codex-first-shell/codexFirstDecisionLifecycle';

/**
 * Fallback UI above the composer when a request cannot render in the transcript
 * (for example, a text-only form or a communication kind this build does not
 * understand).
 *
 * A form opens the full-screen answer sheet. A communication of a kind this
 * build does not implement says so and offers to dismiss it, so the session is
 * never stuck on something this client cannot render.
 */
export function AgentQuestionBanner({ sessionId, focusCommunicationId }: {
    sessionId: string;
    focusCommunicationId?: string;
}) {
    const pendingCommunications = useSessionPendingCommunications(sessionId);
    const session = useSession(sessionId);
    const [openId, setOpenId] = React.useState<string | null>(null);
    const [dismissingId, setDismissingId] = React.useState<string | null>(null);
    const [dismissedId, setDismissedId] = React.useState<string | null>(null);
    const dismissalGate = React.useRef(createCodexFirstDecisionSubmissionGate());

    // Choice forms belong exclusively to the transcript renderer. Communication
    // state can arrive one render before its request_user_input tool message; if
    // the fallback also claimed that intermediate frame, the legacy form flashed
    // before being replaced by the inline card. Keep the banner/modal solely for
    // forms the inline renderer cannot display and unsupported communication kinds.
    const fallbackCommunications = pendingCommunications.filter(communication => (
        shouldUseAgentQuestionFallback(communication)
    ));
    const pending = fallbackCommunications.find(communication => communication.id === focusCommunicationId)
        ?? fallbackCommunications[0];
    const open = pending?.kind === 'form' && openId === pending.id;
    const isConnected = session?.presence === 'online';

    React.useEffect(() => {
        dismissalGate.current = createCodexFirstDecisionSubmissionGate();
        setDismissingId(null);
        setDismissedId(null);
    }, [pending?.id]);

    // Drop the modal as soon as its request is gone, so an answer from another
    // device closes the form here too.
    React.useEffect(() => {
        if (openId !== null && !pendingCommunications.some(item => item.id === openId)) {
            setOpenId(null);
        }
    }, [openId, pendingCommunications]);

    React.useEffect(() => {
        if (pending && pending.id === focusCommunicationId && pending.kind === 'form') {
            setOpenId(pending.id);
        }
    }, [focusCommunicationId, pending]);

    const handleDismissUnsupported = React.useCallback(async (id: string, rawKind: string) => {
        if (!isConnected || dismissalGate.current.inFlight || dismissalGate.current.completedAction !== null) return;
        setDismissingId(id);
        try {
            const result = await submitCodexFirstDecisionOnce(dismissalGate.current, {
                action: 'cancel',
                requestId: id,
                submit: () => sessionCancelCommunication(sessionId, id, rawKind),
            });
            if (result === 'submitted') setDismissedId(id);
        } catch {
            // The agent re-asks if the dismissal never lands; nothing to show here.
        } finally {
            setDismissingId(null);
        }
    }, [isConnected, sessionId]);

    if (!pending) return null;

    if (pending.kind === 'unsupported') {
        return (
            <AgentQuestionBannerView
                pending={pending}
                onDismiss={() => handleDismissUnsupported(pending.id, pending.rawKind)}
                connected={isConnected}
                submitted={dismissedId === pending.id}
                submitting={dismissingId === pending.id}
            />
        );
    }

    return (
        <>
            <AgentQuestionBannerView
                pending={pending}
                onPress={() => setOpenId(pending.id)}
                connected={isConnected}
            />
            <AgentQuestionModal
                pending={pending}
                sessionId={sessionId}
                visible={open}
                onClose={() => setOpenId(null)}
                connected={isConnected}
            />
        </>
    );
}

/**
 * The banner itself, with no store or network of its own, so it can be rendered
 * from the dev previews as well as from a live session.
 */
export function AgentQuestionBannerView({
    pending,
    onPress,
    onDismiss,
    connected = true,
    submitted = false,
    submitting = false,
}: {
    pending: PendingAgentCommunication;
    onPress?: () => void;
    onDismiss?: () => void;
    connected?: boolean;
    submitted?: boolean;
    submitting?: boolean;
}) {
    const styles = stylesheet;
    const { theme } = useUnistyles();

    const decisionPresentation = resolveCodexFirstDecisionPresentation({
        connected,
        requestStatus: 'pending',
        submitted,
        submitting,
    });

    if (pending.kind === 'unsupported') {
        return (
            <View style={[styles.container, styles.containerUnsupported]}>
                <View style={styles.icon}>
                    <Ionicons name="alert-circle-outline" size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.body}>
                    <Text style={styles.title} numberOfLines={1}>
                        {pending.title ?? t('agentQuestion.unsupportedTitle')}
                    </Text>
                    <Text style={styles.subtitle} numberOfLines={2}>
                        {decisionPresentation.state === 'disconnected'
                            ? t('codexFirst.decisionDisconnected')
                            : t('agentQuestion.unsupportedDescription', { kind: pending.rawKind })}
                    </Text>
                </View>
                <Pressable
                    onPress={onDismiss}
                    hitSlop={10}
                    disabled={!decisionPresentation.canInteract}
                    accessibilityRole="button"
                    accessibilityLabel={t('agentQuestion.dismiss')}
                    accessibilityState={decisionPresentation.accessibilityState}
                >
                    <Text style={styles.dismiss}>{t('agentQuestion.dismiss')}</Text>
                </Pressable>
            </View>
        );
    }

    const first = pending.questions[0];
    const remaining = pending.questions.length - 1;

    return (
        <Pressable
            style={styles.container}
            onPress={onPress}
            disabled={!decisionPresentation.canInteract}
            accessibilityRole="button"
            accessibilityLabel={first?.question ?? t('agentQuestion.title')}
            accessibilityState={decisionPresentation.accessibilityState}
        >
            <View style={styles.icon}>
                <Ionicons name="help-circle-outline" size={20} color={theme.colors.textLink} />
            </View>
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>
                    {first?.header ?? t('agentQuestion.title')}
                </Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                    {decisionPresentation.state === 'disconnected'
                        ? t('codexFirst.decisionDisconnected')
                        : remaining > 0
                        ? t('agentQuestion.moreQuestions', { count: remaining })
                        : (first?.question ?? '')}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </Pressable>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 12,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.textLink,
    },
    containerUnsupported: {
        borderColor: theme.colors.divider,
    },
    icon: {
        width: 24,
        alignItems: 'center',
    },
    body: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        fontSize: 14,
        color: theme.colors.text,
        ...Typography.default('semiBold'),
    },
    subtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        ...Typography.default(),
    },
    dismiss: {
        fontSize: 14,
        color: theme.colors.textLink,
        ...Typography.default('semiBold'),
    },
}));
