import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Smile, MoreVertical, Reply, Edit, Trash2, MessageCircle, Image, Video, Camera, Plus, Users } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import useRealTimeMessages from '../../hooks/useRealTimeMessages';
import useRealTimeNotifications from '../../hooks/useRealTimeNotifications';
import { useModalBackButton } from '../../hooks/useModalBackButton';

interface BatchChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: any;
}

interface Message {
  _id: string;
  content: string;
  senderId: string;
  senderType: 'student' | 'coach' | 'admin';
  messageType: 'text' | 'image' | 'video' | 'file' | 'announcement';
  isAnnouncement: boolean;
  isEdited: boolean;
  editedAt?: number;
  createdAt: number;
  readBy?: { userId: string; readAt: number; }[];
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  sender: {
    _id?: string;
    name?: string;
    phone?: string;
    userType?: string;
    image?: string;
  };
}

const BatchChatModal: React.FC<BatchChatModalProps> = ({ isOpen, onClose, batch }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Handle back button for modal
  useModalBackButton({ isOpen, onClose });
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cursor, setCursor] = useState<string | null>(null);

  // Real-time messaging hooks
  const {
    messages,
    unreadCount,
    participants,
    isLoading
  } = useRealTimeMessages({
    batchId: batch?._id || null,
    phoneNumber: user?.phoneNumber || null,
    onNewMessage: (newMessage) => {
      if (newMessage.senderId !== user?.uid && isOpen) {
        showNewMessageNotification(newMessage, batch?.name);
      }
    },
    onMessageUpdate: (updatedMessage) => {
      console.log('Message updated:', updatedMessage);
    }
  });

  // Fallback participants query if hook doesn't provide them
  const fallbackParticipants = useQuery(
    api.batchChat.getBatchParticipants,
    batch?._id && user?.phoneNumber ? { batchId: batch._id, phoneNumber: user.phoneNumber } : "skip"
  );

  // Simple batch query to get basic batch info with participants
  const batchInfo = useQuery(
    api.batches.getBatchById,
    batch?._id ? { id: batch._id } : "skip"
  );

  // Use participants from hook, fallback, or batch info
  const displayParticipants = participants || fallbackParticipants || batchInfo;

  // Mock data for testing if all else fails
  const mockParticipants = {
    participants: [
      {
        _id: 'mock1',
        name: 'Test Student',
        phone: '+1234567890',
        userType: 'student'
      },
      {
        _id: 'mock2',
        name: 'Test Coach',
        phone: '+0987654321',
        userType: 'coach'
      }
    ]
  };

  // Final participants to display (with mock fallback)
  const finalParticipants = displayParticipants || mockParticipants;

  // Debug participants data
  useEffect(() => {
    console.log('=== PARTICIPANTS DEBUG ===');
    console.log('User object:', user);
    console.log('User phoneNumber:', user?.phoneNumber);
    console.log('Batch object:', batch);
    console.log('Batch _id:', batch?._id);
    console.log('Query condition:', batch?._id && user?.phoneNumber);
    console.log('Participants from hook:', participants);
    console.log('Fallback participants:', fallbackParticipants);
    console.log('Batch info:', batchInfo);
    console.log('Display participants:', displayParticipants);
    console.log('Final participants:', finalParticipants);
    console.log('=== END DEBUG ===');
  }, [participants, fallbackParticipants, batchInfo, displayParticipants, finalParticipants, user, batch]);

  // Real-time notifications
  const { showNewMessageNotification } = useRealTimeNotifications({
    userId: user?.uid,
    userType: (user?.userType as 'student' | 'coach' | 'admin') || 'student',
    options: {
      enableSound: true,
      enableToast: true,
      enableBrowserNotification: true,
      position: 'top-right'
    }
  });

  // Mutations
  const sendMessageMutation = useMutation(api.batchChat.sendMessage);
  const markAsReadMutation = useMutation(api.batchChat.markMessagesAsRead);
  const editMessageMutation = useMutation(api.batchChat.editMessage);
  const deleteMessageMutation = useMutation(api.batchChat.deleteMessage);

  // Extract message array for consistent handling
  const messageArray = Array.isArray(messages) ? messages : (messages as any)?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messageArray]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu]);

  // Mark messages as read when modal opens
  useEffect(() => {
    if (isOpen && messageArray.length > 0 && batch) {
      const unreadMessageIds = messageArray
        .filter((msg: any) => !msg.readBy?.some((r: any) => r.userId === user?.uid))
        .map((msg: any) => msg._id);

      if (unreadMessageIds.length > 0 && user?.phoneNumber) {
        markAsReadMutation({
          batchId: batch._id,
          phoneNumber: user.phoneNumber,
          messageIds: unreadMessageIds as any,
        }).catch(console.error);
      }
    }
  }, [isOpen, messageArray, batch, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !replyingTo) return;

    try {
      await sendMessageMutation({
        batchId: batch._id,
        content: message.trim(),
        phoneNumber: user?.phoneNumber || '',
        messageType: 'text',
        replyToMessageId: replyingTo?._id as any
      });

      setMessage('');
      setReplyingTo(null);
      scrollToBottom();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;

    try {
      await editMessageMutation({
        messageId: messageId as any,
        content: editingContent.trim(),
        phoneNumber: user?.phoneNumber || ''
      });

      setEditingMessageId(null);
      setEditingContent('');
      toast.success('Message updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessageMutation({
        messageId: messageId as any,
        phoneNumber: user?.phoneNumber || ''
      });
      toast.success('Message deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete message');
    }
  };

  const startEditing = (message: Message) => {
    setEditingMessageId(message._id);
    setEditingContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getSenderDisplayName = (sender: any) => {
    return sender?.name || sender?.phone || 'Unknown';
  };

  const getSenderTypeColor = (senderType: string) => {
    switch (senderType) {
      case 'admin': return 'text-red-600';
      case 'coach': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const getSenderTypeBadge = (senderType: string) => {
    switch (senderType) {
      case 'admin': return 'Admin';
      case 'coach': return 'Coach';
      default: return 'Student';
    }
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-white z-50">
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="w-full h-full flex flex-col"
        >
          {/* Header - Native Mobile Style */}
          <div className="relative">
            {/* Status Bar Spacer */}
            <div className="h-safe-area-top bg-white"></div>

            {/* Header Content */}
            <div className="bg-white border-b border-gray-200 text-gray-900">
              <div className="flex items-center px-4 py-3 sm:py-4">
                <button
                  onClick={onClose}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex-1 ml-3">
                  <h1 className="text-lg sm:text-xl font-semibold truncate">
                    {batch?.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-gray-600 text-sm">
                      {Array.isArray(finalParticipants) ? 0 : finalParticipants?.participants?.length || 0} members
                      {(unreadCount || 0) > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          {unreadCount}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 relative">
                  <button
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Options Dropdown */}
                  {showOptionsMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setShowMembersModal(true);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Show Members
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages - Native Mobile Style */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            <div className="px-4 py-3 space-y-2">
              {messageArray.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-600 mb-1">No messages yet</p>
                  <p className="text-sm text-gray-500">Start the conversation!</p>
                </div>
              ) : (
                messageArray.map((msg: any) => {
                  const isOwnMessage = msg.senderId === user?.uid || msg.sender?.phone === user?.phoneNumber;
                  const isCoachMessage = msg.senderType === 'coach';
                  const isEditing = editingMessageId === msg._id;

                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`flex items-end gap-2 mb-3 ${isCoachMessage ? 'justify-start' : 'justify-end'}`}
                    >
                      {/* Avatar for coach messages */}
                      {isCoachMessage && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-semibold shadow-md flex-shrink-0">
                          {msg.sender?.name?.charAt(0) || 'C'}
                        </div>
                      )}

                      <div className={`relative max-w-[280px] sm:max-w-sm group ${isCoachMessage
                        ? 'bg-gray-100 text-black shadow-md'
                        : msg.isAnnouncement
                          ? 'bg-amber-50 border border-amber-200 text-amber-800 shadow-sm'
                          : 'bg-[#377C92] text-white shadow-lg'
                        } ${isCoachMessage
                          ? 'rounded-2xl rounded-bl-md'
                          : 'rounded-2xl rounded-br-md'
                        }`}>
                        <div className="px-3 py-2">
                          {/* Reply indicator */}
                          {(msg.replyTo || msg.replyToMessageId) && (
                            <div className={`mb-2 p-2 rounded-lg border-l-2 ${isCoachMessage ? 'bg-gray-50 border-gray-300' : 'bg-[#377C92]/20 border-[#377C92]'
                              }`}>
                              <p className={`text-xs font-medium ${isCoachMessage ? 'text-gray-600' : 'text-white/80'
                                }`}>
                                Replying to {msg.replyTo?.senderName || 'Previous message'}
                              </p>
                              <p className={`text-xs mt-0.5 ${isCoachMessage ? 'text-gray-500' : 'text-white/60'
                                }`}>
                                {msg.replyTo?.content ?
                                  (msg.replyTo.content.length > 40 ? msg.replyTo.content.substring(0, 40) + '...' : msg.replyTo.content)
                                  : 'Original message'
                                }
                              </p>
                            </div>
                          )}

                          {/* Sender info for non-own messages */}
                          {!isOwnMessage && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${msg.isAnnouncement ? 'text-yellow-700' :
                                isCoachMessage ? 'text-gray-700' : 'text-white'
                                }`}>
                                {getSenderDisplayName(msg.sender)}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${msg.senderType === 'admin' ? 'bg-red-100 text-red-600' :
                                msg.senderType === 'coach' ? 'bg-gray-200 text-gray-700' :
                                  'bg-white/20 text-white'
                                }`}>
                                {getSenderTypeBadge(msg.senderType)}
                              </span>
                            </div>
                          )}

                          {/* Message content */}
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-gray-900 text-sm"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditMessage(msg._id)}
                                  className="px-2 py-1 bg-[#377C92] text-white text-xs rounded hover:bg-[#2a5f73]"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Media content */}
                              {msg.mediaUrl && (
                                <div className="mb-3">
                                  {msg.mediaType === 'image' && (
                                    <div className="relative overflow-hidden rounded-xl">
                                      <img
                                        src={msg.mediaUrl}
                                        alt="Shared image"
                                        className="w-full h-auto cursor-pointer transition-transform duration-200 hover:scale-105"
                                        onClick={() => window.open(msg.mediaUrl, '_blank')}
                                      />
                                    </div>
                                  )}
                                  {msg.mediaType === 'video' && (
                                    <div className="relative overflow-hidden rounded-xl">
                                      <video
                                        src={msg.mediaUrl}
                                        controls
                                        className="w-full h-auto"
                                      />
                                    </div>
                                  )}
                                  {msg.mediaType === 'file' && (
                                    <div className={`flex items-center gap-3 p-3 rounded-xl ${isCoachMessage ? 'bg-gray-200' : 'bg-white/20'
                                      }`}>
                                      <div className={`p-2 rounded-lg ${isCoachMessage ? 'bg-gray-300' : 'bg-white/20'
                                        }`}>
                                        <Paperclip className="w-4 h-4" />
                                      </div>
                                      <a
                                        href={msg.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium hover:underline flex-1"
                                      >
                                        Download File
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Text content */}
                              {msg.content && (
                                <p className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words ${isCoachMessage ? 'text-black' : 'text-white'
                                  }`}>
                                  {msg.content}
                                </p>
                              )}

                              {msg.isEdited && (
                                <p className={`text-xs mt-1 ${isCoachMessage ? 'text-gray-600' : isOwnMessage ? 'text-white/70' : 'text-gray-500'
                                  }`}>
                                  (edited)
                                </p>
                              )}

                              {/* Message actions */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setReplyingTo(msg)}
                                    className={`p-1 rounded hover:bg-white/20 ${isCoachMessage ? 'text-gray-700 hover:bg-gray-300' : 'text-white'
                                      }`}
                                    title="Reply"
                                  >
                                    <Reply className="w-3 h-3" />
                                  </button>
                                  {isOwnMessage && (
                                    <>
                                      <button
                                        onClick={() => startEditing(msg)}
                                        className={`p-1 rounded hover:bg-white/20 ${isCoachMessage ? 'text-gray-700 hover:bg-gray-300' : 'text-white'
                                          }`}
                                        title="Edit"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete this message?')) {
                                            handleDeleteMessage(msg._id);
                                          }
                                        }}
                                        className={`p-1 rounded hover:bg-white/20 ${isCoachMessage ? 'text-gray-700 hover:bg-gray-300' : 'text-white'
                                          }`}
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Timestamp for all messages */}
                          {!isEditing && (
                            <div className="flex items-center justify-between mt-2 px-1">
                              <p className={`text-xs ${isCoachMessage ? 'text-gray-500' :
                                msg.isAnnouncement ? 'text-amber-600' :
                                  'text-white/60'
                                }`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Avatar for student messages */}
                      {!isCoachMessage && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-md flex-shrink-0">
                          {msg.sender?.name?.charAt(0) || 'S'}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Reply indicator */}
          {replyingTo && (
            <div className="px-4 sm:px-6 py-2 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Replying to {getSenderDisplayName(replyingTo.sender)}
                  </span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-blue-200 rounded"
                >
                  <X className="w-4 h-4 text-blue-600" />
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-1 truncate">
                {replyingTo.content}
              </p>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMessage(message + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Media Options */}
          {showMediaOptions && (
            <div className="px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowMediaOptions(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Image className="w-4 h-4" />
                  <span className="text-sm">Photo</span>
                </button>
                <button
                  onClick={() => {
                    // Video upload logic
                    setShowMediaOptions(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span className="text-sm">Video</span>
                </button>
                <button
                  onClick={() => {
                    // File upload logic
                    setShowMediaOptions(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">File</span>
                </button>
              </div>
            </div>
          )}

          {/* Message Input - Native Mobile Style */}
          <div className="bg-white border-t border-gray-100 safe-area-bottom">
            <div className="px-4 py-3">
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setShowMediaOptions(!showMediaOptions)}
                  className="p-2.5 text-gray-500 hover:text-teal-500 hover:bg-teal-50 rounded-full transition-all duration-200 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                  <div className="relative bg-gray-100 rounded-3xl">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Message..."
                      className="w-full px-4 py-3 pr-12 bg-transparent border-0 resize-none focus:outline-none text-[16px] placeholder-gray-500 max-h-32"
                      rows={1}
                      style={{ fontSize: '16px' }} // Prevent zoom on iOS
                    />
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-teal-500 rounded-full transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <motion.button
                  onClick={handleSendMessage}
                  disabled={!message.trim() && !replyingTo}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2.5 rounded-full transition-all duration-200 shadow-lg ${message.trim() || replyingTo
                    ? 'bg-black hover:bg-gray-800'
                    : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                  {message.trim() || replyingTo ? (
                    <img
                      src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                      alt="Send"
                      className="w-5 h-5"
                    />
                  ) : (
                    <Send className="w-5 h-5 text-gray-500" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              // Handle file upload
              const file = e.target.files?.[0];
              if (file) {
                // Upload logic here
                console.log('File selected:', file);
              }
            }}
          />
        </motion.div>
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Batch Members</h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {!Array.isArray(finalParticipants) && finalParticipants?.participants && finalParticipants.participants.length > 0 ? (
                <div className="space-y-3">
                  {finalParticipants.participants.map((participant: any, index: number) => (
                    <div key={participant._id || `participant-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {participant.name?.charAt(0) || participant.phone?.charAt(-1) || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {participant.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {participant.phone || 'No phone'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${participant.userType === 'coach' ? 'bg-green-100 text-green-600' :
                        participant.userType === 'admin' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                        {participant.userType || 'Student'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No members found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BatchChatModal;