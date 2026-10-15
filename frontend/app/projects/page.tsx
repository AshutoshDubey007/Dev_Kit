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
  const [tasks, setTasks] = useState<Task[]>([
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
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: 'New platform tracking item.',
      status: 'todo',
      priority: 'medium',
      dueDate: 'Upcoming',
      repo: 'devkit-core',
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
    setShowNewTaskModal(false);
  };

  const handleStatusChange = (taskId: string, nextStatus: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-blue-400 font-mono">
            <span>●</span>
            <span>Developer Project Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Projects &amp; Tasks
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Collaborative Kanban boards, milestone tracking, and task dispatching across your repositories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewTaskModal(true)}
            className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-semibold gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* ─── Kanban Board ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column: To Do */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/90 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono">To Do</h3>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {todoTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {todoTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-white/[0.08] bg-zinc-950 p-4 space-y-2.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                    className="text-[10px] text-blue-400 hover:underline font-mono shrink-0"
                  >
                    Start →
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{task.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1 text-zinc-400">
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
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/90 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase font-mono">In Progress</h3>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {inProgressTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-blue-500/30 bg-blue-950/10 p-4 space-y-2.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task.id, 'done')}
                    className="text-[10px] text-emerald-400 hover:underline font-mono shrink-0"
                  >
                    Complete ✓
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{task.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1 text-zinc-300">
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
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e14]/90 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono">Done</h3>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {doneTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-white/[0.06] bg-zinc-950/70 p-4 space-y-2.5 opacity-80"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-zinc-300 line-through leading-snug">{task.title}</h4>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{task.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px] font-mono text-zinc-500">
                  <span>{task.repo}</span>
                  <span className="text-emerald-400">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for adding task */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleAddTask}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0c0e14] p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Create New Task</h3>
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
              <Button type="submit" variant="primary" size="sm" className="bg-emerald-500 text-black font-semibold">
                Add Task
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
