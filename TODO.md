# Fixes
-

# Enhancement
- move the add task to the sidebar 
- "Tasks Due This Week or Overdue" Board in dashboard
    - Show the most important tasks
        - implement Group, per due date (by default). overdue come first.
        - implement Filter per due date this week (by default), this month, next quarter. This also takes the overdue.
        - Expanded - collapsed (ifts its expanded, when task has subtasks, it will show as a child)
- Remove review page and use course page instead
    - move the review buttons to courses (accept/delete all). 
    - accept/delete specific course
    - list subtasks

- Fix subtasks sprint
    - follow github projects type (sidebar opens on the right of the screen)
- Add search bar for searching a course in course page
- 


# Tech debt
- Fix the sidebar, use shadcn components (currently duplicate code for mobile - desktop).