'use client';

import { useState } from 'react';
import type { Draft } from '@/types/course';
import { TaskStatus } from '@/types/task';

interface ModifyPanelProps {
  draft: Draft;
  onSave: (updatedDraft: Draft) => Promise<void>;
  onCancel: () => void;
}

export default function ModifyPanel({ draft, onSave, onCancel }: ModifyPanelProps) {
  const [title, setTitle] = useState<string>(draft.title ?? '');
  const [notes, setDescription] = useState<string>(draft.notes ?? '');
  const [week, setWeek] = useState<number>(draft.week ?? 1);
  const [status, setStatus] = useState<TaskStatus>(draft.status ?? TaskStatus.PENDING);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDraft: Draft = {
      ...draft,
      title,
      notes: notes,
      week,
      status,
    };
    await onSave(updatedDraft);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={notes}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="week" className="block text-sm font-medium text-gray-700">
            Semaine
          </label>
          <input
            type="number"
            id="week"
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Statut
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value={TaskStatus.PENDING}>En attente</option>
            <option value={TaskStatus.IN_PROGRESS}>En cours</option>
            <option value={TaskStatus.COMPLETED}>Terminé</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
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