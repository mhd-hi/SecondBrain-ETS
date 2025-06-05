"use client";

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import type { Course } from '@/types/course';
import { TaskStatus, type Task, type TaskType } from '@/types/task';
import { getNextTaskStatus, calculateTaskDueDate } from '@/lib/task/util';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CoursePageProps {
  params: Promise<{
    course: string;
  }>;
}

interface CourseResponse extends Course {
  tasks: Task[];
}

// Helper to format Date to YYYY-MM-DD string for input value
const formatDateToInput = (date: Date | string | null | undefined): string => {
    console.log('formatDateToInput received:', date, typeof date); // Log input
    if (!date) return '';
    // Explicitly convert to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
        console.error('formatDateToInput: Invalid Date object created from:', date);
        return ''; // Return empty string if date is invalid
    }
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.course;
  const [course, setCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    week: 1,
    notes: '',
    estimatedEffort: 1,
    dueDate: undefined as Date | undefined,
    type: 'theorie' as TaskType,
  });

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json() as Course[];
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      toast.error('Error loading courses', {
        description: 'Please try refreshing the page',
      });
    }
  }, []);

  const fetchCourse = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      const data = await response.json() as CourseResponse;

      // Convert dueDate strings to Date objects and handle invalid dates
      const tasksWithValidatedDates: Task[] = data.tasks.map(task => {
          let dueDate: Date;
          // Attempt to create Date from fetched dueDate
          const fetchedDate = task.dueDate ? new Date(task.dueDate) : undefined;

          // If fetched dueDate is invalid or missing, calculate based on week
          if (!fetchedDate || isNaN(fetchedDate.getTime())) {
              // Fallback: calculate dueDate based on week if original is invalid or missing
              dueDate = calculateTaskDueDate(task.week);
          } else {
              // Otherwise, use the valid fetched date
              dueDate = fetchedDate;
          }

          return {
              ...task,
              dueDate: dueDate, // Ensure dueDate is always a Date
          } as Task; // Cast to Task to match state type
      });

      setCourse(data);
      setTasks(tasksWithValidatedDates);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course data');
      toast.error('Error loading course', {
        description: 'Please try refreshing the page',
      });
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void fetchCourses();
    void fetchCourse();
  }, [courseId, fetchCourse, fetchCourses]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          tasks: [
            {
              ...newTask,
              status: TaskStatus.PENDING,
              dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : undefined,
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      toast.success('Task added successfully');
      setIsAddTaskOpen(false);
      setNewTask({
        title: '',
        week: 1,
        notes: '',
        estimatedEffort: 1,
        dueDate: undefined,
        type: 'theorie',
      });
      await fetchCourse();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task', {
        description: 'An error occurred while adding the task',
      });
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      toast.success('Task updated successfully');
      await fetchCourse();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task', {
        description: 'An error occurred while updating the task',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      toast.success('Task deleted successfully');
      await fetchCourse();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task', {
        description: 'An error occurred while deleting the task',
      });
    }
  };

  // Group tasks by week
  const tasksByWeek = tasks.reduce((acc, task) => {
    const week = task.week;
    acc[week] ??= [];
    acc[week]?.push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/")}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {!isLoading && courses.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[300px] h-12 text-lg font-bold justify-between">
                  {course.code}
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[300px]">
                {courses.map((c) => {
                  const pendingTasks = c.tasks?.filter(task => task.status === TaskStatus.DRAFT).length ?? 0;
                  return (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => router.push(`/courses/${c.id}`)}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-lg font-medium">{c.code}</span>
                      {pendingTasks > 0 && (
                        <span className="text-sm text-destructive">
                          {pendingTasks} pending
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for {course.code}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTask}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="week">Week</Label>
                  <Input
                    id="week"
                    type="number"
                    min="1"
                    max="15"
                    value={newTask.week}
                    onChange={(e) => setNewTask({ ...newTask, week: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                        id="dueDate"
                        type="date"
                        value={formatDateToInput(newTask.dueDate)}
                        onChange={(e) => {
                            const dateValue = e.target.value;
                            setNewTask({ 
                                ...newTask,
                                dueDate: dateValue ? new Date(dateValue + 'T00:00:00') : undefined  // Append time to ensure correct Date object creation
                            });
                        }}
                    />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newTask.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTask({ ...newTask, notes: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="effort">Estimated Effort (hours)</Label>
                  <Input
                    id="effort"
                    type="number"
                    min="0"
                    step="0.1"
                    value={newTask.estimatedEffort === 0 ? '' : newTask.estimatedEffort}
                    onChange={e => {
                      const value = e.target.value;
                      setNewTask({
                        ...newTask,
                        estimatedEffort: value === '' ? 0 : parseFloat(value)
                      });
                    }}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="text-center text-muted-foreground mb-4">
            Loading tasks...
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(tasksByWeek)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([week, weekTasks]) => (
              <section key={week} className="space-y-4">
                <h2 className="text-2xl font-semibold">Week {week}</h2>
                <div className="grid gap-4">
                  {weekTasks.map((task) => (
                    <div
                      key={task.id}
                      className="text-card-foreground rounded-lg border bg-card p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{task.title}</h3>
                        <div className="flex items-center gap-2">
                           {task.dueDate && (
                              <span className="text-sm text-muted-foreground">
                                Due: {formatDateToInput(task.dueDate)}
                              </span>
                           )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateTask(task.id, { status: getNextTaskStatus(task.status) })}>
                              Mark as {getNextTaskStatus(task.status)}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {task.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{task.notes}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span>Type: {task.type}</span>
                      <span>Effort: {task.estimatedEffort}h</span>
                      <span>Status: {task.status}</span>
                    </div>

                  {task.subtasks && task.subtasks.length > 0 && (
                     <div className="mt-4 border-t pt-4">
                         <h4 className="text-md font-medium mb-2">Subtasks</h4>
                         <ul className="space-y-2">
                            {task.subtasks.map(subtask => (
                                <li key={subtask.id} className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{subtask.title}</span>
                                    <span>{subtask.status}</span>
                                </li>
                            ))}
                           </ul>
                       </div>
                    )}

                    </div>
                  ))
                }
              </div>
            </section>
          ))
        }
      </div>
    )
   : (
        <div className="text-center text-muted-foreground">
          No tasks found. Add a task to get started.
        </div>
      )}
    </div>
  );
} 