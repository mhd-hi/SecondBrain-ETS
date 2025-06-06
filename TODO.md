# Fixes
- Add a container bg color to each container in the dashboard.
- Use name of days of week for header in dayColumn.
- fix week/due date conflict
- fix review page, show a list of courses to review 

# Enhancement
- When adding a course, add a progress to see which state we're on (planets - openai - review stage)
    - move the add task to the sidebar 
- "Tasks Due This Week or Overdue" Board in dashboard
    - Show the most important tasks
        - implement Group, per due date (by default). overdue come first.
        - implement Filter per due date this week (by default), this month, next quarter. This also takes the overdue.
        - Expanded - collapsed (ifts its expanded, when task has subtasks, it will show as a child)
- Start subtasks sprint
    - follow github projects type (sidebar opens on the right of the screen)


# Tech debt
- Fix the sidebar, use shadcn components.

