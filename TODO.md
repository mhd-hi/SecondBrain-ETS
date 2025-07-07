- Fix codescan and copilot: https://github.com/mhd-hi/second-brain/pull/10
- pomodoro page should be able to receive duration and task id in params. Add task title in the UI on top of pomodoroSession. We should be able to change task from there and uncheck task to not count in the pomodoro.
- add preference to pomodoro default settings (duration of pomodoro, small and long break, volume, preference of sound) in localstorage and in settings page (under pomodoro section).

## Story: Today's Focus Enhancements
- remove status from subtasks
- In course page, when there's a change in course status, it doesnt change the count status badge in the sidebar.
- Dont show overdue by x ... when task is completed.

1.  Add course code filter (3 points)
    -   Add a filter icon (entenoir) besides the button "This week" (on its left or in second line and when selecting a course (lets say LOG320), it creates a badge where it has a X icon on its left, we can clear the filter that way by clicking on the course LOG320) and when clicking on it, add a dropdown for selecting the course. The default behaviour of that filter is that all courses are selected.
2.  Add tasks edit functionality (5 points)
    -   Follow GitHub issues style - sidebar opens on the right, allowing modification of tasks and subtasks.
3.  Ask user for course periods to better determine task due dates (2 points)
    - Whats ur first and second course date, on a normal week (for better date accuracy)
4. Instead of "complete all" buttons, change to "Review tasks", that will open a modal where we can either complete the task or just leave as is (if student didnt complete the task).

## Story: AI Enhancements
4.  Cache OpenAI tasks response in DB (5 points)
    -   If course is not in the `openai_cache` db, add it.
    -   Benefits:
        -   Cross-user sharing: Multiple users can benefit from the same cached response
        -   Cost optimization: Significant reduction in OpenAI API calls
        -   Performance: Faster response times for cached courses
5.  Add intra date information in description of intra task.

6.  (not sure if already completed) Improve date accuracy of tasks (2 points)
    -   For new tasks, set default date as today+1week in the dialog.

## Story: Progress Tracking
6.  Add semester progress Board and dashboard page (progressbar for all courses) (3 points)
7.  Add course progress Board inside the course page (progressBar for courses tasks) (2 points)

## Story: Profile and Notifications
8.  Add theme toggle in Profile page (1 point)
9.  Send web notification when task is overdue (3 points)

## Story: PlanETS Integration Improvements
10. Enhance PlanETS error handling and session selection (5 points)
    -   Add an input dropdown for selecting session when fetching data from planets (e.g., current session, last sessions).
    -   Handle cases where PlanETS doesn't have data in the current session or some sessions.
    -   Pass the session parameter to the user so they can choose their session.
    -   Add better error handling when PlanETS data is not found.
    -   Check the response when the session is not valid.

## Story: Kanban Board
11. Implement GitHub-like Kanban board (DRAFT, TODO, IN PROGRESS, COMPLETED) (5 points)

## Story: Integrations
12. Add Google Calendar integration (5 points)
    -   Add Google Calendar in new Integrations page.

-   Add link to Quick actions in dashboard.
-   Or if user not connected, maybe ask him to.

## Story: Dashboard Enhancements
14. Add quick actions container in dashboard (add course, add task) (2 points)

## Story: Roadmap Features
15. Implement Monthly roadmap for better task visualization and movement (3 points)

## Story: Technical Debt Refact
17. Fix "Default to winter if between sessions" smell (should select the last session) (2 points)
18. Fix `dueDate` being passed as a string (3 points)
    -   Convert `dueDate` strings to Date objects as soon as possible and better handle invalid dates (in edit task, add task, in the pipeline when trying to convert tasks from weeks to dates).
    -   Avoid excessive conversion between string and Date types.

## Story: API and Middleware Testing
19. Test cron API and `cron-secret` route for deleting courses (3 points)
20. Test middleware using sensitive API endpoints (2 points)

## Story: Course Management Testing
21. Test add course (with `openai_cache`) (2 points)
22. Test remove course (1 point)
23. Test task creation upon course addition (2 points)

## Story: Task Management Testing
24. Test add task (1 point)
25. Test remove task (1 point)
26. Test edit task (change date, title, subtasks) (3 points)
27. Test change task status (2 points)
28. Test "Accept all" DRAFT tasks (should change all DRAFT tasks to TODO) (2 points)
29. Test "Remove all" DRAFT tasks (will remove all DRAFT tasks) (1 point)
30. Test Pomodoro effort tracking (user and task tables) (3 points)
31. Test add subtasks (1 point)
32. Test remove subtasks (1 point)
33. Test edit subtasks (2 points)

(Optimisation)
-  courses list sidebar receives a heavy amount of data when it only needs specific data (course code and count of statuses)

(Features)
- Add a Must-do tile in dashboard to let users now that you need to review some tasks (will bring them to the specific page and open the "review tasks" dialog).
