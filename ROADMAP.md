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

## Stage 16: Fixed Tiles And App Icon Polish

Status: Complete

Refine the tile grid and icon behavior after CEO review.

Completed features:

- Changed task tiles from fluid/resizing squares to fixed-size tiles.
- Kept two fixed tile columns on mobile.
- Added an explicit `Date` picker button next to due date inputs.
- Replaced the logo with full-square 45-degree stripes alternating black, magenta, and cyan.
- Added PNG app icons for browser and iPhone home-screen support.

## Stage 17: Tile Size And Add Form Tuning

Status: Complete

Tune the square task interaction after CEO review.

Completed features:

- Increased fixed task tile size while preserving two-across mobile layout.
- Centered and enlarged the add-task plus tile.
- Expanded the add-task form into a larger panel.
- Changed the add submit action to `Create task`.
- Made task action buttons solid colors with better tile fit.

## Stage 18: Expanding Add Tile

Status: Complete

Make the add-task interaction feel like a tile growing into a form instead of a cramped card.

Completed features:

- Add tile and add form share a view-transition identity for supported browsers.
- Opened add form expands to two tile widths.
- Opened add form grows vertically for its fields and controls.
- Closing or creating a task transitions back into the grid flow.
- Edit pencil button turns cyan on magenta highlighted tiles.

## Stage 19: Tile Information Compression

Status: Complete

Improve fixed tile readability, especially on mobile.

Completed features:

- Desktop tile grid uses fixed-size columns across the available screen.
- Tile metadata is compressed into short chips.
- Importance displays as H/M/L in a black circle.
- Due dates display as month and day chips without the year.
- `Due today` is shortened to `Due`.
- Overdue state uses a compact warning icon.
- Add and edit expanded panels keep the same color family as their originating tile.
- Archive tiles use light grey with darker crossed-out text.

## Stage 20: Sticky Note Tile Lock

Status: Complete

Make the task grid behave more like physical sticky notes.

Completed features:

- Desktop tiles use fixed 196px sizing.
- Desktop grid leaves empty space until another full column fits.
- Mobile keeps two side-by-side tiles.
- `Due` chip uses red text.
- Buttons use pill/capsule styling.
- Add plus is centered in its tile.
- Save buttons use the opposite cyan/magenta color of the tile being edited.

## Planned Later Improvements

- Spellcheck for task entry and notes.
- Better expanded more-info display for dense task details.
- Categories such as `Main`, `Fun Projects`, and `Buy`.
- A master urgent view for tasks due in the next 3 days across all categories.
- Desktop category columns that can scroll side-to-side.
- Mobile category swiping.
- Per-category task field toggles, such as hiding due date for a category.
- Calendar sync.
- Shared categories with other accounts for shared to-do lists.
- Daily to-dos that can be checked off every day without living in the main task tile list.
- Push notifications.
- Desktop display mode for an always-visible view.
- Move older archive tasks into a menu-accessible archive window while keeping recent archive items under the main list.
- Sort controls near the menu for due date, urgency, estimated time, and other task metrics, plus a master sort that returns to the user's manually arranged order.
- Multi-select and multi-delete for batch task cleanup.
- A daily "I worked on this task" action that highlights worked-on tasks for the day, awards points, adds completion points, and tracks daily point targets against a running total.
- Authenticated AI API access so the user's normal AI account can read and update tasks with permission.
- Custom colour-scheme builder with colour pickers for task tiles, action colours, backgrounds, and text contrast.
- Far future accountability pot where users can deposit money and Tile Todo deducts from the pot on days they end with negative points.

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
- Spellcheck
- Better more-info display
- Categories
- Master urgent cross-category view
- Category field toggles
- Calendar sync
- Shared categories / shared to-do lists
- Daily to-dos outside the main tile list
- Push notifications
- Desktop display mode
- Menu archive window with only recent completed tasks visible below the main list
- Sort button with due date, urgency, estimated time, other metric sorts, and a master/manual-order sort
- Multi-select and multi-delete
- Daily worked-on action, point totals, completion points, daily point targets, and running positive/negative balance
- Authenticated AI API access for reading/updating tasks from a normal AI account
- Custom colour-scheme builder with colour pickers
- Far future money/accountability pot tied to ending the day negative

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
