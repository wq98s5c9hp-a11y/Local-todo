# SPRINT_PLAN.md

## Current Sprint Status

Status: Sprint 20 executed

## Sprint 2: Full Local Task Power-Up

Goal: Add the local-only task features that improve usefulness without requiring accounts, backend, cloud sync, AI, notifications, calendar/email integrations, TV mode, or mobile packaging.

## Completed Scope

- Added due date.
- Added urgent-before threshold.
- Renamed priority concept to importance.
- Added computed urgency labels.
- Sorted active tasks by urgency plus importance.
- Added expandable task details.
- Added combined details / important info field.
- Added export backup.
- Added import backup.
- Added last-saved indicator.
- Kept data local-first with LocalStorage.
- Added no new dependencies.

## Deferred

- Repeat tasks
- Tags
- Projects
- Search
- Filtering
- Custom urgency scoring controls
- Accounts
- Backend
- Cloud sync
- AI updates
- TV-specific display
- Desktop always-on packaging

## Recommended Sprint 3 Options

Sprint 3 chosen: Supabase account sync.

## Sprint 3: Account Sync Foundation

Goal: Allow the same task list to be accessed across devices and when the development computer is off.

## Completed Scope

- Added Supabase client dependency.
- Added Supabase environment configuration.
- Added email/password account panel.
- Added sign-up, sign-in, and sign-out.
- Added cloud task loading.
- Added cloud task syncing.
- Added local-to-cloud merge on sign-in.
- Preserved LocalStorage and JSON backup behavior.
- Added Supabase SQL schema file.

## Remaining Setup

- Run `SUPABASE_SCHEMA.sql` in the Supabase dashboard SQL editor.
- Restart the local dev server so Vite reads `.env.local`.
- Create/sign into an account in the app.
- Test the same account from another device or hosted deployment.

## Recommended Sprint 4 Options

- Deploy the app so it works when the computer is off.
- Add repeat tasks.
- Add search and filtering.

## Sprint 4: Hosted Web App

Goal: Prepare the app for deployment so it can be accessed from phone and laptop when the development computer is off.

## Completed Prep

- Added Vercel deployment config.
- Added deployment instructions.
- Documented required Vercel environment variables.
- Documented required Supabase Auth URL settings.

## Remaining Manual Steps

- Put the project in a GitHub repository.
- Import it into Vercel.
- Add Supabase environment variables in Vercel.
- Update Supabase Auth URLs after Vercel gives the deployed URL.
- Test sign-in and task sync from phone and laptop.

## Sprint 5: Mobile Polish And Home Screen Support

Goal: Make the hosted app feel better on mobile and keep secondary controls out of the main task surface.

## Completed Scope

- Added PWA manifest.
- Added app icon.
- Added iPhone home-screen metadata.
- Made the header smaller.
- Moved account sync into a menu.
- Moved export/import backup into the same menu.
- Changed task creation to open from an `Add task` button.
- Preserved existing task, sync, and backup behavior.

## Sprint 6: Repeat Tasks And Magenta Add Action

Goal: Add the CEO-requested yearly repeat option while keeping repeat behavior simple, and add a stronger magenta accent to the main add-task action.

## Completed Scope

- Added repeat options for none, daily, weekly, monthly, and yearly.
- Added repeat selection to the add-task form.
- Added repeat selection to task editing.
- Created a new active copy when a repeating task is completed.
- Kept the completed copy in the archive.
- Added Supabase schema and migration support for repeat values.
- Changed the main `Add task` button to a magenta accent.

## Sprint 7: Compact Task List Controls

Goal: Make the main list more compact, more visual, and more directly controllable.

## Completed Scope

- Updated the logo to a cyan, magenta, and black striped check shape.
- Added manual move up/down controls to active tasks.
- Added synced task ordering support.
- Made task action controls smaller.
- Changed task list items to square cards.
- Highlighted the top four active tasks.
- Moved the add-task entry point into the active task list.

## Sprint 8: Square Grid Refinement

Goal: Correct repeat behavior and make the main task surface a more visual square grid.

## Completed Scope

- Changed repeat generation to schedule from the completion date.
- Guarded completion against rapid double-click repeat creation.
- Limited due dates to 365 days out.
- Changed the active list to a square tile grid.
- Kept two columns on mobile and a responsive grid on desktop.
- Added view-transition animation when moving tasks.
- Made normal active tasks cyan and the top four active tasks magenta.
- Restored rounded corners.
- Updated the logo with thicker repeating stripes.

## Sprint 9: Fixed Tiles And App Icon Polish

Goal: Keep task tiles visually stable and make the app icon update reliably across browser tabs and phone home screens.

## Completed Scope

- Changed task tiles to fixed dimensions instead of fluid resizing.
- Kept mobile to a fixed two-column tile grid.
- Added an explicit date-picker button beside due date fields.
- Replaced the logo with solid 45-degree stripes across the full square.
- Added PNG app icon assets for installed/home-screen use.
- Added cache-busted icon references in app metadata.

## Sprint 10: Tile Size And Add Form Tuning

Goal: Make the tile grid easier to use on mobile and make task creation feel like a full form after tapping the add tile.

## Completed Scope

- Increased fixed tile sizing.
- Preserved two-across mobile layout.
- Centered and enlarged the add-task plus.
- Changed the opened add form into a larger full-width panel.
- Changed add submit copy to `Create task`.
- Made tile action buttons solid colors.
- Adjusted task action buttons to fit better inside tiles.

## Sprint 11: Expanding Add Tile

Goal: Make task creation feel like the add tile expands into a full form and then returns to the grid.

## Completed Scope

- Added a shared view transition between the add tile and add form.
- Changed the add form to span two tile widths.
- Let the add form grow vertically to fit all inputs and controls.
- Animated closing and create-task transitions where supported.
- Made the edit pencil cyan on magenta highlighted tiles.

## Sprint 12: Tile Information Compression

Goal: Keep fixed tiles readable on desktop and mobile while preserving the square grid interaction.

## Completed Scope

- Locked the desktop grid to fixed-size columns across available width.
- Simplified importance to H/M/L chips.
- Shortened due-date display to month and day chips.
- Shortened `Due today` to `Due`.
- Changed overdue display to a compact warning icon.
- Made add and edit expanded panels keep tile-colored backgrounds.
- Styled archive tiles as grey with darker crossed-out titles.

## Added To Roadmap

- Spellcheck.
- Better more-info display.

## Sprint 13: Sticky Note Tile Lock

Goal: Make the task tiles behave more like physical sticky notes and polish button contrast.

## Completed Scope

- Locked desktop task tiles to literal 196px columns and 196px tiles.
- Preserved two-across mobile tile sizing.
- Made `Due` display in red.
- Changed controls to pill/capsule button styling.
- Centered the add-task plus in the tile.
- Made add/create controls use magenta capsule styling.
- Made edit save use the opposite cyan/magenta color of the tile being edited.

## Sprint 14: Due-Aware Sorting And Tile Metadata

Goal: Make tiles easier to scan and make sorting behave according to urgency and importance instead of newest-created order.

## Completed Scope

- Put due-date chips on their own row under importance/urgency.
- Added days-until-due chips before month/day chips.
- Added blue/yellow/red due timing colors.
- Removed the expanded add form magenta outline.
- Fixed mobile edit panels to span two tile widths.
- Kept completed restore as a plain return arrow.
- Reworked sorting around due score, urgency threshold, importance, and bounded manual bias.
- Added requested category/calendar/sharing ideas to the roadmap without implementing them.

## Sprint 15: Estimate Controls And Manual Drag Sorting

Goal: Make time estimates clearer and make task ordering easier to control without breaking due-date urgency.

## Completed Scope

- Replace the plain estimate entry with amount plus minutes/hours/days/weeks options.
- Tune the sorting score so nearer due dates strongly outweigh far-future priority.
- Keep up/down controls but make them adjust a bounded manual bias instead of absolute position.
- Add drag-style manual reordering for active tiles.
- Prevent exact score ties with a tiny stable tie-breaker.
- Add daily to-dos, push notifications, and desktop display to the roadmap only.

## Sprint 16: Tile Action Cleanup And Mobile Movement

Goal: Tighten task tile controls, prevent mobile zoom issues, and make movement/delete/archive behavior clearer.

## Completed Scope

- Made restore green on completed task tiles.
- Moved completed date out of the tile and into the expanded info area.
- Changed estimate input to a simple unit dropdown.
- Removed estimate display from task tiles.
- Removed delete from the main tile actions and moved delete into edit with confirmation.
- Added a grip control for pointer-based tile moving on desktop and mobile.
- Removed repeated days-until-due from the priority/urgency row.
- Made icon buttons rounded squares while keeping text/info chips pill-shaped.
- Added browser spellcheck/autocorrect hints to task title and details fields.
- Added future archive-window behavior to the roadmap only.

## Sprint 17: Theme Controls And Live Sync Refresh

Goal: Add palette customization and make signed-in task sync update across browsers more reliably.

## Completed Scope

- Added selectable colour schemes: CMYK Pop, Storybook Muted, Earth Workspace, Neon Modern, and Apple Clean.
- Kept light/dark mode separate from colour scheme with `data-theme` and `data-scheme`.
- Added a saturation slider persisted to localStorage.
- Applied saturation to app theme colours while keeping semantic green/yellow/red actions stable.
- Added a live preview row in the Appearance menu.
- Added focus/visibility cloud refresh for signed-in users.
- Added Supabase Realtime subscription for live task updates where Realtime is enabled.
- Made synced signed-in reloads use the cloud task list as source of truth to avoid stale browser data resurrecting old tasks.
- Changed drag placement feedback to a neutral between-tile marker instead of a yellow tile highlight.

## Sprint 18: Theme Defaults And Palette Replacement

Goal: Make mobile tiles fit cleanly and replace the less distinct colour schemes with stronger palette options.

## Completed Scope

- Default colour scheme changed to Earth Workspace.
- Default saturation changed to 75%.
- Old saved `neon` settings migrate to Acid Terminal.
- Old saved `apple` settings migrate to Tonal Contemporary.
- Replaced Neon Modern and Apple Clean with Mustard Cinema, Acid Terminal, and Tonal Contemporary.
- Kept CMYK Pop, Storybook Muted, and Earth Workspace.
- Adjusted light/dark backgrounds away from pure white/black.
- Removed visible tile borders.
- Tightened mobile tile sizing so two tiles fit with extra breathing room.
- Reduced pill text/padding and kept date chips on one row.

## Sprint 19: Tile Todo Naming And Info Panel Polish

Goal: Make the brand/UI naming consistent and make mobile tile spacing reliable across light and dark themes.

## Completed Scope

- Renamed the visible app and metadata to Tile Todo.
- Changed the header logo to use the same PNG app icon asset as installed/browser icon contexts.
- Made the add plus and plus circle use the same colour in every theme.
- Changed the info action to use the same contrast colour as edit.
- Made info/details expansion turn into a larger two-tile panel like edit.
- Fixed dark-mode mobile tile sizing by overriding the tile-size variable at matching specificity.
- Set default saturation to 90%.
- Added future sort controls to the roadmap without implementing them.

## Sprint 20: Flags, Due Time, And Highlight Rules

Goal: Add lightweight task flags and due-time capture while simplifying tile controls.

## Completed Scope

- Removed up/down arrow controls from active task tiles.
- Added an upper-right flag toggle on each tile.
- Added flag type choices to add/edit: red flag, green flag, red circle, green circle, red X, and green X.
- Added due time to add/edit and showed it only inside the expanded info area.
- Made info expansion singleton-style so opening another info panel collapses the previous one.
- Kept at least the top 4 tasks highlighted, and also highlighted every task due today or tomorrow.
- Added multi-select/multi-delete, worked-on points, and far-future money-pot ideas to the roadmap only.
- Added a Supabase migration for flag and due-time columns.

## Sprint 21: Keep-Visible Sorting, Time Blocks, And Sync Safety

Goal: Make flags function as a useful keep-visible signal, replace inconsistent native time controls with consistent app controls, and reduce the risk of newly created tasks disappearing after reload.

## Planned Scope

- Make tile flags smaller and less visually heavy.
- Treat flagged tasks as `Keep visible` in add/edit language.
- Add start time, end time, and duration controls using consistent 15-minute dropdowns.
- Auto-update end time from duration, and duration from end time.
- Add flag scoring and top-four rebalancing for flagged no-date tasks.
- Keep marker style visual only for now.
- Fix yearly repeat to advance by calendar year.
- Make cloud loading merge local and cloud tasks so a failed/empty sync does not wipe local work on reload.
- Update Supabase SQL for end time and duration fields.
- Run a production build.

## Sprint 22: Menu Help And Duration Labels

Goal: Make the task form language clearer, add first-user help, and make account creation confirmation playful but explicit.

## Planned Scope

- Move actual duration after end time in add/edit.
- Restore broad duration estimate as minutes, hours, days, or weeks.
- Rename the measured time field to `Actual duration`.
- Rename the broad estimate field to `Duration estimate`.
- Add the requested account-creation joke confirmation flow.
- Move current menu content under a Settings tab.
- Add a How to use tab with button/function explanations.
- Add an Info tab describing Tile Todo and its sorting behavior.
- Run a production build.

## Sprint 23: Friend Testing Data Safety

Goal: Make Tile Todo safer to send to friends by preventing account data bleed, clarifying local mode, and polishing empty/move edge states.

## Planned Scope

- Add long-term roadmap items for authenticated AI task access and custom colour pickers.
- Show a temporary overlay when a dragged tile cannot actually move because its priority/due score keeps it in place.
- Convert empty active/archive messages into tile-shaped dotted placeholders.
- Add a clear-local-tasks option in local mode.
- Warn users that local mode does not sync or protect tasks across devices.
- Clear the visible task list on logout so another account/person does not inherit browser-local data.
- Load signed-in accounts from that account's cloud task list instead of merging browser-local tasks into every account.
- Keep default saturation at 90%.
- Run a production build and review data isolation behavior.

## Sprint 24: Tile Meta Polish And Repeat Date Fix

Goal: Polish tile reading order and make repeat tasks respect the intended due date.

## Planned Scope

- Place the empty active-task placeholder inside the active grid next to the add tile.
- Show due-date chips before priority/urgency chips.
- Move `Due` and overdue warning indicators into the task title instead of the pill row.
- Keep `Urgent` in the pill row.
- Repeat tasks from their existing due date when present, not from the completion date.
- Clarify that URL/domain changes are handled in Vercel, not app code.
- Run a production build.

## Sprint 25: Create Task Simplification And Tile Pills

Goal: Simplify task creation for first-time users while keeping tile metadata clearer.

## Planned Scope

- Show full text importance pills on tiles.
- Remove repeat labels from tiles and show `Repeat: x` in task info instead.
- Keep first-load/default saturation at 90%.
- Put due and overdue title indicators inside dark charcoal pills.
- Use dark charcoal instead of pure black for data chips.
- Show a red urgent pill for tasks due today.
- Simplify the default Create Task panel to Task, Due date, Effort size, Importance, and Urgent before.
- Move notes, repeat, keep visible, marker style, and specific time into collapsed `Notes & details`.
- Keep Edit Task full-featured.
- Ensure due time and effort size do not affect sorting.
- Run a production build.

## Sprint 26: Info Panel Interaction And Greyscale Theme

Goal: Make expanded task info behave like a clean overlay panel and add a full greyscale appearance option.

## Planned Scope

- Center the overdue exclamation mark in its title pill.
- Hide normal tile action buttons when info is open and show only Edit and Close.
- Prevent completion from the info-open state.
- Restore scroll position when info/edit panels close.
- Close info when clicking the info panel or outside it.
- Cancel edit when clicking outside the edit panel.
- Avoid showing `No extra details yet` when time/repeat/other metadata exists.
- Darken info text for readability.
- Capitalise `Notes & Details` in Create Task.
- Add a full greyscale colour scheme.
- Run a production build.

## Sprint 27: ChatGPT Clipboard Export

Goal: Make it easier to paste the current Tile Todo list into ChatGPT without downloading and uploading a JSON file.

## Planned Scope

- Add a `Copy data to clipboard` option in the menu Backup section.
- Copy a readable task summary plus full structured task data.
- Keep the existing JSON export/import backup features.
- Run a production build.

## Sprint 28: Version 2.1 Ordering And Repeat Polish

Goal: Make the current app version visible and smooth out task ordering, readability, and repeat controls.

## Planned Scope

- Add visible app version in the menu, starting at `2.1`.
- Make manual tile movement stickier for low-priority tasks without overriding deadline-critical tasks.
- Add the missing colon after `Effort size` in expanded info.
- Increase tile title size slightly.
- Better center the overdue exclamation mark.
- Improve greyscale theme pill contrast.
- Add custom repeat days, such as every 28 days, without requiring a database change.
- Rename importance display from `Normal` to `Medium`.
- Run a production build.
