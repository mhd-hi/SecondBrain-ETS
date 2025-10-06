# Bugs
- add a proper state manager to avoid prop drilling shenanigans
- ~~color the course svg icon in the sidebar with the course color~~ ✅
# Features

## Stories:

- Add sentry (throw, log, error, debug, warning)

### Story: AI
-  Cache OpenAI tasks response in DB (5 points)
    -   If course is not in the `courses_cache` db, add it.
    -   Benefits:
        -   Cross-user sharing: Multiple users can benefit from the same cached response
        -   Cost optimization: Significant reduction in OpenAI API calls

### Story: Kanban Board
- Implement GitHub-like Kanban board (TODO, IN PROGRESS, COMPLETED) (5 points)

### Story: Roadmap Features
- Implement Monthly roadmap for better task visualization and movement (3 points)

#### Pomodoro
- we should be able to select a task in pomdoro page, it should be on top of pomodoroContainer, having a sort of select where its searchable to find our task. We should show a dropdown with CourseCodeBadge on the left (as a optional input), and show the title of the task on the right on a different searchable input select (if CourseCodeBadge not selected, we search on all the tasks of the user). We can either select the course code, then the task, OR the task directly. CourseCode should take smaller space then task.
Once we selected a task, and completed a pomdoro, we can call the pomodoro complete endpoint and passing the task id.
    - pomodoro page should be able to receive duration and task id in query params. Add task title in the UI on top of pomodoroContainer. We should be able to change task from there and uncheck task to not count in the pomodoro.
- Add github-like calendar to track pomdoro activity

#### Progress Tracking:
-  Add semester progress Board and dashboard page (progressbar for all courses) (3 points)
-  Add course progress Board inside the course page (progressBar for courses tasks) (2 points)

---

# Tests
### Task Management Testing
- Test add task (1 point)
- Test remove task (1 point)
- Test edit task (change date, title, subtasks) (3 points)
- Test change task status (2 points)
- Test Pomodoro effort tracking (user and task tables) (3 points)
- Test add subtasks (1 point)
- Test remove subtasks (1 point)
- Test edit subtasks (2 points)

### Story: API and Middleware Testing
- Test cron API and `cron-secret` route for deleting courses (3 points)
- Test middleware using sensitive API endpoints (2 points)

### Story: Course Management Testing
- Test add course (with `courses_cache`) (2 points)
- Test remove course (1 point)
- Test task creation upon course addition (2 points)
