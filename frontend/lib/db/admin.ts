import { getDatabase } from '../mongodb';
import { UserProfileRole } from '../auth-shared';

export interface AdminPlatformMetrics {
  totalRevenueINR: number;
  paidOrdersCount: number;
  totalUsersCount: number;
  publishedKitsCount: number;
  activeChatThreads: number;
  flaggedChatThreads: number;
  generatedProjectsCount: number;
  recentOrders: any[];
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserProfileRole;
  joined: string;
  sellerListedCount?: number;
}

/**
 * Calculates authoritative platform metrics from MongoDB
 */
export async function getAdminPlatformMetrics(): Promise<AdminPlatformMetrics> {
  const db = await getDatabase();

  // 1. Calculate Real Revenue from paid orders
  const revenueAggregation = await db.collection('orders').aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, totalRevenue: { $sum: '$amountINR' }, count: { $sum: 1 } } },
  ]).toArray();

  const totalRevenueINR = revenueAggregation[0]?.totalRevenue || 0;
  const paidOrdersCount = revenueAggregation[0]?.count || 0;

  // 2. Counts from authoritative collections
  const [
    totalUsersCount,
    publishedKitsCount,
    activeChatThreads,
    flaggedChatThreads,
    generatedProjectsCount,
    recentOrders,
  ] = await Promise.all([
    db.collection('profiles').countDocuments(),
    db.collection('kits').countDocuments(),
    db.collection('conversations').countDocuments(),
    db.collection('conversations').countDocuments({ status: 'flagged' }),
    db.collection('generated_projects').countDocuments(),
    db.collection('orders').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
  ]);

  return {
    totalRevenueINR,
    paidOrdersCount,
    totalUsersCount: Math.max(totalUsersCount, 4), // At least the 4 standard platform staff profiles
    publishedKitsCount,
    activeChatThreads,
    flaggedChatThreads,
    generatedProjectsCount,
    recentOrders,
  };
}

/**
 * Returns list of platform users from MongoDB profiles
 */
export async function getAdminUsersList(): Promise<AdminUserRecord[]> {
  const db = await getDatabase();
  const profiles = await db.collection('profiles').find({}).toArray();

  const mappedProfiles: AdminUserRecord[] = profiles.map((p: any) => ({
    id: p._id?.toString() || `usr_${p.username}`,
    name: p.name || p.username,
    email: p.email || `${p.username}@devkit.store`,
    username: p.username,
    role: (p.role as UserProfileRole) || 'buyer',
    joined: p.joinedAt ? new Date(p.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Oct 2026',
    sellerListedCount: p.totalKitsListed || 0,
  }));

  // Ensure standard default accounts are always present if not yet upserted
  const standardUsers: AdminUserRecord[] = [
    {
      id: 'usr_ashutosh',
      name: 'Ashutosh Dubey',
      email: 'ashutosh@agency.dev',
      username: 'ashutoshkdubey007',
      role: 'buyer',
      joined: 'Oct 2026',
    },
    {
      id: 'usr_creator',
      name: 'DevKit Core Creator',
      email: 'creator@devkit.store',
      username: 'devkit-core',
      role: 'seller',
      joined: 'Sep 2026',
      sellerListedCount: 3,
    },
    {
      id: 'usr_moderator',
      name: 'Sarah (Safety Desk)',
      email: 'moderator@devkit.store',
      username: 'moderator',
      role: 'operator',
      joined: 'Aug 2026',
    },
    {
      id: 'usr_admin',
      name: 'Platform Administrator',
      email: 'admin@devkit.store',
      username: 'admin',
      role: 'admin',
      joined: 'Jul 2026',
    },
  ];

  const existingEmails = new Set(mappedProfiles.map((u) => u.email.toLowerCase()));
  for (const std of standardUsers) {
    if (!existingEmails.has(std.email.toLowerCase())) {
      mappedProfiles.push(std);
    }
  }

  return mappedProfiles;
}

/**
 * Updates a user role in MongoDB
 */
export async function updateUserRoleInDb(
  identifier: string,
  newRole: UserProfileRole
): Promise<boolean> {
  const db = await getDatabase();

  const result = await db.collection('profiles').updateOne(
    {
      $or: [
        { username: identifier.toLowerCase().trim() },
        { email: identifier.toLowerCase().trim() },
      ],
    },
    {
      $set: { role: newRole, updatedAt: new Date() },
    },
    { upsert: true }
  );

  return result.acknowledged;
}
