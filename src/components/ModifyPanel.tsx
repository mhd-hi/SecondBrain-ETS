'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task';

interface ModifyPanelProps {
  draft: Task;
  onSave: (updatedTask: Partial<Task>) => Promise<void>;
  onCancel: () => void;
}

export function ModifyPanel({ draft, onSave, onCancel }: ModifyPanelProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    ...draft,
    notes: draft.notes ?? '',
    subtasks: draft.subtasks ?? [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedTask: Partial<Task> = {
        ...formData,
        updatedAt: new Date(),
      };

      await onSave(updatedTask);
      toast.success('Tâche modifiée', {
        description: 'Les modifications ont été enregistrées',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Échec de la modification', {
        description: 'Une erreur est survenue lors de la modification de la tâche',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Titre
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="week" className="block text-sm font-medium text-gray-700">
          Semaine
        </label>
        <input
          type="number"
          id="week"
          name="week"
          value={formData.week}
          onChange={handleChange}
          required
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Statut
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value={TaskStatus.DRAFT}>Brouillon</option>
          <option value={TaskStatus.IN_PROGRESS}>En cours</option>
          <option value={TaskStatus.PENDING}>En attente</option>
          <option value={TaskStatus.COMPLETED}>Terminé</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
} 