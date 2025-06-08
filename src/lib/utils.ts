import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
  '#06b6d4', // Cyan variant
  '#fb7185', // Pink variant
  '#34d399', // Emerald variant
] as const;

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

export function generateRandomCourseColor(): string {
  // Get a random color from our predefined palette (excluding duplicates)
  const randomIndex = Math.floor(Math.random() * COURSE_COLORS.length);
  return COURSE_COLORS[randomIndex] as string;
}

export function getCourseColor(course: { id: string; color?: string } | string): string {
  // If it's a string (courseId), fall back to the old method for backwards compatibility
  if (typeof course === 'string') {
    const index = course.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COURSE_COLORS[Math.abs(index) % COURSE_COLORS.length] as string;
  }
  
  // If the course has a color field, use it
  if (course.color) {
    return course.color;
  }
  
  // Fallback to the old method for courses without a color field
  const index = course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COURSE_COLORS[Math.abs(index) % COURSE_COLORS.length] as string;
}