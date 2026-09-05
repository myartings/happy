import * as React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SessionView } from '@/-session/SessionView';
import {
    parseCurrentRequestAttentionRouteVersion,
    type CurrentRequestAttentionFocusHint,
} from '@/features/needs-attention/currentRequestAttentionFocus';
import { perfMark } from '@/utils/perfLog';


export default React.memo(() => {
    const {
        id: sessionId,
        messageId,
        localId,
        createdAt,
        attentionKind,
        attentionSourceId,
        attentionAgentStateVersion,
    } = useLocalSearchParams<{
        id: string;
        messageId?: string;
        localId?: string;
        createdAt?: string;
        attentionKind?: string;
        attentionSourceId?: string;
        attentionAgentStateVersion?: string;
    }>();
    const targetCreatedAt = createdAt !== undefined ? Number(createdAt) : undefined;
    const attentionFocusHint: CurrentRequestAttentionFocusHint | undefined = (
        (attentionKind === 'permission_required' || attentionKind === 'answer_required')
        && typeof attentionSourceId === 'string'
    ) ? {
        kind: attentionKind,
        sourceId: attentionSourceId,
        observedAgentStateVersion: parseCurrentRequestAttentionRouteVersion(
            attentionAgentStateVersion,
        ),
    } : undefined;
    React.useMemo(() => perfMark(`session-open:${sessionId}`), [sessionId]);
    return <SessionView
        id={sessionId}
        targetMessageId={messageId}
        targetMessageLocalId={localId}
        targetMessageCreatedAt={Number.isFinite(targetCreatedAt) ? targetCreatedAt : undefined}
        attentionFocusHint={attentionFocusHint}
    />;
});
