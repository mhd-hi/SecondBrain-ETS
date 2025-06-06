"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DayColumn } from "./DayColumn";
import type { Task, TaskStatus } from "@/types/task";
import type { Course } from "@/types/course";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyRoadmapProps {
  initialTasks?: Task[];
}

export const WeeklyRoadmap = ({ initialTasks = [] }: WeeklyRoadmapProps) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const coursesData = await response.json() as Course[];
        console.log('Fetched courses in WeeklyRoadmap:', coursesData);
        setCourses(coursesData);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error("Failed to load courses");
      }
    };

    void fetchCourses();
  }, []);

  // Get the start of the current week (Monday)
  const getWeekStart = (weekOffset: number) => {
    const now = new Date();
    const start = new Date(now);
    // Get Monday as the start of the week
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday (1) to be our week start
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, otherwise go to Monday
    start.setDate(now.getDate() + daysToMonday + weekOffset * 7);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // Generate array of dates for the week
  const getWeekDates = (weekOffset: number) => {
    const start = getWeekStart(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

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
        const weekTasks = await response.json() as Task[];
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

  const handleTaskAdded = () => {
    // Reload tasks for the current week
    const weekStart = getWeekStart(weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    void fetch(`/api/tasks/weekly?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`)
      .then(response => response.json())
      .then((weekTasks: Task[]) => {
        setTasks(weekTasks);
      });
  };

  const weekDates = getWeekDates(weekOffset);

  // Group tasks by date
  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const dateKey = new Date(task.dueDate).toDateString();
    acc[dateKey] ??= [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  // Format week range for display
  const formatWeekRange = (dates: Date[]) => {
    if (dates.length === 0) return '';
    const start = dates[0]!;
    const end = dates[dates.length - 1]!;
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  console.log('Rendering WeeklyRoadmap with tasks:', tasks);
  console.log('Tasks by date:', tasksByDate);

  return (
    <div className="w-full space-y-4">
      {/* Navigation stays outside the scrollable container */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {/* Today button - moved before arrow buttons */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-md px-3 py-1 text-xs"
            onClick={() => setWeekOffset(0)}
          >
            Today
          </Button>

          {/* Circular navigation buttons */}
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

          {/* Week display */}
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

      {/* Scrollable container with sticky headers */}
      <div className="border rounded-lg bg-muted/30 h-[calc(100vh-200px)] overflow-y-auto">
        <div className="grid grid-cols-7 gap-4 p-4">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};