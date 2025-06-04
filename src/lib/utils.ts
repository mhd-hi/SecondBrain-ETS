import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return twMerge(clsx(...inputs)) as string
}
