"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DayColumn } from "./DayColumn";
import { Task } from "../shared/Task";
import type { Task as TaskType, TaskStatus } from "@/types/task";
import type { DraggedTask, DropTargetData } from "@/types/drag-drop";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekStart, getWeekDates, formatWeekRange } from "@/lib/date/util";
import { useCourses } from "@/contexts/courses-context";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

interface WeeklyRoadmapProps {
  initialTasks?: TaskType[];
}

export const WeeklyRoadmap = ({ initialTasks = [] }: WeeklyRoadmapProps) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use global courses context
  const { courses } = useCourses();

  // Drag and drop state
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeTask, setActiveTask] = useState<{ task: TaskType; sourceDate: Date } | null>(null);

  // Configure sensors for drag and drop
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3, // Reduced for better responsiveness
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 50, // Reduced delay for more responsive mobile experience
      tolerance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  // Load tasks for the selected week
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        console.log('Loading tasks for week offset:', weekOffset);
        const weekStart = getWeekStart(weekOffset);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        console.log('Date range:', { weekStart, weekEnd });
        const response = await fetch(`/api/tasks/weekly?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const weekTasks = await response.json() as TaskType[];
        console.log('Loaded tasks:', weekTasks);
        setTasks(weekTasks);
      } catch (error) {
        console.error("Failed to load tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    void loadTasks();
  }, [weekOffset]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status");
    }
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedData = active.data.current as DraggedTask;

    if (draggedData) {
      setActiveTask({
        task: draggedData.task,
        sourceDate: draggedData.sourceDate
      });
    }

    setIsDragActive(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setIsDragActive(false);
    setActiveTask(null);

    if (!over) return;

    const draggedData = active.data.current as DraggedTask;
    const dropData = over.data.current as DropTargetData;

    if (!draggedData || !dropData) return;

    const { task, sourceDate } = draggedData;
    const { targetDate } = dropData;

    // If moving to the same day, do nothing
    if (sourceDate.toDateString() === targetDate.toDateString()) {
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id ? { ...t, dueDate: targetDate } : t
      )
    );

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dueDate: targetDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task due date');
      }
    } catch (error) {
      // REVERT ON ERROR
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, dueDate: sourceDate } : t
        )
      );
      console.error("Failed to move task:", error);
      toast.error("Failed to move task");
    }
  };

  const handleTaskAdded = () => {
    // Reload tasks for the current week
    const weekStart = getWeekStart(weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    void fetch(`/api/tasks/weekly?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`)
      .then(response => response.json())
      .then((weekTasks: TaskType[]) => {
        setTasks(weekTasks);
      });
  };

  const weekDates = getWeekDates(weekOffset);

  // Group tasks by date
  const tasksByDate = tasks.reduce<Record<string, TaskType[]>>((acc, task) => {
    const dateKey = new Date(task.dueDate).toDateString();
    acc[dateKey] ??= [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full">
        {/* Container with background and title */}
        <div className={`
          border rounded-lg bg-muted/30
          ${isDragActive ? 'bg-muted/50 shadow-lg' : ''}
        `}>
          <div className="p-6 pb-2">
            <h2 className="text-2xl font-semibold mb-6">Weekly Roadmap</h2>
          </div>
          <div className="flex items-center justify-between w-full px-4 pb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-md px-3 py-1 text-xs"
                onClick={() => setWeekOffset(0)}
              >
                Today
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  disabled={isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  disabled={isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm font-medium">
                {weekOffset === 0 ? 'This Week' :
                  weekOffset === 1 ? 'Next Week' :
                    weekOffset === -1 ? 'Last Week' :
                      `${weekOffset > 0 ? '+' : ''}${weekOffset} Weeks`}
                <span className="text-muted-foreground ml-2">
                  ({formatWeekRange(weekDates)})
                </span>
              </span>
            </div>
          </div>
          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-7 gap-4 p-4 pt-0">
              {weekDates.map((date) => (
                <DayColumn
                  key={date.toDateString()}
                  date={date}
                  tasks={tasksByDate[date.toDateString()] ?? []}
                  onStatusChange={handleStatusChange}
                  onTaskAdded={handleTaskAdded}
                  courses={courses}
                  isToday={isToday(date)}
                  isSticky={true}
                  isDragActive={isDragActive}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <Task
            task={activeTask.task}
            sourceDate={activeTask.sourceDate}
            onStatusChange={() => { /* No-op for overlay */ }}
            isDragOverlay={true}
          />
        ) : null}
      </DragOverlay>

    </DndContext>
  );
};