'use client';

import type { Task, TaskStatus } from '@/types/task';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { DueDateDisplay } from '@/components/shared/atoms/due-date-display';
import { MoreActionsDropdown } from '@/components/shared/atoms/more-actions-dropdown';
import { SubtaskProgress } from '@/components/SubtaskProgress';
import { SubtasksList } from '@/components/SubtasksList';
import { TaskStatusChanger } from '@/components/TaskStatusChanger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePomodoro } from '@/contexts/use-pomodoro';
import { getCourseColor } from '@/lib/utils';
import { TaskStatus as TaskStatusEnum } from '@/types/task';

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
    <div
      className="relative group p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
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
        </div>
      )}
      {' '}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-grow">
          <h4 className="font-medium">{task.title}</h4>
          {task.notes && (
            <p className="text-sm text-muted-foreground">{task.notes}</p>
          )}
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <DueDateDisplay date={task.dueDate} />
            )}
            <SubtaskProgress subtasks={task.subtasks} />
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
        </div>
      </div>
      <SubtasksList
        subtasks={task.subtasks ?? []}
        onSubtaskStatusChange={(subtaskId, newStatus) =>
          onUpdateSubtaskStatus(task.id, subtaskId, newStatus)}
        collapsible={true}
        defaultExpanded={false}
        isExpanded={isSubtasksExpanded}
        onToggleExpanded={onToggleSubtasksExpanded ?? (() => setInternalSubtasksExpanded(!internalSubtasksExpanded))}
      />
    </div>
  );
}
