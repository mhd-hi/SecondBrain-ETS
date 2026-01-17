/**
 * Input sanitization utilities for user-provided content
 */

const MAX_USER_CONTEXT_LENGTH = 1000;

/**
 * List of suspicious patterns that might indicate prompt injection attempts
 */
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?|commands?)/gi,
  /disregard\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?|commands?)/gi,
  /forget\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?|commands?)/gi,
  /new\s+(instructions?|prompts?|rules?|system\s+message)/gi,
  /you\s+are\s+(now|a|an)\s+/gi,
  /system:\s*/gi,
  /assistant:\s*/gi,
  /\[SYSTEM\]/gi,
  /\[\/SYSTEM\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
];

/**
 * Sanitizes user-provided text input:
 * - Removes HTML tags
 * - Trims whitespace
 * - Enforces max length
 * - Detects potential prompt injection attempts
 *
 * @param input - Raw user input
 * @param maxLength - Maximum allowed length for the input
 * @returns Sanitized text
 * @throws Error if input contains suspicious patterns
 */
export function sanitizeUserInput(
  input: string | undefined | null,
  maxLength: number = MAX_USER_CONTEXT_LENGTH,
): string {
  if (!input) {
    return '';
  }

  // Basic trimming
  let sanitized = input.trim();

  // Check for prompt injection patterns BEFORE sanitizing HTML
  // This helps detect attacks even if they're wrapped in HTML
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      throw new Error(
        'Input contains suspicious content that appears to be a prompt injection attempt',
      );
    }
  }

  // Remove HTML tags using iterative approach to handle nested/malformed tags
  // This prevents attacks like <script<script>> from bypassing sanitization
  let previousLength;
  do {
    previousLength = sanitized.length;
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } while (sanitized.length < previousLength);

  // Decode common HTML entities
  // Important: decode &amp; last to avoid double-unescaping sequences like "&amp;lt;"
  sanitized = sanitized
    .replaceAll(/&lt;/g, '<')
    .replaceAll(/&gt;/g, '>')
    .replaceAll(/&quot;/g, '"')
    .replaceAll(/&#39;/g, '\'')
    .replaceAll(/&nbsp;/g, ' ')
    .replaceAll(/&amp;/g, '&');

  // After decoding, ensure any newly introduced tag delimiters are removed
  sanitized = sanitized.replace(/[<>]/g, '');

  // Remove excessive whitespace (multiple spaces, tabs, newlines)
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Validates that user context is within acceptable limits
 * @param context - User-provided context
 * @returns true if valid, throws Error otherwise
 */
export function validateUserContext(
  context: string | undefined | null,
): boolean {
  if (!context) {
    return true; // Empty is valid
  }

  if (context.length > MAX_USER_CONTEXT_LENGTH) {
    throw new Error(
      `User context exceeds maximum length of ${MAX_USER_CONTEXT_LENGTH} characters`,
    );
  }

  return true;
}

/**
 * Gets remaining character count for user context
 */
export function getRemainingChars(
  current: string,
  max: number = MAX_USER_CONTEXT_LENGTH,
): number {
  return Math.max(0, max - current.length);
}

export { MAX_USER_CONTEXT_LENGTH };
