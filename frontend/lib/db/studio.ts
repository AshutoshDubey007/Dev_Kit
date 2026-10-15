import { getDatabase } from '../mongodb';
import { ObjectId } from 'mongodb';

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedProject {
  _id?: ObjectId;
  projectId: string;
  projectName: string;
  userId?: string;
  promptSlug?: string;
  modelUsed: string;
  provider: 'anthropic' | 'openai' | 'gemini' | 'synthesizer';
  projectPlan: string;
  files: GeneratedFile[];
  status: 'completed' | 'failed';
  generationTimeSeconds: number;
  createdAt: Date;
}

const PROJECTS_COLLECTION = 'generated_projects';

/**
 * Persists a generated project to MongoDB
 */
export async function saveGeneratedProject(
  data: Omit<GeneratedProject, '_id' | 'createdAt'>
): Promise<GeneratedProject> {
  const db = await getDatabase();
  const newProject: GeneratedProject = {
    ...data,
    createdAt: new Date(),
  };

  await db.collection<GeneratedProject>(PROJECTS_COLLECTION).insertOne(newProject);
  return newProject;
}

/**
 * Retrieves generation history for a user
 */
export async function getUserGeneratedProjects(userId: string): Promise<GeneratedProject[]> {
  try {
    const db = await getDatabase();
    return db
      .collection<GeneratedProject>(PROJECTS_COLLECTION)
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
  } catch (err) {
    console.error('Error fetching user generated projects:', err);
    return [];
  }
}

/**
 * Retrieves a single generated project by ID
 */
export async function getGeneratedProjectById(projectId: string): Promise<GeneratedProject | null> {
  try {
    const db = await getDatabase();
    return db.collection<GeneratedProject>(PROJECTS_COLLECTION).findOne({ projectId });
  } catch (err) {
    console.error('Error looking up project by ID:', err);
    return null;
  }
}
