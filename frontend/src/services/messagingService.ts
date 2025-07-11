// ============================================================================
// MESSAGING SERVICE - Simple messaging functionality
// ============================================================================

import { Conversation, Message } from '@/types/job';

// Mock data for conversations
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    applicationId: 'app-001',
    candidateId: 'candidate-001',
    candidateName: 'Sara Bouaziz',
    rhUserId: 'rh-001',
    rhUserName: 'Fatima Mansouri',
    jobTitle: 'Développeur Frontend React',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    isActive: true,
    messages: [],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conv-2',
    applicationId: 'app-002',
    candidateId: 'candidate-002',
    candidateName: 'Ahmed Khalil',
    rhUserId: 'rh-001',
    rhUserName: 'Fatima Mansouri',
    jobTitle: 'Développeur Backend Java',
    lastMessageAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    isActive: true,
    messages: [],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

// Mock messages for conversations
const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      senderId: 'rh-001',
      senderName: 'Fatima Mansouri',
      senderRole: 'RH' as const,
      recipientId: 'candidate-001',
      recipientName: 'Sara Bouaziz',
      recipientRole: 'CANDIDATE' as const,
      content: 'Bonjour Sara, nous avons bien reçu votre candidature pour le poste de développeur frontend.',
      type: 'text' as const,
      isRead: true,
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      applicationId: 'app-001'
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      senderId: 'candidate-001',
      senderName: 'Sara Bouaziz',
      senderRole: 'CANDIDATE' as const,
      recipientId: 'rh-001',
      recipientName: 'Fatima Mansouri',
      recipientRole: 'RH' as const,
      content: 'Merci pour votre retour concernant ma candidature.',
      type: 'text' as const,
      isRead: false,
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      applicationId: 'app-001'
    }
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      senderId: 'rh-001',
      senderName: 'Fatima Mansouri',
      senderRole: 'RH' as const,
      recipientId: 'candidate-002',
      recipientName: 'Ahmed Khalil',
      recipientRole: 'CANDIDATE' as const,
      content: 'Bonjour Ahmed, votre profil nous intéresse beaucoup.',
      type: 'text' as const,
      isRead: true,
      sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      applicationId: 'app-002'
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      senderId: 'candidate-002',
      senderName: 'Ahmed Khalil',
      senderRole: 'CANDIDATE' as const,
      recipientId: 'rh-001',
      recipientName: 'Fatima Mansouri',
      recipientRole: 'RH' as const,
      content: 'Merci beaucoup ! Je suis très intéressé par cette opportunité.',
      type: 'text' as const,
      isRead: true,
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      applicationId: 'app-002'
    },
    {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      senderId: 'rh-001',
      senderName: 'Fatima Mansouri',
      senderRole: 'RH' as const,
      recipientId: 'candidate-002',
      recipientName: 'Ahmed Khalil',
      recipientRole: 'CANDIDATE' as const,
      content: 'Nous aimerions programmer un entretien avec vous.',
      type: 'text' as const,
      isRead: true,
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      applicationId: 'app-002'
    }
  ]
};

export const messagingService = {
  // Get conversations for a user
  async getConversations(userId: string): Promise<Conversation[]> {
    console.log('📨 Getting conversations for user:', userId);

    // Filter conversations where user is involved (either as RH or candidate)
    const userConversations = MOCK_CONVERSATIONS.filter(conv =>
      conv.rhUserId === userId || conv.candidateId === userId
    );

    // Add messages to conversations
    const conversationsWithMessages = userConversations.map(conv => ({
      ...conv,
      messages: MOCK_MESSAGES[conv.id] || []
    }));

    return conversationsWithMessages;
  },

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    console.log('📨 Getting messages for conversation:', conversationId);
    
    const messages = MOCK_MESSAGES[conversationId] || [];
    return messages;
  },

  // Send a message
  async sendMessage(conversationId: string, senderId: string, senderName: string, content: string): Promise<Message> {
    console.log('📨 Sending message:', { conversationId, senderId, content });

    // Find the conversation to get recipient info
    const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Determine sender and recipient roles
    const isRHSender = conversation.rhUserId === senderId;
    const recipientId = isRHSender ? conversation.candidateId : conversation.rhUserId;
    const recipientName = isRHSender ? conversation.candidateName : conversation.rhUserName;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderRole: isRHSender ? 'RH' : 'CANDIDATE',
      recipientId,
      recipientName,
      recipientRole: isRHSender ? 'CANDIDATE' : 'RH',
      content,
      type: 'text',
      isRead: false,
      sentAt: new Date().toISOString(),
      applicationId: conversation.applicationId
    };

    // Add to mock messages
    if (!MOCK_MESSAGES[conversationId]) {
      MOCK_MESSAGES[conversationId] = [];
    }
    MOCK_MESSAGES[conversationId].push(newMessage);

    // Update conversation's last message timestamp and unread count
    conversation.lastMessageAt = new Date().toISOString();
    conversation.updatedAt = new Date().toISOString();
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;

    return newMessage;
  },

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    console.log('📨 Marking messages as read:', { conversationId, userId });

    const messages = MOCK_MESSAGES[conversationId] || [];
    const now = new Date().toISOString();

    messages.forEach(message => {
      if (message.senderId !== userId && !message.isRead) {
        message.isRead = true;
        message.readAt = now;
      }
    });

    // Reset unread count for the conversation
    const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }
  },

  // Create a new conversation
  async createConversation(
    applicationId: string,
    candidateId: string,
    candidateName: string,
    rhUserId: string,
    rhUserName: string,
    jobTitle: string
  ): Promise<Conversation> {
    console.log('📨 Creating new conversation:', { applicationId, candidateId, rhUserId });

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      applicationId,
      candidateId,
      candidateName,
      rhUserId,
      rhUserName,
      jobTitle,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      isActive: true,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    MOCK_CONVERSATIONS.push(newConversation);
    MOCK_MESSAGES[newConversation.id] = [];

    return newConversation;
  },

  // Get unread message count for a user
  async getUnreadCount(userId: string): Promise<number> {
    console.log('📨 Getting unread count for user:', userId);

    const userConversations = MOCK_CONVERSATIONS.filter(conv =>
      conv.rhUserId === userId || conv.candidateId === userId
    );

    const totalUnread = userConversations.reduce((total, conv) => {
      return total + (conv.unreadCount || 0);
    }, 0);

    return totalUnread;
  },

  // Create conversation for application (compatibility method)
  async createConversationForApplication(data: {
    applicationId: string;
    candidateId: string;
    candidateName: string;
    rhUserId: string;
    rhUserName: string;
    jobTitle: string;
  }): Promise<Conversation> {
    console.log('📨 Creating conversation for application:', data.applicationId);

    return this.createConversation(
      data.applicationId,
      data.candidateId,
      data.candidateName,
      data.rhUserId,
      data.rhUserName,
      data.jobTitle
    );
  }
};

export default messagingService;
