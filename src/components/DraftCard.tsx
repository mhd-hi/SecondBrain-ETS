'use client';

import { useState } from 'react';
import { useSecondBrainStore } from '@/store/useSecondBrainStore';
import type { Draft } from '@/store/useSecondBrainStore';

interface DraftCardProps {
  courseId: string;
  draft: Draft;
}

export default function DraftCard({ courseId, draft }: DraftCardProps) {
  const acceptDraft = useSecondBrainStore((state) => state.acceptDraft);
  const removeDraft = useSecondBrainStore((state) => state.removeDraft);
  const updateDraft = useSecondBrainStore((state) => state.updateDraft);

  const [isEditing, setIsEditing] = useState(false);

  const handleAccept = () => {
    acceptDraft(courseId, draft);
  };

  const handleDiscard = () => {
    removeDraft(courseId, draft.id);
  };

  const formatEffort = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {draft.type === 'theorie' && (
              <span role="img" aria-label="theory">
                ▶
              </span>
            )}
            {draft.title}
          </h3>
          
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <p>
              Est. {formatEffort(draft.estimatedEffort)} • Due{' '}
              {new Date(draft.suggestedDueDate).toLocaleDateString()}
            </p>
            {draft.notes && (
              <p className="text-gray-500 italic">{draft.notes}</p>
            )}
          </div>

          {draft.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {draft.subtasks && draft.subtasks.length > 0 && (
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Subtasks:</h4>
              <ul className="space-y-2">
                {draft.subtasks.map((subtask, index) => (
                  <li
                    key={index}
                    className="text-sm pl-4 border-l-2 border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {subtask.title}
                        </p>
                        <p className="text-gray-600">
                          Est. {formatEffort(subtask.estimatedEffort)}
                        </p>
                        {subtask.notes && (
                          <p className="text-gray-500 italic text-xs mt-1">
                            {subtask.notes}
                          </p>
                        )}
                      </div>
                      {subtask.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {subtask.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleAccept}
            className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Accept
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 transition-colors text-sm font-medium"
          >
            Modify
          </button>
          <button
            onClick={handleDiscard}
            className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Discard
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            Edit functionality coming in Sprint 3
          </p>
        </div>
      )}
    </div>
  );
} 