'use client';

import type { DraggedTask } from '@/types/drag-drop';
import type { Task as TaskType } from '@/types/task';
import type { TaskStatus } from '@/types/task-status';
import { useDraggable } from '@dnd-kit/core';
import { TruncatedTextWithTooltip } from '@/components/shared/atoms/text-with-tooltip';
import { TaskStatusChanger } from '@/components/Task/TaskStatusChanger';
import { Badge } from '@/components/ui/badge';

type TaskProps = {
  task: TaskType;
  sourceDate: Date;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  isDragOverlay?: boolean;
};

export const Task = ({
  task,
  sourceDate,
  onStatusChange,
  isDragOverlay = false,
}: TaskProps) => {
  const dragData: DraggedTask = {
    id: task.id,
    task,
    sourceDate,
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        group relative p-3 rounded-lg border bg-card text-card-foreground shadow-sm cursor-grab active:cursor-grabbing
        ${isDragging && !isDragOverlay ? 'opacity-0' : ''}
        ${isDragOverlay ? 'rotate-2 scale-105 shadow-2xl border-primary/50 bg-card/70 backdrop-blur-sm opacity-80' : ''}
        hover:shadow-md hover:scale-[1.02]
        ${isDragOverlay ? '' : 'hover:border-primary/30'}
        transition-none
      `}
      {...(!isDragOverlay ? attributes : {})}
      {...(!isDragOverlay ? listeners : {})}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          {task.course?.code && (
            <p className="text-sm text-muted-foreground truncate">{task.course.code}</p>
          )}
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {task.estimatedEffort}
            {' '}
            hr
            {task.estimatedEffort !== 1 ? 's' : ''}
          </Badge>
        </div>

        <TruncatedTextWithTooltip
          text={task.title}
          className="text-sm font-normal mt-1 line-clamp-4 leading-tight"
          maxLines={4}
        />

        <div className="mt-2">
          <TaskStatusChanger
            currentStatus={task.status}
            onStatusChange={(newStatus: TaskStatus) => onStatusChange(task.id, newStatus)}
          />
        </div>
      </div>
    </div>
  );
};
