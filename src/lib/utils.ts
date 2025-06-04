import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const COURSE_COLORS = [
  '#3b82f6', // A distinct blue
  '#10b981', // A distinct green
  '#8b5cf6', // A distinct violet/purple
  '#f59e0b', // A distinct orange-yellow (similar to example)
  '#06b6d4', // Cyan
  '#ec4899', // Pink
] as const;

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

export function getCourseColor(courseId: string): string {
  // Use the course ID to consistently map to a color
  // Ensure the character code reduction results in a non-negative index
  const index = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COURSE_COLORS[Math.abs(index) % COURSE_COLORS.length] as string;
}