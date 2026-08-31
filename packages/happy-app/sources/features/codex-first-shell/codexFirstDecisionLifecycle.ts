export type CodexFirstDecisionRequestStatus = 'pending' | 'resolved' | 'expired';

export type CodexFirstDecisionLifecycleState =
    | 'pending'
    | 'submitting'
    | 'resolved'
    | 'expired'
    | 'disconnected';

export type CodexFirstDecisionPresentation = Readonly<{
    accessibilityState: Readonly<{
        busy: boolean;
        disabled: boolean;
    }>;
    canInteract: boolean;
    state: CodexFirstDecisionLifecycleState;
}>;

type ResolveCodexFirstDecisionPresentationInput = Readonly<{
    connected: boolean;
    requestStatus: CodexFirstDecisionRequestStatus;
    submitted: boolean;
    submitting: boolean;
}>;

export function resolveCodexFirstDecisionPresentation({
    connected,
    requestStatus,
    submitted,
    submitting,
}: ResolveCodexFirstDecisionPresentationInput): CodexFirstDecisionPresentation {
    let state: CodexFirstDecisionLifecycleState;
    if (requestStatus === 'resolved' || submitted) {
        state = 'resolved';
    } else if (requestStatus === 'expired') {
        state = 'expired';
    } else if (!connected) {
        state = 'disconnected';
    } else if (submitting) {
        state = 'submitting';
    } else {
        state = 'pending';
    }

    const canInteract = state === 'pending';
    return {
        accessibilityState: {
            busy: state === 'submitting',
            disabled: !canInteract,
        },
        canInteract,
        state,
    };
}

export type CodexFirstDecisionSubmissionGate = {
    completedAction: string | null;
    inFlight: boolean;
    requestId: string | null;
};

export function createCodexFirstDecisionSubmissionGate(): CodexFirstDecisionSubmissionGate {
    return {
        completedAction: null,
        inFlight: false,
        requestId: null,
    };
}

type SubmitCodexFirstDecisionOnceInput = Readonly<{
    action: string;
    requestId: string;
    submit: () => Promise<void>;
}>;

/**
 * Holds a successful request locally until its authoritative state arrives.
 * A rejected operation releases the gate so the same action can be retried.
 */
export async function submitCodexFirstDecisionOnce(
    gate: CodexFirstDecisionSubmissionGate,
    { action, requestId, submit }: SubmitCodexFirstDecisionOnceInput,
): Promise<'submitted' | 'duplicate'> {
    if (gate.requestId !== requestId) {
        gate.requestId = requestId;
        gate.inFlight = false;
        gate.completedAction = null;
    }
    if (gate.inFlight || gate.completedAction !== null) return 'duplicate';

    gate.inFlight = true;
    try {
        await submit();
        gate.completedAction = action;
        return 'submitted';
    } finally {
        gate.inFlight = false;
    }
}
