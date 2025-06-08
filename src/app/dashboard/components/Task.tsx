"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { TaskStatusChanger } from "@/components/TaskStatusChanger";
import { TruncatedTextWithTooltip } from "@/components/shared/atoms/text-with-tooltip";
import type { Task as TaskType, TaskStatus } from "@/types/task";
import type { DraggedTask } from "@/types/drag-drop";

interface TaskProps {
  task: TaskType;
  sourceDate: Date;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  isDragOverlay?: boolean;
}

export const Task = ({
  task,
  sourceDate,
  onStatusChange,
  isDragOverlay = false
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
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: dragData,
  });  // Only apply transform when actively dragging and not in overlay mode
  const style = (transform && isDragging && !isDragOverlay) ? {
    // transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
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
      {/* Task Content */}
      <div>
        <div className="flex items-center justify-between gap-2">
          {task.course?.code && (
            <p className="text-sm text-muted-foreground truncate">{task.course.code}</p>
          )}
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {task.estimatedEffort} hr{task.estimatedEffort !== 1 ? 's' : ''}
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
