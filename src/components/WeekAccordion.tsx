'use client';

import { useState } from 'react';
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { TaskStatus } from "@/types/task";
import { handleApiRequest, handleApiError, handleApiSuccess } from "@/lib/api/util";

interface WeekAccordionProps {
  week: number;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

const WeekAccordion = ({ week, tasks, onTaskUpdate }: WeekAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    await handleApiRequest(
      async () => {
        await onTaskUpdate(taskId, updates);
        handleApiSuccess("Task updated successfully");
      },
      (error) => handleApiError(error, "Failed to update task"),
      "Updating task...",
      setIsLoading
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-2 flex items-center justify-between",
          "bg-gray-50 hover:bg-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 border rounded-lg bg-white"
            >
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
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
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
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