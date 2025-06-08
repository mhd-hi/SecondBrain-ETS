# Fixes

# Enhancement
- Add auth to launch the app to vercel
- Add Pomodoro on the right of Todays Focus, give 1/3 space to pomodoro.
- Fix tasks edit (follow github issues - sidebar opens on the right, we can modify tasks and subtasks in it)
- Add search bar for searching a course in course page
- Add course link in todays focus
    - Remove course link from the tasks (right link icon)
- Use TaskCard in both dashboard and courses.
    -(0/2 subtasks) (progressbar 0%) in the same line. WHen clicking on subtasks badge, it expands  the subtasks.
- Add (try a different session) when adding a course, when a course is not available in a specific session.
    - maybe check the planets dropdown and determine the most recent valid session 
- Add semester progress Board and dashboard page (progressbar for all courses) 
- Add course progress Board inside the course page (progressBar for courses tasks)

# Tech debt
- Fix the sidebar, use shadcn components (currently duplicate code for mobile - desktop).
- Fix this: "// Default to winter if between sessions."
    - It should select the last session, not winter.
- Fix the issue with dueDate being passed as a string.
    - Convert dueDate strings as soon as possible to Date objects and handle invalid dates
    - it should never be a string
- Add a way to store courses tasks to prevent from using openai to reprocess the same data