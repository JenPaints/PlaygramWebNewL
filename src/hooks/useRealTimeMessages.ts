import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface UseRealTimeMessagesProps {
  batchId: string | null;
  phoneNumber: string | null;
  onNewMessage?: (message: any) => void;
  onMessageUpdate?: (message: any) => void;
}

export const useRealTimeMessages = ({
  batchId,
  phoneNumber,
  onNewMessage,
  onMessageUpdate
}: UseRealTimeMessagesProps) => {
  const previousMessagesRef = useRef<any[]>([]);
  const lastMessageCountRef = useRef(0);

  // Real-time query for messages
  const messages = useQuery(
    api.batchChat.getBatchMessages,
    batchId && phoneNumber
      ? {
          batchId: batchId as any,
          phoneNumber,
          limit: 100
        }
      : "skip"
  );

  // Real-time query for unread count
  const unreadCount = useQuery(
    api.batchChat.getUnreadCount,
    batchId && phoneNumber
      ? {
          batchId: batchId as any,
          phoneNumber
        }
      : "skip"
  );

  // Real-time query for participants
  const participants = useQuery(
    api.batchChat.getBatchParticipants,
    batchId && phoneNumber
      ? {
          batchId: batchId as any,
          phoneNumber
        }
      : "skip"
  );

  // Detect new messages and trigger callbacks
  useEffect(() => {
    const messageArray = Array.isArray(messages) ? messages : messages?.messages || [];
    if (!messageArray || messageArray.length === 0) {
      previousMessagesRef.current = [];
      lastMessageCountRef.current = 0;
      return;
    }

    const currentMessages = messageArray;
    const previousMessages = previousMessagesRef.current;
    const currentCount = currentMessages.length;
    const previousCount = lastMessageCountRef.current;

    // Check for new messages
    if (currentCount > previousCount && previousCount > 0) {
      const newMessages = currentMessages.slice(previousCount);
      newMessages.forEach((message: any) => {
        if (onNewMessage) {
          onNewMessage(message);
        }
      });
    }

    // Check for updated messages
    if (previousMessages.length > 0) {
      currentMessages.forEach((currentMessage: any, index: number) => {
        const previousMessage = previousMessages[index];
        if (previousMessage && 
            (currentMessage.content !== previousMessage.content ||
             currentMessage.isEdited !== previousMessage.isEdited ||
             JSON.stringify(currentMessage.readBy) !== JSON.stringify(previousMessage.readBy))) {
          if (onMessageUpdate) {
            onMessageUpdate(currentMessage);
          }
        }
      });
    }

    // Update refs
    previousMessagesRef.current = [...currentMessages];
    lastMessageCountRef.current = currentCount;
  }, [messages, onNewMessage, onMessageUpdate]);

  const messageArray = Array.isArray(messages) ? messages : messages?.messages || [];

  return {
    messages: messageArray,
    unreadCount: unreadCount || 0,
    participants: participants || [],
    isLoading: messages === undefined,
    hasNewMessages: messageArray && messageArray.length > lastMessageCountRef.current
  };
};

export default useRealTimeMessages;