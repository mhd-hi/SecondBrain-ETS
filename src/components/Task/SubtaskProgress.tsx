'use client';

import type { Subtask } from '@/types/subtask';
import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types/task-status';

type SubtaskProgressProps = {
  subtasks?: Subtask[];
  showProgress?: boolean;
};

const SubtaskProgress = ({ subtasks, showProgress = true }: SubtaskProgressProps) => {
  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const completedCount = subtasks.filter(subtask => subtask.status === TaskStatus.COMPLETED).length;
  const totalCount = subtasks.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge variant="outline" className="text-xs">
        {completedCount}
        /
        {totalCount}
        {' '}
        subtasks
      </Badge>
      {showProgress && totalCount > 1 && (
        <div className="flex items-center gap-1">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {Math.round(progressPercentage)}
            %
          </span>
        </div>
      )}
    </div>
  );
};

export { SubtaskProgress };
