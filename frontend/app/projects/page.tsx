'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Calendar,
  BookMarked,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  repo: string;
}

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/projects/tasks');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/projects/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: 'Platform tracking item.',
          status: 'todo',
          priority: 'medium',
          dueDate: 'Upcoming',
          repo: 'devkit-core',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.task) setTasks((prev) => [data.task, ...prev]);
        setNewTaskTitle('');
        setShowNewTaskModal(false);
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleStatusChange = async (taskId: string, nextStatus: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch('/api/projects/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: nextStatus }),
      });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-[#b8531e] font-mono">
            <span>●</span>
            <span>Developer Project Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
            Projects &amp; Tasks
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">
            Collaborative Kanban boards, milestone tracking, and task dispatching across your repositories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewTaskModal(true)}
            className="text-xs bg-[#b8531e] hover:bg-[#964115] text-white border-2 border-[#78330f] shadow-[3px_3px_0px_#e5a982] text-white font-semibold gap-1.5 shadow-lg shadow-[#e8c3a8]"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* ─── Kanban Board ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column: To Do */}
        <div className="rounded-2xl border border-orange-200 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-orange-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              <h3 className="text-xs font-bold text-zinc-950 uppercase font-mono">To Do</h3>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {todoTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {todoTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-orange-200 bg-white p-4 space-y-2.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-zinc-950 leading-snug">{task.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                    className="text-[10px] text-[#b8531e] hover:underline font-mono shrink-0"
                  >
                    Start →
                  </button>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">{task.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-orange-200 text-[10px] font-mono text-zinc-600">
                  <span className="flex items-center gap-1 text-zinc-600">
                    <BookMarked className="h-3 w-3" />
                    <span>{task.repo}</span>
                  </span>
                  <span>{task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column: In Progress */}
        <div className="rounded-2xl border border-orange-200 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-orange-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <h3 className="text-xs font-bold text-zinc-950 uppercase font-mono">In Progress</h3>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {inProgressTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-[#cc6b35] bg-[#f7ece1] p-4 space-y-2.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-zinc-950 leading-snug">{task.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task.id, 'done')}
                    className="text-[10px] text-[#b8531e] hover:underline font-mono shrink-0"
                  >
                    Complete ✓
                  </button>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">{task.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-orange-200 text-[10px] font-mono text-zinc-600">
                  <span className="flex items-center gap-1 text-zinc-800">
                    <BookMarked className="h-3 w-3" />
                    <span>{task.repo}</span>
                  </span>
                  <span>{task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column: Completed */}
        <div className="rounded-2xl border border-orange-200 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-orange-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#cc6b35]" />
              <h3 className="text-xs font-bold text-zinc-950 uppercase font-mono">Done</h3>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {doneTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-orange-200 bg-white p-4 space-y-2.5 opacity-80"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-zinc-800 line-through leading-snug">{task.title}</h4>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#b8531e] shrink-0" />
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">{task.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-orange-200 text-[10px] font-mono text-zinc-600">
                  <span>{task.repo}</span>
                  <span className="text-[#b8531e]">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for adding task */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md">
          <form
            onSubmit={handleAddTask}
            className="relative w-full max-w-md rounded-2xl border border-orange-200 bg-white p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-zinc-950">Create New Task</h3>
            <Input
              type="text"
              required
              placeholder="Task title (e.g. Add webhook retry tests)..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="text-xs"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowNewTaskModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-[#b8531e] text-white font-semibold">
                Add Task
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
