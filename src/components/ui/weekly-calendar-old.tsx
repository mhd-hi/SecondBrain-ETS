'use client';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { TransitionState } from '@/lib/utils/ui-transition-util';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import { NavigationControls } from '@/components/WeeklyRoadmap/NavigationControls';
import { getWeekDates, getWeekStart } from '@/lib/utils/date-util';
import {
  createTransitionState,
  getTransitionClasses,
  getTransitionDirection,
  getTransitionDirectionFromOffset,
  resetTransitionState,
} from '@/lib/utils/ui-transition-util';

// Generic types for the calendar items
export type CalendarItemOld = {
  id: string;
} & Record<string, unknown>;

export type DragData = {
  item: CalendarItemOld;
  sourceDate: Date;
} & Record<string, unknown>;

export type DropData = {
  targetDate: Date;
  dayKey: string;
} & Record<string, unknown>;

type DayColumnPropsOld<T extends CalendarItemOld> = {
  date: Date;
  items: T[];
  isToday: boolean;
  isSticky?: boolean;
  isDragActive?: boolean;
  onItemsChange?: (items: T[]) => void;
} & Record<string, unknown>;

type WeeklyCalendarPropsOld<T extends CalendarItemOld> = {
  /**
   * Initial items to display in the calendar
   */
  initialItems?: T[];

  /**
   * Function to fetch items for a given week
   */
  fetchItems: (weekStart: Date, weekEnd: Date) => Promise<T[]>;

  /**
   * Function to handle drag end - should return the updated item or throw error
   */
  onItemMoved?: (item: T, sourceDate: Date, targetDate: Date) => Promise<T>;

  /**
   * Render function for each day column
   */
  renderDayColumn: (props: DayColumnPropsOld<T>) => React.ReactNode;

  /**
   * Render function for the drag overlay
   */
  renderDragOverlay?: (dragData: unknown) => React.ReactNode;

  /**
   * Additional props to pass to day columns
   */
  dayColumnProps?: Record<string, unknown>;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Callback when loading state changes
   */
  onLoadingChange?: (loading: boolean) => void;

  /**
   * Callback when items change
   */
  onItemsChange?: (items: T[]) => void;

  /**
   * Enable/disable drag and drop
   */
  enableDragDrop?: boolean;

  /**
   * Custom class name for the calendar container
   */
  className?: string;
};

const DEFAULT_INITIAL_ITEMS: CalendarItemOld[] = [];
const DEFAULT_DAY_COLUMN_PROPS: Record<string, unknown> = {};

export function WeeklyCalendarOld<T extends CalendarItemOld>({
  initialItems = DEFAULT_INITIAL_ITEMS as T[],
  fetchItems,
  onItemMoved,
  renderDayColumn,
  renderDragOverlay,
  dayColumnProps = DEFAULT_DAY_COLUMN_PROPS,
  isLoading: externalIsLoading,
  onLoadingChange,
  onItemsChange,
  enableDragDrop = true,
  className = '',
}: WeeklyCalendarPropsOld<T>) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [items, setItems] = useState<T[]>(initialItems);
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [transitionState, setTransitionState] = useState<TransitionState>(() => createTransitionState());

  // Use external loading state if provided, otherwise use internal
  const isLoading = externalIsLoading ?? internalIsLoading;

  // Update external loading state when internal changes
  useEffect(() => {
    if (onLoadingChange && externalIsLoading === undefined) {
      onLoadingChange(internalIsLoading);
    }
  }, [internalIsLoading, onLoadingChange, externalIsLoading]);

  // Notify parent when items change
  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);

  // Drag and drop state
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeDragData, setActiveDragData] = useState<unknown>(null);

  // Configure sensors for drag and drop
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 50,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // Load items for the current week
  useEffect(() => {
    const loadItems = async () => {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true);
      }
      setTransitionState(prev => ({ ...prev, isTransitioning: true }));

      try {
        const weekStart = getWeekStart(weekOffset);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const weekItems = await fetchItems(weekStart, weekEnd);

        setItems(weekItems);
        if (externalIsLoading === undefined) {
          setInternalIsLoading(false);
        }
        setTransitionState(resetTransitionState());
      } catch (error) {
        console.error('Failed to load items:', error);
        if (externalIsLoading === undefined) {
          setInternalIsLoading(false);
        }
        setTransitionState(resetTransitionState());
        throw error;
      }
    };

    void loadItems();
  }, [weekOffset, fetchItems, externalIsLoading]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const transitionDirection = getTransitionDirection(direction);
    setTransitionState({ isTransitioning: true, direction: transitionDirection });
    setWeekOffset(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const handleTodayClick = () => {
    const currentOffset = weekOffset;
    if (currentOffset === 0) {
      return;
    }

    const transitionDirection = getTransitionDirectionFromOffset(currentOffset, 0);
    setTransitionState({ isTransitioning: true, direction: transitionDirection });
    setWeekOffset(0);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    if (!enableDragDrop) {
      return;
    }

    const { active } = event;
    const draggedData = active.data.current;

    if (draggedData) {
      setActiveDragData(draggedData);
    }

    setIsDragActive(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!enableDragDrop) {
      return;
    }

    const { active, over } = event;

    setIsDragActive(false);
    setActiveDragData(null);

    if (!over) {
      return;
    }

    const draggedData = active.data.current;
    const dropData = over.data.current as DropData;

    if (!draggedData || !dropData || !onItemMoved) {
      return;
    }

    // Handle different drag data structures
    let item: T;
    let sourceDate: Date;

    if ('task' in draggedData) {
      // This is a DraggedTask from TaskBox
      item = draggedData.task as T;
      sourceDate = draggedData.sourceDate;
    } else if ('item' in draggedData) {
      // This is our generic DragData
      item = draggedData.item as T;
      sourceDate = draggedData.sourceDate;
    } else {
      return;
    }

    const { targetDate } = dropData;

    // If moving to the same day, do nothing
    if (sourceDate.toDateString() === targetDate.toDateString()) {
      return;
    }

    // Immediate optimistic update - update UI right away
    setItems(prevItems =>
      prevItems.map(i =>
        i.id === item.id ? { ...i, dueDate: targetDate } as T : i,
      ),
    );

    // Then perform the API call in the background
    try {
      await onItemMoved(item, sourceDate, targetDate);
    } catch (error) {
      // Revert on error - restore the original date
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === item.id ? { ...i, dueDate: sourceDate } as T : i,
        ),
      );
      throw error;
    }
  };

  const weekDates = getWeekDates(weekOffset);

  // Group items by date
  const itemsByDate = items.reduce<Record<string, T[]>>((acc, item) => {
    // Items should have a date field or you can customize this logic
    const itemWithDate = item as T & { dueDate?: Date | string; date?: Date | string };
    const dateValue = itemWithDate.dueDate || itemWithDate.date;
    if (dateValue) {
      try {
        const parsedDate = new Date(dateValue);
        // Validate that the date is valid
        if (!Number.isNaN(parsedDate.getTime())) {
          const dateKey = parsedDate.toDateString();
          acc[dateKey] ??= [];
          acc[dateKey].push(item);
        }
      } catch {
        // Skip invalid dates
      }
    }
    return acc;
  }, {});

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const calendarContent = (
    <div className={`bg-card w-full rounded-lg ${className}`}>
      {/* Navigation Controls */}
      <NavigationControls
        weekDates={weekDates}
        isLoading={isLoading}
        onWeekChange={handleWeekChange}
        onTodayClick={handleTodayClick}
      />

      {/* Calendar Container */}
      <div
        className={`bg-card
          rounded-lg transition-all duration-300 py-5
          ${isDragActive ? 'bg-muted/50 shadow-lg' : ''}
        `}
      >
        <div className={`grid grid-cols-7 gap-4 px-4 transition-all duration-200 ease-out ${getTransitionClasses(transitionState)}`}>
          {weekDates.map(date => (
            <div key={date.toDateString()}>
              {renderDayColumn({
                date,
                items: itemsByDate[date.toDateString()] ?? [],
                isToday: isToday(date),
                isSticky: true,
                isDragActive,
                onItemsChange: setItems,
                ...dayColumnProps,
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!enableDragDrop) {
    return calendarContent;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {calendarContent}

      <DragOverlay dropAnimation={null}>
        {renderDragOverlay ? renderDragOverlay(activeDragData) : null}
      </DragOverlay>
    </DndContext>
  );
}
