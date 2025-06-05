"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/types/task";
import { AddTaskDialog } from "./AddTaskDialog";

interface DayColumnProps {
  date: Date;
  tasks: Task[];
  onStatusChange: (taskId: string, currentStatus: TaskStatus) => void;
  onTaskAdded: () => void;
}

export const DayColumn = ({ date, tasks, onStatusChange, onTaskAdded }: DayColumnProps) => {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-4 group">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </div>

      <div className="space-y-2 flex-grow">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-grow">
                <Badge variant="secondary" className="text-xs">
                  {task.estimatedEffort} min
                </Badge>
                <h3 className="font-medium">{task.title}</h3>
                {task.course?.code && (
                  <p className="text-sm text-muted-foreground">{task.course.code}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onStatusChange(task.id, task.status)}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <AddTaskDialog
          selectedDate={date}
          onTaskAdded={onTaskAdded}
          trigger={
            <button
              className="flex items-center justify-center w-full p-3 rounded-lg border border-dashed bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[70px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
          }
        />
      </div>
    </div>
  );
}; 