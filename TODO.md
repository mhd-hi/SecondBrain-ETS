# Bugs

## Technical Debt
- Fix "Default to winter if between sessions" smell (should select the next session)
    - Add a input session dropdown and select the right session
- Fix `dueDate` being passed as a string (3 points)
    -   Convert `dueDate` strings to Date objects as soon as possible and better handle invalid dates (in edit task, add task, in the pipeline when trying to convert tasks from weeks to dates).
    -   Avoid excessive conversion between string and Date types.

---

# Features

## Stories:

### Complete All -> Review
- Instead of "complete all" buttons, change to "Review tasks", that will open a modal where we can either complete the task or just leave as is (if student didnt complete the task).
- Add a Must-do tile in dashboard to let users now that you need to review some tasks (will bring them to the specific page and open the "review tasks" dialog).
### Today's Focus Enhancements
- In course page, when there's a change in course status, it doesnt change the count status badge in the sidebar.
- Dont show overdue by x ... when task is completed.
### Course
-  Add tasks "edit" functionality (5 points)
    -   Follow GitHub issues style - sidebar opens on the right, allowing modification of tasks and subtasks.

### Story: AI/Onboarding course
-  Ask user for course periods (session periods) to better determine task due dates (2 points)
    - Ex: whats ur first and second course date, on a normal week (for better task date accuracy)
-  Cache OpenAI tasks response in DB (5 points)
    -   If course is not in the `openai_cache` db, add it.
    -   Benefits:
        -   Cross-user sharing: Multiple users can benefit from the same cached response
        -   Cost optimization: Significant reduction in OpenAI API calls
        -   Performance: Faster response times for cached courses
-  Add intra date information in description of intra task.

-  (not sure if already completed) Improve date accuracy of tasks (2 points)
    -   For new tasks, set default date as today+1week in the dialog.

### Story: PlanETS Integration Improvements
- Enhance PlanETS error handling and session selection (5 points)
    -   Add an input dropdown for selecting session when fetching data from planets (e.g., current session, last sessions).
    -   Handle cases where PlanETS doesn't have data in the current session or some sessions.
    -   Pass the session parameter to the user so they can choose their session.
    -   Add better error handling when PlanETS data is not found.
    -   Check the response when the session is not valid.

### Story: Kanban Board
- Implement GitHub-like Kanban board (DRAFT, TODO, IN PROGRESS, COMPLETED) (5 points)

### Story: Integrations
- Add Google Calendar integration (5 points)
    -   Add Google Calendar in new Integrations page.

-   Add link to Quick actions in dashboard.
-   Or if user not connected, maybe ask him to.

### Story: Roadmap Features
- Implement Monthly roadmap for better task visualization and movement (3 points)

## QOL
- add tooltip to "Close sidebar" button located in navbar
- make the add course button have less radius
#### Course
- change UI in course page to reduce week pb and mb
#### Pomodoro
- we should be able to select a task in pomdoro page, it should be on top of pomodoroContainer, having a sort of select where its searchable to find our task. We should show a dropdown with CourseCodeBadge on the left (as a optional input), and show the title of the task on the right on a different searchable input select (if CourseCodeBadge not selected, we search on all the tasks of the user). We can either select the course code, then the task, OR the task directly. CourseCode should take smaller space then task.
Once we selected a task, and completed a pomdoro, we can call the pomodoro complete endpoint and passing the task id.
- pomodoro page should be able to receive duration and task id in query params. Add task title in the UI on top of pomodoroContainer. We should be able to change task from there and uncheck task to not count in the pomodoro.
- add preference to pomodoro default settings (duration of pomodoro, small and long break, volume, preference of sound) in localstorage and in settings page (under pomodoro section).
- Add github-like calendar to track pomdoro activity
    - might need to refactor db to create new pomodoro table
#### Dashboard
- make TaskCard responsive
- make Deep Work responsive
- remove deep work tile (its useless)
- add a bigger border between 2 parts of statusChanger
#### Pomodoro
- fix pomodoro settings
    - fix indexing, cant switch over tabs using "tab" key, should be the first 3 to index over.
#### Progress Tracking:
-  Add semester progress Board and dashboard page (progressbar for all courses) (3 points)
-  Add course progress Board inside the course page (progressBar for courses tasks) (2 points)
#### Dashboard Enhancements
- Add quick actions container in dashboard (add course, add task, start pomodoro) (2 points)

# Tests
### Task Management Testing
- Test add task (1 point)
- Test remove task (1 point)
- Test edit task (change date, title, subtasks) (3 points)
- Test change task status (2 points)
- Test "Accept all" DRAFT tasks (should change all DRAFT tasks to TODO) (2 points)
- Test "Remove all" DRAFT tasks (will remove all DRAFT tasks) (1 point)
- Test Pomodoro effort tracking (user and task tables) (3 points)
- Test add subtasks (1 point)
- Test remove subtasks (1 point)
- Test edit subtasks (2 points)

### Story: API and Middleware Testing
- Test cron API and `cron-secret` route for deleting courses (3 points)
- Test middleware using sensitive API endpoints (2 points)

### Story: Course Management Testing
- Test add course (with `openai_cache`) (2 points)
- Test remove course (1 point)
- Test task creation upon course addition (2 points)
