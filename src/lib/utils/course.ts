/**
 * Course code validation utilities
 *
 * This module provides utilities for validating and normalizing course codes
 * according to the expected format: 2-4 uppercase letters followed by 3 digits
 * and an optional uppercase letter (e.g., MAT145, LOG210).
 */

/**
 * Regular expression pattern for valid course codes
 * - 2-4 uppercase letters at the start
 * - Exactly 3 digits
 * - Optional single uppercase letter at the end
 */
const COURSE_CODE_PATTERN = /^[A-Z]{2,4}\d{3}[A-Z]?$/;

/**
 * Validates if a course code matches the expected format
 *
 * @param courseCode - The course code to validate
 * @returns True if the course code is valid, false otherwise
 */
export function isValidCourseCode(courseCode: string): boolean {
  return COURSE_CODE_PATTERN.test(courseCode);
}

/**
 * Normalizes a course code by trimming whitespace and converting to uppercase
 *
 * @param courseCode - The course code to normalize
 * @returns The normalized course code
 */
export function normalizeCourseCode(courseCode: string): string {
  return courseCode.trim().toUpperCase();
}

/**
 * Validates a course code and throws an error if invalid
 *
 * @param courseCode - The course code to validate
 * @param customErrorMessage - Optional custom error message
 * @throws Error if the course code is invalid
 * @returns The normalized course code if valid
 */
export function assertValidCourseCode(
  courseCode: string,
  customErrorMessage?: string,
): string {
  const normalizedCode = normalizeCourseCode(courseCode);

  if (!isValidCourseCode(normalizedCode)) {
    throw new Error(
      customErrorMessage ?? 'Invalid course code format. Expected format: 2-4 letters followed by 3 digits and optional letter (e.g., MAT145)',
    );
  }

  return normalizedCode;
}
