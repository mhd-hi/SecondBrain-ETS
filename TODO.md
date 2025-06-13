# Fixes
- Add totalEffort/estimatedEffort in TaskCard
    Remove 0/2 subtasks badge, add ("graphIcon 0% complete"). This calculate the number of actualEffort/EstimatedEffort of the task. Also before the overdue text, add a clock icon with the hours effort (like "clockIcon 2h 30min"). They all should be in the same line.
- For complete all overdue, make it so that it only clears the draft, todo overdue tasks, but not the in progress tasks.
Course sidebar:
- in course sidebar, add pastille in course sidebar, for the draft tasks as red and add tooltip
- in course sidebar yellow pastille add tooltip for overdue task

# Enhancement
Todays Focus:
- Add course code filter
    - Add a filter icon (entenoir) besides the button This week (on its left) and when clicking on it, add a multi dropdown for selecting the course. The default is that all courses are selected.
Tasks edit :
- Add tasks edit (follow github issues - sidebar opens on the right, we can modify tasks and subtasks in it)
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
    - Add an input dropdown for selecting session when fetching data from planets (e.g., current session, last sessions).
    - Sometimes PlanETS doesn't have the data in the current session or some sessions.
    - Pass the session parameter to the user so they can choose their session.
    - Add better error handling when PlanETS data is not found.
    - Check the response when the session is not valid.
Kanban:
    - Github-like kanban (with DRAFT, TODO, IN PROGRESS, COMPLETED)
Google Calendar:
    - Add google calendar in new Integrations page.
    - Add a quick actions container in dashboard (add course, add task)
Weekly Roadmap:
    - Monthly roadmap to have a better view of tasks and easily move around tasks?
Integrate SoundCloud
    - Add it to pomodoro
    - Add link to Quick actions in dashboard
    - Or if user not connected, maybe ask him to
# Tech debt
- Fix the sidebar, use shadcn components (currently duplicate code for mobile - desktop).
- Smell: Fix this: "// Default to winter if between sessions."
    - It should select the last session, not winter.
- Smell: Fix the issue with dueDate being passed as a string.
    - Convert dueDate strings as soon as possible to Date objects and handle invalid dates
    - avoid as much as possible changing from string to date and back and forth.

# TESTS
- Test the cron api, double-check the cron-secret route to delete courses is working correctly.
- Test middleware
- Test add course (with openai_cache)
- Test add task output
- Test remove course
- Test remove task
- Test pomodoro (test the effort has worked in both user and task tables)
- Test edit task (change date, change title)
