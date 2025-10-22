'use client';

import type { TimeBlock, TimeBlockCalendarProps } from '@/types/time-block-calendar';
import { useMemo, useRef, useState } from 'react';

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

const DEFAULT_HEADER_HEIGHT = 48; // matches h-12

export default function TimeBlockCalendarClean({ initialBlocks = DEFAULT_BLOCKS, onBlockMoved, onBlocksChange, enableDragDrop = true }: TimeBlockCalendarProps) {
  const visibleHours = useMemo(() => Array.from({ length: 12 }, (_: unknown, i: number) => 8 + i), []);
  const [blocks, setBlocks] = useState<TimeBlock[]>(initialBlocks ?? DEFAULT_BLOCKS);

  // preview: left/top/width/height are relative to the grid container
  const [preview, setPreview] = useState<{ day: number; left: number; top: number; width: number; height: number; startHour: number; startMinute: number; title?: string; color?: string } | null>(null);
  const [_draggingId, setDraggingId] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  // fallback ref for the dragged block when dataTransfer is unavailable during dragover
  const draggedRef = useRef<TimeBlock | null>(null);

  // Helper to snap minutes to 15-min increments and fold overflow into hours
  function snapTo15(startHour: number, startMinute: number) {
    const raw = Math.round(startMinute / 15) * 15;
    const extraHour = Math.floor(raw / 60);
    const minute = raw % 60;
    return { startHour: startHour + extraHour, startMinute: minute };
  }

  // Drop handler when dropping inside a specific day column
  function handleDropOnDay(e: React.DragEvent, dayIndex: number) {
    if (!enableDragDrop) {
      return;
    }
    e.preventDefault();

    try {
      // prefer dataTransfer id, fallback to draggedRef.current
      let id: number | null = null;
      try {
        const raw = e.dataTransfer.getData('application/json');
        const parsed = raw ? JSON.parse(raw) : null;
        id = parsed?.id ?? null;
      } catch {
        id = null;
      }
      if (id == null && draggedRef.current) {
        id = draggedRef.current.weekIndex;
      }
      if (id == null) {
        return;
      }

      const pv = preview;
      // only allow drop if preview exists and is for this day
      if (!pv || pv.day !== dayIndex) {
        setDraggingId(null);
        setPreview(null);
        return;
      }

      setBlocks((prev) => {
        const idxBlock = prev.findIndex(x => x.weekIndex === id);
        if (idxBlock === -1) {
          return prev;
        }
        const block = prev[idxBlock]!;
        const moved: TimeBlock = {
          ...block,
          dayOfWeek: pv.day,
          startHour: pv.startHour,
          startMinute: pv.startMinute,
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
            onBlockMoved(block, { day: block.dayOfWeek, startHour: block.startHour, startMinute: block.startMinute }, { day: pv.day, startHour: pv.startHour, startMinute: pv.startMinute });
          } catch {
            // swallow
          }
        }

        return next;
      });
    } catch {
      // ignore
    } finally {
      setDraggingId(null);
      setPreview(null);
    }
  }

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

        <div
          ref={gridRef}
          className="flex-1 grid grid-cols-7 relative"
          onDragOver={(e) => {
            if (!enableDragDrop) {
            return;
}
            e.preventDefault();
            try {
              e.dataTransfer.dropEffect = 'move';

              const gridRect = gridRef.current?.getBoundingClientRect();
              if (!gridRect) {
                return;
              }

              // compute which column we are over by clientX so drops work even when
              // hovering over other children or "corners" of the column
              const colWidth = gridRect.width / 7;
              const relX = Math.max(0, Math.min(e.clientX - gridRect.left, gridRect.width - 1));
              const dayIdx = Math.min(6, Math.max(0, Math.floor(relX / colWidth)));

              // prefer dataTransfer id, fallback to draggedRef
              let id: number | null = null;
              try {
                const raw = e.dataTransfer.getData('application/json');
                const parsed = raw ? JSON.parse(raw) : null;
                id = parsed?.id ?? null;
              } catch {
                id = null;
              }
              if (id == null && draggedRef.current) {
             id = draggedRef.current.weekIndex;
}
              if (id == null) {
           return;
}

              const headerHeight = DEFAULT_HEADER_HEIGHT;
              let yRel = e.clientY - gridRect.top - headerHeight;
              yRel = Math.max(0, Math.min(yRel, HOUR_HEIGHT_PX * visibleHours.length - 0.001));
              const hourOffset = Math.floor(yRel / HOUR_HEIGHT_PX);
              const minute = Math.round(((yRel % HOUR_HEIGHT_PX) / HOUR_HEIGHT_PX) * 60);
              const { startHour: sH, startMinute: sM } = snapTo15(8 + hourOffset, minute);

              const block = blocks.find(x => x.weekIndex === id!);
              if (!block) {
             return;
}

              const top = (sH - 8) * HOUR_HEIGHT_PX + (sM / 60) * HOUR_HEIGHT_PX;
              const left = dayIdx * colWidth;
              const width = colWidth;
              const height = Math.max(28, block.durationHours * HOUR_HEIGHT_PX);

              setPreview({ day: dayIdx, left, top, width, height, startHour: sH, startMinute: sM, title: block.title, color: block.color });
              setDraggingId(id);
            } catch {
              // ignore
            }
          }}
          onDrop={(e) => {
            if (!enableDragDrop) {
            return;
}
            // compute drop target column and forward to handler
            const gridRect = gridRef.current?.getBoundingClientRect();
            if (!gridRect) {
            return;
}
            const colWidth = gridRect.width / 7;
            const relX = Math.max(0, Math.min(e.clientX - gridRect.left, gridRect.width - 1));
            const dayIdx = Math.min(6, Math.max(0, Math.floor(relX / colWidth)));
            handleDropOnDay(e, dayIdx);
          }}
        >
          {DAYS.map((d, idx) => (
            <div key={d} className="border-r border-sidebar-border last:border-r-0">
              <div className="h-12 border-b flex items-center justify-center text-sm font-semibold">{d}</div>

              <div style={{ minHeight: HOUR_HEIGHT_PX * visibleHours.length }} className="relative">
                {visibleHours.map((hour: number) => (
                  <div key={`hr-${hour}`} className="absolute left-0 right-0 border-t border-sidebar-border pointer-events-none" style={{ top: (hour - 8) * HOUR_HEIGHT_PX }} aria-hidden />
                ))}

                {blocks.filter(b => b.dayOfWeek === idx).map((b) => {
                  const { top, height } = calculateBlockPosition(b);
                  const durationMinutes = Math.round(b.durationHours * 60);

                  const onDragStart = (e: React.DragEvent) => {
                    // try to set dataTransfer and always keep a ref
                    try {
                      e.dataTransfer.setData('application/json', JSON.stringify({ id: b.weekIndex }));
                      e.dataTransfer.setData('text/plain', b.title ?? '');
                    } catch {}
                    draggedRef.current = b;
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggingId(b.weekIndex);

                    // show initial preview for this block inside its day
                    const rect = gridRef.current?.getBoundingClientRect();
                    const colWidth = rect ? rect.width / 7 : 0;
                    const left = b.dayOfWeek * colWidth;
                    const width = colWidth;
                    setPreview({ day: b.dayOfWeek, left, top, width, height, startHour: b.startHour, startMinute: b.startMinute, title: b.title, color: b.color });
                  };

                  const onDragEnd = () => {
                    setDraggingId(null);
                    setPreview(null);
                    draggedRef.current = null;
                  };

                  return (
                    <div
                      key={b.weekIndex}
                      style={{ top, height }}
                      draggable={enableDragDrop}
                      onDragStart={enableDragDrop ? onDragStart : undefined}
                      onDragEnd={enableDragDrop ? onDragEnd : undefined}
                    >
                      <div
                        className={
                          `absolute left-2 right-2 rounded-md p-2 text-xs font-medium border border-sidebar-border ${b.color ?? 'bg-blue-500/80 text-white'}`
                        }
                      >
                        <div className="font-semibold truncate">{b.title}</div>
                        <div className="text-xs opacity-90">{`${durationMinutes}m`}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* floating preview constrained to the columns (positioned relative to gridRef) */}
          {preview && (
            <div
              aria-hidden
              style={{ position: 'absolute', left: preview.left, top: preview.top + DEFAULT_HEADER_HEIGHT, width: preview.width, height: preview.height }}
            >
              <div
                className={
                  `rounded-md p-2 text-xs font-medium border border-dashed ${preview.color ?? 'bg-blue-600/30'} text-white/90 pointer-events-none`
                }
              >
                <div className="font-semibold truncate">{preview.title ?? 'Preview'}</div>
                <div className="text-xs opacity-90">{`${preview.startHour}:${String(preview.startMinute).padStart(2, '0')}`}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
