export type ConversationStatus = 'active' | 'flagged' | 'closed';

export interface Conversation {
  _id?: string | any;
  conversationId: string;
  orderId: string;
  kitId: string;
  kitSlug: string;
  kitTitle: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  sellerId: string;
  sellerEmail: string;
  sellerName: string;
  status: ConversationStatus;
  flaggedCount: number; // Increment if anti-leak triggers
  lastMessageSnippet: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
