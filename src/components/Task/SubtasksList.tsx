'use client';

import type { Subtask, TaskStatus } from '@/types/task';
import { CheckCircle2, ChevronDown, ChevronRight, Circle } from 'lucide-react';
import { useState } from 'react';
import { TaskStatusChanger } from '@/components/Task/TaskStatusChanger';
import { Badge } from '@/components/ui/badge';
import { useUpdateField } from '@/hooks/useUpdateField';
import { cn } from '@/lib/utils';
import { TaskStatus as TaskStatusEnum } from '@/types/task';
import { EditableField } from '../shared/EditableField';

type SubtasksListProps = {
  subtasks: Subtask[];
  onSubtaskStatusChange?: (subtaskId: string, newStatus: TaskStatus) => void;
  onEditSubtask?: (subtaskId: string, changes: Partial<Subtask>) => void;
  readonly?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
};

const SubtasksList = ({
  subtasks,
  onSubtaskStatusChange,
  onEditSubtask,
  readonly = false,
  collapsible = false,
  defaultExpanded = true,
  isExpanded: controlledIsExpanded,
  onToggleExpanded,
}: SubtasksListProps) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(defaultExpanded);

  // Use shared hook for API update

  const updateField = useUpdateField();

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledIsExpanded ?? internalIsExpanded;

  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    if (collapsible) {
      if (onToggleExpanded) {
        // Use controlled toggle
        onToggleExpanded();
      } else {
        // Use internal toggle
        setInternalIsExpanded(!internalIsExpanded);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  };

  return (
    <div id="subtasks-list" className={cn(isExpanded && 'mt-4 space-y-2')}>
      {collapsible && (
        <div
          className={cn(
            'flex items-center gap-2',
            !isExpanded && 'mt-4',
            'cursor-pointer hover:text-foreground',
          )}
          onClick={toggleExpanded}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={`Toggle subtasks section (${subtasks.length} subtasks)`}
        >
          {isExpanded
            ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            )
            : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          <h5 className="text-sm font-medium text-muted-foreground">
            Subtasks (
            {subtasks.length}
            )
          </h5>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-2 pl-4 border-l-2 border-muted">
          {subtasks.map(subtask => (
            <div
              key={subtask.id}
              className={cn(
                'flex items-start justify-between gap-4 p-3 rounded-lg border border-muted',
                'transition-colors',
                subtask.status === TaskStatusEnum.COMPLETED
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                  : 'bg-muted/30',
              )}
            >
              <div className="flex-grow space-y-1">
                <div className="flex items-center gap-2">
                  {subtask.status === TaskStatusEnum.COMPLETED
                    ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    : <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  <EditableField
                    value={subtask.title}
                    onSave={async (newTitle) => {
                      await updateField({
                        type: 'subtask',
                        id: subtask.id,
                        input: 'title',
                        value: newTitle,
                      });
                      if (onEditSubtask) {
                        onEditSubtask(subtask.id, { title: newTitle });
                      }
                    }}
                    inputType="input"
                    className={cn('text-sm font-medium', subtask.status === TaskStatusEnum.COMPLETED && 'text-muted-foreground')}
                    placeholder="Subtask title"
                  />
                  {subtask.estimatedEffort && (
                    <Badge variant="outline" className="text-xs">
                      {subtask.estimatedEffort}
                      h
                    </Badge>
                  )}
                </div>
                {typeof subtask.notes === 'string' && (
                  <EditableField
                    value={subtask.notes}
                    onSave={async (newNotes) => {
                      await updateField({
                        type: 'subtask',
                        id: subtask.id,
                        input: 'notes',
                        value: newNotes,
                      });
                      if (onEditSubtask) {
                        onEditSubtask(subtask.id, { notes: newNotes });
                      }
                    }}
                    inputType="textarea"
                    className="text-xs text-muted-foreground ml-6"
                    placeholder="Subtask notes"
                  />
                )}
              </div>
              {!readonly && onSubtaskStatusChange && (
                <div className="flex-shrink-0">
                  <TaskStatusChanger
                    currentStatus={subtask.status}
                    onStatusChange={newStatus => onSubtaskStatusChange(subtask.id, newStatus)}
                  />
                </div>
              )}
              {readonly && (
                <Badge
                  variant="secondary"
                  className="text-xs flex-shrink-0"
                >
                  {subtask.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { SubtasksList };
