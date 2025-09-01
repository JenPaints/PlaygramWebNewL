import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Users, Clock, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import useRealTimeMessages from '../../hooks/useRealTimeMessages';
import useRealTimeNotifications from '../../hooks/useRealTimeNotifications';

interface BatchChat {
  batchId: string;
  batchName: string;
  sportName: string;
  participantCount: number;
  unreadCount: number;
  lastMessage?: {
    content: string;
    senderName: string;
    timestamp: number;
  };
}

interface Message {
  _id: string;
  content: string;
  senderId: string;
  senderType: 'student' | 'coach' | 'admin';
  createdAt: number;
  sender: {
    _id?: string;
    name?: string;
    phone?: string;
    userType?: string;
  };
}

const CoachChatManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get coach's assigned batches
  const coachBatches = useQuery(api.coachBatches.getCoachBatches, 
    user?.phoneNumber ? { coachPhone: user.phoneNumber } : "skip"
  );

  // Real-time messaging for selected batch
  const { 
    messages, 
    unreadCount, 
    participants, 
    isLoading 
  } = useRealTimeMessages({
    batchId: selectedBatchId,
    phoneNumber: user?.phoneNumber || null,
    onNewMessage: (newMessage) => {
      // Show notification for new messages from students
      if (newMessage.senderType === 'student') {
        const selectedBatch = coachBatches?.find(b => b._id === selectedBatchId);
        showNewMessageNotification(newMessage, selectedBatch?.name);
      }
    },
    onMessageUpdate: (updatedMessage) => {
      console.log('Message updated:', updatedMessage);
    }
  });

  // Real-time notifications
  const { showNewMessageNotification } = useRealTimeNotifications({
    userId: user?.uid,
    userType: 'coach',
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract message array for consistent handling
  const messageArray = Array.isArray(messages) ? messages : (messages as any)?.messages || [];

  // Mark messages as read when batch is selected
  useEffect(() => {
    if (selectedBatchId && messageArray.length > 0 && user?.phoneNumber) {
      const unreadMessageIds = messageArray
        .filter((msg: any) => !msg.readBy?.some((r: any) => r.userId === user?.uid))
        .map((msg: any) => msg._id);
      
      if (unreadMessageIds.length > 0 && user?.phoneNumber) {
        markAsReadMutation({
          batchId: selectedBatchId as any,
          phoneNumber: user.phoneNumber,
          messageIds: unreadMessageIds as any,
        }).catch(console.error);
      }
    }
  }, [selectedBatchId, messageArray, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedBatchId || !user?.phoneNumber) return;

    try {
      await sendMessageMutation({
        batchId: selectedBatchId as any,
        phoneNumber: user.phoneNumber,
        content: message.trim(),
        messageType: 'text',
        isAnnouncement: true, // Coach messages are announcements
      });
      setMessage('');
      toast.success('Message sent to batch!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
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
    return sender.name || sender.phone || 'Unknown User';
  };



  // Create batch chat list with unread counts
  const batchChats: BatchChat[] = (coachBatches || []).map((batch: any) => ({
    batchId: batch._id,
    batchName: batch.name,
    sportName: batch.sport?.name || 'Unknown Sport',
    participantCount: batch.currentEnrollments || 0,
    unreadCount: 0, // This would need to be calculated from messages
    lastMessage: undefined, // This would need to be fetched
  }));

  // Filter batches based on search and unread filter
  const filteredBatches = batchChats.filter(batch => {
    const matchesSearch = batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.sportName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterUnread || batch.unreadCount > 0;
    return matchesSearch && matchesFilter;
  });

  const selectedBatch = batchChats.find(b => b.batchId === selectedBatchId);

  return (
    <div className="h-full flex bg-gray-900">
      {/* Batch List Sidebar */}
      <div className="w-1/3 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Batch Chats
          </h2>
          
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search batches..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#89D3EC] focus:outline-none"
              />
            </div>
            
            <button
              onClick={() => setFilterUnread(!filterUnread)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                filterUnread 
                  ? 'bg-[#89D3EC] text-gray-900' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Unread Only
            </button>
          </div>
        </div>

        {/* Batch List */}
        <div className="flex-1 overflow-y-auto">
          {filteredBatches.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No batches found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredBatches.map((batch) => (
                <motion.div
                  key={batch.batchId}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedBatchId === batch.batchId
                      ? 'bg-[#89D3EC] text-gray-900'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedBatchId(batch.batchId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium truncate">{batch.batchName}</h3>
                    {batch.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {batch.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm opacity-75">
                    <span>{batch.sportName}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{batch.participantCount}</span>
                    </div>
                  </div>
                  
                  {batch.lastMessage && (
                    <div className="mt-2 text-xs opacity-60">
                      <p className="truncate">
                        {batch.lastMessage.senderName}: {batch.lastMessage.content}
                      </p>
                      <p className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(batch.lastMessage.timestamp)}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedBatch ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedBatch.batchName}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedBatch.sportName} • {Array.isArray(participants) ? 0 : participants?.participants?.length || 0} participants
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {selectedBatch.participantCount} enrolled
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
              {messageArray.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messageArray.map((msg: any) => {
                  const isOwnMessage = msg.senderId === user?.uid;
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage 
                          ? 'bg-[#89D3EC] text-gray-900' 
                          : msg.isAnnouncement 
                          ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                          : 'bg-gray-700 text-white'
                      }`}>
                        {/* Sender info for non-own messages */}
                        {!isOwnMessage && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              msg.isAnnouncement ? 'text-yellow-700' : 'text-gray-300'
                            }`}>
                              {getSenderDisplayName(msg.sender)}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              msg.senderType === 'admin' ? 'bg-red-100 text-red-600' :
                              msg.senderType === 'coach' ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {msg.senderType === 'admin' ? 'Admin' :
                               msg.senderType === 'coach' ? 'Coach' : 'Student'}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm">{msg.content}</p>
                        
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-gray-700' : 
                          msg.isAnnouncement ? 'text-yellow-600' : 'text-gray-400'
                        }`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message to the batch..."
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-[#89D3EC] focus:border-transparent"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="p-3 bg-[#89D3EC] text-gray-900 rounded-lg hover:bg-[#7BC3D9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line • Messages will be sent as announcements
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium mb-2">Select a Batch</h3>
              <p>Choose a batch from the sidebar to start messaging with students</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachChatManagement;