import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, User, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Conversation, Message } from '@/types/job';
import { messagingService } from '@/services/messagingService';
import { toast } from 'react-toastify';

interface MessagingCenterProps {
  className?: string;
  userRole: 'RH' | 'CANDIDATE';
  userId: string;
  userName: string;
}

const MessagingCenter: React.FC<MessagingCenterProps> = ({
  className = '',
  userRole,
  userId,
  userName
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [userId, userRole]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const fetchedConversations = await messagingService.getConversationsForUser(userId, userRole);
      setConversations(fetchedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const fetchedMessages = await messagingService.getMessagesForConversation(conversationId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await messagingService.markAsRead(conversationId, userId);
      // Update conversation unread count in local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const recipientId = userRole === 'RH' ? selectedConversation.candidateId : selectedConversation.rhUserId;
      const recipientName = userRole === 'RH' ? selectedConversation.candidateName : selectedConversation.rhUserName;
      const recipientRole = userRole === 'RH' ? 'CANDIDATE' : 'RH';

      const message = await messagingService.sendMessage({
        conversationId: selectedConversation.id,
        applicationId: selectedConversation.applicationId,
        senderId: userId,
        senderName: userName,
        senderRole: userRole,
        recipientId,
        recipientName,
        recipientRole,
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update conversation in list
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id
          ? { ...conv, lastMessageAt: message.sentAt, messages: [...conv.messages, message] }
          : conv
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getFilteredConversations = () => {
    if (!searchTerm.trim()) return conversations;
    
    const search = searchTerm.toLowerCase();
    return conversations.filter(conv => 
      conv.candidateName.toLowerCase().includes(search) ||
      conv.rhUserName.toLowerCase().includes(search) ||
      conv.jobTitle.toLowerCase().includes(search) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(search))
    );
  };

  const filteredConversations = getFilteredConversations();

  return (
    <div className={`h-[600px] flex bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {userRole === 'RH' ? conversation.candidateName : conversation.rhUserName}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="error" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-1 truncate">{conversation.jobTitle}</p>
                    
                    {conversation.messages.length > 0 && (
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.messages[conversation.messages.length - 1].content}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {formatMessageTime(conversation.lastMessageAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {userRole === 'RH' ? selectedConversation.candidateName : selectedConversation.rhUserName}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedConversation.jobTitle}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === userId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.type === 'interview_notification' && (
                        <div className="flex items-center gap-2 mb-2 text-xs opacity-75">
                          <Clock className="w-3 h-3" />
                          Interview Notification
                        </div>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                      
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span>{formatMessageTime(message.sentAt)}</span>
                        {isOwnMessage && message.isRead && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  variant="contained"
                  size="small"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingCenter;
