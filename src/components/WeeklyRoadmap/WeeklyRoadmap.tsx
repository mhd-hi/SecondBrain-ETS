'use client';

import type { DraggedTask } from '@/types/drag-drop';

import type { StatusTask } from '@/types/status-task';
import type { Task as TaskType } from '@/types/task';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { ClientContainer } from '@/calendar/components/client-container';
import { CalendarProvider } from '@/calendar/contexts/calendar-context';
import { SelectedDateProvider } from '@/calendar/contexts/selected-date-context';
import { TaskBox } from '@/components/Task/TaskBox';
import { WeeklyCalendar } from '@/components/ui/weekly-calendar';
import { NavigationControls } from '@/components/WeeklyRoadmap/NavigationControls';
import { TaskDayColumn } from '@/components/WeeklyRoadmap/TaskDayColumn';
import { useCoursesContext } from '@/contexts/use-courses';
import { fetchWeeklyTasks, updateDueDateTask, updateStatusTask } from '@/hooks/use-task';
import { getWeekDates } from '@/lib/utils/date-util';

type WeeklyRoadmapProps = {
  initialTasks?: TaskType[];
};

const DEFAULT_INITIAL_TASKS: TaskType[] = [];

export const WeeklyRoadmap = React.memo<WeeklyRoadmapProps>(({ initialTasks = DEFAULT_INITIAL_TASKS }) => {
  // Use global courses context
  const { courses } = useCoursesContext();

  // Calendar demo state
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDateState] = useState(() => new Date());

  const setSelectedDate = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDateState(date);
    }
  }, []);

  const handleStatusChange = useCallback(async (taskId: string, newStatus: StatusTask) => {
    try {
      await updateStatusTask(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
      throw error;
    }
  }, []);

  const handleTaskMoved = useCallback(async (task: TaskType, sourceDate: Date, targetDate: Date): Promise<TaskType> => {
    try {
      await updateDueDateTask(task.id, targetDate);
      return { ...task, dueDate: targetDate };
    } catch (error) {
      console.error('Failed to move task:', error);
      toast.error('Failed to move task');
      throw error;
    }
  }, []);

  const fetchTasks = useCallback(async (weekStart: Date, weekEnd: Date): Promise<TaskType[]> => {
    try {
      return await fetchWeeklyTasks(weekStart, weekEnd);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
      throw error;
    }
  }, []);

  const renderDragOverlay = useCallback((dragData: unknown) => {
    if (!dragData || typeof dragData !== 'object') {
      return null;
    }

    // Handle the DraggedTask structure from TaskBox
    const draggedTask = dragData as DraggedTask;
    if (!draggedTask.task) {
      return null;
    }

    return (
      <TaskBox
        task={draggedTask.task}
        sourceDate={draggedTask.sourceDate}
        onStatusChange={() => { /* No-op for overlay */ }}
        isDragOverlay={true}
      />
    );
  }, []);

  // Calendar demo handlers
  const handleWeekChange = useCallback((direction: 'prev' | 'next') => {
    setWeekOffset(prev => direction === 'prev' ? prev - 1 : prev + 1);
  }, []);

  const handleTodayClick = useCallback(() => {
    setWeekOffset(0);
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  const weekDates = getWeekDates(weekOffset);

  return (
    <>
      <WeeklyCalendar<TaskType>
        initialItems={initialTasks}
        fetchItems={fetchTasks}
        onItemMoved={handleTaskMoved}
        renderDayColumn={props => (
          <TaskDayColumn
            {...props}
            onStatusChange={handleStatusChange}
            courses={courses}
          />
        )}
        renderDragOverlay={renderDragOverlay}
        enableDragDrop={true}
      />

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Time Block Calendar Demo</h2>
        <div className="bg-card w-full rounded-lg">
          <NavigationControls
            weekDates={weekDates}
            isLoading={false}
            onWeekChange={handleWeekChange}
            onTodayClick={handleTodayClick}
          />
          <SelectedDateProvider selectedDate={selectedDate} setSelectedDate={setSelectedDate}>
            <CalendarProvider events={[]}>
              <ClientContainer view="week" />
            </CalendarProvider>
          </SelectedDateProvider>
        </div>
      </div>

    </>
  );
});
