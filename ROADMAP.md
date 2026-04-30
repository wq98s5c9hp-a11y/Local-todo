# ROADMAP.md

## Roadmap

The project should move in small, reviewable stages. Do not skip ahead without the user's approval.

## Stage 0: Planning

Status: Complete

Create project planning files:

- `AGENTS.md`
- `PRODUCT_SPEC.md`
- `ROADMAP.md`

No app code should be built in this stage.

## Stage 1: Project Scaffold

Status: Complete

Create the initial app shell using the preferred stack:

- Vite
- React
- TypeScript, if reasonable

Keep the scaffold minimal. Do not add routing, state libraries, UI libraries, backend tooling, or extra dependencies unless explicitly approved.

Expected outcome:

- The app can be installed and run locally.
- The default scaffold is cleaned up enough to prepare for implementation.

## Stage 2: Task Data And Local Persistence

Status: Complete

Define the task model and LocalStorage persistence helpers.

Expected outcome:

- Tasks can be loaded from LocalStorage.
- Tasks can be saved to LocalStorage.
- Invalid or missing stored data is handled safely.

## Stage 3: Basic Task Creation

Status: Complete

Build the first usable task form.

Expected outcome:

- The user can add a task.
- The task includes title, importance, and estimated duration.
- New tasks appear in the active task list.
- Tasks persist after refresh.

## Stage 4: Task Editing And Deletion

Status: Complete

Add controls for maintaining existing tasks.

Expected outcome:

- The user can edit a task.
- The user can delete a task.
- Changes persist after refresh.

## Stage 5: Completion And Archive View

Status: Complete

Separate active and completed tasks.

Expected outcome:

- The user can mark a task complete.
- Completed tasks move to a completed/archive section.
- Completed tasks remain available for reference.
- Completion state persists after refresh.

## Stage 6: Product Director Sprint 1

Status: Complete

Refine the current V1 app around visibility and notepad-like usability.

Expected outcome:

- The interface is clean and readable.
- Active and completed sections are easy to scan.
- Controls are clear and consistent.
- The top 4 active tasks are easy to see at a glance.
- The app remains simple and close to a written notepad.

## Stage 7: Task Details

Status: Complete

Add controlled support for more information on a task without cluttering the default view.

Candidate fields:

- Due date
- Urgency threshold
- Description or important info

Expected outcome:

- The main list stays readable.
- Extra task detail is available behind an explicit control.
- The CEO can test whether detail fields help or slow down capture.

## Stage 8: Importance And Urgency Sorting

Status: Complete

Evolve the current priority field into a clearer importance/urgency model.

Expected outcome:

- Importance captures how much the task matters.
- Urgency captures how pressing the task is.
- Active tasks can be ordered by a simple, understandable balance of importance and urgency.

## Stage 9: Completed Archive Improvements

Status: Complete

Improve completed-task behavior.

Completed features:

- Restore completed task to active list.
- Keep archive readable.
- Add simple repeat behavior for daily, weekly, monthly, and yearly tasks.

## Stage 10: Local Backup

Status: Complete

Add local-only backup and restore.

Expected outcome:

- The user can export task data as a JSON backup.
- The user can import a JSON backup.
- The user can see when the app last saved data locally.

## Phase 2: Generalisable Product

Status: Started

Make the app usable by other people with accounts.

Backend, authentication, account data ownership, and sync have started with Supabase.

## Stage 11: Supabase Account Sync

Status: Complete

Add account-backed sync so the task list is available across devices and when the development computer is off.

Expected outcome:

- The user can create an account.
- The user can sign in.
- Tasks sync to Supabase.
- Local tasks merge into the signed-in account.
- The app keeps local backup/export behavior.

## Stage 12: Hosted Web Deployment

Status: Prepared

Deploy the app to a hosted URL so it can be used when the development computer is off.

Expected outcome:

- The app is hosted on Vercel or an equivalent static host.
- Supabase environment variables are configured in the host.
- Supabase Auth redirect URLs use the hosted URL.
- The app can be opened from mobile on cellular.

## Stage 13: Mobile Polish And Home Screen Support

Status: Complete

Make the app more comfortable as a phone-first task surface.

Expected outcome:

- Secondary account and backup controls move out of the way.
- Task creation opens only when requested.
- The app can be added to an iPhone home screen.
- The top task list stays more visible on small screens.

## Stage 14: Compact Task List Controls

Status: Complete

Make the main task list feel more like a compact working notepad.

Completed features:

- Updated the app logo with cyan, magenta, and black check-stripe artwork.
- Added manual move up/down controls for active tasks.
- Made task action controls smaller and more compact.
- Changed list items to square cards.
- Highlighted the top four active tasks.
- Moved `Add task` into the active list as a task-shaped box.

## Stage 15: Square Grid Refinement

Status: Complete

Refine the task surface after CEO review.

Completed features:

- Changed active tasks into a square tile grid.
- Kept two columns on mobile and a responsive grid on desktop.
- Kept rounded corners.
- Made highlighted tiles solid magenta and normal active tiles solid cyan.
- Added browser-supported view-transition animation for task reordering.
- Changed repeat scheduling to create the next task from the completion date.
- Limited due dates to a maximum of 365 days out.
- Updated the logo to use thicker repeating stripes across the check shape.

## Later Ideas

These are intentionally outside version 1:

- Tags
- Projects
- Search
- Filtering
- AI-assisted planning
- Keyboard shortcuts
- Reminders
- TV-specific display mode
- Desktop always-on packaging

Any later idea should be discussed before implementation.

## Product Director Sprint Gate

CEO direction collected:

- Primary user
- Daily workflow
- Required task fields
- Priority behavior
- Completed-task behavior
- Visual style
- Explicit non-goals

Next step: put the project in GitHub, import it into Vercel, configure environment variables, then update Supabase Auth URLs.
