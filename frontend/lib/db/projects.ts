import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';

export interface ProjectTask {
  _id?: ObjectId;
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  repo: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TASKS_COLLECTION = 'project_tasks';

export const INITIAL_TASKS: Omit<ProjectTask, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'task-1',
    title: 'Implement Razorpay Webhook Idempotency',
    description: 'Validate raw-body HMAC signature and prevent double credit grants.',
    status: 'done',
    priority: 'high',
    dueDate: 'Oct 14',
    repo: 'nextjs-razorpay-pro',
  },
  {
    id: 'task-2',
    title: 'Build Universal Command Palette',
    description: 'Support Cmd+K keyboard shortcut across all developer platform views.',
    status: 'done',
    priority: 'medium',
    dueDate: 'Oct 15',
    repo: 'devkit-core',
  },
  {
    id: 'task-3',
    title: 'AI Generation Studio Provider Adapter',
    description: 'Wire Claude 3.5 Sonnet and GPT-4o multi-file generation handlers.',
    status: 'in_progress',
    priority: 'high',
    dueDate: 'Oct 18',
    repo: 'ai-studio',
  },
  {
    id: 'task-4',
    title: 'Quarantine Scanner for Executable Uploads',
    description: 'Inspect ZIP archive paths and reject unauthorized binaries.',
    status: 'todo',
    priority: 'medium',
    dueDate: 'Oct 22',
    repo: 'devkit-security',
  },
];

export async function getProjectTasksFromDb(): Promise<ProjectTask[]> {
  try {
    const db = await getDatabase();
    const count = await db.collection(TASKS_COLLECTION).countDocuments();
    if (count === 0) {
      const now = new Date();
      const seeds = INITIAL_TASKS.map((t) => ({ ...t, createdAt: now, updatedAt: now }));
      await db.collection(TASKS_COLLECTION).insertMany(seeds);
    }

    return db.collection<ProjectTask>(TASKS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
  } catch (err) {
    console.error('Error fetching tasks from DB:', err);
    return INITIAL_TASKS.map((t) => ({ ...t, createdAt: new Date(), updatedAt: new Date() }));
  }
}

export async function createProjectTaskInDb(data: {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  repo?: string;
  createdBy?: string;
}): Promise<ProjectTask> {
  const db = await getDatabase();
  const now = new Date();
  const newTask: ProjectTask = {
    id: `task-${Date.now()}`,
    title: data.title.trim(),
    description: data.description?.trim() || 'New platform tracking item.',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    dueDate: data.dueDate || 'Soon',
    repo: data.repo || 'devkit-core',
    createdBy: data.createdBy || 'anonymous',
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<ProjectTask>(TASKS_COLLECTION).insertOne(newTask);
  return newTask;
}

export async function updateProjectTaskStatusInDb(
  taskId: string,
  newStatus: 'todo' | 'in_progress' | 'done'
): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.collection<ProjectTask>(TASKS_COLLECTION).updateOne(
    { id: taskId },
    { $set: { status: newStatus, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}
