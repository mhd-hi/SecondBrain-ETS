'use client';
import type { Course } from '@/types/course';

import type { Daypart } from '@/types/study-block';
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
import { Label } from '@/components/ui/label';
import { useStudyBlock } from '@/hooks/use-study-block';
import { useCalendarViewStore } from '@/lib/stores/calendar-view-store';

type AddStudyBlockDialogProps = {
  selectedDate?: Date;
  onStudyBlockAdded: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  courses: Course[];
};

export const AddStudyBlockDialog = ({
  selectedDate: selectedDateProp,
  onStudyBlockAdded,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  courses,
}: AddStudyBlockDialogProps) => {
  // Use global selectedDate if prop not provided
  const globalSelectedDate = useCalendarViewStore(state => state.selectedDate);
  const selectedDate = selectedDateProp !== undefined ? selectedDateProp : globalSelectedDate;
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (externalOnOpenChange) {
      // Controlled mode: delegate to external handler
      externalOnOpenChange(open);
    } else {
      // Uncontrolled mode: update internal state
      setInternalOpen(open);
    }
  };

  const { addStudyBlock, isLoading } = useStudyBlock();

  const [studyBlockData, setStudyBlockData] = useState(() => ({
    daypart: 'AM' as Daypart,
    startAt: selectedDate ?? new Date(),
    endAt: selectedDate ? new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000) : new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
    selectedCourseIds: [] as string[],
  }));

  useEffect(() => {
    if (selectedDate) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setStudyBlockData(prev => ({
        ...prev,
        startAt: selectedDate,
        endAt: new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000),
      }));
    }
  }, [selectedDate]);

  const handleAddStudyBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studyBlockData.selectedCourseIds.length === 0) {
      toast.error('Please select at least one course.');
      return;
    }

    const success = await addStudyBlock({
      daypart: studyBlockData.daypart,
      startAt: studyBlockData.startAt,
      endAt: studyBlockData.endAt,
      courseIds: studyBlockData.selectedCourseIds,
    });

    if (success) {
      toast.success('Study block added successfully');
      setIsOpen(false);
      setStudyBlockData({
        daypart: 'AM' as Daypart,
        startAt: selectedDate ?? new Date(),
        endAt: selectedDate ? new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000) : new Date(Date.now() + 2 * 60 * 60 * 1000),
        selectedCourseIds: [],
      });
      onStudyBlockAdded();
    }
  };

  const handleCourseToggle = (courseId: string) => {
    setStudyBlockData(prev => ({
      ...prev,
      selectedCourseIds: prev.selectedCourseIds.includes(courseId)
        ? prev.selectedCourseIds.filter(id => id !== courseId)
        : [...prev.selectedCourseIds, courseId],
    }));
  };

  const updateStartTime = (hour: number, minute: number) => {
    const newStartAt = new Date(studyBlockData.startAt);
    newStartAt.setHours(hour, minute);
    setStudyBlockData({ ...studyBlockData, startAt: newStartAt });
  };

  const updateEndTime = (hour: number, minute: number) => {
    const newEndAt = new Date(studyBlockData.endAt);
    newEndAt.setHours(hour, minute);
    setStudyBlockData({ ...studyBlockData, endAt: newEndAt });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Study Block
          </Button>
        )}
      </DialogTrigger>
      <DialogContent aria-describedby="add-study-block-description">
        <DialogHeader>
          <DialogTitle>Add Study Block</DialogTitle>
          <DialogDescription id="add-study-block-description">
            Create a focused study session with multiple courses
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddStudyBlock}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Start Date & Time</Label>
              <div className="flex gap-2">
                <DatePicker
                  date={studyBlockData.startAt}
                  onDateChange={date => date && setStudyBlockData({
                    ...studyBlockData,
                    startAt: new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      studyBlockData.startAt.getHours(),
                      studyBlockData.startAt.getMinutes(),
                    ),
                    endAt: new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      studyBlockData.endAt.getHours(),
                      studyBlockData.endAt.getMinutes(),
                    ),
                  })}
                />
                <div className="flex gap-1">
                  <select
                    className="flex h-10 w-16 rounded-md border border-input bg-background px-2 py-2 text-sm"
                    value={studyBlockData.startAt.getHours()}
                    onChange={e => updateStartTime(Number(e.target.value), studyBlockData.startAt.getMinutes())}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  :
                  <select
                    className="flex h-10 w-16 rounded-md border border-input bg-background px-2 py-2 text-sm"
                    value={studyBlockData.startAt.getMinutes()}
                    onChange={e => updateStartTime(studyBlockData.startAt.getHours(), Number(e.target.value))}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>End Date & Time</Label>
              <div className="flex gap-2">
                <DatePicker
                  date={studyBlockData.endAt}
                  onDateChange={date => date && setStudyBlockData({
                    ...studyBlockData,
                    endAt: new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      studyBlockData.endAt.getHours(),
                      studyBlockData.endAt.getMinutes(),
                    ),
                  })}
                />
                <div className="flex gap-1">
                  <select
                    className="flex h-10 w-16 rounded-md border border-input bg-background px-2 py-2 text-sm"
                    value={studyBlockData.endAt.getHours()}
                    onChange={e => updateEndTime(Number(e.target.value), studyBlockData.endAt.getMinutes())}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  :
                  <select
                    className="flex h-10 w-16 rounded-md border border-input bg-background px-2 py-2 text-sm"
                    value={studyBlockData.endAt.getMinutes()}
                    onChange={e => updateEndTime(studyBlockData.endAt.getHours(), Number(e.target.value))}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Courses</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                {courses && courses.length > 0
                  ? courses.map(course => (
                      <label key={course.id} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={studyBlockData.selectedCourseIds.includes(course.id)}
                          onChange={() => handleCourseToggle(course.id)}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {course.code}
                          {' - '}
                          {course.name}
                        </span>
                      </label>
                    ))
                  : (
                      <p className="text-sm text-muted-foreground">No courses available</p>
                    )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Study Block'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
