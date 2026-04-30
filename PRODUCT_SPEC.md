# PRODUCT_SPEC.md

## Product Summary

A local-first web to-do app for quickly capturing, prioritising, estimating, completing, and reviewing tasks.

The app should feel lightweight and direct. It is meant for personal task tracking, not team collaboration or full project management.

## Product Director Status

Product Director Mode is active. Future product changes should be shaped through small CEO-approved sprints.

Phase 2 has started. The app now supports account-based Supabase sync so the same task list can be accessed across devices after sign-in.

Current assumption: AI, notifications, calendar/email/messaging integrations, payment features, team features, and TV-specific display remain out of scope.

## Target User

The primary user is an individual who wants a fast, browser-based task list that can work locally and sync across personal devices after sign-in.

The initial primary user is the CEO.

The product should optimize for the CEO's personal workflow first while using an account model that can later generalise to other individual users.

## Core Jobs

- Capture a task before it is forgotten.
- Keep the task list visibly present throughout the day.
- Decide how important the task is.
- Understand what is urgent because of time pressure.
- Estimate how much time the task will take.
- See what still needs doing.
- Move completed work out of the active list.
- Review completed tasks later.

## Version 1 Features

### Add A Task

The user can create a new task with:

- Title
- Importance
- Estimated duration
- Due date
- Urgent-before threshold
- Repeat option
- Optional details

The title is required. Other fields should be easy to set but should not make capture feel slow.

CEO direction: task capture should stay close to a written notepad experience. Details should be available without making the main input feel heavy.

### Edit A Task

The user can update an existing task's:

- Title
- Importance
- Estimated duration
- Due date
- Urgent-before threshold
- Repeat option
- Details
- Completion state

### Delete A Task

The user can permanently delete a task.

Deletion should be clear enough that the user understands the task will be removed.

### Mark A Task Complete

The user can mark an active task as complete.

Completed tasks should move out of the active task list and into the completed/archive area.

### Set Importance And Urgency

Current implementation uses an importance field with one of three levels:

- Low
- Medium
- High

- Importance means how valuable or important it is to complete the task.
- Urgency means how pressing it is, especially as a deadline approaches.
- A lower-importance task may need to appear higher if its deadline is soon.

Active tasks are sorted by a simple balance of due-date urgency and importance.

### Add Due Date And Urgency Threshold

Each task can include a due date and a threshold for when it should become urgent.

Supported urgent-before options:

- Due day
- 1 day
- 3 days
- 1 week
- 2 weeks

### Add Estimated Duration

Each task can include an estimated duration.

The first version can use a simple text or numeric input, depending on what keeps the interface clean and quick.

### Add Details

Each task can include a details field for important info, notes, links, or context.

Details should be hidden from the main row until the user opens them.

### Separate Active And Completed Tasks

The app should visually separate:

- Active tasks
- Completed tasks

Completed tasks act as a simple archive.

CEO direction: completed tasks should move to an archive, remain available for reference, and be restorable to the main active list.

Repeating tasks can be set to daily, weekly, monthly, or yearly. When a repeating task is completed, the completed copy moves to the archive and a new active copy is created for the next repeat date.

### Local Browser Storage

Task data should persist in the browser using LocalStorage.

LocalStorage remains useful for local resilience and offline-ish continuity in the same browser.

### Local Backup

The user can export a JSON backup file and import a JSON backup file later.

This gives the user a manual data safety path in addition to account sync.

### Account Sync

The user can create an account, sign in, and sync tasks through Supabase.

When signed in, tasks are saved locally and synced to Supabase so the same account can access them from another device.

Local tasks are merged with cloud tasks on sign-in. If the same task exists locally and in the cloud, the newer `updatedAt` version wins.

## Current Implementation Snapshot

As of Product Director Mode setup, the app already has a small Vite, React, and TypeScript implementation with:

- Task creation
- Active task list
- Inline task editing
- Deletion
- Completion
- Completed archive section
- Importance field
- Estimated duration field
- Due date field
- Urgent-before field
- Details field
- Repeat option with none, daily, weekly, monthly, and yearly choices
- Active task sorting by urgency and importance
- JSON export backup
- JSON import backup
- Last-saved indicator
- Supabase account sync
- Email/password sign-up and sign-in
- Local-to-cloud task merge on sign-in
- LocalStorage persistence
- Minimal styling

Future work should refine this product deliberately rather than expand scope by default.

## Non-Goals For Version 1

- AI features
- Payment features
- Team collaboration
- Tags
- Projects
- Team/multi-user collaboration
- Due-date automation beyond local sorting/status labels
- Reminders
- Calendar integration
- Email integration
- Messaging integration
- Mobile app wrapper
- Offline service worker

## Candidate Fields Beyond Current V1

These fields are requested or under consideration, but should be introduced in controlled increments:

- Repeat duration
- Tags
- Projects
- Search
- Filtering

Product decision: `description` and `important info` are currently combined into one details field.

## Suggested Task Model

```ts
type TaskImportance = "low" | "medium" | "high";
type TaskRepeat = "none" | "daily" | "weekly" | "monthly" | "yearly";

type Task = {
  id: string;
  title: string;
  importance: TaskImportance;
  estimatedDuration: string;
  dueDate: string;
  urgentBeforeDays: number;
  repeat: TaskRepeat;
  details: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
```

This model is intentionally small and can be migrated later if the app grows.

## UX Direction

- Clean, minimal interface
- Fast task entry
- Clear distinction between active and completed work
- Avoid clutter
- Avoid heavy visual styling
- Prefer obvious controls over hidden interactions
- Polished, readable, and basic.
- Preserve the current aesthetic direction.
- Keep top tasks visible; the CEO wants to see at least the top 4 most important or pressing tasks on screen at one time.
- Put detailed information behind a button or expandable area rather than showing everything at once.
- Long-term display contexts may include desktop visibility and TV display, but Version 1 should stay browser-based.

## Success Criteria For Version 1

- The user can manage a personal task list without leaving the browser.
- Refreshing the page keeps tasks intact.
- Signing in syncs tasks across devices.
- Active and completed tasks are easy to tell apart.
- The interface remains simple and focused.
- The most important or urgent tasks are easy to see without digging.
