'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import ModifyPanel from '@/app/components/ModifyPanel';
import type { Task } from '@/types/course';
import { TaskStatus } from '@/types/task';

interface DraftCardProps {
  draft: Task;
  onDraftUpdate: () => Promise<void>;
}

export default function DraftCard({ draft, onDraftUpdate }: DraftCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleAccept = async () => {
    try {
      const response = await fetch(`/api/tasks/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: TaskStatus.PENDING }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept draft');
      }

      toast.success('Tâche ajoutée', {
        description: 'La tâche a été ajoutée à votre calendrier',
      });
      await onDraftUpdate();
    } catch (error) {
      console.error('Error accepting draft:', error);
      toast.error('Échec de l&apos;acceptation', {
        description: 'Une erreur est survenue lors de l&apos;acceptation de la tâche',
      });
    }
  };

  const handleDiscard = async () => {
    try {
      const response = await fetch(`/api/tasks/${draft.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to discard draft');
      }

      toast.success('Brouillon supprimé', {
        description: 'Le brouillon a été supprimé',
      });
      await onDraftUpdate();
    } catch (error) {
      console.error('Error discarding draft:', error);
      toast.error('Échec de la suppression', {
        description: 'Une erreur est survenue lors de la suppression du brouillon',
      });
    }
  };

  const handleUpdate = async (updatedDraft: Task) => {
    try {
      const response = await fetch(`/api/tasks/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDraft),
      });

      if (!response.ok) {
        throw new Error('Failed to update draft');
      }

      toast.success('Brouillon modifié', {
        description: 'Le brouillon a été modifié avec succès',
      });
      await onDraftUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating draft:', error);
      toast.error('Échec de la modification', {
        description: 'Une erreur est survenue lors de la modification du brouillon',
      });
    }
  };

  if (isEditing) {
    return (
      <ModifyPanel
        draft={draft}
        onSave={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{draft.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            Accepter
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Modifier
          </button>
          <button
            onClick={handleDiscard}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Supprimer
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <p>Semaine: {draft.week}</p>
        <p>Statut: {draft.status}</p>
        {draft.notes && <p>Notes: {draft.notes}</p>}
      </div>
    </div>
  );
}