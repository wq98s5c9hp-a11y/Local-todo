# DEPLOYMENT.md

## Deployment Goal

Host the to-do app at a public HTTPS URL so it works from phone and laptop even when the development computer is off.

Recommended host for the next step: Vercel.

## Before Deploying

Supabase setup must be complete:

- `SUPABASE_SCHEMA.sql` has been run in the Supabase SQL Editor.
- Supabase Auth email settings are configured for the deployed app URL after deployment.

## Vercel Setup

1. Create or sign into a Vercel account.
2. Put this project in a GitHub repository.
3. In Vercel, choose Add New Project.
4. Import the GitHub repository.
5. Use the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
6. Add these environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
7. Deploy the project.

## Environment Variables

Use the same values as `.env.local`.

Do not publish private database passwords or service-role keys.

The Supabase publishable key is okay for frontend use.

## Supabase Auth URL Settings

After Vercel gives you a deployed URL, update Supabase:

1. Go to Supabase.
2. Open the project.
3. Go to Authentication.
4. Go to URL Configuration.
5. Set Site URL to the deployed Vercel URL, for example:

```text
https://your-project.vercel.app
```

6. Add Redirect URLs:

```text
https://your-project.vercel.app/**
http://localhost:5173/**
```

The localhost redirect is useful for continued local development.

## Mobile Testing

1. Open the deployed Vercel URL on the phone.
2. Sign in with the same account used on the laptop.
3. Add a test task on the phone.
4. Open the app on the laptop and confirm the task appears after sign-in.

## Current Limits

- The app is not packaged as an iOS app.
- There are no native notifications.
- There is no offline conflict resolution beyond latest-updated task merge on sign-in.
- Realtime live updates are not implemented yet; changes sync after app actions and account loading.

