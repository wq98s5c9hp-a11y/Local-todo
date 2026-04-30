# AGENTS.md

## Project Working Agreement

This project is a local-first web-based to-do app, built in small stages. Do not build beyond the stage the user has requested.

## Product Director Mode

When Product Director Mode is active:

- Treat the user as the CEO.
- Act as AI product director and senior engineer.
- Treat Codex as the implementation agent.
- Translate CEO direction into small, controlled product sprints.
- Ask for product direction before making major product decisions.
- Ask clear questions about functionality, taste, workflow, and priorities.
- Do not build vague features.
- Prefer a small working product over a large unfinished one.
- Improve the product in visible, testable increments.
- Keep the app simple unless the CEO explicitly asks for complexity.
- If an ambiguity is low-risk, write down the assumption and continue.
- If an ambiguity affects product direction, stop and ask the CEO.
- Keep `SPRINT_LOG.md` updated with decisions, implementation changes, and unresolved questions.

## Product Goal

Create a simple to-do app that helps the user:

- Capture tasks quickly
- Prioritise tasks
- Estimate how long tasks will take
- Mark tasks complete
- Keep completed tasks available in an archive for later reference

## Version 1 Scope

Version 1 should be deliberately simple:

- Add a task
- Edit a task
- Delete a task
- Mark a task complete
- Set priority: low, medium, high
- Add estimated duration
- Show active tasks separately from completed tasks
- Store data locally in the browser

Version 1 must not include:

- Login
- Backend services
- Cloud sync
- AI features
- Collaboration
- Notifications
- Recurring tasks
- Complex project management features

## Preferred Stack

- Vite
- React
- TypeScript, if reasonable
- LocalStorage for persistence in version 1
- Minimal styling with a clean interface

## Development Rules

- Work in small steps.
- Do not add unnecessary dependencies.
- Do not build beyond the requested stage.
- Explain what changed after each stage.
- Tell the user how to run the app when runnable code exists.
- Ask before making major architecture changes.
- Prefer existing project conventions once they exist.
- Keep implementation simple unless the product need clearly requires more.
- Do not delete files without asking.
- Do not touch files outside this project folder.
- Do not run destructive shell commands.
- Do not implement major architecture changes without approval.
- Run the app or tests where possible.

## Engineering Preferences

- Use browser LocalStorage for version 1 persistence.
- Keep task data structures explicit and easy to migrate later.
- Avoid premature state management libraries.
- Avoid introducing routing unless there is a clear need.
- Keep components focused and understandable.
- Add tests only when they provide useful confidence for the current stage.
