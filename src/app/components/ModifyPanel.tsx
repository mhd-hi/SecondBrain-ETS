'use client';

import { useState } from 'react';
import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task';

interface ModifyPanelProps {
  draft: Task;
  onSave: (updatedDraft: Task) => Promise<void>;
  onCancel: () => void;
}

export default function ModifyPanel({ draft, onSave, onCancel }: ModifyPanelProps) {
  const [title, setTitle] = useState<string>(draft.title);
  const [notes, setNotes] = useState<string>(draft.notes ?? '');
  const [week, setWeek] = useState<number>(draft.week);
  const [status, setStatus] = useState<TaskStatus>(draft.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDraft: Task = {
      ...draft,
      title,
      notes,
      week,
      status,
    };
    await onSave(updatedDraft);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground">
            Titre
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-ring focus:ring-ring"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground">
            Description
          </label>          <textarea
            id="description"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-ring focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="week" className="block text-sm font-medium text-foreground">
            Semaine
          </label>          <input
            type="number"
            id="week"
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-ring focus:ring-ring"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-foreground">
            Statut
          </label>          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-ring focus:ring-ring"
            required
          >
            <option value={TaskStatus.DRAFT}>Brouillon</option>
            <option value={TaskStatus.IN_PROGRESS}>En cours</option>
            <option value={TaskStatus.TODO}>En attente</option>
            <option value={TaskStatus.COMPLETED}>Terminé</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </form>
  );
} 