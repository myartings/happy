import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    useWindowDimensions,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { sessionAllow, sessionDeny, sessionSetAgentModes } from '@/sync/ops';
import { useUnistyles } from 'react-native-unistyles';
import { useSession } from '@/sync/storage';
import { t } from '@/text';
import { useIsTablet } from '@/utils/responsive';
import {
    createCodexFirstDecisionSubmissionGate,
    resolveCodexFirstDecisionPresentation,
    submitCodexFirstDecisionOnce,
} from '@/features/codex-first-shell/codexFirstDecisionLifecycle';
import { useReducedMotion } from '@/features/codex-first-shell/useReducedMotion';

interface PermissionActionButtonProps {
    label: string;
    loading: boolean;
    disabled: boolean;
    onPress: () => void;
    activeOpacity: number;
    buttonStyle: StyleProp<ViewStyle>;
    contentStyle: StyleProp<ViewStyle>;
    textStyle: StyleProp<TextStyle>;
    ringStyle: StyleProp<ViewStyle>;
    ringColor: string;
    numberOfLines?: number;
    selected?: boolean;
}

const PermissionActionButton = React.memo(function PermissionActionButton({
    label,
    loading,
    disabled,
    onPress,
    activeOpacity,
    buttonStyle,
    contentStyle,
    textStyle,
    ringStyle,
    ringColor,
    numberOfLines = 1,
    selected = false,
}: PermissionActionButtonProps) {
    const pulse = useRef(new Animated.Value(0)).current;
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (!loading) {
            pulse.stopAnimation();
            pulse.setValue(0);
            return;
        }

        if (reduceMotion) {
            pulse.stopAnimation();
            pulse.setValue(1);
            return;
        }

        pulse.setValue(0);
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 720,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 720,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        );
        animation.start();

        return () => {
            animation.stop();
        };
    }, [loading, pulse, reduceMotion]);

    const ringOpacity = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.18, 0.52],
    });

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={activeOpacity}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ busy: loading, disabled, selected }}
        >
            <View style={contentStyle}>
                <Text style={textStyle} numberOfLines={numberOfLines} ellipsizeMode="tail">
                    {label}
                </Text>
            </View>
            {loading ? (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        ringStyle,
                        {
                            borderColor: ringColor,
                            opacity: ringOpacity,
                        },
                    ]}
                />
            ) : null}
        </TouchableOpacity>
    );
});

interface PermissionFooterProps {
    permission: {
        id: string;
        status: "pending" | "approved" | "denied" | "canceled";
        reason?: string;
        mode?: string;
        allowedTools?: string[];
        decision?: 'approved' | 'approved_for_session' | 'denied' | 'abort';
    };
    sessionId: string;
    toolName: string;
    toolInput?: any;
    metadata?: any;
}

export const PermissionFooter: React.FC<PermissionFooterProps> = ({ permission, sessionId, toolName, toolInput, metadata }) => {
    const { theme } = useUnistyles();
    const isTablet = useIsTablet();
    const { height: windowHeight } = useWindowDimensions();
    const session = useSession(sessionId);
    const [loadingButton, setLoadingButton] = useState<'allow' | 'deny' | 'abort' | null>(null);
    const [loadingAllEdits, setLoadingAllEdits] = useState(false);
    const [loadingBypass, setLoadingBypass] = useState(false);
    const [loadingForSession, setLoadingForSession] = useState(false);
    const [submittedAction, setSubmittedAction] = useState<string | null>(null);
    const submissionGate = useRef(createCodexFirstDecisionSubmissionGate());

    useEffect(() => {
        submissionGate.current = createCodexFirstDecisionSubmissionGate();
        setSubmittedAction(null);
    }, [permission.id]);

    const isConnected = session?.presence === 'online';
    const requestStatus = permission.status === 'pending'
        ? 'pending'
        : permission.status === 'canceled'
            ? 'expired'
            : 'resolved';
    const anyLoading = loadingButton !== null || loadingAllEdits || loadingBypass || loadingForSession;
    const decisionPresentation = resolveCodexFirstDecisionPresentation({
        connected: isConnected,
        requestStatus,
        submitted: submittedAction !== null,
        submitting: anyLoading,
    });

    const canStartSubmission = () => decisionPresentation.canInteract
        && !submissionGate.current.inFlight
        && submissionGate.current.completedAction === null;

    const submitOnce = async (action: string, submit: () => Promise<void>) => {
        const result = await submitCodexFirstDecisionOnce(submissionGate.current, {
            action,
            requestId: permission.id,
            submit,
        });
        if (result === 'submitted') setSubmittedAction(action);
        return result;
    };
    
    // Check if this is a Codex session - check both metadata.flavor and tool name prefix
    const isCodex = metadata?.flavor === 'codex' || toolName.startsWith('Codex');

    const handleApprove = async () => {
        if (!canStartSubmission()) return;

        setLoadingButton('allow');
        try {
            await submitOnce('allow', async () => {
                await sessionAllow(sessionId, permission.id);
                // Plain plan approval switches the CLI's live SDK query to
                // 'default' — mirror that here, otherwise the next message's meta
                // still carries the stale 'plan' and pushes the SDK back into
                // plan mode, undoing the approval.
                if (toolName === 'exit_plan_mode' || toolName === 'ExitPlanMode') {
                    sessionSetAgentModes(sessionId, { permissionMode: 'default' });
                }
            });
        } catch (error) {
            console.error('Failed to approve permission:', error);
        } finally {
            setLoadingButton(null);
        }
    };

    const handleApproveAllEdits = async () => {
        if (!canStartSubmission()) return;

        setLoadingAllEdits(true);
        try {
            await submitOnce('allow-all-edits', async () => {
                await sessionAllow(sessionId, permission.id, 'acceptEdits');
                // Update the session permission mode to 'acceptEdits' for future permissions
                sessionSetAgentModes(sessionId, { permissionMode: 'acceptEdits' });
            });
        } catch (error) {
            console.error('Failed to approve all edits:', error);
        } finally {
            setLoadingAllEdits(false);
        }
    };

    const handleBypassPermissions = async () => {
        if (!canStartSubmission()) return;

        setLoadingBypass(true);
        try {
            await submitOnce('bypass-permissions', async () => {
                await sessionAllow(sessionId, permission.id, 'bypassPermissions');
                sessionSetAgentModes(sessionId, { permissionMode: 'bypassPermissions' });
            });
        } catch (error) {
            console.error('Failed to bypass permissions:', error);
        } finally {
            setLoadingBypass(false);
        }
    };

    const handleApproveForSession = async () => {
        if (!canStartSubmission() || !toolName) return;

        setLoadingForSession(true);
        try {
            // Special handling for Bash tool - include exact command
            let toolIdentifier = toolName;
            if (toolName === 'Bash' && toolInput?.command) {
                const command = toolInput.command;
                toolIdentifier = `Bash(${command})`;
            }
            
            await submitOnce('allow-for-session', () => (
                sessionAllow(sessionId, permission.id, undefined, [toolIdentifier])
            ));
        } catch (error) {
            console.error('Failed to approve for session:', error);
        } finally {
            setLoadingForSession(false);
        }
    };

    const handleDeny = async () => {
        if (!canStartSubmission()) return;

        setLoadingButton('deny');
        try {
            await submitOnce('deny', () => sessionDeny(sessionId, permission.id));
        } catch (error) {
            console.error('Failed to deny permission:', error);
        } finally {
            setLoadingButton(null);
        }
    };
    
    // Codex-specific handlers
    const handleCodexApprove = async () => {
        if (!canStartSubmission()) return;
        
        setLoadingButton('allow');
        try {
            await submitOnce('codex-approve', () => (
                sessionAllow(sessionId, permission.id, undefined, undefined, 'approved')
            ));
        } catch (error) {
            console.error('Failed to approve permission:', error);
        } finally {
            setLoadingButton(null);
        }
    };
    
    const handleCodexApproveForSession = async () => {
        if (!canStartSubmission()) return;
        
        setLoadingForSession(true);
        try {
            await submitOnce('codex-approve-for-session', () => (
                sessionAllow(sessionId, permission.id, undefined, undefined, 'approved_for_session')
            ));
        } catch (error) {
            console.error('Failed to approve for session:', error);
        } finally {
            setLoadingForSession(false);
        }
    };
    
    const handleCodexAbort = async () => {
        if (!canStartSubmission()) return;
        
        setLoadingButton('abort');
        try {
            await submitOnce('codex-abort', () => (
                sessionDeny(sessionId, permission.id, undefined, undefined, 'abort')
            ));
        } catch (error) {
            console.error('Failed to abort permission:', error);
        } finally {
            setLoadingButton(null);
        }
    };

    const isApproved = permission.status === 'approved';
    const isDenied = permission.status === 'denied';
    const isPending = permission.status === 'pending';

    // Helper function to check if tool matches allowed pattern
    const isToolAllowed = (toolName: string, toolInput: any, allowedTools: string[] | undefined): boolean => {
        if (!allowedTools) return false;
        
        // Direct match for non-Bash tools
        if (allowedTools.includes(toolName)) return true;
        
        // For Bash, check exact command match
        if (toolName === 'Bash' && toolInput?.command) {
            const command = toolInput.command;
            return allowedTools.includes(`Bash(${command})`);
        }
        
        return false;
    };

    // Detect which button was used based on mode (for Claude) or decision (for Codex)
    const isApprovedViaAllow = submittedAction === 'allow' || (isApproved && permission.mode !== 'acceptEdits' && permission.mode !== 'bypassPermissions' && !isToolAllowed(toolName, toolInput, permission.allowedTools));
    const isApprovedViaAllEdits = submittedAction === 'allow-all-edits' || (isApproved && permission.mode === 'acceptEdits');
    const isApprovedViaBypass = submittedAction === 'bypass-permissions' || (isApproved && permission.mode === 'bypassPermissions');
    const isApprovedForSession = submittedAction === 'allow-for-session' || (isApproved && isToolAllowed(toolName, toolInput, permission.allowedTools));
    
    // Codex-specific status detection with fallback
    const isCodexApproved = submittedAction === 'codex-approve' || (isCodex && isApproved && (permission.decision === 'approved' || !permission.decision));
    const isCodexApprovedForSession = submittedAction === 'codex-approve-for-session' || (isCodex && isApproved && permission.decision === 'approved_for_session');
    const isCodexAborted = submittedAction === 'codex-abort' || (isCodex && isDenied && permission.decision === 'abort');

    const styles = StyleSheet.create({
        container: {
            paddingHorizontal: 6,
            paddingTop: 4,
            paddingBottom: 8,
            justifyContent: 'center',
        },
        optionsScroll: {
            maxHeight: Math.min(260, Math.round(windowHeight * 0.35)),
        },
        buttonContainer: {
            flexDirection: 'column',
            gap: 7,
            alignItems: isTablet ? 'flex-end' : 'stretch',
        },
        button: {
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 7,
            backgroundColor: Platform.select({ web: 'transparent', default: theme.colors.surface }),
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 34,
            maxWidth: '100%',
            borderWidth: 1,
            borderColor: Platform.select({ web: theme.colors.textSecondary, default: theme.colors.divider }),
            flexShrink: 1,
            opacity: Platform.select({ web: 0.62, default: 1 }),
            overflow: 'hidden',
            position: 'relative',
        },
        buttonAllow: {
            borderColor: Platform.select({ web: theme.colors.textSecondary, default: theme.colors.divider }),
        },
        buttonDeny: {
            borderColor: Platform.select({ web: theme.colors.textSecondary, default: theme.colors.divider }),
        },
        buttonAllowAll: {
            borderColor: Platform.select({ web: theme.colors.textSecondary, default: theme.colors.divider }),
        },
        buttonSelected: {
            backgroundColor: Platform.select({ web: 'transparent', default: theme.colors.surfaceHighest }),
            borderColor: Platform.select({ web: theme.colors.textSecondary, default: theme.colors.divider }),
            opacity: 1,
        },
        buttonInactive: {
            opacity: Platform.select({ web: 0.62, default: 0.52 }),
        },
        buttonContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            minHeight: 18,
            minWidth: 0,
        },
        buttonRing: {
            ...StyleSheet.absoluteFillObject,
            top: -1,
            right: -1,
            bottom: -1,
            left: -1,
            borderRadius: 8,
            borderWidth: 2,
        },
        buttonLoading: {
            opacity: 1,
        },
        buttonText: {
            fontSize: 14,
            lineHeight: 18,
            fontWeight: '400',
            color: theme.colors.text,
        },
        buttonTextAllow: {
            color: theme.colors.text,
            fontWeight: '500',
        },
        buttonTextDeny: {
            color: theme.colors.text,
            fontWeight: '500',
        },
        buttonTextAllowAll: {
            color: theme.colors.text,
            fontWeight: '500',
        },
        buttonTextSelected: {
            color: theme.colors.text,
            fontWeight: '500',
        },
        buttonForSession: {
            borderColor: Platform.select({ web: theme.colors.textSecondary, default: theme.colors.divider }),
        },
        buttonTextForSession: {
            color: theme.colors.text,
            fontWeight: '500',
        },
        lifecycleText: {
            color: theme.colors.textSecondary,
            fontSize: 12,
            lineHeight: 17,
            paddingHorizontal: 4,
            paddingBottom: 6,
            textAlign: isTablet ? 'right' : 'left',
        },
    });

    const renderPermissionButton = ({
        label,
        loading,
        onPress,
        disabled,
        buttonStyle,
        textStyle,
        numberOfLines = 1,
        selected = false,
    }: {
        label: string;
        loading: boolean;
        onPress: () => void;
        disabled: boolean;
        buttonStyle: StyleProp<ViewStyle>;
        textStyle: StyleProp<TextStyle>;
        numberOfLines?: number;
        selected?: boolean;
    }) => (
        <PermissionActionButton
            label={label}
            loading={loading && isPending}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={isPending ? 0.7 : 1}
            buttonStyle={[
                buttonStyle,
                loading && isPending ? styles.buttonLoading : null,
            ]}
            contentStyle={styles.buttonContent}
            textStyle={textStyle}
            ringStyle={styles.buttonRing}
            ringColor={theme.colors.text}
            numberOfLines={numberOfLines}
            selected={selected}
        />
    );

    const lifecycleMessage = decisionPresentation.state === 'disconnected'
        ? t('codexFirst.decisionDisconnected')
        : decisionPresentation.state === 'expired'
            ? t('codexFirst.decisionExpired')
            : decisionPresentation.state === 'submitting'
                ? t('codexFirst.decisionSubmitting')
                : null;

    // Render Codex buttons if this is a Codex session
    if (isCodex) {
        return (
            <View style={styles.container}>
                {lifecycleMessage ? <Text style={styles.lifecycleText}>{lifecycleMessage}</Text> : null}
                <ScrollView
                    style={styles.optionsScroll}
                    contentContainerStyle={styles.buttonContainer}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                >
                    {renderPermissionButton({
                        label: t('common.yes'),
                        loading: loadingButton === 'allow',
                        onPress: handleCodexApprove,
                        disabled: !decisionPresentation.canInteract || anyLoading,
                        buttonStyle: [
                            styles.button,
                            isPending && styles.buttonAllow,
                            isCodexApproved && styles.buttonSelected,
                            (isCodexAborted || isCodexApprovedForSession) && styles.buttonInactive
                        ],
                        textStyle: [
                            styles.buttonText,
                            isPending && styles.buttonTextAllow,
                            isCodexApproved && styles.buttonTextSelected
                        ],
                        selected: isCodexApproved,
                    })}

                    {renderPermissionButton({
                        label: t('codex.permissions.yesForSession'),
                        loading: loadingForSession,
                        onPress: handleCodexApproveForSession,
                        disabled: !decisionPresentation.canInteract || anyLoading,
                        buttonStyle: [
                            styles.button,
                            isPending && styles.buttonForSession,
                            isCodexApprovedForSession && styles.buttonSelected,
                            (isCodexAborted || isCodexApproved) && styles.buttonInactive
                        ],
                        textStyle: [
                            styles.buttonText,
                            isPending && styles.buttonTextForSession,
                            isCodexApprovedForSession && styles.buttonTextSelected
                        ],
                        numberOfLines: 2,
                        selected: isCodexApprovedForSession,
                    })}

                    {renderPermissionButton({
                        label: t('codex.permissions.stopAndExplain'),
                        loading: loadingButton === 'abort',
                        onPress: handleCodexAbort,
                        disabled: !decisionPresentation.canInteract || anyLoading,
                        buttonStyle: [
                            styles.button,
                            isPending && styles.buttonDeny,
                            isCodexAborted && styles.buttonSelected,
                            (isCodexApproved || isCodexApprovedForSession) && styles.buttonInactive
                        ],
                        textStyle: [
                            styles.buttonText,
                            isPending && styles.buttonTextDeny,
                            isCodexAborted && styles.buttonTextSelected
                        ],
                        numberOfLines: 2,
                        selected: isCodexAborted,
                    })}
                </ScrollView>
            </View>
        );
    }

    // Render Claude buttons (existing behavior)
    return (
        <View style={styles.container}>
            {lifecycleMessage ? <Text style={styles.lifecycleText}>{lifecycleMessage}</Text> : null}
            <ScrollView
                style={styles.optionsScroll}
                contentContainerStyle={styles.buttonContainer}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
            >
                {renderPermissionButton({
                    label: t('common.yes'),
                    loading: loadingButton === 'allow',
                    onPress: handleApprove,
                    disabled: !decisionPresentation.canInteract || anyLoading,
                    buttonStyle: [
                        styles.button,
                        isPending && styles.buttonAllow,
                        isApprovedViaAllow && styles.buttonSelected,
                        (isDenied || isApprovedViaAllEdits || isApprovedViaBypass || isApprovedForSession) && styles.buttonInactive
                    ],
                    textStyle: [
                        styles.buttonText,
                        isPending && styles.buttonTextAllow,
                        isApprovedViaAllow && styles.buttonTextSelected
                    ],
                    selected: isApprovedViaAllow,
                })}

                {/* Allow All Edits button - only show for Edit and MultiEdit tools */}
                {(toolName === 'Edit' || toolName === 'MultiEdit' || toolName === 'Write' || toolName === 'NotebookEdit' || toolName === 'exit_plan_mode' || toolName === 'ExitPlanMode') && (
                    renderPermissionButton({
                        label: t('claude.permissions.yesAllowAllEdits'),
                        loading: loadingAllEdits,
                        onPress: handleApproveAllEdits,
                        disabled: !decisionPresentation.canInteract || anyLoading,
                        buttonStyle: [
                            styles.button,
                            isPending && styles.buttonAllowAll,
                            isApprovedViaAllEdits && styles.buttonSelected,
                            (isDenied || isApprovedViaAllow || isApprovedViaBypass || isApprovedForSession) && styles.buttonInactive
                        ],
                        textStyle: [
                            styles.buttonText,
                            isPending && styles.buttonTextAllowAll,
                            isApprovedViaAllEdits && styles.buttonTextSelected
                        ],
                        numberOfLines: 2,
                        selected: isApprovedViaAllEdits,
                    })
                )}

                {/* Bypass all permissions (yolo mode) - only show for ExitPlanMode */}
                {(toolName === 'exit_plan_mode' || toolName === 'ExitPlanMode') && (
                    renderPermissionButton({
                        label: t('claude.permissions.yesAllowEverything'),
                        loading: loadingBypass,
                        onPress: handleBypassPermissions,
                        disabled: !decisionPresentation.canInteract || anyLoading,
                        buttonStyle: [
                            styles.button,
                            isPending && styles.buttonForSession,
                            isApprovedViaBypass && styles.buttonSelected,
                            (isDenied || isApprovedViaAllow || isApprovedViaAllEdits || isApprovedForSession) && styles.buttonInactive
                        ],
                        textStyle: [
                            styles.buttonText,
                            isPending && styles.buttonTextForSession,
                            isApprovedViaBypass && styles.buttonTextSelected
                        ],
                        numberOfLines: 2,
                        selected: isApprovedViaBypass,
                    })
                )}

                {/* Allow for session button - only show for non-edit, non-exit-plan tools */}
                {toolName && toolName !== 'Edit' && toolName !== 'MultiEdit' && toolName !== 'Write' && toolName !== 'NotebookEdit' && toolName !== 'exit_plan_mode' && toolName !== 'ExitPlanMode' && (
                    renderPermissionButton({
                        label: t('claude.permissions.yesForTool'),
                        loading: loadingForSession,
                        onPress: handleApproveForSession,
                        disabled: !decisionPresentation.canInteract || anyLoading,
                        buttonStyle: [
                            styles.button,
                            isPending && styles.buttonForSession,
                            isApprovedForSession && styles.buttonSelected,
                            (isDenied || isApprovedViaAllow || isApprovedViaAllEdits || isApprovedViaBypass) && styles.buttonInactive
                        ],
                        textStyle: [
                            styles.buttonText,
                            isPending && styles.buttonTextForSession,
                            isApprovedForSession && styles.buttonTextSelected
                        ],
                        numberOfLines: 2,
                        selected: isApprovedForSession,
                    })
                )}

                {renderPermissionButton({
                    label: t('claude.permissions.noTellClaude'),
                    loading: loadingButton === 'deny',
                    onPress: handleDeny,
                    disabled: !decisionPresentation.canInteract || anyLoading,
                    buttonStyle: [
                        styles.button,
                        isPending && styles.buttonDeny,
                        isDenied && styles.buttonSelected,
                        (isApproved) && styles.buttonInactive
                    ],
                    textStyle: [
                        styles.buttonText,
                        isPending && styles.buttonTextDeny,
                        isDenied && styles.buttonTextSelected
                    ],
                    numberOfLines: 2,
                    selected: isDenied || submittedAction === 'deny',
                })}
            </ScrollView>
        </View>
    );
};
