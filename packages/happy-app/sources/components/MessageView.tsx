import * as React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { MarkdownView } from "./markdown/MarkdownView";
import { t } from '@/text';
import { Message, UserTextMessage, AgentTextMessage, ToolCallMessage } from "@/sync/typesMessage";
import { Metadata } from "@/sync/storageTypes";
import { ToolView } from "./tools/ToolView";
import { AgentEvent } from "@/sync/typesRaw";
import { sync } from '@/sync/sync';
import { useSetting } from '@/sync/storage';
import { Option } from './markdown/MarkdownView';
import { layout } from "./layout";
import { parseLocalCommandMessage, isUserSlashCommandEcho } from './parseLocalCommandMessage';
import { resolveUserMessageBubbleColor } from '@/utils/userMessageBubbleColor';
import { getMessageTargetNativeId } from '@/utils/messageTarget';
import { useStudioSemanticTextPresentation } from '@/features/studio-semantic-text/useStudioSemanticTextPresentation';
import { LongPressCopyable } from './LongPressCopyable';
import { resolveCodexFirstUserMessagePresentation } from '@/features/codex-first-shell/codexFirstConversationPresentation';


export const MessageView = React.memo((props: {
  codexFirstEnabled?: boolean;
  message: Message;
  metadata: Metadata | null;
  sessionId: string;
  highlighted?: boolean;
  getMessageById?: (id: string) => Message | null;
  copyTextResolver?: () => string;
}) => {
  return (
    <View
      nativeID={getMessageTargetNativeId(props.message.id)}
      style={[styles.messageContainer, props.highlighted && styles.messageHighlighted]}
      renderToHardwareTextureAndroid={Platform.OS !== 'web'}
    >
      <View style={styles.messageContent}>
        <RenderBlock
          codexFirstEnabled={props.codexFirstEnabled ?? false}
          message={props.message}
          metadata={props.metadata}
          sessionId={props.sessionId}
          getMessageById={props.getMessageById}
          copyTextResolver={props.copyTextResolver}
        />
      </View>
    </View>
  );
});

// RenderBlock function that dispatches to the correct component based on message kind
function RenderBlock(props: {
  codexFirstEnabled: boolean;
  message: Message;
  metadata: Metadata | null;
  sessionId: string;
  getMessageById?: (id: string) => Message | null;
  copyTextResolver?: () => string;
}): React.ReactElement {
  switch (props.message.kind) {
    case 'user-text':
      return (
        <UserTextBlock
          codexFirstEnabled={props.codexFirstEnabled}
          message={props.message}
          metadata={props.metadata}
          sessionId={props.sessionId}
        />
      );

    case 'agent-text':
      return <AgentTextBlock message={props.message} sessionId={props.sessionId} copyTextResolver={props.copyTextResolver} />;

    case 'tool-call':
      return <ToolCallBlock
        message={props.message}
        metadata={props.metadata}
        sessionId={props.sessionId}
        getMessageById={props.getMessageById}
      />;

    case 'agent-event':
      return <AgentEventBlock event={props.message.event} metadata={props.metadata} />;


    default:
      // Exhaustive check - TypeScript will error if we miss a case
      const _exhaustive: never = props.message;
      throw new Error(`Unknown message kind: ${_exhaustive}`);
  }
}

function UserTextBlock(props: {
  codexFirstEnabled: boolean;
  message: UserTextMessage;
  metadata: Metadata | null;
  sessionId: string;
}) {
  const handleOptionPress = React.useCallback((option: Option) => {
    sync.sendMessage(props.sessionId, option.title, { source: 'option' });
  }, [props.sessionId]);

  const userMessageBubbleColor = useSetting('userMessageBubbleColor');
  const { theme } = useUnistyles();
  const studioPresentation = useStudioSemanticTextPresentation();
  const bubblePalette = resolveUserMessageBubbleColor(userMessageBubbleColor, theme.dark);
  const codexFirstPresentation = resolveCodexFirstUserMessagePresentation({
    enabled: props.codexFirstEnabled,
    isDark: theme.dark,
    selectedColor: userMessageBubbleColor,
  });
  const bubbleStyle = {
    backgroundColor: codexFirstPresentation?.backgroundColor ?? bubblePalette.background,
    borderColor: codexFirstPresentation?.borderColor ?? bubblePalette.border,
    ...(codexFirstPresentation ? {
      borderRadius: codexFirstPresentation.borderRadius,
      marginBottom: codexFirstPresentation.marginBottom,
      paddingHorizontal: codexFirstPresentation.paddingHorizontal,
      paddingVertical: codexFirstPresentation.paddingVertical,
    } : {}),
  };
  const copyTargetStyle = [
    styles.userCopyTarget,
    codexFirstPresentation && { maxWidth: codexFirstPresentation.contentMaxWidth },
  ];
  // Claude Agent SDK emits synthetic user messages wrapped in tags like
  // <local-command-caveat>…</local-command-caveat> and
  // <command-message>…</command-message><command-name>/foo</command-name>
  // whenever a slash command runs. The plain MarkdownView renders these as
  // literal text, which looks broken. Collapse them into chips or hide
  // them entirely depending on what kind of wrapper this is.
  // The user's own slash-command input is shown optimistically (carries a
  // localId); the SDK then injects the canonical wrapper chip. Hide the raw
  // echo so we don't render the command twice. Gated to Claude flavor only:
  // Codex/Gemini don't reliably emit the <command-*> wrapper, so hiding the
  // echo there would drop the command with nothing to replace it. (Absent
  // flavor == Claude, matching the convention used elsewhere.)
  const isClaudeFlavor = !props.metadata?.flavor || props.metadata.flavor === 'claude';
  if (isClaudeFlavor && isUserSlashCommandEcho(props.message.text, props.message.localId != null)) {
    return null;
  }

  const parsed = parseLocalCommandMessage(props.message.displayText || props.message.text);
  if (parsed.kind === 'caveat') {
    return null;
  }
  if (parsed.kind === 'goal-confirmation') {
    return null;
  }
  if (parsed.kind === 'goal-run') {
    return (
      <View style={styles.userMessageContainer}>
        <LongPressCopyable style={copyTargetStyle} text={parsed.goal}>
          <View style={[styles.userMessageBubble, styles.userMessageBubbleSolid, bubbleStyle, styles.goalMessageBubble]}>
            <MarkdownView externalCopyHandler markdown={parsed.goal} onOptionPress={handleOptionPress} sessionId={props.sessionId} />
          </View>
          <View style={styles.goalSentRow}>
            <Ionicons name="locate-outline" size={16} color={styles.goalSentText.color} />
            <Text style={[styles.goalSentText, studioPresentation?.roles.statusSecondary, studioPresentation?.metadata]}>{t('message.sentAsGoal')}</Text>
          </View>
        </LongPressCopyable>
      </View>
    );
  }
  if (parsed.kind === 'command-run') {
    const commandText = parsed.args ? `/${parsed.commandName} ${parsed.args}` : `/${parsed.commandName}`;
    return (
      <View style={styles.userMessageContainer}>
        <LongPressCopyable style={copyTargetStyle} text={commandText}>
          {parsed.args ? (
            <View style={[styles.userMessageBubble, styles.userMessageBubbleSolid, bubbleStyle, styles.commandMessageBubble]}>
              <MarkdownView externalCopyHandler markdown={parsed.args} onOptionPress={handleOptionPress} sessionId={props.sessionId} />
            </View>
          ) : null}
          <View style={[styles.commandChip, styles.userMessageBubbleSolid, bubbleStyle]}>
            <Text style={[styles.commandChipText, studioPresentation?.roles.command, studioPresentation?.metadata]}>/{parsed.commandName}</Text>
          </View>
        </LongPressCopyable>
      </View>
    );
  }

  return (
    <View style={styles.userMessageContainer}>
      {/* Long-press copies the whole message through our own menu rather than the
          OS selection callout. Rewind remains in session actions. */}
      <LongPressCopyable style={copyTargetStyle} text={parsed.text}>
        <View style={[styles.userMessageBubble, styles.userMessageBubbleSolid, bubbleStyle]}>
          <MarkdownView externalCopyHandler markdown={parsed.text} onOptionPress={handleOptionPress} sessionId={props.sessionId} />
        </View>
      </LongPressCopyable>
    </View>
  );
}

function AgentTextBlock(props: {
  message: AgentTextMessage;
  sessionId: string;
  copyTextResolver?: () => string;
}) {
  const handleOptionPress = React.useCallback((option: Option) => {
    sync.sendMessage(props.sessionId, option.title, { source: 'option' });
  }, [props.sessionId]);

  // Hide thinking messages
  if (props.message.isThinking) {
    return null;
  }

  return (
    <View style={styles.agentMessageContainer}>
      <MarkdownView markdown={props.message.text} onOptionPress={handleOptionPress} sessionId={props.sessionId} />
      {props.copyTextResolver ? <MessageCopyButton resolveText={props.copyTextResolver} /> : null}
    </View>
  );
}

// The glyph is deliberately small, so widen the touch target well past it.
const COPY_HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 20 };

function MessageCopyButton(props: { resolveText: () => string }) {
  const { theme } = useUnistyles();
  const [copied, setCopied] = React.useState(false);
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
  }, []);

  const handleCopy = React.useCallback(async () => {
    try {
      const text = props.resolveText();
      if (!text) return;
      await Clipboard.setStringAsync(text);
      setCopied(true);
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, [props.resolveText]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copied ? t('common.copied') : t('common.copy')}
      hitSlop={COPY_HIT_SLOP}
      onPress={handleCopy}
      style={({ pressed }) => [
        styles.copyAction,
        pressed && styles.copyActionPressed,
      ]}
    >
      <Ionicons
        name={copied ? 'checkmark' : 'copy-outline'}
        size={16}
        color={theme.colors.text}
      />
    </Pressable>
  );
}

function AgentEventBlock(props: {
  event: AgentEvent;
  metadata: Metadata | null;
}) {
  const studioPresentation = useStudioSemanticTextPresentation();
  const eventTextStyle = [
    styles.agentEventText,
    studioPresentation?.roles.statusSecondary,
    studioPresentation?.metadata,
  ];

  if (props.event.type === 'switch') {
    return (
      <View style={styles.agentEventContainer}>
        <Text style={eventTextStyle}>{t('message.switchedToMode', { mode: props.event.mode })}</Text>
      </View>
    );
  }
  if (props.event.type === 'message') {
    return (
      <View style={styles.agentEventContainer}>
        <Text style={eventTextStyle}>{props.event.message}</Text>
      </View>
    );
  }
  if (props.event.type === 'limit-reached') {
    const formatTime = (timestamp: number): string => {
      try {
        const date = new Date(timestamp * 1000); // Convert from Unix timestamp
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {
        return t('message.unknownTime');
      }
    };

    return (
      <View style={styles.agentEventContainer}>
        <Text style={eventTextStyle}>
          {t('message.usageLimitUntil', { time: formatTime(props.event.endsAt) })}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.agentEventContainer}>
      <Text style={[eventTextStyle, studioPresentation?.roles.statusWarning]}>{t('message.unknownEvent')}</Text>
    </View>
  );
}

function ToolCallBlock(props: {
  message: ToolCallMessage;
  metadata: Metadata | null;
  sessionId: string;
  getMessageById?: (id: string) => Message | null;
}) {
  if (!props.message.tool) {
    return null;
  }
  return (
    <View style={styles.toolContainer}>
      <ToolView
        tool={props.message.tool}
        metadata={props.metadata}
        messages={props.message.children}
        sessionId={props.sessionId}
        messageId={props.message.id}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  messageHighlighted: {
    backgroundColor: 'rgba(139, 124, 255, 0.16)',
    borderRadius: 12,
  },
  messageContent: {
    flexDirection: 'column',
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
    maxWidth: layout.maxWidth,
    overflow: 'hidden',
  },
  userMessageContainer: {
    maxWidth: '100%',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  userMessageBubble: {
    backgroundColor: theme.colors.userMessageBackground,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    maxWidth: '100%',
  },
  userMessageBubbleSolid: {
    borderWidth: Platform.select({ web: 0, default: StyleSheet.hairlineWidth }),
    overflow: 'hidden',
  },
  goalMessageBubble: {
    marginBottom: 6,
  },
  commandMessageBubble: {
    marginBottom: 6,
  },
  goalSentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    maxWidth: '100%',
    opacity: 0.72,
  },
  goalSentText: {
    color: theme.colors.agentEventText,
    fontSize: 14,
  },
  commandChip: {
    backgroundColor: theme.colors.userMessageBackground,
    borderColor: theme.colors.divider,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
    maxWidth: '100%',
    opacity: 0.65,
  },
  commandChipText: {
    color: theme.colors.input.text,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  agentMessageContainer: {
    // Symmetric, so a tool row reads the same distance from the text whether
    // it lands above or below it. Total rhythm matches the old 4 + 16.
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    maxWidth: '100%',
  },
  copyAction: {
    // No width, so the box shrink-wraps the glyph and its left edge lands on the
    // same x as the markdown text above it. hitSlop carries the touch target.
    alignSelf: 'flex-start',
    height: 20,
    justifyContent: 'center',
    // Sits fully below the last markdown block's trailing margin, clear of the
    // reply text.
    marginTop: 0,
  },
  copyActionPressed: {
    opacity: 0.5,
  },
  userCopyTarget: {
    alignItems: 'flex-end',
    maxWidth: '100%',
  },
  agentEventContainer: {
    marginHorizontal: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  agentEventText: {
    color: theme.colors.agentEventText,
    fontSize: 14,
  },
  toolContainer: {
    marginHorizontal: 8,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  debugText: {
    color: theme.colors.agentEventText,
    fontSize: 12,
  },
}));
