'use client';

import type { Subtask } from '@/types/task';
import { ChevronDown, ChevronRight } from 'lucide-react';

type SubtasksPillProps = {
  subtasks: Subtask[];
  isExpanded: boolean;
  onToggle: () => void;
};

export function SubtasksPill({ subtasks, isExpanded, onToggle }: SubtasksPillProps) {
  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      className="text-xs font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2 py-0.5 rounded-full border border-muted transition-colors cursor-pointer"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-controls="subtasks-list"
    >
      {subtasks.length}
      {' '}
      Subtask
      {subtasks.length !== 1 ? 's' : ''}
      {isExpanded
        ? (
          <ChevronDown className="h-3 w-3 transition-transform duration-150" />
        )
        : (
          <ChevronRight className="h-3 w-3 transition-transform duration-150" />
        )}
    </button>
  );
}
