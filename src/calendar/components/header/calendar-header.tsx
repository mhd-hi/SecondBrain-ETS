import { CalendarRange, Columns, Grid2x2, Grid3x3, List, Plus } from 'lucide-react';

import { useState } from 'react';
import { DateNavigator } from '@/calendar/components/header/date-navigator';
import { TodayButton } from '@/calendar/components/header/today-button';
import { useCalendarViewStore } from '@/calendar/contexts/calendar-view-store';

import { AddStudyBlockDialog } from '@/components/shared/dialogs/AddStudyBlockDialog';
import { AddTaskDialog } from '@/components/shared/dialogs/AddTaskDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCoursesContext } from '@/contexts/use-courses';

export function CalendarHeader() {
  const view = useCalendarViewStore(state => state.view);
  const setView = useCalendarViewStore(state => state.setView);
  const { courses } = useCoursesContext();
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addStudyBlockOpen, setAddStudyBlockOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator view={view} />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            <Button
              aria-label="View by day"
              size="icon"
              variant={view === 'day' ? 'default' : 'outline'}
              className="rounded-r-none [&_svg]:size-5"
              onClick={() => setView('day')}
            >
              <List strokeWidth={1.8} />
            </Button>
            <Button
              aria-label="View by week"
              size="icon"
              variant={view === 'week' ? 'default' : 'outline'}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView('week')}
            >
              <Columns strokeWidth={1.8} />
            </Button>
            <Button
              aria-label="View by month"
              size="icon"
              variant={view === 'month' ? 'default' : 'outline'}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView('month')}
            >
              <Grid2x2 strokeWidth={1.8} />
            </Button>
            <Button
              aria-label="View by year"
              size="icon"
              variant={view === 'year' ? 'default' : 'outline'}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView('year')}
            >
              <Grid3x3 strokeWidth={1.8} />
            </Button>
            <Button
              aria-label="View by agenda"
              size="icon"
              variant={view === 'agenda' ? 'default' : 'outline'}
              className="-ml-px rounded-l-none [&_svg]:size-5"
              onClick={() => setView('agenda')}
            >
              <CalendarRange strokeWidth={1.8} />
            </Button>
          </div>
        </div>

        {/* Add dropdown for Add Study Block and Add Task */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full sm:w-auto" variant="default">
              <Plus className="mr-2" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <button type="button" onClick={() => setAddStudyBlockOpen(true)}>
                Add Study Block
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button type="button" onClick={() => setAddTaskOpen(true)}>
                Add Task
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AddStudyBlockDialog
          open={addStudyBlockOpen}
          onOpenChange={setAddStudyBlockOpen}
          courses={courses}
          trigger={false}
          onStudyBlockAdded={() => setAddStudyBlockOpen(false)}
        />
        <AddTaskDialog
          open={addTaskOpen}
          onOpenChange={setAddTaskOpen}
          courses={courses}
          trigger={false}
          onTaskAdded={() => setAddTaskOpen(false)}
        />
      </div>
    </div>
  );
}
