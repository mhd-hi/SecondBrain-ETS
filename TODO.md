# Fixes
-

# Enhancement
- move the add task to the sidebar 
- "Tasks Due This Week or Overdue" Board in dashboard
    - Show the most important tasks
        - implement Group, per due date (by default). overdue come first.
        - implement Filter per due date this week (by default), this month, next quarter. This also takes the overdue.
        - Expanded - collapsed (ifts its expanded, when task has subtasks, it will show as a child)

- Fix tasks edit (follow github issues - sidebar opens on the right, we can modify tasks and subtasks in it)
- Add search bar for searching a course in course page
- 


# Tech debt
- Remove review page and use course page instead
    - move the review buttons to courses (accept/delete all). 
    - accept/delete specific course
    - list subtasks
- Fix the sidebar, use shadcn components (currently duplicate code for mobile - desktop).
- Fix this: "// Default to winter if between sessions."
    - It should select the last session, not winter.
- Fix the issue with dueDate being passed as a string.