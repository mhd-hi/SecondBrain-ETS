// Shared types for TimeBlockCalendar
export type TimeBlock = {
    // stable identifier for the block within a week view
    weekIndex: number;
    // 0 = Monday, 6 = Sunday
    dayOfWeek: number;
    // hour in 24h (0-23)
    startHour: number;
    // minutes (0-59)
    startMinute: number;
    // duration in hours, fractional allowed (e.g. 1.5)
    durationHours: number;
    // short label
    title: string;
    // optional hex/tailwind class
    color?: string;
    // timestamps in ISO string form for persistence / syncing
    start_at?: string;
    end_at?: string;
} & Record<string, unknown>;

export type DragData = {
    block: TimeBlock;
    sourceDay: number;
    sourceStartHour: number;
    sourceStartMinute: number;
} & Record<string, unknown>;

export type DropData = {
    targetDay: number;
    targetStartHour: number;
    targetStartMinute: number;
} & Record<string, unknown>;

export type TimeBlockCalendarProps = {
    initialBlocks?: TimeBlock[];
    onBlockMoved?: (
        block: TimeBlock,
        sourceDayAndTime: { day: number; startHour: number; startMinute: number },
        targetDayAndTime: { day: number; startHour: number; startMinute: number }
    ) => Promise<void> | void;
    onBlocksChange?: (blocks: TimeBlock[]) => void;
    enableDragDrop?: boolean;
    className?: string;
    weekOffset?: number;
    onWeekOffsetChange?: (offset: number) => void;
    isLoading?: boolean;
};

export type TimeBlockGridProps = {
    weekDates: Date[];
    blocks: TimeBlock[];
};
