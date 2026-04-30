# SPRINT_PLAN.md

## Current Sprint Status

Status: Sprint 4 prepared

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
