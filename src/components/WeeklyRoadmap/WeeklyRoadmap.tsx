'use client';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { TransitionState } from '@/lib/ui-transitions/util';
import type { DraggedTask, DropTargetData } from '@/types/drag-drop';
import type { Task as TaskType } from '@/types/task';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Task } from '@/components/Task/Task';
import { useCoursesContext } from '@/contexts/use-courses';
import { fetchWeeklyTasks } from '@/hooks/use-task';
import { getWeekDates, getWeekStart } from '@/lib/date/util';
import {
  createTransitionState,
  getTransitionClasses,
  getTransitionDirection,
  getTransitionDirectionFromOffset,
  resetTransitionState,
} from '@/lib/ui-transitions/util';
import { TaskStatus } from '@/types/task-status';
import { DayColumn } from './DayColumn';
import { NavigationControls } from './NavigationControls';

type WeeklyRoadmapProps = {
  initialTasks?: TaskType[];
};

const DEFAULT_INITIAL_TASKS: TaskType[] = [];

export const WeeklyRoadmap = ({ initialTasks = DEFAULT_INITIAL_TASKS }: WeeklyRoadmapProps) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [transitionState, setTransitionState] = useState<TransitionState>(() => createTransitionState());

  // Use global courses context
  const { courses } = useCoursesContext();

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

  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      setTransitionState(prev => ({ ...prev, isTransitioning: true }));

      try {
        const weekStart = getWeekStart(weekOffset);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const weekTasks = await fetchWeeklyTasks(weekStart, weekEnd);

        // Shorter delay for more responsive feel
        const timeoutId = setTimeout(() => {
          setTasks(weekTasks);
          setIsLoading(false);
          setTransitionState(resetTransitionState());
        }, 100);

        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        toast.error('Failed to load tasks');
        setIsLoading(false);
        setTransitionState(resetTransitionState());
      }
    };

    void loadTasks();
  }, [weekOffset]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const transitionDirection = getTransitionDirection(direction);
    setTransitionState({ isTransitioning: true, direction: transitionDirection });
    setWeekOffset(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const handleTodayClick = () => {
    const currentOffset = weekOffset;
    if (currentOffset === 0) {
      return;
    }

    const transitionDirection = getTransitionDirectionFromOffset(currentOffset, 0);
    setTransitionState({ isTransitioning: true, direction: transitionDirection });
    setWeekOffset(0);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update - update UI immediately
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');

      // Rollback optimistic update on error
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: tasks.find(t => t.id === taskId)?.status || TaskStatus.TODO }
            : task,
        ),
      );
    }
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedData = active.data.current as DraggedTask;

    if (draggedData) {
      setActiveTask({
        task: draggedData.task,
        sourceDate: draggedData.sourceDate,
      });
    }

    setIsDragActive(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setIsDragActive(false);
    setActiveTask(null);

    if (!over) {
      return;
    }

    const draggedData = active.data.current as DraggedTask;
    const dropData = over.data.current as DropTargetData;

    if (!draggedData || !dropData) {
      return;
    }

    const { task, sourceDate } = draggedData;
    const { targetDate } = dropData;

    // If moving to the same day, do nothing
    if (sourceDate.toDateString() === targetDate.toDateString()) {
      return;
    }

    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, dueDate: targetDate } : t,
      ),
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
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id ? { ...t, dueDate: sourceDate } : t,
        ),
      );
      console.error('Failed to move task:', error);
      toast.error('Failed to move task');
    }
  };

  const handleTaskAdded = async () => {
    // Reload tasks for the current week
    const weekStart = getWeekStart(weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    try {
      const weekTasks = await fetchWeeklyTasks(weekStart, weekEnd);
      setTasks(weekTasks);
    } catch (error) {
      console.error('Failed to reload tasks:', error);
      toast.error('Failed to reload tasks');
    }
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
        {/* Navigation Controls */}
        <NavigationControls
          weekDates={weekDates}
          isLoading={isLoading}
          onWeekChange={handleWeekChange}
          onTodayClick={handleTodayClick}
        />

        {/* Calendar Container */}
        <div className={`
          bg-card rounded-lg transition-all duration-300 py-5
          ${isDragActive ? 'bg-muted/50 shadow-lg' : ''}
        `}
        >
          <div className={`grid grid-cols-7 gap-4 px-4 transition-all duration-200 ease-out ${getTransitionClasses(transitionState)}`}>
            {weekDates.map(date => (
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
      <DragOverlay dropAnimation={null}>
        {activeTask
          ? (
            <Task
              task={activeTask.task}
              sourceDate={activeTask.sourceDate}
              onStatusChange={() => { /* No-op for overlay */ }}
              isDragOverlay={true}
            />
          )
          : null}
      </DragOverlay>

    </DndContext>
  );
};
