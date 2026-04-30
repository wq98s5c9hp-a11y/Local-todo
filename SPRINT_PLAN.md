# SPRINT_PLAN.md

## Current Sprint Status

Status: Sprint 6 executed

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
