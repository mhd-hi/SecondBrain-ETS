'use client';

import { useState } from 'react';
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { TaskStatus } from "@/types/task";
import { withLoadingAndErrorHandling } from "@/lib/loading/util";
import { ErrorHandlers, CommonErrorMessages } from "@/lib/error/util";
import { SubtasksList } from "@/components/SubtasksList";

interface WeekAccordionProps {
  week: number;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

const WeekAccordion = ({ week, tasks, onTaskUpdate }: WeekAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    const result = await withLoadingAndErrorHandling(
      async () => {
        await onTaskUpdate(taskId, updates);
      },
      setIsLoading,
      (error) => ErrorHandlers.api(error, CommonErrorMessages.TASK_UPDATE_FAILED, 'WeekAccordion')
    );
    
    return result;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}        className={cn(
          "w-full px-4 py-2 flex items-center justify-between",
          "bg-muted hover:bg-muted/80",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
        aria-expanded={isOpen}
      >
        <span className="font-medium">Week {week}</span>
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          {tasks.map((task) => (            <div
              key={task.id}
              className="p-4 border rounded-lg bg-white"
            >
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{task.notes}</p>
              
              {/* Subtasks Display (readonly in this context) */}
              <SubtasksList
                subtasks={task.subtasks ?? []}
                readonly={true}
              />
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleTaskUpdate(task.id, { status: TaskStatus.TODO })}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={isLoading}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleTaskUpdate(task.id, { status: TaskStatus.DRAFT })}
                  className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80"
                  disabled={isLoading}
                >
                  Modify
                </button>
                <button
                  onClick={() => handleTaskUpdate(task.id, { status: TaskStatus.DRAFT })}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { WeekAccordion };