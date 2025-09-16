'use client';

import type { Subtask } from '@/types/subtask';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <ChevronDown
        className={cn('h-3 w-3 transition-transform duration-150', isExpanded && 'rotate-180')}
      />
    </button>
  );
}
