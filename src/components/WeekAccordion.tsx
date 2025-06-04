'use client';

import { useState } from 'react';
import { DraftCard } from './DraftCard';
import { toast } from 'sonner';
import type { Task } from '@/types/course';
import { TaskStatus } from '@/types/task';

interface WeekAccordionProps {
  courseId: string;
  week: number;
  drafts: Task[];
  onDraftUpdate: () => Promise<void>;
}

export default function WeekAccordion({
  week,
  drafts,
  onDraftUpdate,
}: WeekAccordionProps) {
  const [expanded, setExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAcceptAll = async () => {
    setIsLoading(true);
    try {
      const promises = drafts.map(draft =>
        fetch(`/api/tasks/${draft.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: TaskStatus.PENDING }),
        })
      );

      await Promise.all(promises);
      toast.success(`${drafts.length} tâches ajoutées`, {
        description: `Toutes les tâches de la semaine ${week} ont été acceptées`,
      });
      await onDraftUpdate();
    } catch (error) {
      console.error('Error accepting all drafts:', error);
      toast.error('Échec de l\'acceptation', {
        description: 'Une erreur est survenue lors de l\'acceptation des tâches',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardAll = async () => {
    setIsLoading(true);
    try {
      const promises = drafts.map(draft =>
        fetch(`/api/tasks/${draft.id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);
      toast.success('Brouillons supprimés', {
        description: `Tous les brouillons de la semaine ${week} ont été supprimés`,
      });
      await onDraftUpdate();
    } catch (error) {
      console.error('Error discarding all drafts:', error);
      toast.error('Échec de la suppression', {
        description: 'Une erreur est survenue lors de la suppression des brouillons',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-4 border rounded-lg shadow-sm bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
        aria-expanded={expanded}
        aria-label={`Semaine ${week} (${drafts.length} brouillons)`}
      >
        <span className="font-medium flex items-center gap-2">
          <span role="img" aria-label="calendar">
            🗓️
          </span>
          Week {week} ({drafts.length})
        </span>
        <span className="text-xl text-gray-500">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleAcceptAll}
              disabled={isLoading}
              className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Accepter tous les brouillons de la semaine ${week}`}
            >
              {isLoading ? 'Chargement...' : `Accept All (Week ${week})`}
            </button>
            <button
              onClick={handleDiscardAll}
              disabled={isLoading}
              className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Supprimer tous les brouillons de la semaine ${week}`}
            >
              {isLoading ? 'Chargement...' : `Discard All (Week ${week})`}
            </button>
          </div>
          <div className="space-y-3">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onAccept={async () => {
                  await fetch(`/api/tasks/${draft.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: TaskStatus.PENDING }),
                  });
                  await onDraftUpdate();
                }}
                onAcceptAll={handleAcceptAll}
                onModify={async () => {
                  await onDraftUpdate();
                }}
                onDelete={async () => {
                  await fetch(`/api/tasks/${draft.id}`, {
                    method: 'DELETE',
                  });
                  await onDraftUpdate();
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
} 