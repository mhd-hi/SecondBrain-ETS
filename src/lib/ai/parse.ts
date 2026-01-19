import type { AITask } from '@/types/api/ai';

export function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function extractJsonArrayFromText(aiText: string): AITask[] {
  // 1) Direct parse
  let parsed = tryParseJson(aiText);
  if (parsed && Array.isArray(parsed)) {
    return parsed as AITask[];
  }

  // 2) Extract between first [ and last ]
  const firstBracket = aiText.indexOf('[');
  const lastBracket = aiText.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = aiText.substring(firstBracket, lastBracket + 1);
    parsed = tryParseJson(candidate);
    if (parsed && Array.isArray(parsed)) {
      return parsed as AITask[];
    }
  }

  // 3) Regex heuristic
  const regex = /(\[\s*\{[\s\S]*\}\s*\])/;
  const match = aiText.match(regex);
  if (match && match[1]) {
    parsed = tryParseJson(match[1]);
    if (parsed && Array.isArray(parsed)) {
      return parsed as AITask[];
    }
  }

  throw new Error('Unable to parse JSON array of tasks from AI response');
}
