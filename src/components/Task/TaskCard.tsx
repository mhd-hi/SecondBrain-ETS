'use client';

import type { Task } from '@/types/task';
import { BarChart3, Clock, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { DueDateDisplay } from '@/components/shared/atoms/due-date-display';
import { MoreActionsDropdown } from '@/components/shared/atoms/more-actions-dropdown';
import AddSubtaskDialog from '@/components/shared/dialogs/AddSubtaskDialog';
import { SubtasksList } from '@/components/Task/SubtasksList';
import { SubtasksPill } from '@/components/Task/SubtasksPill';
import { TaskStatusChanger } from '@/components/Task/TaskStatusChanger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { useUpdateField } from '@/hooks/useUpdateField';
import { cn, formatEffortTime } from '@/lib/utils';
import { TaskStatus } from '@/types/task-status';
import { CourseCodeBadge } from '../shared/atoms/CourseCodeBadge';
import { EditableField } from '../shared/EditableField';

type TaskCardProps = {
  task: Task;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateSubtaskStatus: (taskId: string, subtaskId: string, newStatus: TaskStatus) => void;
  onTaskAdded?: () => void;
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
  showCourseBadge = false,
  isSubtasksExpanded: controlledSubtasksExpanded,
  onToggleSubtasksExpanded,
  actions,
  onTaskAdded,
}: TaskCardProps) {
  const router = useRouter();
  const [internalSubtasksExpanded, setInternalSubtasksExpanded] = useState(false);
  const [isAddSubtaskOpen, setIsAddSubtaskOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.notes ?? '');
  const updateField = useUpdateField();
  const [subtasks, setSubtasks] = useState(task.subtasks ?? []);
  const [isEditingEffort, setIsEditingEffort] = useState(false);
  const [editedEffort, setEditedEffort] = useState<number | undefined>(
    task.estimatedEffort > 0 ? task.estimatedEffort : undefined,
  );
  const inputContainerRef = useRef<HTMLDivElement | null>(null);

  // Focus the numeric input when entering edit mode
  useEffect(() => {
    if (isEditingEffort) {
      // query the actual input inside the container (avoids changing Input component)
      const el = inputContainerRef.current?.querySelector('input') as HTMLInputElement | null;
      if (el) {
        el.focus();
        el.select();
      }
    }
  }, [isEditingEffort]);

  // State for editing due date
  const [editedDueDate, setEditedDueDate] = useState(() => (task.dueDate ? new Date(task.dueDate) : undefined));

  // Handler for saving due date (used by DueDateDisplay onChange)
  const handleSaveDueDate = async (newDate: Date | undefined | null) => {
    const dateToStore = newDate instanceof Date && !Number.isNaN(newDate.getTime()) ? newDate : undefined;
    setEditedDueDate(dateToStore);
    if (dateToStore) {
      await updateField({
        type: 'task',
        id: task.id,
        input: 'dueDate',
        value: dateToStore.toISOString(),
      });
      toast.success('Due date updated');
    } else {
      // clear due date
      await updateField({
        type: 'task',
        id: task.id,
        input: 'dueDate',
        value: '',
      });
      toast.success('Due date cleared');
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
      label: 'Add subtask',
      onClick: () => setIsAddSubtaskOpen(true),
    },
    {
      label: 'Delete task',
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
      {/* Add Subtask dialog controlled by this card */}
      <AddSubtaskDialog
        taskId={task.id}
        open={isAddSubtaskOpen}
        onOpenChange={setIsAddSubtaskOpen}
        onSubtaskAdded={(subtask) => {
          setSubtasks(prev => [...prev, subtask]);
        }}
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
              subtasks={subtasks ?? []}
              isExpanded={isSubtasksExpanded}
              onToggle={() => {
                if (onToggleSubtasksExpanded) {
                  onToggleSubtasksExpanded();
                } else {
                  setInternalSubtasksExpanded(!internalSubtasksExpanded);
                }
              }}
            />

            {/* Effort Time (editable) */}
            {((task.estimatedEffort >= 0) || editedEffort) && (
              <div>
                {isEditingEffort && (
                  <div ref={inputContainerRef} className="w-16 max-w-[72px]">
                    {/* Use existing Input component styled for numbers */}
                    <Input
                      type="number"
                      value={editedEffort ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEditedEffort(e.target.value === '' ? undefined : Number(e.target.value));
                      }}
                      onBlur={async () => {
                        setIsEditingEffort(false);
                        // ensure value is a number; if negative default to 0.5, otherwise use value (min 0)
                        const rawVal = editedEffort ?? 0;
                        const newVal = Number.isFinite(rawVal) ? (rawVal < 0 ? 0.5 : Math.max(0, rawVal)) : 0.5;
                        const oldVal = typeof task.estimatedEffort === 'number' ? task.estimatedEffort : 0;
                        // Only persist if value actually changed
                        if (newVal === oldVal) {
                          return;
                        }
                        // Persist update via hook
                        try {
                          await updateField({
                            type: 'task',
                            id: task.id,
                            input: 'estimatedEffort',
                            value: String(newVal),
                          });
                          toast.success('Estimated effort updated');
                        } catch (err) {
                          // ignore - keep UI in sync locally
                          console.error('Failed to save estimated effort', err);
                          toast.error('Failed to update estimated effort');
                        }
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          (e.target as HTMLInputElement).blur();
                        }
                        if (e.key === 'Escape') {
                          setEditedEffort(task.estimatedEffort > 0 ? task.estimatedEffort : undefined);
                          setIsEditingEffort(false);
                        }
                      }}
                      className="h-6 px-2 py-0.5 text-xs"
                      min={0}
                    />
                  </div>
                )}

                {!isEditingEffort && (
                  <Badge
                    variant="muted"
                    onClick={() => {
                      // initialize edit value from task and open editor
                      setEditedEffort(task.estimatedEffort > 0 ? task.estimatedEffort : undefined);
                      setIsEditingEffort(true);
                    }}
                    title="Click to edit estimated effort (hours)"
                  >
                    <span className="text-xs font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      {formatEffortTime(editedEffort ?? task.estimatedEffort)}
                    </span>
                  </Badge>
                )}
              </div>
            )}

            {/* Effort Progress */}
            {task.estimatedEffort > 0 && task.actualEffort > 0 && (
              <Badge variant="muted">
                <span className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
                  <BarChart3 className="h-3 w-3 flex-shrink-0" />
                  {Math.round((task.actualEffort / task.estimatedEffort) * 100)}
                  % complete
                </span>
              </Badge>
            )}

              {task.dueDate && task.status !== TaskStatus.COMPLETED && (
                <Badge variant="muted">
                  <span style={{ cursor: 'pointer' }} aria-label="Edit due date">
                    <DueDateDisplay
                      date={editedDueDate ?? task.dueDate}
                      onChange={d => handleSaveDueDate(d ?? null)}
                    />
                  </span>
                </Badge>
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
          <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:w-auto">
            <div className="flex-shrink min-w-0 ml-auto lg:ml-0">
              <TaskStatusChanger
                currentStatus={task.status}
                onStatusChange={newStatus => onUpdateTaskStatus(task.id, newStatus)}
              />
            </div>
            {task.status === TaskStatus.IN_PROGRESS && (
              <Button
                onClick={handleStartPomodoro}
                size="sm"
                className="pomodoro-button h-8 px-3 flex-shrink min-w-0 ml-auto lg:ml-0"
              >
                <Play className="h-4 w-4" />
                Pomodoro
              </Button>
            )}
          </div>
        </div>
      </div>
      <SubtasksList
        taskId={task.id}
        subtasks={subtasks}
        courseId={task.courseId}
        courseIdDueDate={task.dueDate}
        onTaskAdded={onTaskAdded}
        onEditSubtask={(subtaskId, changes) => {
          setSubtasks(prev => prev.map(sub =>
            sub.id === subtaskId ? { ...sub, ...changes } : sub,
          ));
        }}
        onDeleteSubtask={(subtaskId) => {
          setSubtasks(prev => prev.filter(s => s.id !== subtaskId));
        }}
        collapsible={false}
        defaultExpanded={false}
        isExpanded={isSubtasksExpanded}
      />
    </div>
  );
}
