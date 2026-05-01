# SPRINT_PLAN.md

## Current Sprint Status

Status: Sprint 14 executed

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
