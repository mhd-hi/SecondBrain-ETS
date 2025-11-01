import type { Course } from '@/types/course';
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type TimeSlotBlockProps = {
  date: Date;
  courses: Course[];
  isOccupied?: boolean;
  onAddTask: () => void;
  onAddStudyBlock: () => void;
};

export function TimeSlotBlock({ isOccupied, onAddTask, onAddStudyBlock }: TimeSlotBlockProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  if (isOccupied) {
    // Render a transparent div that does not block pointer events, so event is draggable/clickable
    return <div className="absolute inset-0 z-10 pointer-events-none" style={{ minHeight: '18px' }} />;
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className="absolute inset-0 z-10 cursor-pointer rounded-md hover:bg-accent/40"
          style={{ minHeight: '18px' }}
          title="Add event"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              onAddTask();
            }}
          >
            Add Task
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              onAddStudyBlock();
            }}
          >
            Add Study Block
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
