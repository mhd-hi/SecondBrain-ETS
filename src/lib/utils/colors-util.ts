import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const COURSE_COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#ef4444', // Red
    '#84cc16', // Lime
    '#f97316', // Orange
    '#a855f7', // Purple
    '#0ea5e9', // Sky
    '#14b8a6', // Teal
    '#eab308', // Yellow
    '#6366f1', // Indigo
    '#f43f5e', // Rose
    '#22c55e', // Green
    '#d946ef', // Fuchsia
    '#fb7185', // Pink variant
    '#34d399', // Emerald variant
    '#6b7280', // Gray
] as const;

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(...inputs));
}

export function generateRandomCourseColor(): string {
    // Get a random color from our predefined palette
    const randomIndex = Math.floor(Math.random() * COURSE_COLORS.length);
    return COURSE_COLORS[randomIndex] as string;
}
