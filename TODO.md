# Fixes
- data is not received when adding a course, we need to manually update the page.
- update sidebar mycourses data too on add course event 
# Enhancement
+ Add auth to launch the app to vercel
- Add Pomodoro on the right of Todays Focus, give 1/3 space to pomodoro.
- Fix tasks edit (follow github issues - sidebar opens on the right, we can modify tasks and subtasks in it)
- Add search bar for searching a course in course page
- Add (try a different session) when adding a course, when a course is not available in a specific session.
    - maybe check the planets dropdown and determine the most recent valid session
Progress:
- Add semester progress Board and dashboard page (progressbar for all courses) 
- Add course progress Board inside the course page (progressBar for courses tasks)
- Add theme toggle in Profile page.
-  We can create a task without a course. 
- Ask user for its course periods to better determine task due dates.

# Tech debt
- Fix the sidebar, use shadcn components (currently duplicate code for mobile - desktop).
- Fix this: "// Default to winter if between sessions."
    - It should select the last session, not winter.
- Fix the issue with dueDate being passed as a string.
    - Convert dueDate strings as soon as possible to Date objects and handle invalid dates
    - it should never be a string
- Add a way to store courses tasks to prevent from using openai to reprocess the same data
- Course save ai data: 
    - Can you add the parsed content of openai by adding it in a new json column. That way, if we already have  the content, we wont need to do a new request when we already have the data in our database. That would  also reduce the costs of ai. SO basically before adding a course usiong , 






- Deploy to vercel: 
    Google: https://console.cloud.google.com/auth/clients/470248852209-kgs2okpd3ai1151ig52j0itom31md8ev.apps.googleusercontent.com?authuser=7&inv=1&invt=AbzmsQ&project=rugged-truck-462322-s5&supportedpurview=project
    - Add authorized javascript origin : https://your-production-domain.com
    - Authorized Redirect URIs: https://your-production-domain.com/api/auth/callback/google
    - Discord: Redirects: https://discord.com/developers/applications/1381408285143597116/oauth2