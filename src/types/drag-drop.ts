import type { Task } from "./task";
import type {
  DragEndEvent as DndKitDragEndEvent,
  DragStartEvent as DndKitDragStartEvent,
  DragOverEvent as DndKitDragOverEvent
} from "@dnd-kit/core";

export interface DraggedTask {
  id: string;
  task: Task;
  sourceDate: Date;
}

export interface DropTargetData {
  targetDate: Date;
  dayKey: string;
}

export type DragEndEvent = DndKitDragEndEvent;
export type DragStartEvent = DndKitDragStartEvent;
export type DragOverEvent = DndKitDragOverEvent;
