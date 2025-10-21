'use client';

import type { TimeBlock, TimeBlockCalendarProps } from '@/types/time-block-calendar';
import { useMemo, useState } from 'react';

const DEFAULT_BLOCKS: TimeBlock[] = [];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOUR_HEIGHT_PX = 60;
const TIME_COLUMN_WIDTH = 80;

const formatHourLabel = (hour: number) => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour} ${ampm}`;
};

function calculateBlockPosition(block: TimeBlock) {
  const top = (block.startHour - 8) * HOUR_HEIGHT_PX + (block.startMinute / 60) * HOUR_HEIGHT_PX;
  const height = Math.max(28, block.durationHours * HOUR_HEIGHT_PX);
  return { top, height };
}

export default function TimeBlockCalendarClean({ initialBlocks = DEFAULT_BLOCKS, onBlockMoved, onBlocksChange, enableDragDrop = true }: TimeBlockCalendarProps) {
  const visibleHours = useMemo(() => Array.from({ length: 12 }, (_: unknown, i: number) => 8 + i), []);
  const [blocks, setBlocks] = useState<TimeBlock[]>(initialBlocks ?? DEFAULT_BLOCKS);

  // Note: local `blocks` initializes from `initialBlocks`. If parent wants to control blocks
  // after mount, it should provide `onBlocksChange` and update `initialBlocks` to re-mount.

  return (
    <div className="w-full">
      <div className="flex border rounded-lg overflow-hidden bg-card">
        <div style={{ width: TIME_COLUMN_WIDTH }} className="border-r">
          <div className="h-12 border-b flex items-center justify-center text-xs font-medium">Time</div>
          <div>
            {visibleHours.map(h => (
              <div key={h} style={{ height: HOUR_HEIGHT_PX }} className="border-b text-center text-xs text-muted-foreground flex items-center justify-center">
                {formatHourLabel(h)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-7">
          {DAYS.map((d, idx) => (
            <div key={d} className="border-r border-sidebar-border last:border-r-0">
              <div className="h-12 border-b flex items-center justify-center text-sm font-semibold">{d}</div>
              <div
                style={{ minHeight: HOUR_HEIGHT_PX * visibleHours.length }}
                className="relative"
                onDragOver={(e) => {
                  if (!enableDragDrop) {
                    return;
                  }
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  if (!enableDragDrop) {
                    return;
                  }
                  e.preventDefault();
                  try {
                    const raw = e.dataTransfer.getData('application/json');
                    const parsed = raw ? JSON.parse(raw) : null;
                    const id = parsed?.id;
                    if (id == null) {
                      return;
                    }

                    const container = e.currentTarget as HTMLDivElement;
                    const { startHour, startMinute } = computeTimeFromPointer(container, e.clientY);

                    setBlocks((prev) => {
                      const idxBlock = prev.findIndex(x => x.weekIndex === id);
                      if (idxBlock === -1) {
                        return prev;
                      }
                      const block = prev[idxBlock]!;
                      const moved: TimeBlock = {
                        ...block,
                        dayOfWeek: idx,
                        startHour,
                        startMinute,
                      };
                      const next = [...prev];
                      next[idxBlock] = moved;

                      if (onBlocksChange) {
                        try {
                          onBlocksChange(next);
                        } catch {
                          // swallow
                        }
                      }

                      if (onBlockMoved) {
                        try {
                          onBlockMoved(block, { day: block.dayOfWeek, startHour: block.startHour, startMinute: block.startMinute }, { day: idx, startHour, startMinute });
                        } catch {
                          // swallow
                        }
                      }

                      return next;
                    });
                  } catch {
                    // ignore malformed drag data
                  }
                }}
              >
                {visibleHours.map((hour: number, i: number) => (
                  <div key={`hr-${hour}`} className="absolute left-0 right-0 border-t border-sidebar-border pointer-events-none" style={{ top: i * HOUR_HEIGHT_PX }} aria-hidden />
                ))}

                {blocks.filter(b => b.dayOfWeek === idx).map((b) => {
                  const { top, height } = calculateBlockPosition(b);
                  const durationMinutes = Math.round(b.durationHours * 60);

                  const onDragStart = (e: React.DragEvent) => {
                    // use weekIndex as stable id for the block
                    e.dataTransfer.setData('application/json', JSON.stringify({ id: b.weekIndex }));
                    // allow drop effects
                    e.dataTransfer.effectAllowed = 'move';
                  };

                  const onDragEnd = (_e: React.DragEvent) => {
                    // no-op for now
                  };

                  return (
                    <div
                      key={b.weekIndex}
                      style={{ top, height }}
                      draggable={enableDragDrop}
                      onDragStart={enableDragDrop ? onDragStart : undefined}
                      onDragEnd={enableDragDrop ? onDragEnd : undefined}
                      className={`absolute left-2 right-2 rounded-md p-2 text-xs font-medium border border-sidebar-border ${b.color ?? 'bg-blue-500/80 text-white'}`}
                    >
                      <div className="font-semibold truncate">{b.title}</div>
                      <div className="text-xs opacity-90">{`${durationMinutes}m`}</div>
                    </div>
                  );
                })}
                {/* drop handlers are attached to the container above so blocks remain draggable */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper: compute target startHour and startMinute given a day container and clientY pointer
function computeTimeFromPointer(container: HTMLDivElement, clientY: number) {
  const rect = container.getBoundingClientRect();
  const y = clientY - rect.top; // relative y inside container
  const clamped = Math.max(0, Math.min(y, rect.height - 1));
  const hourOffset = Math.floor(clamped / HOUR_HEIGHT_PX);
  const minutes = Math.round(((clamped % HOUR_HEIGHT_PX) / HOUR_HEIGHT_PX) * 60);
  const startHour = 8 + hourOffset;
  const startMinute = minutes;
  return { startHour, startMinute };
}
