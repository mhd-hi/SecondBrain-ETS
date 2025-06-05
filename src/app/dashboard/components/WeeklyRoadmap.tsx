"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DayColumn } from "./DayColumn";
import type { Task, TaskStatus } from "@/types/task";
import { getNextTaskStatus } from "@/lib/task/utils";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyRoadmapProps {
  initialTasks?: Task[];
}

export const WeeklyRoadmap = ({ initialTasks = [] }: WeeklyRoadmapProps) => {
  const [weekOffset, setWeekOffset] = useState(0); // 0 is current week, -1 is last week, 1 is next week, etc.
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);

  // Get the start of the current week (Sunday)
  const getWeekStart = (weekOffset: number) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + weekOffset * 7);
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

  const handleStatusChange = async (taskId: string, currentStatus: TaskStatus) => {
    try {
      const nextStatus = getNextTaskStatus(currentStatus);
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: nextStatus } : task
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

  console.log('Rendering WeeklyRoadmap with tasks:', tasks);
  console.log('Tasks by date:', tasksByDate);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-2xl font-bold">Weekly Roadmap</h2>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset(prev => prev - 1)}
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {weekOffset === 0 ? 'This Week' : 
             weekOffset === 1 ? 'Next Week' :
             weekOffset === -1 ? 'Last Week' :
             `${weekOffset > 0 ? '+' : ''}${weekOffset} Weeks`}
            <span className="text-muted-foreground ml-2">
              ({formatWeekRange(weekDates)})
            </span>
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset(prev => prev + 1)}
            disabled={isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 w-full">
        {weekDates.map((date) => (
          <DayColumn
            key={date.toDateString()}
            date={date}
            tasks={tasksByDate[date.toDateString()] ?? []}
            onStatusChange={handleStatusChange}
            onTaskAdded={handleTaskAdded}
          />
        ))}
      </div>
    </div>
  );
}; 