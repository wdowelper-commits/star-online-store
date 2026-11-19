# Cloudflare deployment

This project uses the Cloudflare Vite plugin to deploy the React SPA and its API Worker together. The existing Supabase project and database are not changed by this migration.

## 1. Install dependencies

After pulling this branch, run:

```bash
npm install
```

This also refreshes `package-lock.json` for the added Cloudflare packages.

## 2. Configure Supabase frontend values

Create a local `.env.local` file (do not commit it):

```dotenv
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Use the existing project's URL and anon/publishable key. Never use the Supabase `service_role` key in a browser app or any `VITE_*` variable.

For Cloudflare builds, add these two values as build environment variables in the Workers build settings so Vite can embed them during the build.

## 3. Configure the AI secret locally

Copy `.dev.vars.example` to `.dev.vars` and set your Gemini API key in the new local file. The real `.dev.vars` file is ignored by Git.

For a deployed Worker, add the secret from your terminal:

```bash
npx wrangler secret put GEMINI_API_KEY
```

Paste the key only into the secure prompt. Do not add it to source code, `.env.example`, or GitHub.

## 4. Run locally

```bash
npm run dev
```

The app and Worker API run through the Cloudflare Vite development environment. Check:

- `/api/health`
- AI Assistant from the website UI

## 5. Deploy

Authenticate Wrangler with your Cloudflare account, then run:

```bash
npm run deploy
```

The Worker serves the React app and handles `/api/health` and `/api/ai/assistant`. Other paths are served from the static assets binding, with SPA fallback for React Router.

## Important notes

- This migration does not run SQL, drop tables, or alter your Supabase database.
- The Supabase anon/publishable key is intended for browser use; secure your tables with correct Row Level Security policies.
- Do not expose a Supabase `service_role` key or Gemini key in frontend code.
- The old Express `server.ts` is no longer used by the Cloudflare Vite scripts. It is left in the repository for now and can be removed after the Cloudflare version has been tested.
- Before merging this branch, run the build and test sign-in, product listing, order flow, image upload, and AI Assistant against a test account.
