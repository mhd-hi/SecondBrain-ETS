 'use client';

import type { TimeBlock, TimeBlockCalendarProps } from '@/types/time-block-calendar';
import React, { useEffect, useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOUR_HEIGHT_PX = 60; // px per hour in this simpler layout
const TIME_COLUMN_WIDTH = 80;

// Short hour label for the time column (e.g. "8 AM")
const formatHourLabel = (hour: number) => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour} ${ampm}`;
};

const calculateBlockPosition = (block: TimeBlock) => {
  // Render starting at 8:00 visually
  const top = (block.startHour - 8) * HOUR_HEIGHT_PX + (block.startMinute / 60) * HOUR_HEIGHT_PX;
  const height = Math.max(32, block.durationHours * HOUR_HEIGHT_PX);
  return { top, height };
};

const DEFAULT_BLOCKS: TimeBlock[] = [];

export function TimeBlockCalendar({
  initialBlocks = DEFAULT_BLOCKS,
  onBlockMoved: _onBlockMoved,
  onBlocksChange,
  enableDragDrop: _enableDragDrop = false,
  className = '',
  isLoading: _isLoading = false,
}: TimeBlockCalendarProps) {
  const [blocks, _setBlocks] = useState<TimeBlock[]>(initialBlocks ?? DEFAULT_BLOCKS);

  // keep parent in sync when blocks change
  useEffect(() => {
    onBlocksChange?.(blocks);
  }, [blocks, onBlocksChange]);

  const visibleHours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8:00 - 19:00

  return (
    <div className={`w-full ${className}`}>
      <div className="flex border rounded-lg overflow-hidden bg-card">
        {/* Time column (no background) */}
        <div style={{ width: TIME_COLUMN_WIDTH }} className="border-r">
          <div className="h-12 border-b flex items-center justify-center text-xs font-medium">Time</div>
          <div>
            {visibleHours.map(h => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT_PX }}
                className="border-b text-center text-xs text-muted-foreground flex items-center justify-center"
              >
                {formatHourLabel(h)}
              </div>
            ))}
          </div>
        </div>

        {/* Days */}
        <div className="flex-1 grid grid-cols-7">
          {DAYS.map((d, idx) => (
            <div key={d} className="border-r border-sidebar-border last:border-r-0">
              {/* header without vertical border */}
              <div className="h-12 border-b flex items-center justify-center text-sm font-semibold">{d}</div>
              {/* body keeps vertical borders between days */}
              <div style={{ minHeight: HOUR_HEIGHT_PX * visibleHours.length }} className="relative">
                {/* horizontal hour lines */}
                {visibleHours.map((hour, i) => (
                  <div
                    key={`hr-${hour}`}
                    className="absolute left-0 right-0 border-t border-sidebar-border pointer-events-none"
                    style={{ top: i * HOUR_HEIGHT_PX }}
                    aria-hidden
                  />
                ))}

                {blocks
                  .filter(b => b.dayOfWeek === idx)
                  .map((b) => {
                    const { top, height } = calculateBlockPosition(b);
                    // display duration in minutes, rounded
                    const durationMinutes = Math.round(b.durationHours * 60);
                    return (
                      <div
                        key={b.weekIndex}
                        className={`absolute left-2 right-2 rounded-md p-2 text-xs font-medium border border-sidebar-border ${b.color ?? 'bg-blue-500/80 text-white'}`}
                        style={{ top, height, minHeight: 28 }}
                      >
                        <div className="font-semibold truncate">{b.title}</div>
                        <div className="text-xs opacity-90">{`${durationMinutes}m`}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimeBlockCalendar;
