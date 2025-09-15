'use client';

import type { Course } from '@/types/course';
import type { TaskType } from '@/types/task';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAddTask } from '@/hooks/use-add-task';
import { TaskStatus } from '@/types/task';

type AddTaskDialogProps = {
  courseId?: string;
  courseCode?: string;
  selectedDate?: Date;
  onTaskAdded: () => void;
  trigger?: React.ReactNode;
  courses?: Course[];
};

export const AddTaskDialog = ({
  courseId,
  courseCode,
  selectedDate,
  onTaskAdded,
  trigger,
  courses,
}: AddTaskDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addTask, isLoading } = useAddTask();
  const [newTask, setNewTask] = useState(() => ({
    title: '',
    notes: '',
    estimatedEffort: 1,
    dueDate: selectedDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Today + 1 week
    type: 'theorie' as TaskType,
    status: TaskStatus.TODO,
  }));
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courseId ?? null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setSelectedCourseId(courseId ?? null);
  }, [courseId]);
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId && !selectedCourseId) {
      toast.error('Please select a course.');
      return;
    }
    const success = await addTask({
      courseId: courseId ?? selectedCourseId!,
      newTask,
    });
    if (success) {
      toast.success('Task added successfully');
      setIsOpen(false);
      setNewTask({
        title: '',
        notes: '',
        estimatedEffort: 1,
        dueDate: selectedDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Today + 1 week
        type: 'theorie' as TaskType,
        status: TaskStatus.TODO,
      });
      onTaskAdded();
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
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            {courseCode ? `Add a new task for ${courseCode}` : 'Add a new task'}
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
                  onChange={e => setSelectedCourseId(e.target.value)}
                  required={!courseId}
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map(course => (
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
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newTask.notes}
                onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                placeholder="(Optional) Add any additional notes or details about the task"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newTask.type}
                onChange={e => setNewTask({ ...newTask, type: e.target.value as TaskType })}
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
                onDateChange={date => date && setNewTask({ ...newTask, dueDate: date })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimatedEffort">Estimated Effort (hours)</Label>
              <Input
                id="estimatedEffort"
                type="number"
                step="0.25"
                value={newTask.estimatedEffort}
                onChange={e => setNewTask({ ...newTask, estimatedEffort: Number.parseFloat(e.target.value) || 1 })}
                min="0.25"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
