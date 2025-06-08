"use client";

import React from 'react';
import { MoreActionsDropdown } from "@/components/shared/atoms/more-actions-dropdown";
import { DueDateDisplay } from "@/components/shared/atoms/due-date-display";
import { SubtaskProgress } from "@/components/SubtaskProgress";
import { SubtasksList } from "@/components/SubtasksList";
import { TaskStatusChanger } from "@/components/TaskStatusChanger";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getCourseColor } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateSubtaskStatus: (taskId: string, subtaskId: string, newStatus: TaskStatus) => void;
  showCourseBadge?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    destructive?: boolean;
  }>;
}

export function TaskCard({
  task,
  onDeleteTask,
  onUpdateTaskStatus,
  onUpdateSubtaskStatus,
  showCourseBadge = false,
  actions
}: TaskCardProps) {
  const router = useRouter();
  const courseColor = task.course?.id ? getCourseColor(task.course.id) : undefined;

  const handleNavigateToTask = () => {
    if (task.course?.id) {
      router.push(`/courses/${task.course.id}#task-${task.id}`);
    }
  };

  const defaultActions = [
    {
      label: "Delete",
      onClick: () => onDeleteTask(task.id),
      destructive: true,
    },
  ];

  const cardActions = actions ?? defaultActions;  return (
    <div
      className="relative group p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
    >
      <MoreActionsDropdown
        actions={cardActions}
        triggerClassName="absolute -top-[10px] -right-[10px] z-10 opacity-0 group-hover:opacity-100"
      />      {/* Course badge at top left inside the card */}
      {showCourseBadge && task.course?.code && (
        <div className="mb-1">
          <Badge 
            variant="outline" 
            className="text-xs cursor-pointer hover:bg-muted/80 transition-colors"
            style={{ 
              borderColor: courseColor,
              color: courseColor,
              backgroundColor: courseColor ? `${courseColor}15` : undefined
            }}
            onClick={handleNavigateToTask}
          >
            {task.course.code}
          </Badge>
        </div>
      )}

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
        <div className="flex items-center gap-2">
          <TaskStatusChanger
            currentStatus={task.status}
            onStatusChange={(newStatus) => onUpdateTaskStatus(task.id, newStatus)}
          />
        </div>
      </div>

      {/* Subtasks Display - Collapsed by default */}
      <SubtasksList
        subtasks={task.subtasks ?? []}
        onSubtaskStatusChange={(subtaskId, newStatus) => 
          onUpdateSubtaskStatus(task.id, subtaskId, newStatus)
        }
        collapsible={true}
        defaultExpanded={false}
      />
    </div>
  );
}
