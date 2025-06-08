"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { Task as TaskType, TaskStatus } from "@/types/task";
import type { Course } from "@/types/course";
import type { DropTargetData } from "@/types/drag-drop";
import { AddTaskDialog } from "../shared/dialogs/AddTaskDialog";
import { Task } from "../shared/Task";

interface DayColumnProps {
  date: Date;
  tasks: TaskType[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskAdded: () => void;
  courses: Course[];
  isToday: boolean;
  isSticky?: boolean;
  isDragActive?: boolean;
}

export const DayColumn = ({
  date,
  tasks,
  onStatusChange,
  onTaskAdded,
  courses,
  isToday,
  isSticky = false,
  isDragActive = false
}: DayColumnProps) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const dayKey = date.toDateString();

  const dropData: DropTargetData = {
    targetDate: date,
    dayKey,
  };

  const {
    isOver,
    setNodeRef: setDropRef,
  } = useDroppable({
    id: dayKey,
    data: dropData,
  });

  return (
    <div
      ref={setDropRef}
      className={`
        flex flex-col min-h-[300px]
        ${isOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-dashed' : ''}
        rounded-lg
      `}
    >
      {/* Sticky Date Header */}
      <div className={`
        ${isSticky ? 'sticky top-0 z-10' : ''}
        rounded-lg p-3 text-center border mb-2
        ${isToday
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-muted text-muted-foreground border-border'
        }
      `}>
        <div className="font-semibold text-sm">{dayName}</div>
        <div className="text-xs opacity-75">{dayDate}</div>
      </div>
      <div className={`
        flex flex-col space-y-2 flex-1 p-2 rounded-lg relative
        ${isOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''}
        ${isDragActive ? 'bg-muted/30' : ''}
      `}>
        {/* Drop indicator when dragging over */}
        {isOver && (
          <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 text-center text-primary/70 text-sm animate-pulse bg-primary/5">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
              <span>Drop task here</span>
              <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            </div>
          </div>
        )}

        {tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            sourceDate={date}
            onStatusChange={onStatusChange}
          />
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
  );
};
