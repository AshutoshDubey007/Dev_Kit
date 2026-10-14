export type MessageSenderRole = 'buyer' | 'seller' | 'operator' | 'system';

export interface Message {
  _id?: string | any;
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: MessageSenderRole;
  originalContent: string; // Saved for Operator inspection
  filteredContent: string; // Sanitized content shown to users
  isFlagged: boolean;
  flagReason?: string; // 'phone_leak' | 'email_leak' | 'whatsapp_leak' | 'upi_leak' | 'external_link'
  isSystemEvent?: boolean;
  metadata?: {
    isAutomatedReadme?: boolean;
    orderId?: string;
  };
  createdAt: Date;
}
