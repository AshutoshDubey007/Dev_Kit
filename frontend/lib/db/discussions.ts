import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';
import { escapeRegex } from '../utils/regex';

export interface DiscussionReply {
  id: string;
  author: string;
  authorRole?: 'buyer' | 'seller' | 'operator' | 'admin';
  content: string;
  createdAt: string;
  isSolution?: boolean;
}

export interface DiscussionItem {
  _id?: ObjectId;
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole?: 'buyer' | 'seller' | 'operator' | 'admin';
  authorAvatar?: string;
  category: 'q_and_a' | 'feature' | 'announcement' | 'showcase';
  repliesCount: number;
  isAnswered: boolean;
  date: string;
  createdAt: Date;
  replies: DiscussionReply[];
}

const DISCUSSIONS_COLLECTION = 'discussions';

export const INITIAL_DISCUSSIONS: Omit<DiscussionItem, '_id' | 'createdAt'>[] = [
  {
    id: 'disc-1',
    title: 'How to handle Razorpay webhook signatures in Next.js 15 Route Handlers without raw-body corruption?',
    content: 'When receiving Razorpay webhook events in Next.js 15 App Router, calling `req.json()` consumes the stream and modifies formatting, causing signature verification with `crypto.createHmac` to fail. What is the recommended way to read the raw text buffer?',
    author: 'alex_dev',
    authorRole: 'buyer',
    category: 'q_and_a',
    repliesCount: 2,
    isAnswered: true,
    date: '2 hours ago',
    replies: [
      {
        id: 'rep-1',
        author: 'devkit-core',
        authorRole: 'seller',
        content: 'Use `await req.text()` directly rather than `req.json()`. Generate the HMAC hex digest from the raw UTF-8 string and compare using `crypto.timingSafeEqual` against the `x-razorpay-signature` header.',
        createdAt: '1 hour ago',
        isSolution: true,
      },
      {
        id: 'rep-2',
        author: 'alex_dev',
        authorRole: 'buyer',
        content: 'That completely solved the signature mismatch! Thank you!',
        createdAt: '30 mins ago',
        isSolution: false,
      },
    ],
  },
  {
    id: 'disc-2',
    title: 'Best practices for chunking technical PDF docs in RAG vector pipelines with Pinecone',
    content: 'We are ingesting 50-page technical API manuals into Pinecone. With standard 1000-token chunks, code snippets and tables get split across chunk boundaries, losing semantic context. How should we structure the chunking?',
    author: 'sam_ai',
    authorRole: 'buyer',
    category: 'q_and_a',
    repliesCount: 1,
    isAnswered: false,
    date: 'Yesterday',
    replies: [
      {
        id: 'rep-3',
        author: 'alex_dev',
        authorRole: 'buyer',
        content: 'Use semantic recursive character text splitting with custom separators prioritizing markdown headings (`## `) and code blocks (```). Add 150-200 tokens of overlap to preserve context across chunks.',
        createdAt: '18 hours ago',
        isSolution: false,
      },
    ],
  },
  {
    id: 'disc-3',
    title: 'DevKit AI Studio v2 released: Multi-file project synthesis with Claude 3.5 Sonnet',
    content: 'We are excited to announce DevKit AI Studio v2! You can now generate full-stack Next.js 15 projects with multiple interconnected files, auto-scanned security compliance, and direct repo export.',
    author: 'devkit-core',
    authorRole: 'seller',
    category: 'announcement',
    repliesCount: 1,
    isAnswered: false,
    date: '3 days ago',
    replies: [
      {
        id: 'rep-4',
        author: 'sam_ai',
        authorRole: 'buyer',
        content: 'Just tested the ZIP download workflow—super fast and the generated TypeScript types are spot on!',
        createdAt: '2 days ago',
        isSolution: false,
      },
    ],
  },
  {
    id: 'disc-4',
    title: 'Feature Request: Add automated GitHub Action CI/CD workflow generator in Prompt Marketplace',
    content: 'It would be amazing to have standard prompts specifically tuned to output complete GitHub Actions workflows with secrets management, Docker build/push, and deployment stages.',
    author: 'cloud_architect',
    authorRole: 'buyer',
    category: 'feature',
    repliesCount: 1,
    isAnswered: true,
    date: '5 days ago',
    replies: [
      {
        id: 'rep-5',
        author: 'devkit-core',
        authorRole: 'seller',
        content: 'Added to our Q4 roadmap! We are currently testing templates for Vercel, AWS ECS, and DigitalOcean.',
        createdAt: '4 days ago',
        isSolution: true,
      },
    ],
  },
];

// In-memory fallback cache for development/offline environments
let memoryDiscussions: DiscussionItem[] = INITIAL_DISCUSSIONS.map((d) => ({
  ...d,
  createdAt: new Date(),
}));

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
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ title: regex }, { author: regex }, { content: regex }];
    }

    const items = await db
      .collection<DiscussionItem>(DISCUSSIONS_COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      replies: item.replies || [],
    }));
  } catch (err) {
    console.warn('Falling back to memory discussions store:', err);
    return memoryDiscussions.filter((d) => {
      const matchCat = !category || category === 'all' || d.category === category;
      const matchSearch =
        !search ||
        !search.trim() ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.author.toLowerCase().includes(search.toLowerCase()) ||
        (d.content && d.content.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }
}

export async function getDiscussionByIdFromDb(id: string): Promise<DiscussionItem | null> {
  try {
    const db = await getDatabase();
    const query: any = {
      $or: [{ id }, { slug: id }],
    };
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    const item = await db.collection<DiscussionItem>(DISCUSSIONS_COLLECTION).findOne(query);
    if (item) {
      return {
        ...item,
        replies: item.replies || [],
      };
    }
  } catch (err) {
    console.warn('Error reading discussion from db, checking memory fallback:', err);
  }

  const found = memoryDiscussions.find((d) => d.id === id || (d._id && d._id.toString() === id));
  return found || null;
}

export async function createDiscussionInDb(data: {
  title: string;
  content?: string;
  author: string;
  authorRole?: 'buyer' | 'seller' | 'operator' | 'admin';
  category: DiscussionItem['category'];
}): Promise<DiscussionItem> {
  const now = new Date();
  const newDiscussion: DiscussionItem = {
    id: `disc-${Date.now()}`,
    title: data.title.trim(),
    content: data.content?.trim() || data.title.trim(),
    author: data.author.trim() || 'Anonymous Developer',
    authorRole: data.authorRole || 'buyer',
    category: data.category || 'q_and_a',
    repliesCount: 0,
    isAnswered: false,
    date: 'Just now',
    createdAt: now,
    replies: [],
  };

  try {
    const db = await getDatabase();
    await db.collection<DiscussionItem>(DISCUSSIONS_COLLECTION).insertOne(newDiscussion);
  } catch (err) {
    console.warn('Saving discussion to memory fallback:', err);
  }

  memoryDiscussions = [newDiscussion, ...memoryDiscussions];
  return newDiscussion;
}

export async function addReplyToDiscussionInDb(
  discussionId: string,
  reply: {
    author: string;
    authorRole?: 'buyer' | 'seller' | 'operator' | 'admin';
    content: string;
  }
): Promise<{ success: boolean; reply: DiscussionReply; discussion?: DiscussionItem }> {
  const newReply: DiscussionReply = {
    id: `rep-${Date.now()}`,
    author: reply.author.trim() || 'Anonymous Developer',
    authorRole: reply.authorRole || 'buyer',
    content: reply.content.trim(),
    createdAt: 'Just now',
    isSolution: false,
  };

  try {
    const db = await getDatabase();
    const query: any = {
      $or: [{ id: discussionId }],
    };
    if (ObjectId.isValid(discussionId)) {
      query.$or.push({ _id: new ObjectId(discussionId) });
    }

    const res = await db.collection<DiscussionItem>(DISCUSSIONS_COLLECTION).findOneAndUpdate(
      query,
      {
        $push: { replies: newReply },
        $inc: { repliesCount: 1 },
      },
      { returnDocument: 'after' }
    );

    if (res) {
      return { success: true, reply: newReply, discussion: res as any };
    }
  } catch (err) {
    console.warn('Updating discussion in memory fallback:', err);
  }

  // Update in memory
  const idx = memoryDiscussions.findIndex(
    (d) => d.id === discussionId || (d._id && d._id.toString() === discussionId)
  );
  if (idx !== -1) {
    const target = memoryDiscussions[idx];
    target.replies = [...(target.replies || []), newReply];
    target.repliesCount = (target.repliesCount || 0) + 1;
    return { success: true, reply: newReply, discussion: target };
  }

  return { success: true, reply: newReply };
}

export async function toggleDiscussionAnsweredInDb(
  discussionId: string,
  isAnswered: boolean
): Promise<{ success: boolean }> {
  try {
    const db = await getDatabase();
    const query: any = {
      $or: [{ id: discussionId }],
    };
    if (ObjectId.isValid(discussionId)) {
      query.$or.push({ _id: new ObjectId(discussionId) });
    }

    await db.collection<DiscussionItem>(DISCUSSIONS_COLLECTION).updateOne(query, {
      $set: { isAnswered },
    });
    return { success: true };
  } catch (err) {
    console.warn('Updating answered state in memory fallback:', err);
    const item = memoryDiscussions.find(
      (d) => d.id === discussionId || (d._id && d._id.toString() === discussionId)
    );
    if (item) item.isAnswered = isAnswered;
    return { success: true };
  }
}
