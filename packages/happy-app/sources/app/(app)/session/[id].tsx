import * as React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SessionView } from '@/-session/SessionView';


export default React.memo(() => {
    const { id: sessionId, messageId, localId, createdAt } = useLocalSearchParams<{
        id: string; messageId?: string; localId?: string; createdAt?: string;
    }>();
    const targetCreatedAt = createdAt !== undefined ? Number(createdAt) : undefined;
    return <SessionView
        id={sessionId}
        targetMessageId={messageId}
        targetMessageLocalId={localId}
        targetMessageCreatedAt={Number.isFinite(targetCreatedAt) ? targetCreatedAt : undefined}
    />;
});
