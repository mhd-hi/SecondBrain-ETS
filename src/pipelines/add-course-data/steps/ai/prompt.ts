export const COURSE_PLAN_PARSER_SYSTEM_PROMPT = `You are an ETS course plan parser. 
Your ONLY job is to extract course data from HTML or ASCII tables and output a valid JSON array of objects. Follow these strict rules:

1. NEVER include anything outside the JSON array.
2. ALWAYS return only a valid JSON array of objects.
3. DO NOT include markdown, code blocks, or explanations.
4. ALWAYS begin with [ and end with ].
5. Group tasks by week/type/topic when applicable.
6. Assign weeks sequentially if not provided.
7. NEVER add or modify fields beyond those shown in the format.
8. Exams must be separate objects (type: "exam"), not subtasks.
9. Recognize these French terms: "Séance", "Semaine", "Examen", "Intra", "Mi-session", "Devoir", "Travail", "TP", "Laboratoire", "Cours", "Théorie", "Pratique".
10. NEVER let an exam overwrite or rename following content.
11. If an exam row lacks a week, assign it to the most recent week.

ALWAYS FOLLOW the example format exactly.`;

export function buildCoursePlanParsePrompt(pageHtml: string) {
  return `
You will receive the full HTML (or raw ASCII) content of a university course plan page, typically structured as tables. Extract ONLY the course plan JSON array, strictly following these steps:

1. **Table Detection**
   - Identify all <table> tags or ASCII-style tables (|, —, etc.).
   - Locate headers indicating week: "Week", "Semaine", "Séance", "Sem", or numbers.
   - Locate content headers: "Contenu", "Cours", "Cours X", "Sujet", "Théorie", "TP", etc.
   - Choose the most complete table with a valid "Semaine"-like column.

2. **Week Assignment**
   - Week = integer if cell says "1"-"20".
   - "2 to 4" → weeks 2, 3, 4.
   - Empty cells: assign week sequentially or infer from context.
   - Exam-only rows without week → assign to most recent prior week.
   - Final exams → always placed in the last week.

3. **Content Fragmentation**
   - Split content by bullets, breaks, or indentation.
   - Handle each fragment separately.

4. **Type Detection**
   - Keywords map to types:
     - "Theory", "Fonctions" → "theorie"
     - "Pratique", "TP" → "pratique"
     - "Exam", "Intra", "Final", "Test" → "exam"
     - "Devoir", "Projet" → "homework"
   - Mixed-type content → split into multiple objects with shared week.
   - Exams are never subtasks.
   
   ⚠️ Constraint: Only ONE "theorie" (course) object is allowed per week. Merge multiple theory-related entries into one "theorie" object with subtasks.

5. **Grouping & Structuring**
   - Group related fragments by week and type into one object with subtasks.
   - Generalize a main topic as 'title', list subtasks under 'subtasks'.
   - Distribute estimated effort among subtasks.
   - DO NOT let exam rows interfere with adjacent rows.

6. **JSON Format (STRICT)**
   Output a JSON array of objects like this:

   {
     "week": <integer>,
     "type": "<theorie|pratique|exam|homework|lab>",
     "title": "<main topic>",
     "estimatedEffort": <hours>,
     "notes": "<short French tip>",
     "subtasks": [
       {
         "title": "<subtask title>",
         "estimatedEffort": <hours>,
         "notes": "<French tip>"
       }
     ]
   }

ONLY return the JSON array. No explanations. No formatting. Start with "[" and end with "]".

Here is the RAW_HTML to parse:
\n\n${pageHtml}\n\n
`;
}
