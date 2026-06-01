-- 028_seed_active_challenges.sql
-- Seeds at least one active challenge (and one upcoming) for Release-3 flows.

-- Active challenge (joinable now)
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
  'release3-active-web-sprint',
  'Release-3 Web Sprint',
  'Build and ship a production-ready web feature with clean code, tests, and a short demo.',
  E'1) Join the challenge.\n2) Submit your repo/demo before deadline.\n3) Ranking is based on completion quality and score.',
  'web',
  'intermediate',
  'global',
  null,
  'live',
  true,
  200,
  null,
  now() - interval '12 hours',
  now() + interval '3 days',
  jsonb_build_object('source', 'release_3_seed'),
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
  starts_at = least(public.challenges.starts_at, now() - interval '1 hour'),
  ends_at = greatest(public.challenges.ends_at, now() + interval '2 days'),
  metadata = coalesce(public.challenges.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

-- Upcoming challenge (for Upcoming tab)
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
  'release3-upcoming-api-sprint',
  'Release-3 API Sprint',
  'Design and implement a resilient API flow with auth, validation, and observability.',
  E'1) Join before it starts.\n2) Submit once challenge becomes active.\n3) Keep endpoints stable and documented.',
  'backend',
  'advanced',
  'global',
  null,
  'published',
  false,
  260,
  null,
  now() + interval '1 day',
  now() + interval '4 days',
  jsonb_build_object('source', 'release_3_seed'),
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
  starts_at = greatest(public.challenges.starts_at, now() + interval '1 hour'),
  ends_at = greatest(public.challenges.ends_at, now() + interval '2 days'),
  metadata = coalesce(public.challenges.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

