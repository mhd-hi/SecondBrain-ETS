import type {
  DragEndEvent as DndKitDragEndEvent,
  DragOverEvent as DndKitDragOverEvent,
  DragStartEvent as DndKitDragStartEvent,
} from '@dnd-kit/core';
import type { Task } from './task';

export type DraggedTask = {
  id: string;
  task: Task;
  sourceDate: Date;
};

export type DropTargetData = {
  targetDate: Date;
  dayKey: string;
};

export type DragEndEvent = DndKitDragEndEvent;
export type DragStartEvent = DndKitDragStartEvent;
export type DragOverEvent = DndKitDragOverEvent;
