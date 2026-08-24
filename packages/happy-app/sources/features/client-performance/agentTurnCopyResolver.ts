import * as React from 'react';

import type { Message } from '@/sync/typesMessage';
import type { AgentTurnCopyMessage } from '@/utils/agentTurnCopy';
import { TurnProjectionCache } from './turnProjectionCache';

export type AgentTurnCopyResolver = {
    messageId: string;
    resolve: () => string;
};

export function buildAgentTurnCopyResolver(
    messagesNewestFirst: readonly AgentTurnCopyMessage[],
    complete: boolean,
): AgentTurnCopyResolver | null {
    if (!complete) return null;
    const textMessages = messagesNewestFirst.filter((message) => (
        message.kind === 'agent-text'
        && !message.isThinking
        && Boolean(message.text?.trim())
    ));
    const finalMessage = textMessages[0];
    if (!finalMessage) return null;

    return {
        messageId: finalMessage.id,
        resolve: () => textMessages
            .slice()
            .reverse()
            .map((message) => message.text!.trim())
            .join('\n\n'),
    };
}

export function useAgentTurnCopyResolvers(
    messages: readonly Message[],
    currentTurnComplete: boolean,
): ReadonlyMap<string, () => string> {
    const cacheRef = React.useRef<TurnProjectionCache<Message, AgentTurnCopyResolver | null> | null>(null);
    if (!cacheRef.current) {
        cacheRef.current = new TurnProjectionCache<Message, AgentTurnCopyResolver | null>();
    }

    return React.useMemo(() => {
        const projected = cacheRef.current!.project({
            items: messages,
            getId: (message) => message.id,
            isBoundary: (message) => message.kind === 'user-text',
            variantForSegment: (segmentIndex) => String(segmentIndex === 0 ? currentTurnComplete : true),
            projectSegment: (segment, segmentIndex) => buildAgentTurnCopyResolver(
                segment,
                segmentIndex === 0 ? currentTurnComplete : true,
            ),
        });
        const resolvers = new Map<string, () => string>();
        for (const item of projected) {
            if (item) resolvers.set(item.messageId, item.resolve);
        }
        return resolvers;
    }, [currentTurnComplete, messages]);
}
