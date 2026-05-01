# SPRINT_LOG.md

## 2026-04-30

### Product Director Mode Setup

- Product Director Mode was requested by the CEO.
- Reviewed existing planning docs: `AGENTS.md`, `PRODUCT_SPEC.md`, and `ROADMAP.md`.
- Reviewed the current codebase at a high level.
- Confirmed the app already contains a small V1 implementation using Vite, React, TypeScript, and LocalStorage.
- Created `PRODUCT_DIRECTOR.md`.
- Created `SPRINT_PLAN.md`.
- Created `SPRINT_LOG.md`.
- Updated `AGENTS.md` with Product Director Mode rules.
- Updated `PRODUCT_SPEC.md` with current implementation status and sprint-oriented product boundary.
- Updated `ROADMAP.md` to reflect completed V1 foundation stages and the CEO-direction gate.

### Product Decisions

- Product Director Mode is active.
- No new app feature work should begin until the CEO answers the product-direction questions.
- Version 1 remains local-first and one-user.
- Backend, authentication, cloud sync, AI, notifications, calendar/email/messaging integrations, mobile packaging, payments, and collaboration remain out of scope.

### Implementation Changes

- Documentation and planning files only.
- No app behavior was changed.

### Unresolved Questions

- Awaiting CEO approval of the proposed first sprint.

### CEO Direction Received

- Initial target user is the CEO.
- Phase 2 should make the product generalisable with accounts for other people.
- The app should be visible as much as possible, potentially desktop-adjacent now and TV-displayable later.
- The CEO wants to add tasks manually at first, with possible AI-updated tasks later.
- Candidate future task fields include due date, urgency threshold, description, and important info.
- Priority needs to evolve into importance plus urgency.
- Completed tasks should move to archive and be restorable to the main list.
- Repeat options may be useful later, but should be treated carefully.
- Visual direction should be polished, readable, basic, and close to the current aesthetic.
- The top 4 most important or pressing tasks should be visible on screen at one time.
- The product should stay close to the functionality of a written notepad.
- Avoid getting too fancy.
- Longer-term access from phone and computer matters, but current Version 1 remains local-first browser storage.

### Product Decisions Added

- Keep the immediate next sprint focused on visibility and notepad-like usability.
- Defer due dates, urgency thresholds, details fields, repeat behavior, AI updates, accounts, sync, TV mode, and desktop packaging until explicitly approved.

### Documentation Changes

- Updated `PRODUCT_SPEC.md` with CEO direction.
- Updated `ROADMAP.md` with candidate stages for task details, importance/urgency sorting, archive improvements, and Phase 2 accounts.
- Updated `SPRINT_PLAN.md` with a proposed first sprint.

### Sprint 1 Approval

- CEO approved the recommended first sprint: top-4 visual prominence, restore completed task, and no new task fields.

### Sprint 1 Implementation Changes

- Updated active task presentation so the first four active tasks are visually more prominent.
- Added a `Later` section for active tasks beyond the first four.
- Added a `Restore` action for completed tasks so archived tasks can return to the active list.
- Kept the current task fields unchanged: title, priority, and estimated duration.
- Added no new dependencies.

### Sprint 1 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 1 Deferred Items

- Due date
- Urgency threshold
- Importance/urgency scoring
- Description
- Important info
- Repeat option
- Repeat duration
- Accounts
- Phone/computer sync
- AI updates
- TV-specific layout
- Desktop always-on packaging

### Sprint 2 Approval

- CEO requested a larger sprint implementing local-only features that do not require integrations.
- CEO also requested a stronger way to keep data from being lost after leaving and coming back.
- Sprint 2 scope was set to due date, importance, urgency calculation, expandable details, sorting, export backup, import backup, and last-saved indicator.
- Repeat tasks were deferred to avoid making completion behavior too complex in the same sprint.

### Sprint 2 Implementation Changes

- Replaced task priority with task importance while migrating existing saved `priority` data.
- Added due date to tasks.
- Added urgent-before threshold to tasks.
- Added combined details / important info field.
- Added expandable Details view on each task.
- Added active task sorting by urgency plus importance.
- Added urgency labels including overdue, due today, urgent, and due-in status.
- Added JSON export backup.
- Added JSON import backup.
- Added last-saved indicator.
- Preserved LocalStorage persistence.
- Added no new dependencies.

### Sprint 2 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 2 Deferred Items

- Repeat tasks
- Tags
- Projects
- Search
- Filtering
- Accounts
- Backend
- Cloud sync
- AI updates
- Calendar/email/messaging integrations
- TV-specific display
- Desktop always-on packaging

### Sprint 3 Approval

- CEO confirmed that syncing between phone and laptop and access while the computer is off is now the next most important functionality.
- CEO approved accounts/login and Supabase as the backend service.
- CEO provided the Supabase project URL and publishable public key.

### Sprint 3 Implementation Changes

- Installed `@supabase/supabase-js`.
- Added `.env.local` with the Supabase project URL and publishable key.
- Added `.env.example`.
- Added `src/supabase.ts`.
- Added `SUPABASE_SCHEMA.sql` for the tasks table and row-level security policies.
- Added account sync UI for email/password sign-up, sign-in, and sign-out.
- Added cloud task loading from Supabase.
- Added task sync to Supabase after local changes.
- Added local-to-cloud merge on sign-in.
- Preserved LocalStorage and JSON backup/import behavior.
- Added `.gitignore` for local artifacts and environment files.

### Sprint 3 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 3 Unresolved Setup

- The CEO needs to run `SUPABASE_SCHEMA.sql` in the Supabase dashboard SQL editor.
- The local dev server should be restarted so Vite reads `.env.local`.
- The app should be tested with a real sign-up/sign-in flow.

### Sprint 4 Approval

- CEO approved moving forward with hosted web access rather than native iOS for now.

### Sprint 4 Deployment Prep

- Added `vercel.json`.
- Added `DEPLOYMENT.md`.
- Documented Vercel setup steps.
- Documented Vercel environment variables.
- Documented Supabase Auth URL settings needed for hosted mobile access.

### Sprint 4 Remaining Manual Setup

- Create or use a GitHub repository for the project.
- Import the repository into Vercel.
- Add Supabase environment variables in Vercel.
- Update Supabase Site URL and Redirect URLs after deployment.
- Test from phone and laptop.

### Sprint 5 Approval

- CEO approved mobile polish and home screen support.
- CEO requested title and backup controls to be smaller and out of the way.
- CEO requested account sync to move into a hamburger/menu.
- CEO requested the add task form to open from a button instead of taking constant screen space.

### Sprint 5 Implementation Changes

- Added web app manifest.
- Added app icon.
- Added iPhone home-screen metadata.
- Reduced the app header title.
- Moved account sync and backup controls into a slide-out menu.
- Replaced the always-visible add task form with an `Add task` button and collapsible add panel.
- Kept task sync, backup/import, and task behavior unchanged.

### Sprint 5 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 6 Approval

- CEO requested yearly repeat support.
- CEO requested more magenta in the color scheme, especially for `Add task`.

### Sprint 6 Implementation Changes

- Added repeat options for none, daily, weekly, monthly, and yearly.
- Added repeat controls to add and edit flows.
- Added repeat labels to task rows.
- When a repeating task is completed, the completed task stays in the archive and a new active task is created for the next repeat date.
- Added `repeat` to the Supabase schema.
- Added `SUPABASE_REPEAT_MIGRATION.sql` for the already-created Supabase table.
- Changed the main `Add task` button to a magenta accent.

### Sprint 6 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 6 Manual Setup

- Run `SUPABASE_REPEAT_MIGRATION.sql` in the Supabase dashboard SQL editor before using repeat tasks with account sync.

### Sprint 7 Approval

- CEO requested a logo with cyan, magenta, and black stripes forming a bent check-like angle.
- CEO requested manual move up/down controls on the side of list items.
- CEO requested smaller controls and a more compact task list.
- CEO requested square list items.
- CEO requested the top four active tasks to be highlighted.
- CEO requested `Add task` to live at the top of the list in the same task-box format.

### Sprint 7 Implementation Changes

- Replaced the app icon with a striped check-style mark.
- Added manual move up/down controls to active tasks.
- Added `sortOrder` to tasks so manual ordering can be preserved and synced.
- Added `SUPABASE_SORT_ORDER_MIGRATION.sql` for the existing Supabase table.
- Made task cards square-cornered and more compact.
- Changed task row actions to compact icon-style buttons.
- Highlighted the top four active tasks with a warmer task-card background.
- Moved the add-task trigger into the Active Tasks section as a task-shaped row.

### Sprint 7 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 7 Manual Setup

- Run `SUPABASE_SORT_ORDER_MIGRATION.sql` in the Supabase dashboard SQL editor before using the deployed manual ordering feature with account sync.

### Sprint 8 Correction Request

- CEO reported repeat completion was behaving incorrectly by advancing years instead of clearly creating the next task.
- CEO clarified task cards should be square tiles in a grid.
- CEO requested two columns on mobile and a responsive square grid on desktop.
- CEO requested reorder movement animation.
- CEO requested thicker repeating logo stripes that fill the box.
- CEO requested rounded corners to remain.
- CEO requested solid color task highlights: magenta for top tasks and cyan for normal tasks.
- CEO requested no task due date more than 365 days out.

### Sprint 8 Implementation Changes

- Repeat tasks now schedule the next due date from the completion date.
- Yearly repeat uses a 365-day interval to respect the 365-day maximum.
- Added a guard against rapid repeated completion clicks.
- Added a due-date max of 365 days to task forms and normalisation.
- Changed active tasks into a square tile grid.
- Kept two columns on mobile and a responsive grid on desktop.
- Added browser view-transition support for move up/down reordering.
- Made normal active tasks solid cyan.
- Made the top four active tasks solid magenta.
- Restored rounded card corners.
- Updated the logo with thicker repeating cyan, magenta, and black stripes clipped through the check mark.

### Sprint 8 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 9 Approval

- CEO requested fixed-size task squares instead of dynamically resizing tiles.
- CEO requested a visible desktop date picker.
- CEO requested the browser tab and iPhone home-screen icon to use the current logo.
- CEO requested the logo change to full-square 45-degree stripes alternating black, magenta, and cyan.

### Sprint 9 Implementation Changes

- Changed task tiles to fixed dimensions.
- Kept mobile at two fixed columns.
- Added an explicit `Date` button beside due date inputs to open the date picker where supported.
- Replaced the logo with solid diagonal stripes across the rounded square.
- Added `icon-512.png` and `apple-touch-icon.png`.
- Updated manifest and HTML icon references with cache-busting query strings.

### Sprint 9 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 10 Approval

- CEO requested larger fixed task boxes that still fit two side by side on mobile.
- CEO requested the add-task plus to be larger and centered.
- CEO requested task action buttons to use solid colors and fit better inside boxes.
- CEO clarified that tapping add should open a larger form with filled inputs and a `Create task` action, then return to the main page.

### Sprint 10 Implementation Changes

- Increased the base fixed task tile size.
- Set the mobile tile size to two-across based on viewport width.
- Centered the add-task tile content.
- Enlarged the add plus into a prominent centered symbol.
- Changed the opened add-task panel to a larger full-width form.
- Changed the submit button text from `Add` to `Create task`.
- Made task action buttons solid green, yellow, magenta, and red.
- Adjusted action button layout to fit cleanly inside the tiles.

### Sprint 10 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 11 Approval

- CEO requested the add tile to animate/grow into a larger form panel on top of the grid flow.
- CEO requested the opened form to be no wider than two task tiles.
- CEO requested the opened form to grow vertically enough for the controls.
- CEO requested create/close to shrink the form back into the grid spot as tiles shift.
- CEO requested the pencil button on magenta tiles to be cyan for contrast.

### Sprint 11 Implementation Changes

- Added a shared view transition name for the add tile and expanded add form.
- Changed the expanded add form to span two tile columns instead of behaving like a single fixed tile.
- Let the expanded add form grow vertically with a larger minimum height.
- Added view-transition behavior when closing the add form.
- Kept create-task transition in the grid flow when a new task is created.
- Changed the highlighted tile edit button to cyan.
- Made move buttons solid black.

### Sprint 11 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 12 Approval

- CEO requested desktop tiles stay constant size with empty space until another column fits.
- CEO requested simpler tile info to avoid mobile clipping.
- CEO requested H/M/L importance letters in colored text inside a black circle.
- CEO requested shorter due date display without year, with month and day in capsules.
- CEO requested `Due today` become `Due`.
- CEO requested overdue display become a compact red triangle warning inside the black capsule.
- CEO requested add and edit expanded panels keep the same tile-color feel.
- CEO requested archive tiles become light grey with darker crossed-out task names.
- CEO requested spellcheck and better more-info display be added to the roadmap, but not implemented yet.

### Sprint 12 Implementation Changes

- Changed desktop app width/grid behavior so fixed-size tile columns use the available screen and leave side space until another column fits.
- Replaced full importance words with H/M/L tokens.
- Replaced full due dates with month/day chips.
- Shortened future due status to compact day counts.
- Shortened due-today label to `Due`.
- Added compact overdue warning icon styling.
- Made add form background cyan.
- Made edit form background match the tile being edited.
- Styled archive tiles as grey with darker crossed-out text.
- Added spellcheck and better more-info display to the roadmap.

### Sprint 12 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 13 Approval

- CEO requested desktop tiles behave like fixed-size sticky notes and stop resizing with page width.
- CEO requested `Due` text to be red.
- CEO requested all buttons use a contrasting capsule shape.
- CEO requested add/create task controls to use magenta capsule styling.
- CEO requested edit save to use the opposite cyan/magenta color of the tile being edited.
- CEO requested the add-task plus symbol be centered in the tile.

### Sprint 13 Implementation Changes

- Changed desktop grid columns and tile dimensions to literal `196px` values.
- Preserved calculated two-column sizing only inside the mobile layout.
- Made `Due` urgency chip red.
- Changed default buttons to pill/capsule shape.
- Centered the add plus symbol independently of the add label.
- Styled the add label as a magenta capsule.
- Styled create-task as a magenta capsule.
- Styled edit save as magenta on cyan tiles and cyan on magenta tiles.

### Sprint 13 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 14 Approval

- CEO requested date chips always appear on a line below the priority/urgency line.
- CEO requested a days-until-due pill before the month/day date chips.
- CEO requested days-until-due color states: blue for more than a week, yellow for about a week to 3 days, and red for 3 days or less.
- CEO requested mobile edit panels expand to two tile widths.
- CEO requested completed-task restore icon stay as a plain return arrow.
- CEO requested a stronger sorting algorithm based on due date, urgency, importance, and bounded manual bias.
- CEO requested category, category-field-toggle, calendar sync, and category-sharing ideas be added to the roadmap but not implemented.
- CEO requested add tile label/plus alignment and add panel outline fixes from browser comments.

### Sprint 14 Implementation Changes

- Split tile metadata into a priority/urgency row and a separate date row.
- Added days-until-due chips before month/day date chips.
- Added blue/yellow/red due timing chip colors.
- Adjusted add tile plus and label placement.
- Removed the magenta border from the expanded add form.
- Fixed mobile expanded edit panels to span two tile widths.
- Forced the completed restore icon to use a text-style return arrow.
- Replaced absolute manual ordering with a bounded manual bias inside a due-date/urgency/importance score.
- Added future roadmap items for categories, master urgent category view, category field toggles, calendar sync, and shared categories.

### Sprint 14 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 15 Approval

- CEO requested time estimates use an amount plus minutes/hours/days/weeks options.
- CEO requested the sorting algorithm be written out for review.
- CEO requested due-soon low-priority tasks outrank far-future medium/high-priority tasks.
- CEO reported up/down movement sometimes jumps two tiles and asked for less tie-prone ordering.
- CEO requested drag-style manual movement while keeping up/down buttons.
- CEO requested daily to-dos, push notifications, and desktop display be added to the roadmap only.

### Sprint 15 Implementation Changes

- Replaced plain estimate text boxes with amount/unit controls while keeping the same stored estimate text format.
- Reworked task scores around due-date urgency, importance, urgency threshold, bounded manual bias, and a tiny stable tie-breaker.
- Changed up/down controls to calculate a new manual bias relative to neighboring task scores.
- Added drag-and-drop movement for active task tiles with a visible drop target.
- Added future roadmap items for daily to-dos, push notifications, and desktop display mode.

### Sprint 15 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 16 Approval

- CEO requested restore be green and completed dates move into the expanded info section.
- CEO requested edit save/cancel buttons be wider and mobile edit panels stop causing page zoom.
- CEO requested delete move out of the main tile and into edit with confirmation.
- CEO requested a grip-based movement control instead of relying on native drag, especially for mobile.
- CEO requested estimated time become a simple unit dropdown and not display on tiles.
- CEO requested icon buttons become rounded squares while text/info chips remain pills.
- CEO requested duplicate days-until-due display be cleaned up.
- CEO requested archive-window behavior be added to the roadmap but not implemented yet.

### Sprint 16 Implementation Changes

- Changed completed restore action to green.
- Removed completed date and estimate text from compact tile metadata.
- Added completed date to the expanded details area.
- Changed estimate editing to a minutes/hours/days/weeks dropdown.
- Added spellcheck/autocorrect hints to task title and details fields.
- Replaced main-tile delete with a grip movement button.
- Added pointer-based grip movement with before/after drop highlighting.
- Moved destructive delete into the edit panel with browser confirmation.
- Tightened mobile sizing and 16px form controls to reduce iOS zoom.
- Added the future archive-window concept to the roadmap.

### Sprint 16 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 17 Approval

- CEO requested drag feedback only mark the space between tiles, using a neutral grey marker instead of yellow tile highlighting.
- CEO reported tasks were not updating between browsers and requested live update or at least page reload update.
- CEO requested selectable colour schemes and saturation controls from a supplied implementation brief.

### Sprint 17 Implementation Changes

- Added a separate `colorScheme` setting with five palette options.
- Added a persisted saturation slider and live palette preview to the Appearance menu.
- Set `document.documentElement.dataset.scheme` separately from the existing dark/light `dataset.theme`.
- Added CSS variable palettes for CMYK Pop, Storybook Muted, Earth Workspace, Neon Modern, and Apple Clean in light and dark variants.
- Applied saturation to theme/action/task colours while leaving semantic status colours stable.
- Changed movement feedback to a neutral between-tile marker.
- Added signed-in refresh on page focus and visibility return.
- Added a Supabase Realtime subscription for task changes where Realtime is enabled.
- Made reload/focus refresh use the cloud task list as source of truth after the user has synced once.

### Sprint 17 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 18 Approval

- CEO requested mobile tile sizing be reduced so edges are not clipped.
- CEO requested the default theme start on Earth Workspace at 75% saturation.
- CEO requested light mode use a very light tan background and dark mode use a very dark charcoal rather than pure white/black.
- CEO requested visible tile border colours be removed.
- CEO requested smaller pill text and sizing so long due-date rows such as `364d Apr 30` stay on one line.
- CEO requested Neon Modern and Apple Clean be replaced by Mustard Cinema, Acid Terminal, and Tonal Contemporary.

### Sprint 18 Implementation Changes

- Changed default colour scheme fallback to Earth Workspace.
- Changed default saturation fallback to 75%.
- Migrated old saved `neon` settings to Acid Terminal and `apple` settings to Tonal Contemporary.
- Updated colour scheme union/options to six schemes: CMYK Pop, Storybook Muted, Earth Workspace, Mustard Cinema, Acid Terminal, and Tonal Contemporary.
- Removed Neon Modern and Apple Clean CSS theme blocks.
- Added Mustard Cinema, Acid Terminal, and Tonal Contemporary light/dark CSS theme blocks.
- Removed visible task tile borders.
- Tightened mobile app width, grid gap, and tile sizing.
- Reduced chip text/padding and prevented date chip wrapping.

### Sprint 18 Verification

- Ran `npm run build`.
- Build completed successfully.

### Sprint 19 Approval

- CEO requested the add plus symbol and circle use the same colour across all colour themes.
- CEO requested the header logo match the browser-tab/icon graphic.
- CEO requested the app name change to Tile Todo.
- CEO requested info/details open up the tile like edit does.
- CEO requested the info button use the same contrasting colour as edit.
- CEO requested mobile light and dark tile sizing match, with side gaps equal to the gap between tiles.
- CEO requested a future sort button/function be added to the roadmap only.
- CEO requested default saturation start at 90.

### Sprint 19 Implementation Changes

- Renamed the header, document title, iOS app title, and manifest name to Tile Todo.
- Pointed the header logo at the PNG app icon asset.
- Changed add plus circle and plus symbol to share `currentColor`.
- Added a `task-info-open` expanded state so info/details spans two tile widths and grows vertically.
- Restyled details/info action to match the edit action contrast colour.
- Fixed mobile tile-size variable specificity so dark theme no longer falls back to desktop sizing.
- Changed default saturation fallback and root CSS default to 90%.
- Added future sort controls to the roadmap without implementing them.

### Sprint 19 Verification

- Ran `npm run build`.
- Build completed successfully.
