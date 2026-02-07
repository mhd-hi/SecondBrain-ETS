'use client';

import type { Task } from '@/types/task';
import { BarChart3, Clock, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ActionsDropdown } from '@/components/shared/atoms/actions-dropdown';
import { DueDateDisplay } from '@/components/shared/atoms/due-date-display';
import { AddSubtaskDialog } from '@/components/shared/dialogs/AddSubtaskDialog';
import { StatusTaskChanger } from '@/components/Task/StatusTaskChanger';
import { SubtasksList } from '@/components/Task/SubtasksList';
import { SubtasksPill } from '@/components/Task/SubtasksPill';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { useUpdateField } from '@/hooks/use-update-field';
import { getCoursePath, getPomodoroPath } from '@/lib/routes';
import { cn, formatEffortTime } from '@/lib/utils';
import { StatusTask } from '@/types/status-task';
import { TASK_TYPE_OPTIONS } from '@/types/task';
import { CourseCodeBadge } from '../shared/atoms/CourseCodeBadge';
import { EditableField } from '../shared/EditableField';

type TaskCardProps = {
  task: Task;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatusTask: (taskId: string, newStatus: StatusTask) => void;
  className?: string;
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
  onUpdateStatusTask,
  className,
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

  // State for type dropdown (Radix handles open/close)
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [editedType, setEditedType] = useState(task.type);

  // Save handler for type
  const handleSaveType = async (newType: string) => {
    setEditedType(newType as Task['type']);
    setIsTypeDropdownOpen(false); // Always close dropdown on select
    if (newType !== task.type) {
      await updateField({
        type: 'task',
        id: task.id,
        input: 'type',
        value: newType,
      });
      toast.success('Task type updated');
    }
  };

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

  const isCompleted = task.status === StatusTask.COMPLETED;

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
      router.push(`${getCoursePath(task.course.id)}#task-${task.id}`);
    }
  };

  const handleStartPomodoro = () => {
    router.push(`${getPomodoroPath(task.id)}`);
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
      'relative group p-2 rounded-lg border bg-card text-card-foreground shadow-sm transition-colors',
      isCompleted && 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
      className,
    )}
    >
      <ActionsDropdown
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
        <div className="ml-1 mb-1">
          <CourseCodeBadge
            course={task.course}
            onClick={handleNavigateToTask}
          />
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1 min-w-0 w-full md:w-auto">
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
          <div className="flex items-center gap-3 mt-2">
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

            {/* Task Type (Radix dropdown, portaled) */}
            <DropdownMenu open={isTypeDropdownOpen} onOpenChange={setIsTypeDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="muted"
                  className="cursor-pointer select-none"
                  title="Click to change task type"
                >
                  <span className="text-xs font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    {TASK_TYPE_OPTIONS.find(opt => opt.value === editedType)?.label ?? editedType}
                  </span>
                </Badge>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="min-w-32 p-1">
                {TASK_TYPE_OPTIONS.map(opt => (
                  <DropdownMenuItem
                    key={opt.value}
                    // Radix prefers onSelect; it also closes the menu automatically
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSaveType(opt.value);
                    }}
                    className={cn(
                      'text-xs cursor-pointer',
                      editedType === opt.value && 'font-semibold text-primary',
                    )}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Effort Time (editable) */}
            {((task.estimatedEffort >= 0) || editedEffort) && (
              <div>
                {isEditingEffort && (
                  <div ref={inputContainerRef} className="w-16 max-w-18">
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
                      <Clock className="h-3 w-3 shrink-0" />
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
                  <BarChart3 className="h-3 w-3 shrink-0" />
                  {Math.round((task.actualEffort / task.estimatedEffort) * 100)}
                  % complete
                </span>
              </Badge>
            )}

              <Badge variant="muted" className="overflow-visible">
                <span aria-label="Edit due date" className="block w-full min-w-0">
                  <DueDateDisplay
                    date={editedDueDate ?? task.dueDate ?? null}
                    onChange={d => handleSaveDueDate(d ?? null)}
                  />
                </span>
              </Badge>
          </div>
        </div>

        <div
          className={cn(
            // Row, wrap, full width on mobile, auto on desktop
            'flex flex-row flex-wrap gap-2 w-full items-start',
            'md:flex-col md:items-end md:w-auto md:mr-2',
          )}
        >
          <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:w-auto">
            <div className="shrink min-w-0 ml-auto">
              <StatusTaskChanger
                currentStatus={task.status}
                onStatusChange={newStatus => onUpdateStatusTask(task.id, newStatus)}
              />
            </div>
            {task.status === StatusTask.IN_PROGRESS && (
              <Button
                onClick={handleStartPomodoro}
                size="sm"
                className="pomodoro-button h-8 px-3 shrink min-w-0 ml-auto"
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
