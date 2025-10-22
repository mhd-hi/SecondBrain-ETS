export type TCalendarView = 'day' | 'week' | 'month' | 'year' | 'agenda';
export type TBadgeVariant = 'dot' | 'colored' | 'mixed';
export type TVisibleHours = { from: number; to: number };

export type TEvent = {
    id: string;
    startDate: string;
    endDate: string;
    title: string;
    description?: string;
    type: 'studyBlock' | 'task';
    color: string;
    secondaryColor?: string;
};

export type TCalendarCell = {
    day: number;
    currentMonth: boolean;
    date: Date;
};
