"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TaskStatus, type TaskType } from "@/types/task";
import type { Course } from "@/types/course";
import { DatePicker } from "@/components/ui/date-picker";

interface ErrorResponse {
  error?: string;
}

interface AddTaskDialogProps {
  courseId?: string;
  courseCode?: string;
  selectedDate?: Date;
  onTaskAdded: () => void;
  trigger?: React.ReactNode;
  courses?: Course[];
}

export const AddTaskDialog = ({ 
  courseId, 
  courseCode, 
  selectedDate,
  onTaskAdded,
  trigger,
  courses,
}: AddTaskDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    week: 1,
    notes: '',
    estimatedEffort: 1,
    dueDate: selectedDate ?? new Date(),
    type: 'theorie' as TaskType,
    status: TaskStatus.TODO,
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courseId ?? null);

  useEffect(() => {
    setSelectedCourseId(courseId ?? null);
  }, [courseId]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!courseId && !selectedCourseId) {
      toast.error("Please select a course.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseId ?? selectedCourseId,
          tasks: [
            {
              ...newTask,
              status: TaskStatus.TODO,
              dueDate: newTask.dueDate.toISOString(),
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error ?? 'Failed to add task');
      }

      toast.success('Task added successfully');
      setIsOpen(false);
      setNewTask({
        title: '',
        week: 1,
        notes: '',
        estimatedEffort: 1,
        dueDate: selectedDate ?? new Date(),
        type: 'theorie',
        status: TaskStatus.TODO,
      });
      onTaskAdded();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            {courseCode ? `Create a new task for ${courseCode}` : 'Create a new task'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddTask}>
          <div className="grid gap-4 py-4">
            {!courseId && courses && courses.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="course">Course</Label>
                <select
                  id="course"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedCourseId ?? ''}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  required={!courseId}
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                placeholder="Add any additional notes or details about the task"
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
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value as TaskType })}
                required
              >
                <option value="theorie">Theory</option>
                <option value="pratique">Practice</option>
                <option value="exam">Exam</option>
                <option value="homework">Homework</option>
                <option value="lab">Lab</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <DatePicker
                date={newTask.dueDate}
                onDateChange={(date) => date && setNewTask({ ...newTask, dueDate: date })}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 