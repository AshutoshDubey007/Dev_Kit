import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';

export interface DiscussionItem {
  _id?: ObjectId;
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  category: 'q_and_a' | 'feature' | 'announcement' | 'showcase';
  repliesCount: number;
  isAnswered: boolean;
  date: string;
  createdAt: Date;
}

const DISCUSSIONS_COLLECTION = 'discussions';

export const INITIAL_DISCUSSIONS: Omit<DiscussionItem, '_id' | 'createdAt'>[] = [
  {
    id: 'disc-1',
    title: 'How to handle Razorpay webhook signatures in Next.js 15 Route Handlers without raw-body corruption?',
    author: 'alex_dev',
    category: 'q_and_a',
    repliesCount: 8,
    isAnswered: true,
    date: '2 hours ago',
  },
  {
    id: 'disc-2',
    title: 'Best practices for chunking technical PDF docs in RAG vector pipelines with Pinecone',
    author: 'sam_ai',
    category: 'q_and_a',
    repliesCount: 4,
    isAnswered: false,
    date: 'Yesterday',
  },
  {
    id: 'disc-3',
    title: 'DevKit AI Studio v2 released: Multi-file project synthesis with Claude 3.5 Sonnet',
    author: 'devkit-core',
    category: 'announcement',
    repliesCount: 16,
    isAnswered: false,
    date: '3 days ago',
  },
  {
    id: 'disc-4',
    title: 'Feature Request: Add automated GitHub Action CI/CD workflow generator in Prompt Marketplace',
    author: 'cloud_architect',
    category: 'feature',
    repliesCount: 5,
    isAnswered: true,
    date: '5 days ago',
  },
];

export async function getDiscussionsFromDb(category?: string, search?: string): Promise<DiscussionItem[]> {
  try {
    const db = await getDatabase();
    const count = await db.collection(DISCUSSIONS_COLLECTION).countDocuments();
    if (count === 0) {
      const now = new Date();
      const seeds = INITIAL_DISCUSSIONS.map((d) => ({ ...d, createdAt: now }));
      await db.collection(DISCUSSIONS_COLLECTION).insertMany(seeds);
    }

    const filter: any = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { author: regex }];
    }

    return db
      .collection<DiscussionItem>(DISCUSSIONS_COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
  } catch (err) {
    console.error('Error fetching discussions from DB:', err);
    return INITIAL_DISCUSSIONS.map((d) => ({ ...d, createdAt: new Date() }));
  }
}

export async function createDiscussionInDb(data: {
  title: string;
  author: string;
  category: DiscussionItem['category'];
}): Promise<DiscussionItem> {
  const db = await getDatabase();
  const now = new Date();
  const newDiscussion: DiscussionItem = {
    id: `disc-${Date.now()}`,
    title: data.title.trim(),
    author: data.author.trim() || 'Anonymous Developer',
    category: data.category || 'q_and_a',
    repliesCount: 0,
    isAnswered: false,
    date: 'Just now',
    createdAt: now,
  };

  await db.collection<DiscussionItem>(DISCUSSIONS_COLLECTION).insertOne(newDiscussion);
  return newDiscussion;
}
