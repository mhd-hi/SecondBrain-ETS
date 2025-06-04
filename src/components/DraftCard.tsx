"use client";

import { useState } from "react";
import { useSecondBrainStore } from "@/store/useSecondBrainStore";
import type {  Draft } from "@/types/course";
import { DraftStatus, DraftType } from "@/types/course";
import type { SecondBrainState } from "@/store/useSecondBrainStore";

interface DraftCardProps {
  draft: Draft;
  courseId: string;
}

export const DraftCard = ({ draft, courseId }: DraftCardProps) => {
  const store = useSecondBrainStore() as unknown as SecondBrainState;
  const updateDraft = store.updateDraft;
  const removeDraft = store.removeDraft;

  const [isEditing] = useState(false);

  const handleAccept = () => {
    updateDraft(courseId, draft.id, { status: DraftStatus.ACCEPTED } as {
      status: DraftStatus;
    });
  };

  const handleReject = () => {
    removeDraft(courseId, draft.id);
  };

  const formatEffort = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {draft.type === (DraftType.THEORIE) && (
              <span className="text-blue-500">▶</span>
            )}
            <h3 className="text-lg font-semibold">{draft.title}</h3>
          </div>

          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Week {draft.week}</p>
            <p>Estimated effort: {draft.estimatedEffort} hours</p>
            <p>
              Due date: {new Date(draft.suggestedDueDate).toLocaleDateString()}
            </p>
          </div>

          {draft.notes && <p className="text-gray-500 italic">{draft.notes}</p>}

          {draft.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
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
                    className="border-l-2 border-gray-200 pl-4 text-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {subtask.title}
                        </p>
                        <p className="text-gray-600">
                          Est. {formatEffort(subtask.estimatedEffort)}
                        </p>
                        {subtask.notes && (
                          <p className="mt-1 text-xs text-gray-500 italic">
                            {subtask.notes}
                          </p>
                        )}
                      </div>
                      {subtask.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {subtask.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-800"
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

        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          >
            Reject
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            Edit functionality coming in Sprint 3
          </p>
        </div>
      )}
    </div>
  );
};
