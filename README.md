# Tierd - The Ranked Network

Tierd is a reputation network for developers where rank is earned through shipped work, verified output, and consistent progress.

## Product Context

Tierd is built around one idea: private effort should become public proof.

Instead of self-reported skills, developers build a living profile that shows:
- verified links and projects
- featured shipments with visible impact
- challenge participation and wins
- streaks, activity, and momentum
- badges, tiers, and rank movement over time

## What the Product Experience Focuses On

- A live feed of what builders are shipping
- Regional and stack-based leaderboards
- Competitive challenges that award points
- Explore surfaces to discover developers and projects
- Profile pages that aggregate proof into one public identity

## Backend Direction

The backend starts as a simple API foundation and evolves into the source of truth for:
- user identity and profiles
- challenge lifecycle, submissions, scoring, and rewards
- leaderboard calculations and rank snapshots
- feed events and engagement signals
- project and achievement verification data

## Current Product Stage

The frontend currently expresses the full product vision and interaction model.
The backend is in initial setup, ready to grow into the ranking and proof engine behind that experience.

## Local development

1. Install dependencies: `npm install`
2. (Optional) For auth and profile features, set **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`** in a `.env` file. **Vite reads env from the repo root** (next to `vite.config.ts`). If you only have `frontend/.env`, that is used automatically when there is **no** `.env` at the repo root. **`backend/.env` is never used by the React app** (that’s for the Express server only). Names must start with `VITE_` or they won’t reach the browser. Restart `npm run dev` after editing `.env`.
3. Start the app: `npm run dev`
4. Open **http://127.0.0.1:8080/** (port `8080` is set in `vite.config.ts`).

To expose the dev server on your LAN (e.g. phone testing), run: `npm run dev -- --host`

### Supabase Explore (feed, search, images)

If post images fail with **Bucket not found**, or logged-out Explore shows **Anonymous Builder** / empty search / “No builders yet” while posts still appear, configure Storage and `profiles` RLS as described in **[docs/EXPLORE_SETUP.md](docs/EXPLORE_SETUP.md)**. In development, the browser console also prints `[Explore:dev]` hints when Supabase returns a diagnosable error.
