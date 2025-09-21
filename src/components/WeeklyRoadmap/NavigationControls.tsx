'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatWeekRange } from '@/lib/utils/date-util';

type NavigationControlsProps = {
  weekDates: Date[];
  isLoading: boolean;
  onWeekChange: (direction: 'prev' | 'next') => void;
  onTodayClick: () => void;
};

export const NavigationControls = ({
  weekDates,
  isLoading,
  onWeekChange,
  onTodayClick,
}: NavigationControlsProps) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-t-lg">
      <Button
        variant="outline"
        size="sm"
        className="rounded-md px-4 py-2 text-sm border border-accent h-9"
        onClick={onTodayClick}
      >
        Today
      </Button>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-9 w-9"
          onClick={() => onWeekChange('prev')}
          disabled={isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-9 w-9"
          onClick={() => onWeekChange('next')}
          disabled={isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-md font-medium text-foreground ml-2 transition-opacity duration-200">
        {formatWeekRange(weekDates)}
      </span>
    </div>
  );
};
