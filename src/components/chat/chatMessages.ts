import { ChatMessage } from '../../types';

export type ReactionMap = Record<string, { count: number; hasReacted: boolean; users?: string[] }>;

export function reactionMap(message: ChatMessage, fallback: ReactionMap = {}): ReactionMap {
  if (!message.reactions) return fallback;
  return Object.fromEntries(message.reactions.filter(item => item.count > 0).map(item => [item.emoji, { count: item.count, hasReacted: !!item.hasReacted }]));
}

export function toggleReaction(current: ReactionMap, emoji: string): ReactionMap {
  const next = { ...current };
  const entry = next[emoji];
  if (entry?.hasReacted) {
    if (entry.count <= 1) delete next[emoji];
    else next[emoji] = { ...entry, count: entry.count - 1, hasReacted: false, users: entry.users?.filter(user => user !== '我') };
  } else {
    next[emoji] = { count: (entry?.count || 0) + 1, hasReacted: true, users: [...(entry?.users || []), '我'] };
  }
  return next;
}

export function visibleChatMessages(messages: ChatMessage[], deletedIds: string[], edits: Record<string, string>, recalledIds: string[], reactions: Record<string, ReactionMap>, useSourceData = false): ChatMessage[] {
  return messages.filter(message => !deletedIds.includes(message.id)).map(message => {
    const isRecalled = Boolean(message.isRecalled) || recalledIds.includes(message.id) || message.type === 'recalled';
    if (isRecalled) {
      return {
        ...message,
        isRecalled: true,
        type: 'recalled' as const,
        text: message.isMe ? '你撤回了一条消息' : (message.text && message.text.includes('撤回') ? message.text : `${message.senderName || '对方'}撤回了一条消息`),
        imageUrl: undefined,
        audioUrl: undefined,
        fileData: undefined,
        locationData: undefined,
        activityData: undefined,
        contactData: undefined,
        reactions: [],
      };
    }
    return {
      ...message,
      text: !useSourceData && edits[message.id] !== undefined ? edits[message.id] : message.text,
      reactions: Object.entries(useSourceData ? reactionMap(message, reactions[message.id]) : reactions[message.id] ?? reactionMap(message)).map(([emoji, entry]) => ({ emoji, count: entry.count, hasReacted: entry.hasReacted })),
    };
  });
}
