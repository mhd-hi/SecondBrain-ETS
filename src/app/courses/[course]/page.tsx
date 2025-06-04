"use client";

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import type { Course } from '@/types/course';
import { TaskStatus, type Task } from '@/types/task';
import { getNextTaskStatus } from '@/lib/task/util';
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
import { ChevronDown, Plus } from "lucide-react";
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
      setCourse(data);
      setTasks(data.tasks);
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
              status: TaskStatus.PENDING
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

  // Group tasks by week
  const tasksByWeek = tasks.reduce((acc, task) => {
    const week = task.week;
    acc[week] ??= [];
    acc[week]?.push(task);
    return acc;
  }, {} as Record<number, Task[]>);

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
            <Button>
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
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{task.title}</h3>
                          {task.notes && (
                            <p className="text-sm text-muted-foreground">
                              {task.notes}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Estimated effort: {task.estimatedEffort} hours
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {task.status !== TaskStatus.COMPLETED && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateTask(task.id, { status: getNextTaskStatus(task.status) })}
                              className="text-green-600 hover:text-green-700"
                            >
                              Mark as {getNextTaskStatus(task.status)}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-2 mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium">Subtasks:</h4>
                          <div className="space-y-2">
                            {task.subtasks.map((subtask, index) => (
                              <div
                                key={index}
                                className="text-sm bg-muted/50 p-2 rounded"
                              >
                                <div className="font-medium">{subtask.title}</div>
                                {subtask.notes && (
                                  <p className="text-muted-foreground">
                                    {subtask.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No tasks found. Add a task to get started.
        </div>
      )}
    </div>
  );
} 