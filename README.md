# Tierd

Tierd is a developer ranking platform where users earn reputation through shipped work, verified identity/security, activity, and challenge performance.

## Live

- `https://tierd.dev` (domain set; production rollout finalization follows)

## Release Timeline (R1-R4)

### Release 1 - Core Platform

- Auth + profile foundations
- Social feed (posts, comments, likes, media)
- Base RLS/security policies
- Initial projects, scoring, leaderboard, and challenge schema

### Release 2 - Engagement Scoring

- Post engagement scoring improvements
- Better ranking signal quality from community interactions

### Release 3 - External Proof + Verification

- GitHub integration (repos/activity/contributions sync)
- LinkedIn identity signal integration
- Project submissions (external repo/live links)
- Email 2FA verification
- Profile verification state (`verified` / `unverified`) based on required signals

### Release 4 - Intelligent Evaluation Engine

- Backend/Supabase-driven evaluation runs
- AI-supported evaluation (Groq) with deterministic scoring fallback
- Multi-source scoring (GitHub + projects + activity/challenges)
- Tier calculation and public ranking gating (`Unranked` until evaluation is completed)
- Score breakdown + user feedback

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Data/Auth/Storage: Supabase (Postgres + RLS)
- AI: Groq API

## Local Development

```bash
# install
npm install
npm --prefix frontend install
npm --prefix backend install

# run
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:5000
```

## Environment

- Frontend vars: `frontend/.env.example`
- Backend vars: `backend/.env.example`

Important: frontend does not read `backend/.env`.

## Database

Run Supabase migrations from `supabase/` in order (`001` -> `035`).

## Explore Setup

If feed/search/storage is misconfigured, follow: [docs/EXPLORE_SETUP.md](docs/EXPLORE_SETUP.md)

You can also check out all the screenshots of the application: [docs/screenshots](docs/screenshots/)
