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
import { useUpdateField } from '@/hooks/useUpdateField';
import { cn, formatEffortTime } from '@/lib/utils';
import { TaskStatus, TaskStatus as TaskStatusEnum } from '@/types/task';
import { CourseCodeBadge } from '../shared/atoms/CourseCodeBadge';
import { EditableField } from '../shared/EditableField';
import { DatePicker } from '../ui/date-picker';

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
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.notes ?? '');
  const updateField = useUpdateField();
  const [subtasks, setSubtasks] = useState(task.subtasks ?? []);

    // State for editing due date
    const [isEditingDueDate, setIsEditingDueDate] = useState(false);
    const [editedDueDate, setEditedDueDate] = useState(task.dueDate ? new Date(task.dueDate) : undefined);

    // Handler for saving due date
    const handleSaveDueDate = async (newDate: Date | undefined) => {
      setEditedDueDate(newDate);
      setIsEditingDueDate(false);
      if (newDate instanceof Date && !isNaN(newDate.getTime())) {
        await updateField({
          type: 'task',
          id: task.id,
          input: 'dueDate',
          value: newDate.toISOString(),
        });
      }
    };

  // Use controlled state if provided, otherwise use internal state
  const isSubtasksExpanded = controlledSubtasksExpanded ?? internalSubtasksExpanded;

  const isCompleted = task.status === TaskStatus.COMPLETED;

  // Save handler for title
  const handleSaveTitle = async (newTitle: string) => {
    setEditedTitle(newTitle);
    await updateField({
      type: 'task',
      id: task.id,
      input: 'title',
      value: newTitle,
    });
  };

  // Save handler for description
  const handleSaveDescription = async (newDescription: string) => {
    setEditedDescription(newDescription);
    await updateField({
      type: 'task',
      id: task.id,
      input: 'notes',
      value: newDescription,
    });
  };

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
          {/* Editable Title */}
          <EditableField
            value={editedTitle}
            onSave={handleSaveTitle}
            inputType="input"
            className={cn('font-medium', isCompleted && 'text-muted-foreground')}
            placeholder="Task title"
          />

          {/* Editable Description */}
          <EditableField
            value={editedDescription}
            onSave={handleSaveDescription}
            inputType="textarea"
            className={cn('text-sm text-muted-foreground', isCompleted && 'opacity-70')}
            placeholder="Task description"
          />
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
                <>
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => setIsEditingDueDate(true)}
                  >
                    <DueDateDisplay date={editedDueDate ?? task.dueDate} />
                  </span>
              {isEditingDueDate && (
                <div className="ml-2">
                  <DatePicker
                    date={editedDueDate}
                    onDateChange={(date: Date | undefined) => {
                      setEditedDueDate(date);
                      handleSaveDueDate(date);
                    }}
                    className="w-[180px]"
                    open={isEditingDueDate}
                  />
                </div>
              )}
                </>
              )}
          </div>
        </div>

        <div
          className={cn(
            // Row, wrap, full width on mobile, auto on desktop
            'flex flex-row flex-wrap gap-2 w-full mt-3 items-start',
            'md:flex-col md:items-end md:w-auto md:mt-0',
          )}
        >
          <div className="flex flex-row flex-wrap gap-2 w-full lg:flex-col lg:w-auto">
            <div className="flex-shrink min-w-0">
              <TaskStatusChanger
                currentStatus={task.status}
                onStatusChange={newStatus => onUpdateTaskStatus(task.id, newStatus)}
              />
            </div>
            {task.status === TaskStatusEnum.IN_PROGRESS && (
              <Button
                onClick={handleStartPomodoro}
                size="sm"
                className="pomodoro-button h-8 px-3 flex-shrink min-w-0"
              >
                <Play className="h-4 w-4" />
                Pomodoro
              </Button>
            )}
          </div>
        </div>
      </div>
      <SubtasksList
        subtasks={subtasks}
        onSubtaskStatusChange={(subtaskId, newStatus) =>
          onUpdateSubtaskStatus(task.id, subtaskId, newStatus)}
        onEditSubtask={(subtaskId, changes) => {
          setSubtasks(prev => prev.map(sub =>
            sub.id === subtaskId ? { ...sub, ...changes } : sub,
          ));
        }}
        collapsible={false}
        defaultExpanded={false}
        isExpanded={isSubtasksExpanded}
      />
    </div>
  );
}
