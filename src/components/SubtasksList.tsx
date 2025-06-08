'use client';

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { TaskStatusChanger } from "@/components/TaskStatusChanger";
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Subtask, TaskStatus } from "@/types/task";
import { TaskStatus as TaskStatusEnum } from "@/types/task";

interface SubtasksListProps {
  subtasks: Subtask[];
  onSubtaskStatusChange?: (subtaskId: string, newStatus: TaskStatus) => void;
  readonly?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const SubtasksList = ({ 
  subtasks, 
  onSubtaskStatusChange, 
  readonly = false, 
  collapsible = false,
  defaultExpanded = true,
  isExpanded: controlledIsExpanded,
  onToggleExpanded
}: SubtasksListProps) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(defaultExpanded);
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

  return (
    <div className="mt-4 space-y-2">
      <div 
        className={cn(
          "flex items-center gap-2",
          collapsible && "cursor-pointer hover:text-foreground"
        )}
        onClick={toggleExpanded}
      >
        {collapsible && (
          isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )
        )}
        <h5 className="text-sm font-medium text-muted-foreground">
          Subtasks ({subtasks.length})
        </h5>
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className="space-y-2 pl-4 border-l-2 border-muted">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={cn(
                "flex items-start justify-between gap-4 p-3 rounded-lg border border-muted",
                "transition-colors",
                subtask.status === TaskStatusEnum.COMPLETED 
                  ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                  : "bg-muted/30"
              )}
            >
              <div className="flex-grow space-y-1">
                <div className="flex items-center gap-2">
                  {subtask.status === TaskStatusEnum.COMPLETED ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <h6 className={cn(
                    "text-sm font-medium",
                    subtask.status === TaskStatusEnum.COMPLETED && "line-through text-muted-foreground"
                  )}>
                    {subtask.title}
                  </h6>
                  {subtask.estimatedEffort && (
                    <Badge variant="outline" className="text-xs">
                      {subtask.estimatedEffort}h
                    </Badge>
                  )}
                </div>
                {subtask.notes && (
                  <p className="text-xs text-muted-foreground ml-6">{subtask.notes}</p>
                )}
              </div>
              {!readonly && onSubtaskStatusChange && (
                <div className="flex-shrink-0">
                  <TaskStatusChanger
                    currentStatus={subtask.status}
                    onStatusChange={(newStatus) => onSubtaskStatusChange(subtask.id, newStatus)}
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
