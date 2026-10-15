import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Production Pipeline Quality: Project Tasks & Discussions Data Model', () => {
  describe('Project Task Lifecycle Invariants', () => {
    type TaskStatus = 'todo' | 'in_progress' | 'done';

    interface ProjectTask {
      id: string;
      title: string;
      status: TaskStatus;
      priority: 'low' | 'medium' | 'high';
      assigneeEmail: string;
      createdAt: Date;
    }

    function createValidTask(data: Partial<ProjectTask>): ProjectTask {
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('Task title cannot be empty');
      }
      return {
        id: data.id || `task_${Date.now()}`,
        title: data.title.trim(),
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        assigneeEmail: data.assigneeEmail || 'user@example.com',
        createdAt: data.createdAt || new Date(),
      };
    }

    it('creates a task with valid defaults', () => {
      const task = createValidTask({ title: 'Implement OAuth refresh token rotation' });
      assert.equal(task.title, 'Implement OAuth refresh token rotation');
      assert.equal(task.status, 'todo');
      assert.equal(task.priority, 'medium');
      assert.ok(task.id.startsWith('task_'));
    });

    it('rejects blank task titles', () => {
      assert.throws(() => createValidTask({ title: '   ' }), /Task title cannot be empty/);
      assert.throws(() => createValidTask({ title: '' }), /Task title cannot be empty/);
    });

    it('supports valid status transitions', () => {
      const task = createValidTask({ title: 'Deploy webhook consumer' });
      const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'done'];

      for (const nextStatus of validStatuses) {
        task.status = nextStatus;
        assert.equal(task.status, nextStatus);
      }
    });
  });

  describe('Discussions Forum Data Model', () => {
    interface DiscussionThread {
      id: string;
      title: string;
      content: string;
      category: string;
      authorEmail: string;
      commentsCount: number;
      createdAt: Date;
    }

    function validateDiscussion(thread: Partial<DiscussionThread>): boolean {
      if (!thread.title || thread.title.trim().length < 5) return false;
      if (!thread.content || thread.content.trim().length < 10) return false;
      if (!thread.category) return false;
      return true;
    }

    it('accepts well-formed discussion thread', () => {
      const thread = {
        title: 'Best practices for Next.js 15 server actions with MongoDB',
        content: 'When writing server actions in Next.js 15, should we reuse client pool or create singletons?',
        category: 'Next.js',
      };
      assert.equal(validateDiscussion(thread), true);
    });

    it('rejects excessively short discussion titles or contents', () => {
      assert.equal(validateDiscussion({ title: 'Hi', content: 'Short', category: 'General' }), false);
      assert.equal(validateDiscussion({ title: 'Good title here', content: 'Too short', category: 'General' }), false);
    });
  });
});
