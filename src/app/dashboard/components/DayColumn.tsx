"use client";

import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/types/task";
import type { Course } from "@/types/course";
import { AddTaskDialog } from "./AddTaskDialog";
import { TaskStatusChanger } from "@/components/TaskStatusChanger";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// This is the expected structure for DayColumn component
interface DayColumnProps {
  date: Date;
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskAdded: () => void;
  courses: Course[];
  isToday: boolean;
  isSticky?: boolean;
}

export const DayColumn = ({ date, tasks, onStatusChange, onTaskAdded, courses, isToday, isSticky = false }: DayColumnProps) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <TooltipProvider>
      <div className="flex flex-col">
        {/* Sticky Date Header */}
        <div className={`
          ${isSticky ? 'sticky top-0 z-10' : ''}
          rounded-lg p-3 text-center border mb-2
          ${isToday 
            ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
          }
        `}>
          <div className="font-semibold text-sm">{dayName}</div>
          <div className="text-xs opacity-75">{dayDate}</div>
        </div>
        
        {/* Tasks content */}
        <div className="flex flex-col space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                {task.course?.code && (
                  <p className="text-sm text-muted-foreground truncate">{task.course.code}</p>
                )}
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {task.estimatedEffort} hr{task.estimatedEffort !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-normal mt-1 line-clamp-4 leading-tight">{task.title}</h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{task.title}</p>
                </TooltipContent>
              </Tooltip>
              <div className="mt-2">
                <TaskStatusChanger
                  currentStatus={task.status}
                  onStatusChange={(newStatus: TaskStatus) => onStatusChange(task.id, newStatus)}
                />
              </div>
            </div>
          ))}

          <AddTaskDialog
            selectedDate={date}
            onTaskAdded={onTaskAdded}
            courses={courses}
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
    </TooltipProvider>
  );
};