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

## Release Q4 2026

Name
Verification & External Integration Release

Goal
Establish a proof-of-work system by integrating external data sources and identity verification. The goal is to increase credibility and ensure that user rankings reflect real-world developer activity.

Features
• GitHub integration (repos, activity, contributions)
• LinkedIn integration (identity and professional signals)
• Project submission (external app links)
• Identity verification (third-party services)
• Locked/unlocked verification states on profiles

### Supabase Explore (feed, search, images)

If post images fail with **Bucket not found**, or logged-out Explore shows **Anonymous Builder** / empty search / “No builders yet” while posts still appear, configure Storage and `profiles` RLS as described in **[docs/EXPLORE_SETUP.md](docs/EXPLORE_SETUP.md)**. In development, the browser console also prints `[Explore:dev]` hints when Supabase returns a diagnosable error.

## 2.3. Architectural Pattern

We implemented Layered Architecture with the flow:
• UI/components → Services → Repositories → Supabase

We chose this pattern because it clearly separates the responsibilities of the application. The UI layer handles rendering and user interaction, the service layer handles business logic and coordination, while the repository layer handles data access and Supabase queries.

This makes the project easier to maintain, test, and extend. It also prevents duplicated Supabase logic inside UI components and makes future features such as GitHub integration, ranking improvements, verification, and advanced scoring easier to add.

The pattern is implemented in the following parts of the project:

UI / Feature Layer:
• frontend/src/features/exploreFeatures/explore.ts
• frontend/src/features/leaderboardFeatures/components/LeaderboardPageContent.tsx
• frontend/src/features/profileFeatures/components/ProfilePageContent.tsx

Service Layer:
• frontend/src/services/postService.ts
• frontend/src/services/rankingService.ts

Repository Layer:
• frontend/src/repositories/postRepository.ts
• frontend/src/repositories/activityRepository.ts
• frontend/src/repositories/rankingRepository.ts
• frontend/src/repositories/storageRepository.ts

A concrete example is post creation. The UI triggers the create action, postService.ts validates the content and coordinates the flow, storageRepository.ts uploads images if needed, postRepository.ts saves the post, and activityRepository.ts logs the activity. After that, ranking data is refreshed so the leaderboard and profile progress stay updated.

This architecture keeps the code organized because each layer has one clear responsibility: UI handles interaction, services handle logic, and repositories handle Supabase communication.

2.4. Design Patterns
In our project, we implemented two main design patterns: the Factory Pattern and the Strategy Pattern.

Factory Pattern
The Factory Pattern is a creational design pattern used to centralize the creation of objects.
In our project, it is used for creating activity payloads for different user actions, such as creating a post, liking a post, or commenting on a post.

It is implemented in:
• frontend/src/factories/activityFactory.ts

It is used in:
• frontend/src/services/postService.ts

We chose this pattern because activity objects are created in multiple parts of the application. Without a factory, the same activity object structure would have to be manually repeated across different services. This would make the code harder to maintain and increase the chance of errors.

By using the Factory Pattern, all activity payloads are created in one place with a consistent structure. This makes the service code cleaner because services only call factory methods instead of manually building activity objects. It also makes the system easier to extend, because new activity types can be added inside the factory without changing the rest of the application logic.

Strategy Pattern
The Strategy Pattern is a behavioral design pattern used to separate different algorithms and make them interchangeable.

In our project, it is used for the ranking and scoring system. Different scoring sources have different calculation logic, so each source is implemented as a separate strategy.

It is implemented in:
• frontend/src/strategies/ScoringStrategy.ts
• frontend/src/strategies/GitHubScoringStrategy.ts
• frontend/src/strategies/ChallengeScoringStrategy.ts
• frontend/src/strategies/SocialActivityScoringStrategy.ts

It is used in:
• frontend/src/services/rankingService.ts
• frontend/src/services/rankingService.ts

We've decided to go with this pattern because ranking logic naturally depends on multiple independent scoring sources, such as GitHub activity, challenge participation, and social activity. If all scoring rules were placed in one large function, the code would quickly become difficult to read, test, and extend.

By using the Strategy Pattern, each scoring algorithm is isolated in its own class. This makes the code more modular and easier to test. It also allows us to add new scoring sources in the future by creating a new strategy class, without rewriting the existing ranking logic.
