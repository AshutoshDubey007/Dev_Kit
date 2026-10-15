import { NextRequest, NextResponse } from 'next/server';
import {
  getProjectTasksFromDb,
  createProjectTaskInDb,
  updateProjectTaskStatusInDb,
} from '@/lib/db/projects';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tasks = await getProjectTasksFromDb();
    return NextResponse.json({ success: true, count: tasks.length, tasks });
  } catch (error: any) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const newTask = await createProjectTaskInDb({
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      dueDate: body.dueDate,
      repo: body.repo,
      createdBy: body.createdBy,
    });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: any) {
    console.error('Error creating project task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Task id and status are required' }, { status: 400 });
    }

    const updated = await updateProjectTaskStatusInDb(id, status);
    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}
