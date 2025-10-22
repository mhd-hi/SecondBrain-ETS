import type { ClassValue } from 'clsx';
import type { TCourseColor } from '@/types/colors';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const COURSE_COLORS = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'gray'] as TCourseColor[];

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(...inputs));
}

export function generateRandomCourseColor(): TCourseColor {
    // Get a random color from our predefined palette
    const randomIndex = Math.floor(Math.random() * COURSE_COLORS.length);
    return COURSE_COLORS[randomIndex]!;
}
