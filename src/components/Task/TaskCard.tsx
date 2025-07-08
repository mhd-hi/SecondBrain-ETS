'use client';

import type { Task } from '@/types/task';
import { BarChart3, Clock, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { DueDateDisplay } from '@/components/shared/atoms/due-date-display';
import { MoreActionsDropdown } from '@/components/shared/atoms/more-actions-dropdown';
import { SubtasksList } from '@/components/Task/SubtasksList';
import { SubtasksPill } from '@/components/Task/SubtasksPill';
import { TaskStatusChanger } from '@/components/Task/TaskStatusChanger';
import { Button } from '@/components/ui/button';
import { cn, formatEffortTime } from '@/lib/utils';
import { TaskStatus, TaskStatus as TaskStatusEnum } from '@/types/task';
import { CourseCodeBadge } from '../shared/atoms/CourseCodeBadge';

type TaskCardProps = {
  task: Task;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateSubtaskStatus: (taskId: string, subtaskId: string, newStatus: TaskStatus) => void;
  showCourseBadge?: boolean;
  isSubtasksExpanded?: boolean;
  onToggleSubtasksExpanded?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    destructive?: boolean;
  }>;
};

export function TaskCard({
  task,
  onDeleteTask,
  onUpdateTaskStatus,
  onUpdateSubtaskStatus,
  showCourseBadge = false,
  isSubtasksExpanded: controlledSubtasksExpanded,
  onToggleSubtasksExpanded,
  actions,
}: TaskCardProps) {
  const router = useRouter();
  const [internalSubtasksExpanded, setInternalSubtasksExpanded] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isSubtasksExpanded = controlledSubtasksExpanded ?? internalSubtasksExpanded;

  const isCompleted = task.status === TaskStatus.COMPLETED;

  const handleNavigateToTask = () => {
    if (task.course?.id) {
      router.push(`/courses/${task.course.id}#task-${task.id}`);
    }
  };

  const handleStartPomodoro = () => {
    router.push(`/pomodoro?taskId=${task.id}`);
  };

  const defaultActions = [
    {
      label: 'Delete',
      onClick: () => onDeleteTask(task.id),
      destructive: true,
    },
  ];

  const cardActions = actions ?? defaultActions;

  return (
    <div className={cn(
      'relative group p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors',
      isCompleted && 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
    )}
    >
      <MoreActionsDropdown
        actions={cardActions}
        triggerClassName="absolute -top-[10px] -right-[10px] z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      {showCourseBadge && task.course && (
        <div className="mb-1">
          <CourseCodeBadge
            course={task.course}
            onClick={handleNavigateToTask}
          />
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 flex-grow min-w-0">
          <h4 className={cn(
            'font-medium',
            isCompleted && 'text-muted-foreground',
          )}
          >
            {task.title}
          </h4>
          {task.notes && (
            <p className={cn(
              'text-sm text-muted-foreground',
              isCompleted && 'opacity-70',
            )}
            >
              {task.notes}
            </p>
          )}
          <div className="flex items-center gap-3">
            <SubtasksPill
              subtasks={task.subtasks ?? []}
              isExpanded={isSubtasksExpanded}
              onToggle={() => {
                if (onToggleSubtasksExpanded) {
                  onToggleSubtasksExpanded();
                } else {
                  setInternalSubtasksExpanded(!internalSubtasksExpanded);
                }
              }}
            />

            {/* Effort Time */}
            {task.estimatedEffort > 0 && (
              <span className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                {formatEffortTime(task.estimatedEffort)}
              </span>
            )}

            {/* Effort Progress */}
            {task.estimatedEffort > 0 && task.actualEffort > 0 && (
              <span className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
                <BarChart3 className="h-3 w-3 flex-shrink-0" />
                {Math.round((task.actualEffort / task.estimatedEffort) * 100)}
                % complete
              </span>
            )}

            {task.dueDate && task.status !== TaskStatus.COMPLETED && (
              <DueDateDisplay date={task.dueDate} />
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex flex-row flex-wrap gap-2 w-full mt-3 items-start',
            'md:flex-col md:items-end md:w-auto md:mt-0',
          )}
        >
          <TaskStatusChanger
            currentStatus={task.status}
            onStatusChange={newStatus => onUpdateTaskStatus(task.id, newStatus)}
          />

          {task.status === TaskStatusEnum.IN_PROGRESS && (
            <Button
              onClick={handleStartPomodoro}
              size="sm"
              className="pomodoro-button h-8 px-3"
            >
              <Play className="h-4 w-4" />
              Pomodoro
            </Button>
          )}
        </div>
      </div>
      <SubtasksList
        subtasks={task.subtasks ?? []}
        onSubtaskStatusChange={(subtaskId, newStatus) =>
          onUpdateSubtaskStatus(task.id, subtaskId, newStatus)}
        collapsible={false}
        defaultExpanded={false}
        isExpanded={isSubtasksExpanded}
      />
    </div>
  );
}
