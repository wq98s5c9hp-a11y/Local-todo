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
