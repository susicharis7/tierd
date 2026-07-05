-- 035_seed_more_challenges_next_month.sql
-- Adds more active/upcoming challenges so the app has visible data for ~next month.

-- ACTIVE (long-running)
insert into public.challenges (
  slug,
  title,
  description,
  rules,
  category,
  difficulty,
  scope,
  scope_key,
  status,
  is_featured,
  reward_points,
  max_participants,
  starts_at,
  ends_at,
  metadata,
  created_by
)
values (
  'r4-active-fullstack-quest-20d',
  'Fullstack Quest (20d)',
  'Ship a production-ready fullstack feature with robust validation, tests, and deployment.',
  E'1) Join challenge\n2) Submit repo + demo + notes\n3) Keep repo accessible until results',
  'fullstack',
  'intermediate',
  'global',
  null,
  'live',
  true,
  240,
  null,
  now() - interval '1 day',
  now() + interval '20 days',
  jsonb_build_object('source', 'release_4_seed', 'window', '20d_active'),
  null
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  rules = excluded.rules,
  category = excluded.category,
  difficulty = excluded.difficulty,
  scope = excluded.scope,
  scope_key = excluded.scope_key,
  status = 'live',
  is_featured = true,
  reward_points = excluded.reward_points,
  max_participants = excluded.max_participants,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  metadata = coalesce(public.challenges.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

insert into public.challenges (
  slug,
  title,
  description,
  rules,
  category,
  difficulty,
  scope,
  scope_key,
  status,
  is_featured,
  reward_points,
  max_participants,
  starts_at,
  ends_at,
  metadata,
  created_by
)
values (
  'r4-active-api-hardening-24d',
  'API Hardening Sprint (24d)',
  'Build resilient API flows with auth guards, observability, and failure handling.',
  E'1) Join challenge\n2) Submit working endpoints\n3) Include monitoring/testing evidence',
  'backend',
  'advanced',
  'global',
  null,
  'live',
  false,
  280,
  null,
  now() - interval '2 days',
  now() + interval '24 days',
  jsonb_build_object('source', 'release_4_seed', 'window', '24d_active'),
  null
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  rules = excluded.rules,
  category = excluded.category,
  difficulty = excluded.difficulty,
  scope = excluded.scope,
  scope_key = excluded.scope_key,
  status = 'live',
  is_featured = false,
  reward_points = excluded.reward_points,
  max_participants = excluded.max_participants,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  metadata = coalesce(public.challenges.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

-- UPCOMING (future windows)
insert into public.challenges (
  slug,
  title,
  description,
  rules,
  category,
  difficulty,
  scope,
  scope_key,
  status,
  is_featured,
  reward_points,
  max_participants,
  starts_at,
  ends_at,
  metadata,
  created_by
)
values (
  'r4-upcoming-observability-30d',
  'Observability Build-Off (starts in 30d)',
  'Design diagnostics-first services with metrics, traces, and actionable alerts.',
  E'1) Join before start\n2) Submit repo/demo once active\n3) Include runbook + dashboards',
  'backend',
  'intermediate',
  'global',
  null,
  'published',
  false,
  260,
  null,
  now() + interval '30 days',
  now() + interval '52 days',
  jsonb_build_object('source', 'release_4_seed', 'window', '30d_upcoming'),
  null
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  rules = excluded.rules,
  category = excluded.category,
  difficulty = excluded.difficulty,
  scope = excluded.scope,
  scope_key = excluded.scope_key,
  status = 'published',
  is_featured = false,
  reward_points = excluded.reward_points,
  max_participants = excluded.max_participants,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  metadata = coalesce(public.challenges.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

insert into public.challenges (
  slug,
  title,
  description,
  rules,
  category,
  difficulty,
  scope,
  scope_key,
  status,
  is_featured,
  reward_points,
  max_participants,
  starts_at,
  ends_at,
  metadata,
  created_by
)
values (
  'r4-upcoming-ai-ranking-40d',
  'AI Ranking Signals Lab (starts in 40d)',
  'Prototype ranking signal extraction and scoring explainability for developer profiles.',
  E'1) Join challenge\n2) Submit signal model approach\n3) Provide evaluation notes',
  'ai',
  'advanced',
  'global',
  null,
  'published',
  false,
  320,
  null,
  now() + interval '40 days',
  now() + interval '64 days',
  jsonb_build_object('source', 'release_4_seed', 'window', '40d_upcoming'),
  null
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  rules = excluded.rules,
  category = excluded.category,
  difficulty = excluded.difficulty,
  scope = excluded.scope,
  scope_key = excluded.scope_key,
  status = 'published',
  is_featured = false,
  reward_points = excluded.reward_points,
  max_participants = excluded.max_participants,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  metadata = coalesce(public.challenges.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

