 'use client';

import type { Task } from '@/types/task';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTaskStore } from '@/lib/stores/task-store';
import { StatusTask } from '@/types/status-task';
import { TASK_TYPES } from '@/types/task';

type TaskUpdateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSaved?: () => void;
};

type FormState = {
  title: string;
  notes: string;
  type: Task['type'];
  dueDate: Date;
  estimatedEffort: number;
  status: StatusTask;
};

export const TaskUpdateDialog = ({ open, onOpenChange, task, onSaved }: TaskUpdateDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const updateTask = useTaskStore(state => state.updateTask);
  const updateTaskField = useTaskStore(state => state.updateTaskField);
  const [form, setForm] = useState<FormState>(() => ({
    title: task.title ?? '',
    notes: task.notes ?? '',
    type: (task.type ?? TASK_TYPES.THEORIE) as Task['type'],
    dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
    estimatedEffort: task.estimatedEffort ?? 1,
    status: task.status ?? StatusTask.TODO,
  }));

  // Note: we intentionally do not sync form with task changes after mount.
  // The dialog is remounted when opened so initial state is sufficient.

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Update all fields using the store
      const updates: Partial<Task> = {
        title: form.title,
        notes: form.notes,
        type: form.type,
        dueDate: form.dueDate,
        estimatedEffort: form.estimatedEffort,
        status: form.status,
      };
      updateTask(task.id, updates);

      // Sync with backend
      await updateTaskField(task.id, 'title', form.title);
      await updateTaskField(task.id, 'notes', form.notes);
      await updateTaskField(task.id, 'type', form.type);
      await updateTaskField(task.id, 'dueDate', form.dueDate.toISOString());
      await updateTaskField(task.id, 'estimatedEffort', form.estimatedEffort);
      await updateTaskField(task.id, 'status', form.status);

      toast.success('Task updated');
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      console.error('Failed to update task', err);
      toast.error('Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="edit-task-description">
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
          <DialogDescription id="edit-task-description">Update the task details below and save your changes.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="(Optional) Add additional notes about the task"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={e => setForm(prev => ({ ...prev, type: e.target.value as Task['type'] }))}
                required
              >
                <option value={TASK_TYPES.THEORIE}>Théorie</option>
                <option value={TASK_TYPES.PRATIQUE}>Pratique</option>
                <option value={TASK_TYPES.EXAM}>Examen</option>
                <option value={TASK_TYPES.HOMEWORK}>Devoir</option>
                <option value={TASK_TYPES.LAB}>Laboratoire</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Due Date</Label>
              <DatePicker
                date={form.dueDate}
                onDateChange={date => date && setForm(prev => ({ ...prev, dueDate: date }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estimatedEffort">Estimated Effort (hours)</Label>
              <Input
                id="estimatedEffort"
                type="number"
                step="0.25"
                value={String(form.estimatedEffort)}
                onChange={(e) => {
                  const raw = Number.parseFloat(e.target.value);
                  const clamped = Number.isFinite(raw) ? (raw < 0 ? 0.5 : Math.max(0.25, raw)) : 0.5;
                  setForm(prev => ({ ...prev, estimatedEffort: clamped }));
                }}
                min="0.25"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
