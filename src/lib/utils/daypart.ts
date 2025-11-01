import type { Daypart } from '@/types/course';

export type DaypartTimes = {
    startDate: string;
    endDate: string;
};

/**
 * Returns start and end times for a given date and daypart
 * AM: 9:00 AM - 12:00 PM
 * PM: 1:30 PM - 5:00 PM
 * EVEN: 6:00 PM - 9:00 PM
 */
export function getDaypartTimes(date: Date, daypart: Daypart): DaypartTimes {
    const startDate = new Date(date);
    const endDate = new Date(date);

    switch (daypart) {
        case 'AM':
            startDate.setHours(9, 0, 0, 0); // 9:00 AM
            endDate.setHours(12, 0, 0, 0); // 12:00 PM
            break;
        case 'PM':
            startDate.setHours(13, 30, 0, 0); // 1:30 PM
            endDate.setHours(17, 0, 0, 0); // 5:00 PM
            break;
        case 'EVEN':
            startDate.setHours(18, 0, 0, 0); // 6:00 PM
            endDate.setHours(21, 0, 0, 0); // 9:00 PM
            break;
    }

    // Helper to get local ISO string (YYYY-MM-DDTHH:mm:ss, no Z)
    function toLocalISOString(date: Date) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
    return {
        startDate: toLocalISOString(startDate),
        endDate: toLocalISOString(endDate),
    };
}
