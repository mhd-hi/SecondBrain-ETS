# Fixes
- fix middleware signin page
- Fix this : https://semgrep.dev/orgs/my_org_mohamed/findings?tab=open&primary=true&last_opened=All%20time
- Add total effort in TaskCard
- in course sidebar, add pastille in course sidebar, for the draft tasks as red and add tooltip
- in course sidebar yellow pastille add tooltip for overdue task
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
Task PlanETS better error handling:
    - add input dropdown (current session - last sessions) because sometimes PlanETS doesnt have the data in the current sesison or some session, so we pass in the parameter to user so that he could choose his session. Add better error handling when planets data is not found. (need to check its response when session not valid).
Kanban:
    - Github-like kanban (with DRAFT, TODO, IN PROGRESS, COMPLETED)
Google Calendar:
    - Add google calendar in new Integrations page.
    - Add a quick actions container in dashboard (add course, add task)
# Tech debt
- Fix the sidebar, use shadcn components (currently duplicate code for mobile - desktop).
- Smell: Fix this: "// Default to winter if between sessions."
    - It should select the last session, not winter.
- Smell: Fix the issue with dueDate being passed as a string.
    - Convert dueDate strings as soon as possible to Date objects and handle invalid dates
    - avoid as much as possible changing from string to date and back and forth.
