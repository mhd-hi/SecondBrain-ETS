'use client';

import type { Course } from '@/types/course';
import type { DropTargetData } from '@/types/drag-drop';
import type { StatusTask } from '@/types/status-task';
import type { Task as TaskType } from '@/types/task';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { AddTaskDialog } from '@/components/shared/dialogs/AddTaskDialog';
import { TaskBox } from '@/components/Task/TaskBox';

type TaskDayColumnProps = {
  date: Date;
  items: TaskType[];
  isToday: boolean;
  isSticky?: boolean;
  isDragActive?: boolean;
  onStatusChange: (taskId: string, newStatus: StatusTask) => void;
  courses: Course[];
  onItemsChange?: (items: TaskType[]) => void;
};

export const TaskDayColumn = ({
  date,
  items: tasks,
  isToday,
  isSticky = false,
  isDragActive = false,
  onStatusChange,
  courses,
  onItemsChange,
}: TaskDayColumnProps) => {
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

  const handleTaskAdded = () => {
    // Trigger a reload by calling the parent's onItemsChange
    // This is a simplified approach - in a real app you might want to be more specific
    if (onItemsChange) {
      // Force a reload by passing current tasks back
      onItemsChange(tasks);
    }
  };

  const handleTaskUpdated = () => {
    // Same as handleTaskAdded
    if (onItemsChange) {
      onItemsChange(tasks);
    }
  };

  return (
    <div
      ref={setDropRef}
      className={`
        flex flex-col min-h-[300px]
        ${isOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-dashed' : ''}
        rounded-lg
      `}
    >
      <div className={`
        ${isSticky ? 'sticky top-0 z-10' : ''}
        rounded-lg p-3 text-center border mb-2
        ${isToday
          ? 'bg-primary text-primary-foreground shadow-md border-primary'
          : 'bg-card border-border'
        }
      `}
      >
        <div className="font-semibold text-sm">
          {dayName}
        </div>
        <div className="text-xs opacity-80">
          {dayDate}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {isDragActive && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
            <div className="flex items-center gap-2 text-primary/70 text-sm">
              <span>Drop task here</span>
              <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            </div>
          </div>
        )}

        {tasks.map(task => (
          <TaskBox
            key={task.id}
            task={task}
            sourceDate={date}
            onStatusChange={onStatusChange}
            onTaskUpdated={handleTaskUpdated}
          />
        ))}

        <AddTaskDialog
          selectedDate={date}
          onTaskAdded={handleTaskAdded}
          courses={courses}
          trigger={(
            <button
              type="button"
              className="flex items-center justify-center w-full p-3 rounded-lg border border-dashed bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[70px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
          )}
        />
      </div>
    </div>
  );
};
