-- 017_seed_demo_data.sql
-- Demo seed data for development/staging only.
-- Requires migrations 011-016.

-- -------------------------------------------------------------------
-- 1) Map first profiles to demo personas
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
persona(rn, full_name, username, headline, country_code, city, company, website_url, github_username, linkedin_url, bio) as (
  values
    (1, 'Sara Kovačević', 'sarakdev', 'Senior AI Engineer', 'BA', 'Sarajevo', 'Open Systems', 'https://sara.dev', 'sarakdev', 'https://linkedin.com/in/sarakdev', 'Shipping AI products with measurable impact.'),
    (2, 'Amir Hadžić', 'amirh_', 'Systems Engineer', 'DE', 'Berlin', 'Kernel Labs', 'https://amir.systems', 'amirh', 'https://linkedin.com/in/amirh', 'Rust, distributed systems, and performance tuning.'),
    (3, 'Lena Marić', 'lenam', 'Frontend Architect', 'US', 'Austin', 'PixelForge', 'https://lena.dev', 'lenam', 'https://linkedin.com/in/lenam', 'Design systems, product UX, and scalable frontend architecture.'),
    (4, 'Jay Delić', 'jaydev', 'Full Stack Engineer', 'HR', 'Zagreb', 'ShipFast', 'https://jaybuilds.dev', 'jaydev', 'https://linkedin.com/in/jaydev', 'From API design to polished UI delivery.'),
    (5, 'Nina Petrović', 'ninap', 'Cloud Backend Engineer', 'GB', 'London', 'Cloudline', 'https://nina.cloud', 'ninap', 'https://linkedin.com/in/ninap', 'Go, infra automation, and reliable backend systems.'),
    (6, 'Dino Begović', 'dinob', 'Product Engineer', 'NL', 'Amsterdam', 'North Stack', 'https://dino.engineer', 'dinob', 'https://linkedin.com/in/dinob', 'Building end-to-end web products quickly and cleanly.'),
    (7, 'Mia Vukojević', 'miav_', 'Data Engineer', 'CA', 'Toronto', 'DataNorth', 'https://mia-data.dev', 'miav', 'https://linkedin.com/in/miav', 'Data pipelines, analytics, and ML feature delivery.'),
    (8, 'Emir Kurtović', 'emirk', 'Mobile Engineer', 'SE', 'Stockholm', 'Pocket Labs', 'https://emirmobile.dev', 'emirk', 'https://linkedin.com/in/emirk', 'React Native apps with production-grade performance.')
)
update public.profiles p
set
  full_name = coalesce(nullif(p.full_name, ''), per.full_name),
  username = case
    when (p.username is null or p.username = '' or p.username like 'seed_%')
      and not exists (
        select 1
        from public.profiles p2
        where lower(p2.username) = lower(per.username)
          and p2.id <> p.id
      )
    then per.username
    else p.username
  end,
  headline = coalesce(p.headline, per.headline),
  country_code = coalesce(p.country_code, per.country_code),
  city = coalesce(p.city, per.city),
  company = coalesce(p.company, per.company),
  website_url = coalesce(p.website_url, per.website_url),
  github_username = coalesce(p.github_username, per.github_username),
  linkedin_url = coalesce(p.linkedin_url, per.linkedin_url),
  bio = coalesce(p.bio, per.bio),
  last_active_at = now(),
  updated_at = now()
from seed_profiles sp
join persona per on per.rn = sp.rn
where p.id = sp.id;

-- -------------------------------------------------------------------
-- 2) Follows graph
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
pairs(follower_rn, following_rn) as (
  values
    (1,2),(1,3),(1,4),(1,5),
    (2,1),(2,3),(2,5),
    (3,1),(3,4),(3,6),
    (4,1),(4,2),(4,7),
    (5,1),(5,2),(5,8),
    (6,3),(6,4),(6,5),
    (7,1),(7,3),(7,8),
    (8,2),(8,4),(8,7)
)
insert into public.follows (follower_id, following_id, created_at)
select a.id, b.id, now() - interval '2 days'
from pairs pr
join seed_profiles a on a.rn = pr.follower_rn
join seed_profiles b on b.rn = pr.following_rn
on conflict (follower_id, following_id) do nothing;

-- -------------------------------------------------------------------
-- 3) Projects
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
proj(rn, slug, name, description, repo_url, live_url, is_featured, is_verified, stars_count, forks_count, watchers_count, open_issues_count) as (
  values
    (1, 'neuralquery', 'NeuralQuery', 'LLM-powered domain search assistant.', 'https://github.com/example/neuralquery', 'https://neuralquery.app', true, true, 420, 66, 38, 4),
    (2, 'rust-migrate', 'rust-migrate', 'Schema migration tooling for Rust services.', 'https://github.com/example/rust-migrate', 'https://rust-migrate.dev', false, true, 290, 44, 25, 6),
    (3, 'crdt-sync', 'CRDTSync', 'Realtime collaboration engine with offline support.', 'https://github.com/example/crdt-sync', 'https://crdtsync.dev', true, true, 360, 58, 31, 3),
    (4, 'edge-auth', 'EdgeAuth', 'Low-latency auth service for edge runtimes.', 'https://github.com/example/edge-auth', 'https://edgeauth.io', false, true, 240, 32, 21, 5),
    (5, 'go-sentinel', 'GoSentinel', 'Go service observability starter kit.', 'https://github.com/example/go-sentinel', 'https://gosentinel.dev', false, true, 210, 29, 19, 7),
    (6, 'nexar-ui', 'Nexar UI', 'Accessible component library for product teams.', 'https://github.com/example/nexar-ui', 'https://nexarui.dev', true, true, 330, 47, 27, 8)
)
update public.projects pj
set
  name = p.name,
  description = p.description,
  repo_url = p.repo_url,
  live_url = p.live_url,
  is_featured = p.is_featured,
  is_verified = p.is_verified,
  stars_count = p.stars_count,
  forks_count = p.forks_count,
  watchers_count = p.watchers_count,
  open_issues_count = p.open_issues_count,
  updated_at = now()
from proj p
join seed_profiles sp on sp.rn = p.rn
where pj.owner_id = sp.id
  and pj.slug = p.slug;

with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
proj(rn, slug, name, description, repo_url, live_url, is_featured, is_verified, stars_count, forks_count, watchers_count, open_issues_count) as (
  values
    (1, 'neuralquery', 'NeuralQuery', 'LLM-powered domain search assistant.', 'https://github.com/example/neuralquery', 'https://neuralquery.app', true, true, 420, 66, 38, 4),
    (2, 'rust-migrate', 'rust-migrate', 'Schema migration tooling for Rust services.', 'https://github.com/example/rust-migrate', 'https://rust-migrate.dev', false, true, 290, 44, 25, 6),
    (3, 'crdt-sync', 'CRDTSync', 'Realtime collaboration engine with offline support.', 'https://github.com/example/crdt-sync', 'https://crdtsync.dev', true, true, 360, 58, 31, 3),
    (4, 'edge-auth', 'EdgeAuth', 'Low-latency auth service for edge runtimes.', 'https://github.com/example/edge-auth', 'https://edgeauth.io', false, true, 240, 32, 21, 5),
    (5, 'go-sentinel', 'GoSentinel', 'Go service observability starter kit.', 'https://github.com/example/go-sentinel', 'https://gosentinel.dev', false, true, 210, 29, 19, 7),
    (6, 'nexar-ui', 'Nexar UI', 'Accessible component library for product teams.', 'https://github.com/example/nexar-ui', 'https://nexarui.dev', true, true, 330, 47, 27, 8)
)
insert into public.projects (
  owner_id, slug, name, description, repo_url, live_url,
  is_featured, is_verified, stars_count, forks_count, watchers_count, open_issues_count,
  created_at, updated_at
)
select
  sp.id, p.slug, p.name, p.description, p.repo_url, p.live_url,
  p.is_featured, p.is_verified, p.stars_count, p.forks_count, p.watchers_count, p.open_issues_count,
  now() - interval '10 days', now()
from proj p
join seed_profiles sp on sp.rn = p.rn
left join public.projects pj on pj.owner_id = sp.id and pj.slug = p.slug
where pj.id is null;

-- project technologies
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
map(project_rn, project_slug, tech_slug, is_primary, sort_order) as (
  values
    (1, 'neuralquery', 'python', true, 1),
    (1, 'neuralquery', 'ai-ml', false, 2),
    (1, 'neuralquery', 'typescript', false, 3),
    (2, 'rust-migrate', 'rust', true, 1),
    (2, 'rust-migrate', 'postgresql', false, 2),
    (3, 'crdt-sync', 'typescript', true, 1),
    (3, 'crdt-sync', 'react', false, 2),
    (4, 'edge-auth', 'node-js', true, 1),
    (4, 'edge-auth', 'typescript', false, 2),
    (5, 'go-sentinel', 'go', true, 1),
    (5, 'go-sentinel', 'docker', false, 2),
    (6, 'nexar-ui', 'react', true, 1),
    (6, 'nexar-ui', 'typescript', false, 2)
)
insert into public.project_technologies (project_id, technology_id, is_primary, sort_order, created_at)
select
  pj.id,
  t.id,
  m.is_primary,
  m.sort_order,
  now()
from map m
join seed_profiles sp on sp.rn = m.project_rn
join public.projects pj on pj.owner_id = sp.id and pj.slug = m.project_slug
join public.technologies t on t.slug = m.tech_slug
on conflict (project_id, technology_id) do update
set
  is_primary = excluded.is_primary,
  sort_order = excluded.sort_order;

-- -------------------------------------------------------------------
-- 4) Profile technologies
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
map(rn, tech_slug, is_primary, sort_order) as (
  values
    (1, 'python', true, 1), (1, 'ai-ml', false, 2), (1, 'typescript', false, 3),
    (2, 'rust', true, 1), (2, 'postgresql', false, 2), (2, 'go', false, 3),
    (3, 'react', true, 1), (3, 'typescript', false, 2), (3, 'next-js', false, 3),
    (4, 'node-js', true, 1), (4, 'typescript', false, 2), (4, 'react', false, 3),
    (5, 'go', true, 1), (5, 'docker', false, 2), (5, 'postgresql', false, 3),
    (6, 'next-js', true, 1), (6, 'react', false, 2), (6, 'typescript', false, 3),
    (7, 'python', true, 1), (7, 'postgresql', false, 2), (7, 'ai-ml', false, 3),
    (8, 'react-native', true, 1), (8, 'typescript', false, 2), (8, 'swift', false, 3)
)
insert into public.profile_technologies (profile_id, technology_id, is_primary, sort_order, created_at)
select
  sp.id,
  t.id,
  m.is_primary,
  m.sort_order,
  now()
from map m
join seed_profiles sp on sp.rn = m.rn
join public.technologies t on t.slug = m.tech_slug
on conflict (profile_id, technology_id) do update
set
  is_primary = excluded.is_primary,
  sort_order = excluded.sort_order;

-- -------------------------------------------------------------------
-- 5) Posts + likes + comments
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
post_seed(rn, content) as (
  values
    (1, 'Shipped a domain RAG pipeline with 94% answer accuracy in production.'),
    (2, 'Refactored core message broker in Rust. P99 dropped from 180ms to 22ms.'),
    (3, 'Released a new design-system package and migrated 4 products to it.'),
    (4, 'Implemented edge auth flow with session rotation and audit tracing.'),
    (5, 'Built incident timeline tooling for backend services.'),
    (6, 'Shipped a responsive dashboard shell with reusable data widgets.')
)
insert into public.posts (user_id, content, image_url, created_at, updated_at)
select
  sp.id,
  ps.content,
  null,
  now() - interval '3 days',
  now() - interval '3 days'
from post_seed ps
join seed_profiles sp on sp.rn = ps.rn
where not exists (
  select 1
  from public.posts p
  where p.user_id = sp.id
    and p.content = ps.content
);

with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
post_seed(rn, content) as (
  values
    (1, 'Shipped a domain RAG pipeline with 94% answer accuracy in production.'),
    (2, 'Refactored core message broker in Rust. P99 dropped from 180ms to 22ms.'),
    (3, 'Released a new design-system package and migrated 4 products to it.'),
    (4, 'Implemented edge auth flow with session rotation and audit tracing.')
),
post_ids as (
  select ps.rn, p.id as post_id
  from post_seed ps
  join seed_profiles sp on sp.rn = ps.rn
  join public.posts p on p.user_id = sp.id and p.content = ps.content
),
likes_seed(actor_rn, post_rn) as (
  values
    (2,1),(3,1),(4,1),(5,1),
    (1,2),(3,2),(6,2),
    (1,3),(2,3),(4,3),(7,3),
    (1,4),(2,4),(3,4),(8,4)
)
insert into public.post_likes (post_id, user_id, created_at)
select
  pi.post_id,
  a.id,
  now() - interval '2 days'
from likes_seed ls
join post_ids pi on pi.rn = ls.post_rn
join seed_profiles a on a.rn = ls.actor_rn
on conflict (post_id, user_id) do nothing;

with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
post_seed(rn, content) as (
  values
    (1, 'Shipped a domain RAG pipeline with 94% answer accuracy in production.'),
    (2, 'Refactored core message broker in Rust. P99 dropped from 180ms to 22ms.'),
    (3, 'Released a new design-system package and migrated 4 products to it.'),
    (4, 'Implemented edge auth flow with session rotation and audit tracing.')
),
post_ids as (
  select ps.rn, p.id as post_id
  from post_seed ps
  join seed_profiles sp on sp.rn = ps.rn
  join public.posts p on p.user_id = sp.id and p.content = ps.content
),
comment_seed(actor_rn, post_rn, content) as (
  values
    (2,1,'Strong result. Curious which retrieval strategy gave the biggest lift?'),
    (3,1,'Love this. Any write-up coming?'),
    (1,2,'Huge latency win. Nice engineering discipline.'),
    (4,3,'Design consistency across 4 products is a massive achievement.'),
    (5,4,'Great security baseline. Session rotation details look clean.')
)
insert into public.post_comments (post_id, user_id, content, created_at)
select
  pi.post_id,
  a.id,
  cs.content,
  now() - interval '2 days'
from comment_seed cs
join post_ids pi on pi.rn = cs.post_rn
join seed_profiles a on a.rn = cs.actor_rn
where not exists (
  select 1
  from public.post_comments pc
  where pc.post_id = pi.post_id
    and pc.user_id = a.id
    and pc.content = cs.content
);

-- -------------------------------------------------------------------
-- 6) Base score events
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
evt(rn, points, reason_type, seed_key) as (
  values
    (1, 1200, 'seed_bootstrap', 'seed_score_1'),
    (2, 1080, 'seed_bootstrap', 'seed_score_2'),
    (3, 980,  'seed_bootstrap', 'seed_score_3'),
    (4, 900,  'seed_bootstrap', 'seed_score_4'),
    (5, 820,  'seed_bootstrap', 'seed_score_5'),
    (6, 760,  'seed_bootstrap', 'seed_score_6'),
    (7, 690,  'seed_bootstrap', 'seed_score_7'),
    (8, 610,  'seed_bootstrap', 'seed_score_8')
)
insert into public.score_events (profile_id, points, reason_type, metadata, created_at)
select
  sp.id,
  e.points,
  e.reason_type,
  jsonb_build_object('seed_key', e.seed_key),
  now() - interval '9 days'
from evt e
join seed_profiles sp on sp.rn = e.rn
where not exists (
  select 1
  from public.score_events se
  where se.profile_id = sp.id
    and se.reason_type = e.reason_type
    and se.metadata ->> 'seed_key' = e.seed_key
);

-- -------------------------------------------------------------------
-- 7) Challenges + participants + submissions + winners
-- -------------------------------------------------------------------
update public.challenges c
set
  title = d.title,
  description = d.description,
  rules = d.rules,
  category = d.category,
  difficulty = d.difficulty,
  scope = d.scope,
  scope_key = d.scope_key,
  status = d.status,
  is_featured = d.is_featured,
  reward_points = d.reward_points,
  starts_at = d.starts_at,
  ends_at = d.ends_at,
  metadata = d.metadata,
  updated_at = now()
from (
  values
    (
      'global-web-sprint',
      'Global Web Sprint',
      'Build and ship a polished developer-facing web app.',
      'Submit repo + demo. Judged by quality, completeness, and utility.',
      'web',
      'intermediate',
      'global',
      null::text,
      'live',
      true,
      350,
      now() - interval '2 days',
      now() + interval '5 days',
      '{"season":"spring"}'::jsonb
    ),
    (
      'api-reliability-sprint',
      'API Reliability Sprint',
      'Improve resilience and observability of an API service.',
      'Submit test results and architecture notes.',
      'backend',
      'advanced',
      'global',
      null::text,
      'published',
      false,
      280,
      now() - interval '1 day',
      now() + interval '7 days',
      '{"season":"spring"}'::jsonb
    )
) as d(slug, title, description, rules, category, difficulty, scope, scope_key, status, is_featured, reward_points, starts_at, ends_at, metadata)
where c.slug = d.slug;

insert into public.challenges (
  slug, title, description, rules, category, difficulty, scope, scope_key,
  status, is_featured, reward_points, starts_at, ends_at, metadata, created_by,
  created_at, updated_at
)
select
  d.slug, d.title, d.description, d.rules, d.category, d.difficulty, d.scope, d.scope_key,
  d.status, d.is_featured, d.reward_points, d.starts_at, d.ends_at, d.metadata, null,
  now(), now()
from (
  values
    (
      'global-web-sprint',
      'Global Web Sprint',
      'Build and ship a polished developer-facing web app.',
      'Submit repo + demo. Judged by quality, completeness, and utility.',
      'web',
      'intermediate',
      'global',
      null::text,
      'live',
      true,
      350,
      now() - interval '2 days',
      now() + interval '5 days',
      '{"season":"spring"}'::jsonb
    ),
    (
      'api-reliability-sprint',
      'API Reliability Sprint',
      'Improve resilience and observability of an API service.',
      'Submit test results and architecture notes.',
      'backend',
      'advanced',
      'global',
      null::text,
      'published',
      false,
      280,
      now() - interval '1 day',
      now() + interval '7 days',
      '{"season":"spring"}'::jsonb
    )
) as d(slug, title, description, rules, category, difficulty, scope, scope_key, status, is_featured, reward_points, starts_at, ends_at, metadata)
where not exists (
  select 1 from public.challenges c where c.slug = d.slug
);

with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
part(challenge_slug, rn) as (
  values
    ('global-web-sprint',1),('global-web-sprint',2),('global-web-sprint',3),('global-web-sprint',4),('global-web-sprint',5),
    ('api-reliability-sprint',2),('api-reliability-sprint',4),('api-reliability-sprint',5),('api-reliability-sprint',6)
)
insert into public.challenge_participants (challenge_id, profile_id, status, joined_at, metadata)
select
  c.id,
  sp.id,
  'joined',
  now() - interval '1 day',
  jsonb_build_object('seed', true)
from part p
join public.challenges c on c.slug = p.challenge_slug
join seed_profiles sp on sp.rn = p.rn
on conflict (challenge_id, profile_id) do update
set
  status = 'joined',
  updated_at = now();

with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
sub(challenge_slug, rn, title, repo_url, demo_url, score, rank, seed_key) as (
  values
    ('global-web-sprint',1,'RAG Studio','https://github.com/example/rag-studio','https://ragstudio.app',95.50,1,'sub_gws_1'),
    ('global-web-sprint',3,'Design Grid','https://github.com/example/design-grid','https://designgrid.app',92.20,2,'sub_gws_3'),
    ('global-web-sprint',4,'Edge Tokens','https://github.com/example/edge-tokens','https://edgetokens.app',89.70,3,'sub_gws_4'),
    ('api-reliability-sprint',2,'Rust Guard','https://github.com/example/rust-guard','https://rustguard.dev',94.10,1,'sub_ars_2'),
    ('api-reliability-sprint',5,'Sentinel API','https://github.com/example/sentinel-api','https://sentinelapi.dev',90.30,2,'sub_ars_5')
)
insert into public.challenge_submissions (
  challenge_id, profile_id, title, description, repo_url, demo_url,
  status, score, rank, reviewed_at, metadata, submitted_at, created_at, updated_at
)
select
  c.id,
  sp.id,
  s.title,
  'Seed submission',
  s.repo_url,
  s.demo_url,
  'reviewed',
  s.score,
  s.rank,
  now() - interval '6 hours',
  jsonb_build_object('seed_key', s.seed_key),
  now() - interval '1 day',
  now() - interval '1 day',
  now() - interval '6 hours'
from sub s
join public.challenges c on c.slug = s.challenge_slug
join seed_profiles sp on sp.rn = s.rn
where not exists (
  select 1
  from public.challenge_submissions cs
  where cs.challenge_id = c.id
    and cs.profile_id = sp.id
    and cs.metadata ->> 'seed_key' = s.seed_key
);

with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
wins(challenge_slug, rn, position, awarded_points, badge, summary) as (
  values
    ('global-web-sprint',1,1,350,'Gold','Best overall product quality and execution.'),
    ('global-web-sprint',3,2,220,'Silver','Excellent UX and strong implementation quality.'),
    ('global-web-sprint',4,3,140,'Bronze','Solid delivery and good technical decisions.')
),
sub_pick as (
  select
    c.id as challenge_id,
    sp.id as profile_id,
    (
      select cs.id
      from public.challenge_submissions cs
      where cs.challenge_id = c.id
        and cs.profile_id = sp.id
      order by cs.submitted_at desc, cs.created_at desc
      limit 1
    ) as submission_id
  from wins w
  join public.challenges c on c.slug = w.challenge_slug
  join seed_profiles sp on sp.rn = w.rn
)
insert into public.challenge_winners (
  challenge_id, profile_id, submission_id, position, awarded_points, badge, summary, awarded_at, created_by, created_at
)
select
  c.id,
  sp.id,
  spk.submission_id,
  w.position,
  w.awarded_points,
  w.badge,
  w.summary,
  now() - interval '2 hours',
  'seed_bootstrap',
  now() - interval '2 hours'
from wins w
join public.challenges c on c.slug = w.challenge_slug
join seed_profiles sp on sp.rn = w.rn
left join sub_pick spk on spk.challenge_id = c.id and spk.profile_id = sp.id
on conflict (challenge_id, position) do update
set
  profile_id = excluded.profile_id,
  submission_id = excluded.submission_id,
  awarded_points = excluded.awarded_points,
  badge = excluded.badge,
  summary = excluded.summary,
  awarded_at = excluded.awarded_at;

-- -------------------------------------------------------------------
-- 8) Verification runs + bonus score events
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
vr(rn, score_before, score_after, tier_before, tier_after, seed_key) as (
  values
    (1, 2500, 2840, 'Tier 5', 'Aegis', 'vr_1'),
    (2, 2300, 2680, 'Tier 4', 'Tier 5', 'vr_2'),
    (3, 2100, 2520, 'Tier 4', 'Tier 5', 'vr_3')
),
ins as (
  insert into public.verification_runs (
    profile_id, status, source, score_before, score_after, tier_before, tier_after,
    summary, recommendations, signals, started_at, completed_at, created_at, updated_at
  )
  select
    sp.id,
    'completed',
    'manual',
    v.score_before,
    v.score_after,
    v.tier_before,
    v.tier_after,
    'Seed verification completed successfully.',
    '["Add one more verified project","Increase weekly consistency"]'::jsonb,
    jsonb_build_object('github_connected', true, 'projects_detected', 4, 'seed_key', v.seed_key),
    now() - interval '1 day',
    now() - interval '20 hours',
    now() - interval '1 day',
    now() - interval '20 hours'
  from vr v
  join seed_profiles sp on sp.rn = v.rn
  where not exists (
    select 1
    from public.verification_runs ex
    where ex.profile_id = sp.id
      and ex.signals ->> 'seed_key' = v.seed_key
  )
  returning id, profile_id, tier_before, tier_after, score_before, score_after
)
select public.log_activity_event(
  i.profile_id,
  i.profile_id,
  'verification_completed',
  'verification_run',
  i.id,
  jsonb_build_object(
    'verification_run_id', i.id,
    'tier_before', i.tier_before,
    'tier_after', i.tier_after,
    'score_before', i.score_before,
    'score_after', i.score_after
  ),
  'public'
)
from ins i;

with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
evt(rn, points, seed_key) as (
  values
    (1, 180, 'verification_bonus_1'),
    (2, 160, 'verification_bonus_2'),
    (3, 140, 'verification_bonus_3')
)
insert into public.score_events (profile_id, points, reason_type, metadata, created_at)
select
  sp.id,
  e.points,
  'verification_bonus',
  jsonb_build_object('seed_key', e.seed_key),
  now() - interval '19 hours'
from evt e
join seed_profiles sp on sp.rn = e.rn
where not exists (
  select 1
  from public.score_events se
  where se.profile_id = sp.id
    and se.reason_type = 'verification_bonus'
    and se.metadata ->> 'seed_key' = e.seed_key
);

-- -------------------------------------------------------------------
-- 9) External accounts (update + insert; no fragile ON CONFLICT)
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
acc(rn, provider, account_handle, account_url, is_primary, is_verified) as (
  values
    (1, 'github',  'sarakdev', 'https://github.com/sarakdev', true,  true),
    (1, 'linkedin','sarakdev', 'https://linkedin.com/in/sarakdev', false, true),
    (1, 'website', null,       'https://sara.dev', false, true),
    (2, 'github',  'amirh',    'https://github.com/amirh', true,  true),
    (2, 'linkedin','amirh',    'https://linkedin.com/in/amirh', false, true),
    (3, 'github',  'lenam',    'https://github.com/lenam', true,  true),
    (3, 'website', null,       'https://lena.dev', false, true),
    (4, 'github',  'jaydev',   'https://github.com/jaydev', true, true),
    (5, 'github',  'ninap',    'https://github.com/ninap', true, true)
)
update public.profile_external_accounts pea
set
  account_handle = a.account_handle,
  account_url = a.account_url,
  is_primary = a.is_primary,
  is_verified = a.is_verified,
  verified_at = case when a.is_verified then now() - interval '4 days' else null end,
  connected_at = now() - interval '4 days',
  updated_at = now()
from acc a
join seed_profiles sp on sp.rn = a.rn
where pea.profile_id = sp.id
  and pea.provider = a.provider;

with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
acc(rn, provider, account_handle, account_url, is_primary, is_verified) as (
  values
    (1, 'github',  'sarakdev', 'https://github.com/sarakdev', true,  true),
    (1, 'linkedin','sarakdev', 'https://linkedin.com/in/sarakdev', false, true),
    (1, 'website', null,       'https://sara.dev', false, true),
    (2, 'github',  'amirh',    'https://github.com/amirh', true,  true),
    (2, 'linkedin','amirh',    'https://linkedin.com/in/amirh', false, true),
    (3, 'github',  'lenam',    'https://github.com/lenam', true,  true),
    (3, 'website', null,       'https://lena.dev', false, true),
    (4, 'github',  'jaydev',   'https://github.com/jaydev', true, true),
    (5, 'github',  'ninap',    'https://github.com/ninap', true, true)
)
insert into public.profile_external_accounts (
  profile_id, provider, account_handle, account_url,
  is_primary, is_verified, verified_at, connected_at, created_at, updated_at
)
select
  sp.id,
  a.provider,
  a.account_handle,
  a.account_url,
  a.is_primary,
  a.is_verified,
  case when a.is_verified then now() - interval '4 days' else null end,
  now() - interval '4 days',
  now() - interval '4 days',
  now() - interval '4 days'
from acc a
join seed_profiles sp on sp.rn = a.rn
left join public.profile_external_accounts pea
  on pea.profile_id = sp.id
 and pea.provider = a.provider
where pea.id is null;

-- -------------------------------------------------------------------
-- 10) Achievements
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 8
),
amap(rn, code) as (
  values
    (1,'challenge_winner'),
    (1,'streak_8_weeks'),
    (1,'verified_profile'),
    (2,'challenge_winner'),
    (2,'streak_4_weeks'),
    (3,'verified_profile'),
    (3,'open_source_builder'),
    (4,'early_adopter'),
    (5,'early_adopter')
)
insert into public.profile_achievements (
  profile_id, achievement_id, awarded_by, progress_value, metadata, achieved_at, created_at
)
select
  sp.id,
  ad.id,
  'seed_bootstrap',
  100,
  jsonb_build_object('seed', true),
  now() - interval '1 day',
  now() - interval '1 day'
from amap a
join seed_profiles sp on sp.rn = a.rn
join public.achievement_definitions ad on ad.code = a.code
on conflict (profile_id, achievement_id) do nothing;

-- -------------------------------------------------------------------
-- 11) GitHub daily contributions (last 84 days)
-- -------------------------------------------------------------------
with seed_profiles as (
  select id, row_number() over (order by created_at, id) as rn
  from public.profiles
  order by created_at, id
  limit 5
),
days as (
  select gs::date as day
  from generate_series(current_date - interval '83 days', current_date, interval '1 day') gs
)
insert into public.github_daily_contributions (
  profile_id, day, contributions, commits_count, prs_count, issues_count, reviews_count, metadata,
  created_at, updated_at
)
select
  sp.id,
  d.day,
  case
    when extract(dow from d.day) in (0,6) then (sp.rn % 3)
    else ((sp.rn * 2 + extract(doy from d.day)::int) % 8)
  end as contributions,
  greatest(0, ((sp.rn + extract(doy from d.day)::int) % 6)) as commits_count,
  greatest(0, ((sp.rn + extract(doy from d.day)::int) % 3)) as prs_count,
  greatest(0, ((sp.rn + extract(doy from d.day)::int) % 2)) as issues_count,
  greatest(0, ((sp.rn + extract(doy from d.day)::int) % 2)) as reviews_count,
  jsonb_build_object('seed', true),
  now() - interval '12 hours',
  now() - interval '12 hours'
from seed_profiles sp
cross join days d
on conflict (profile_id, day) do update
set
  contributions = excluded.contributions,
  commits_count = excluded.commits_count,
  prs_count = excluded.prs_count,
  issues_count = excluded.issues_count,
  reviews_count = excluded.reviews_count,
  metadata = excluded.metadata,
  updated_at = now();

-- -------------------------------------------------------------------
-- 12) Refresh one global all_time leaderboard snapshot from live scores
-- -------------------------------------------------------------------
do $$
declare
  v_snapshot_id uuid;
begin
  select s.id
    into v_snapshot_id
  from public.leaderboard_snapshots s
  where s.scope = 'global'
    and s.scope_key is null
    and s.period = 'all_time'
    and s.created_by = 'seed_bootstrap'
  order by s.created_at desc
  limit 1;

  if v_snapshot_id is null then
    insert into public.leaderboard_snapshots (
      scope, scope_key, period, week_start, month_start, effective_at, created_by, created_at
    )
    values (
      'global', null, 'all_time', null, null, now(), 'seed_bootstrap', now()
    )
    returning id into v_snapshot_id;
  else
    update public.leaderboard_snapshots
       set effective_at = now(),
           created_at = now()
     where id = v_snapshot_id;
  end if;

  delete from public.leaderboard_entries
  where snapshot_id = v_snapshot_id;

  insert into public.leaderboard_entries (
    snapshot_id, profile_id, rank, score, delta, percentile, peak_rank, tier_code, streak_weeks, projects_count, created_at
  )
  select
    v_snapshot_id,
    l.profile_id,
    l.rank,
    l.score,
    coalesce(l.delta, 0),
    l.percentile,
    ps.peak_rank_global,
    l.tier_code,
    l.streak_weeks,
    coalesce((
      select count(*)::int
      from public.projects p
      where p.owner_id = l.profile_id
    ), 0),
    now()
  from public.live_global_leaderboard l
  left join public.profile_scores ps on ps.profile_id = l.profile_id
  order by l.rank
  limit 100;
end
$$;
