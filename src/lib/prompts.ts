export const COURSE_PLAN_PARSER_SYSTEM_PROMPT = `You are a specialized ETS course plan parser. Your ONLY task is to extract course information from HTML tables or elements and return it as a JSON array. You MUST:
1. NEVER include any explanations or disclaimers
2. NEVER include any text outside the JSON array
3. ALWAYS return a valid JSON array of objects
4. ALWAYS follow the exact format specified in the prompt
5. NEVER modify or add to the format
6. NEVER include any markdown formatting or code blocks
7. ALWAYS start your response with [ and end with ]
8. ALWAYS return ONLY the JSON array, nothing else
9. ALWAYS group related tasks into subtasks when they share the same week, type, and main topic
10. ALWAYS assign weeks sequentially when not explicitly provided
11. NEVER add any fields not explicitly shown in the example object`;

export function buildCoursePlanParsePrompt(pageHtml: string) {
  return `
You are receiving the complete HTML code (or raw text) of an ETS course plan page that contains one or more tables describing week(s) and content(s). Apply these STRICT rules to extract only a JSON array of objects, without any additional annotation or explanation:

1. **Table Identification**
   - Identify all <table> ... </table> blocks in the HTML, or any ASCII segment that looks like a table (lines delimited by "|", "—", etc.).
   - Among the headers (first row), detect the column corresponding to "Week" (keyword "Week", "Sem", or an integer "1", "2", ...).
   - Then, identify the "Content" column (or any header containing "Content", "Course", "Subject", "Theory", "Practice", "Exam", "Homework", etc.).
   - If multiple tables exist, keep only the one whose header clearly contains "Week" or a plausible row number.

2. **Line-by-Line Extraction**
   For each line (except header):
   a. Read the "Week" cell:
      - If it contains a single integer X (1 ≤ X ≤ 20), then \`week = X\`.
      - If it contains "Y to Z" or "Y and Z" (e.g., "2 to 4", "5 and 6"), consider each intermediate week number: create an object for each week Y, Y+1, ..., Z.
      - If the cell is empty or non-numeric:
        * If it's the first item in a logical sequence, assign \`week = 1\`
        * If it's part of a sequence, increment the week number from the previous item
        * If it's a major topic change, increment the week number
        * If it's a subtopic of the previous item, use the same week number
      - If it's a final exam, ALWAYS place it in the last week of the course
   b. Read the "Content" cell(s) (or "Subject" / "Course"):
      - Split by bullets (\`•\`), line breaks, or indented lists to get one or more text fragments.

3. **Type Classification**
   For each extracted content fragment:
   - If the text contains "Theory", "Reading", "Functions", "Graphs", etc., then \`type = "theorie"\`.
   - If the text contains "Practice", "Exercises", "TP", "Work", then \`type = "pratique"\`.
   - If the text contains "Exam", "Midterm", "Test", "Quiz", then \`type = "exam"\`.
   - If the text contains "Homework", "Project", "TP to submit", then \`type = "homework"\`.
   - If multiple different keywords appear in the same fragment (e.g., "Midterm exam + Practical work"), create two distinct objects (one \`exam\`, one \`pratique\`) with the same \`week\`.
   - If it's a final exam, ALWAYS set \`type = "exam"\` and place it in the last week

4. **Content Grouping**
   - If multiple fragments in the same week and type are related (e.g., different algorithms, different parts of the same topic), group them as subtasks
   - The main task should have a general title that encompasses all subtasks
   - Each subtask should have its specific title and details
   - The total estimated effort should be distributed among subtasks
   - When grouping items without explicit weeks:
     * Group related items under the same week
     * Use logical progression to determine week numbers
     * Consider topic changes as week boundaries
     * Maintain consistent week numbering across the course
     * ALWAYS place final exams in the last week

5. **JSON Object Construction**
   For each main task (with optional subtasks), generate an object with EXACTLY these fields:
   \`\`\`jsonc
   {
     "week": <integer>,
     "type": "<theorie|pratique|exam|homework|lab>",
     "title": "<main topic or general description>",
     "estimatedEffort": <total hours for all subtasks>,
     "notes": "<short tip in French, 15-25 words max>",
     "subtasks": [
       {
         "title": "<specific subtask title>",
         "estimatedEffort": <hours for this subtask>,
         "notes": "<specific tip for this subtask>"
       }
     ]
   }
   \`\`\`

Here is the **RAW_HTML** of the course plan to parse:
\n\n${pageHtml}\n\n

**The AI must respond ONLY** with this **JSON array** printed (strict), without any other explanation or tag.
`;
}
