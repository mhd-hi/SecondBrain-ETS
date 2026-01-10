'use client';

import type { DraggedTask } from '@/types/drag-drop';
import type { StatusTask } from '@/types/status-task';
import type { Task } from '@/types/task';

import { useDraggable } from '@dnd-kit/core';
import React, { useState } from 'react';

import { ActionsDropdown } from '@/components/shared/atoms/actions-dropdown';
import { TruncatedTextWithTooltip } from '@/components/shared/atoms/text-with-tooltip';
import { TaskUpdateDialog } from '@/components/shared/dialogs/TaskUpdateDialog';
import { StatusTaskChanger } from '@/components/Task/StatusTaskChanger';
import { Badge } from '@/components/ui/badge';
import { useTaskStore } from '@/lib/stores/task-store';

type TaskProps = {
  task: Task;
  sourceDate: Date;
  onStatusChange: (taskId: string, newStatus: StatusTask) => void;
  isDragOverlay?: boolean;
  onTaskUpdated?: () => void;
};

export const TaskBox = ({
  task,
  sourceDate,
  onStatusChange,
  isDragOverlay = false,
  onTaskUpdated,
}: TaskProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { removeTask } = useTaskStore();
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
      {/* More actions button - visible on hover, positioned on the corner */}
      <div className="absolute -right-3 -top-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
        <ActionsDropdown
          actions={[
            {
              label: 'Edit',
              onClick: () => setIsEditDialogOpen(true),
            },
            {
              label: 'Delete',
              destructive: true,
              onClick: async () => {
                await removeTask(task.id);
                onTaskUpdated?.();
              },
            },
          ]}
          triggerClassName="p-1"
        />
      </div>
      <div className="text-left w-full">
        <div className="flex items-center justify-between gap-2">
          {task.course?.code && (
            <p className="text-sm text-muted-foreground truncate">{task.course.code}</p>
          )}
          <Badge variant="secondary" className="text-xs shrink-0">
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
          <StatusTaskChanger
            currentStatus={task.status}
            onStatusChange={(newStatus: StatusTask) => onStatusChange(task.id, newStatus)}
          />
        </div>
      </div>
      <TaskUpdateDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
        onSaved={() => {
          setIsEditDialogOpen(false);
          onTaskUpdated?.();
        }}
      />
    </div>
  );
};
