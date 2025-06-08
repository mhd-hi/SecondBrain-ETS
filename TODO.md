# Fixes
- Enter doesnt submit input when adding a course
- Bug: We need to click on submit, then go to course page to create the courses and tasks. It should add course and tasks before we click on review tasks. 

# Enhancement
- move the add task to the sidebar 
- "Tasks Due This Week or Overdue" Board in dashboard
    - Show the most important tasks
        - implement Group, per due date (by default). overdue come first.
        - implement Filter per due date this week (by default), this month, next quarter. This also takes the overdue.
        - Expanded - collapsed (ifts its expanded, when task has subtasks, it will show as a child)
- Add a way to store courses tasks to prevent from using openai to reprocess the same data
- Add auth to launch the app to vercel
- Fix tasks edit (follow github issues - sidebar opens on the right, we can modify tasks and subtasks in it)
- Add search bar for searching a course in course page
- Add course link in todays focus
    - Remove course link from the tasks (right link icon)
- Use TaskCard in both dashboard and courses.
    -(0/2 subtasks) (progressbar 0%) in the same line. WHen clicking on subtasks badge, it expands  the subtasks.
- Add (try a different session) when adding a course, when a course is not available in a specific session.
    - maybe check the planets dropdown and determine the most recent valid session 
- Add semester progress Board and dashboard (progressbar for all courses) 

# Tech debt
- Fix the sidebar, use shadcn components (currently duplicate code for mobile - desktop).
- Fix this: "// Default to winter if between sessions."
    - It should select the last session, not winter.
- Fix the issue with dueDate being passed as a string.
    - Convert dueDate strings as soon as possible to Date objects and handle invalid dates
    - it should never be a string