 'use client';

import type { Subtask } from '@/types/subtask';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api/util';
import { TaskStatus } from '@/types/task-status';

type AddSubtaskDialogProps = {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubtaskAdded?: (subtask: Subtask) => void;
};

export const AddSubtaskDialog = ({ taskId, open, onOpenChange, onSubtaskAdded }: AddSubtaskDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newSubtask, setNewSubtask] = useState(() => ({
    title: '',
    notes: '',
    estimatedEffort: 0.5,
  }));

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.title || newSubtask.title.trim() === '') {
      toast.error('Please provide a title for the subtask');
      return;
    }

    setIsLoading(true);
    try {
      // POST the new subtask (only title/notes/estimatedEffort needed)
      const payload = {
        title: newSubtask.title,
        notes: newSubtask.notes ?? '',
        estimatedEffort: newSubtask.estimatedEffort ?? 0.5,
        status: TaskStatus.TODO,
      };

      const created = await api.post(`/api/tasks/${taskId}/subtasks`, payload);
      toast.success('Subtask added');
      handleClose();
  setNewSubtask({ title: '', notes: '', estimatedEffort: 0.5 });
      if (onSubtaskAdded) {
        onSubtaskAdded(created as Subtask);
      }
    } catch {
      toast.error('Failed to add subtask');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subtask</DialogTitle>
          <DialogDescription>
            Add a new subtask to this task
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <input
                id="title"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newSubtask.title}
                onChange={e => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea
                id="notes"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newSubtask.notes}
                onChange={e => setNewSubtask(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="estimatedEffort" className="text-sm font-medium">Estimated Effort (hours)</label>
              <input
                id="estimatedEffort"
                type="number"
                step="0.25"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newSubtask.estimatedEffort}
                onChange={e => setNewSubtask(prev => ({ ...prev, estimatedEffort: Number.parseFloat(e.target.value) || 0.5 }))}
                min="0.25"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Subtask'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubtaskDialog;
