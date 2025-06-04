'use client';

import { useState } from 'react';
import { DraftCard } from './DraftCard';
import type { Draft } from '@/types/course';

interface WeekAccordionProps {
  courseId: string;
  week: number;
  drafts: Draft[];
  onAcceptAll: () => void;
  onDiscardAll: () => void;
}

export default function WeekAccordion({
  courseId,
  week,
  drafts,
  onAcceptAll,
  onDiscardAll,
}: WeekAccordionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="mb-4 border rounded-lg shadow-sm bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
        aria-expanded={expanded}
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
              onClick={onAcceptAll}
              className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Accept All (Week {week})
            </button>
            <button
              onClick={onDiscardAll}
              className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Discard All (Week {week})
            </button>
          </div>
          <div className="space-y-3">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                courseId={courseId}
                draft={draft}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
} 