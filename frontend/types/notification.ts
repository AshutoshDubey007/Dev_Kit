export interface NotificationItem {
  id: string;
  userId: string;
  type: 'purchase' | 'star' | 'chat' | 'system' | 'prompt_sale' | 'security';
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string | Date;
}
