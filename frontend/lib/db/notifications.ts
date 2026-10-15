import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';

export interface NotificationItem {
  _id?: ObjectId;
  id: string;
  userId: string;
  type: 'purchase' | 'star' | 'chat' | 'system' | 'prompt_sale' | 'security';
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}

const NOTIFICATIONS_COLLECTION = 'notifications';

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'current',
    type: 'purchase',
    title: 'Kit Purchased: HealthEase',
    message: 'A buyer purchased your HealthEase medical integration for ₹1,499. README auto-delivered in chat.',
    link: '/seller/my-kits',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
  },
  {
    id: 'notif-2',
    userId: 'current',
    type: 'chat',
    title: 'New Support Message',
    message: 'Ashutosh Dubey sent a message regarding Next.js 15 App Router configuration.',
    link: '/chat',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
  },
  {
    id: 'notif-3',
    userId: 'current',
    type: 'star',
    title: 'Repository Starred',
    message: 'Your repository nextjs-razorpay-pro received a new star from @alex_dev.',
    link: '/repos/devkit-core/nextjs-razorpay-pro',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
  },
  {
    id: 'notif-4',
    userId: 'current',
    type: 'security',
    title: 'Razorpay Verification Active',
    message: 'Razorpay live test keys validated with webhook signature protection.',
    link: '/settings',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

export async function getUserNotifications(userId?: string): Promise<NotificationItem[]> {
  try {
    const db = await getDatabase();
    if (userId) {
      const list = await db
        .collection<NotificationItem>(NOTIFICATIONS_COLLECTION)
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
      if (list.length > 0) return list;
    }
  } catch (err) {
    console.error('Error fetching notifications from DB:', err);
  }

  return SEED_NOTIFICATIONS;
}

export async function markAllNotificationsRead(userId?: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    if (userId) {
      await db
        .collection<NotificationItem>(NOTIFICATIONS_COLLECTION)
        .updateMany({ userId, read: false }, { $set: { read: true } });
    }
    return true;
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    return false;
  }
}
