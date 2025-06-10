# Fixes
- fix middleware signin page

# Enhancement
Progress bar:
- Add semester progress Board and dashboard page (progressbar for all courses) 
- Add course progress Board inside the course page (progressBar for courses tasks)
Profile page:
- Add theme toggle in Profile page.
Tasks edit : 
- Fix tasks edit (follow github issues - sidebar opens on the right, we can modify tasks and subtasks in it)
- Ask user for its course periods to better determine task due dates.
AI: 
- cache openai tasks response in db
     -Create Dedicated Cache Table: Create a separate table for caching OpenAI responses that can be shared across users for the same course. A course will have the same tasks in all terms:
     Schema would have, id, courseCode, parsedOpenAIContent, createdAt, updatedAt. 
     Benefits: 
        - Cross-user sharing: Multiple users can benefit from the same cached response
        - Cost optimization: Significant reduction in OpenAI API calls
        - Performance: Faster response times for cached courses

Better date accuracy of tasks 
- For new tasks, set default date as today+1week in the dialog.

# Tech debt
- Fix the sidebar, use shadcn components (currently duplicate code for mobile - desktop).
- Smell: Fix this: "// Default to winter if between sessions."
    - It should select the last session, not winter.
- Smell: Fix the issue with dueDate being passed as a string.
    - Convert dueDate strings as soon as possible to Date objects and handle invalid dates
    - it should never be a string
