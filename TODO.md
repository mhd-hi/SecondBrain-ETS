# Fixes
- fix middleware signin page
- Fix this : https://semgrep.dev/orgs/my_org_mohamed/findings?tab=open&primary=true&
last_opened=All%20time
- Add total effort in TaskCard
- CHange favicon to a capibara, add it to logo too
- add pastille in course sidebar, for the draft tasks as red and add tooltip
- add tooltip for overdue task
# Enhancement
Tasks edit :
- Fix tasks edit (follow github issues - sidebar opens on the right, we can modify tasks and subtasks in it)
- Ask user for its course periods to better determine task due dates.
AI:
- cache openai tasks response in db
    - if course is not in the openai_cache db, add it.
    Benefits:
        - Cross-user sharing: Multiple users can benefit from the same cached response
        - Cost optimization: Significant reduction in OpenAI API calls
        - Performance: Faster response times for cached courses
Better date accuracy of tasks
- For new tasks, set default date as today+1week in the dialog.
Progress bar:
- Add semester progress Board and dashboard page (progressbar for all courses)
- Add course progress Board inside the course page (progressBar for courses tasks)
Profile page:
- Add theme toggle in Profile page.
- When task is overdue, send a web notification

# Tech debt
- Fix the sidebar, use shadcn components (currently duplicate code for mobile - desktop).
- Smell: Fix this: "// Default to winter if between sessions."
    - It should select the last session, not winter.
- Smell: Fix the issue with dueDate being passed as a string.
    - Convert dueDate strings as soon as possible to Date objects and handle invalid dates
    - avoid as much as possible changing from string to date and back and forth.
