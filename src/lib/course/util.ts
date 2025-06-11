/**
 * Course code validation utilities
 *
 * This module provides utilities for validating and normalizing course codes
 * according to the expected format: 2-4 uppercase letters followed by 3 digits
 * and an optional uppercase letter (e.g., MAT145, CSC108A, LOG210).
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
 *
 * @example
 * ```ts
 * isValidCourseCode('MAT145')  // true
 * isValidCourseCode('CSC108A') // true
 * isValidCourseCode('LOG210')  // true
 * isValidCourseCode('mat145')  // false (needs to be uppercase)
 * isValidCourseCode('M145')    // false (too few letters)
 * isValidCourseCode('MAT45')   // false (too few digits)
 * ```
 */
export function isValidCourseCode(courseCode: string): boolean {
  return COURSE_CODE_PATTERN.test(courseCode);
}

/**
 * Normalizes a course code by trimming whitespace and converting to uppercase
 *
 * @param courseCode - The course code to normalize
 * @returns The normalized course code
 *
 * @example
 * ```ts
 * normalizeCourseCode('  mat145  ') // 'MAT145'
 * normalizeCourseCode('csc108a')    // 'CSC108A'
 * ```
 */
export function normalizeCourseCode(courseCode: string): string {
  return courseCode.trim().toUpperCase();
}

/**
 * Validates and normalizes a course code in one step
 *
 * @param courseCode - The course code to validate and normalize
 * @returns An object containing the normalized code and validation status
 *
 * @example
 * ```ts
 * validateAndNormalizeCourseCode('  mat145  ')
 * // { isValid: true, normalizedCode: 'MAT145' }
 *
 * validateAndNormalizeCourseCode('invalid')
 * // { isValid: false, normalizedCode: 'INVALID' }
 * ```
 */
export function validateAndNormalizeCourseCode(courseCode: string): {
  isValid: boolean;
  normalizedCode: string;
} {
  const normalizedCode = normalizeCourseCode(courseCode);
  const isValid = isValidCourseCode(normalizedCode);

  return {
    isValid,
    normalizedCode,
  };
}

/**
 * Validates a course code and throws an error if invalid
 *
 * @param courseCode - The course code to validate
 * @param customErrorMessage - Optional custom error message
 * @throws Error if the course code is invalid
 * @returns The normalized course code if valid
 *
 * @example
 * ```ts
 * const cleanCode = assertValidCourseCode('mat145'); // 'MAT145'
 * assertValidCourseCode('invalid'); // throws Error
 * ```
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
