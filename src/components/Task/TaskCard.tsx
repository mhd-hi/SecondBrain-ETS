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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePomodoro } from '@/contexts/use-pomodoro';
import { cn, formatEffortTime, getCourseColor } from '@/lib/utils';
import { TaskStatus, TaskStatus as TaskStatusEnum } from '@/types/task';

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
  const { startPomodoro } = usePomodoro();
  const courseColor = task.course ? getCourseColor(task.course) : undefined;
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
    startPomodoro(task);
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
      {showCourseBadge && task.course?.code && (
        <div className="mb-1">
          <Badge
            variant="outline"
            className="text-xs cursor-pointer hover:bg-muted/80 transition-colors"
            style={{
              borderColor: courseColor,
              color: courseColor,
              backgroundColor: courseColor ? `${courseColor}15` : undefined,
            }}
            onClick={handleNavigateToTask}
          >
            {task.course.code}
          </Badge>
          {' '}

        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-grow">
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
              <span className={cn(
                'text-xs font-medium flex items-center gap-1 text-muted-foreground',
                isCompleted && 'line-through',
              )}
              >
                <Clock className="h-3 w-3 flex-shrink-0" />
                {formatEffortTime(task.estimatedEffort)}
              </span>
            )}

            {/* Effort Progress */}
            {task.estimatedEffort > 0 && task.actualEffort > 0 && (
              <span className={cn(
                'text-xs font-medium flex items-center gap-1 text-muted-foreground',
                isCompleted && 'line-through',
              )}
              >
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

        <div className="flex flex-col items-end gap-2">
          {task.status === TaskStatusEnum.IN_PROGRESS && (
            <Button
              onClick={handleStartPomodoro}
              size="sm"
              className="bg-violet-500 hover:bg-violet-600 text-white h-8 px-3"
            >
              <Play className="h-3 w-3 mr-1" />
              Pomodoro
            </Button>
          )}
          <TaskStatusChanger
            currentStatus={task.status}
            onStatusChange={newStatus => onUpdateTaskStatus(task.id, newStatus)}
          />
          {' '}

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
