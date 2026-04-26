-- 015_verification_activity_and_achievements.sql
-- Activity events + external accounts + verification runs + github heatmap + achievements

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -------------------------------------------------------------------
-- activity_events
-- -------------------------------------------------------------------
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  target_profile_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (
    event_type in (
      'follow',
      'post_created',
      'post_liked',
      'post_commented',
      'challenge_joined',
      'challenge_submitted',
      'challenge_won',
      'verification_completed',
      'achievement_unlocked'
    )
  ),
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_target_created
  on public.activity_events (target_profile_id, created_at desc);

create index if not exists idx_activity_events_actor_created
  on public.activity_events (actor_profile_id, created_at desc);

create index if not exists idx_activity_events_type_created
  on public.activity_events (event_type, created_at desc);

create index if not exists idx_activity_events_created
  on public.activity_events (created_at desc);

alter table public.activity_events enable row level security;

drop policy if exists "Users can read visible activity events" on public.activity_events;
create policy "Users can read visible activity events"
  on public.activity_events for select
  using (
    visibility = 'public'
    or auth.uid() = actor_profile_id
    or auth.uid() = target_profile_id
  );

-- no client write policies (events are system/backend-generated)

create or replace function public.log_activity_event(
  p_actor_profile_id uuid,
  p_target_profile_id uuid,
  p_event_type text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_visibility text default 'public'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_events (
    actor_profile_id,
    target_profile_id,
    event_type,
    entity_type,
    entity_id,
    metadata,
    visibility,
    created_at
  )
  values (
    p_actor_profile_id,
    p_target_profile_id,
    p_event_type,
    p_entity_type,
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb),
    coalesce(p_visibility, 'public'),
    now()
  );
end;
$$;

-- follows -> activity
create or replace function public.trg_follows_log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity_event(
    new.follower_id,
    new.following_id,
    'follow',
    'follow',
    null,
    jsonb_build_object(
      'follower_id', new.follower_id,
      'following_id', new.following_id
    ),
    'public'
  );
  return new;
end;
$$;

drop trigger if exists trg_follows_log_activity on public.follows;
create trigger trg_follows_log_activity
after insert on public.follows
for each row
execute function public.trg_follows_log_activity();

-- posts -> activity
create or replace function public.trg_posts_log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity_event(
    new.user_id,
    new.user_id,
    'post_created',
    'post',
    new.id,
    jsonb_build_object('post_id', new.id),
    'public'
  );
  return new;
end;
$$;

drop trigger if exists trg_posts_log_activity on public.posts;
create trigger trg_posts_log_activity
after insert on public.posts
for each row
execute function public.trg_posts_log_activity();

-- post_likes -> activity
create or replace function public.trg_post_likes_log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner uuid;
begin
  select p.user_id into post_owner
  from public.posts p
  where p.id = new.post_id;

  if post_owner is null then
    return new;
  end if;

  if post_owner = new.user_id then
    return new;
  end if;

  perform public.log_activity_event(
    new.user_id,
    post_owner,
    'post_liked',
    'post',
    new.post_id,
    jsonb_build_object('post_id', new.post_id),
    'public'
  );

  return new;
end;
$$;

drop trigger if exists trg_post_likes_log_activity on public.post_likes;
create trigger trg_post_likes_log_activity
after insert on public.post_likes
for each row
execute function public.trg_post_likes_log_activity();

-- post_comments -> activity
create or replace function public.trg_post_comments_log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner uuid;
begin
  select p.user_id into post_owner
  from public.posts p
  where p.id = new.post_id;

  if post_owner is null then
    return new;
  end if;

  if post_owner = new.user_id then
    return new;
  end if;

  perform public.log_activity_event(
    new.user_id,
    post_owner,
    'post_commented',
    'post',
    new.post_id,
    jsonb_build_object(
      'post_id', new.post_id,
      'comment_id', new.id
    ),
    'public'
  );

  return new;
end;
$$;

drop trigger if exists trg_post_comments_log_activity on public.post_comments;
create trigger trg_post_comments_log_activity
after insert on public.post_comments
for each row
execute function public.trg_post_comments_log_activity();

-- challenge_participants -> activity
create or replace function public.trg_challenge_participants_log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'joined' then
    perform public.log_activity_event(
      new.profile_id,
      new.profile_id,
      'challenge_joined',
      'challenge',
      new.challenge_id,
      jsonb_build_object('challenge_id', new.challenge_id),
      'public'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_challenge_participants_log_activity on public.challenge_participants;
create trigger trg_challenge_participants_log_activity
after insert on public.challenge_participants
for each row
execute function public.trg_challenge_participants_log_activity();

-- challenge_submissions -> activity
create or replace function public.trg_challenge_submissions_log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('submitted', 'winner') then
    perform public.log_activity_event(
      new.profile_id,
      new.profile_id,
      'challenge_submitted',
      'challenge_submission',
      new.id,
      jsonb_build_object(
        'challenge_id', new.challenge_id,
        'submission_id', new.id
      ),
      'public'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_challenge_submissions_log_activity on public.challenge_submissions;
create trigger trg_challenge_submissions_log_activity
after insert on public.challenge_submissions
for each row
execute function public.trg_challenge_submissions_log_activity();

-- challenge_winners -> activity
create or replace function public.trg_challenge_winners_log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity_event(
    new.profile_id,
    new.profile_id,
    'challenge_won',
    'challenge',
    new.challenge_id,
    jsonb_build_object(
      'challenge_id', new.challenge_id,
      'winner_id', new.id,
      'position', new.position,
      'awarded_points', new.awarded_points
    ),
    'public'
  );

  return new;
end;
$$;

drop trigger if exists trg_challenge_winners_log_activity on public.challenge_winners;
create trigger trg_challenge_winners_log_activity
after insert on public.challenge_winners
for each row
execute function public.trg_challenge_winners_log_activity();

-- -------------------------------------------------------------------
-- profile_external_accounts
-- -------------------------------------------------------------------
create table if not exists public.profile_external_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('github', 'linkedin', 'website', 'x', 'leetcode', 'custom')),
  account_handle text,
  account_url text,
  external_user_id text,
  is_primary boolean not null default false,
  is_verified boolean not null default false,
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profile_external_accounts_profile_provider
  on public.profile_external_accounts (profile_id, provider, connected_at desc);

create index if not exists idx_profile_external_accounts_provider_verified
  on public.profile_external_accounts (provider, is_verified, connected_at desc);

create unique index if not exists idx_profile_external_accounts_single_provider
  on public.profile_external_accounts (profile_id, provider)
  where provider in ('github', 'linkedin', 'website', 'x', 'leetcode');

create unique index if not exists idx_profile_external_accounts_custom_handle
  on public.profile_external_accounts (profile_id, provider, lower(account_handle))
  where provider = 'custom' and account_handle is not null;

drop trigger if exists trg_profile_external_accounts_set_updated_at on public.profile_external_accounts;
create trigger trg_profile_external_accounts_set_updated_at
before update
on public.profile_external_accounts
for each row
execute function public.set_updated_at();

alter table public.profile_external_accounts enable row level security;

drop policy if exists "Anyone can read external accounts" on public.profile_external_accounts;
create policy "Anyone can read external accounts"
  on public.profile_external_accounts for select
  using (true);

drop policy if exists "Users can insert own external accounts" on public.profile_external_accounts;
create policy "Users can insert own external accounts"
  on public.profile_external_accounts for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "Users can update own external accounts" on public.profile_external_accounts;
create policy "Users can update own external accounts"
  on public.profile_external_accounts for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "Users can delete own external accounts" on public.profile_external_accounts;
create policy "Users can delete own external accounts"
  on public.profile_external_accounts for delete
  to authenticated
  using (auth.uid() = profile_id);

-- -------------------------------------------------------------------
-- verification_runs
-- -------------------------------------------------------------------
create table if not exists public.verification_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  source text not null default 'manual' check (source in ('manual', 'scheduled', 'admin')),
  score_before int check (score_before is null or score_before >= 0),
  score_after int check (score_after is null or score_after >= 0),
  tier_before text,
  tier_after text,
  summary text,
  recommendations jsonb not null default '[]'::jsonb,
  signals jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  requested_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_runs_time_window_chk check (
    completed_at is null or started_at is null or completed_at >= started_at
  )
);

create index if not exists idx_verification_runs_profile_created
  on public.verification_runs (profile_id, created_at desc);

create index if not exists idx_verification_runs_status_created
  on public.verification_runs (status, created_at desc);

drop trigger if exists trg_verification_runs_set_updated_at on public.verification_runs;
create trigger trg_verification_runs_set_updated_at
before update
on public.verification_runs
for each row
execute function public.set_updated_at();

alter table public.verification_runs enable row level security;

drop policy if exists "Users can read own verification runs" on public.verification_runs;
create policy "Users can read own verification runs"
  on public.verification_runs for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "Users can request own verification runs" on public.verification_runs;
create policy "Users can request own verification runs"
  on public.verification_runs for insert
  to authenticated
  with check (
    auth.uid() = profile_id
    and status = 'queued'
    and score_before is null
    and score_after is null
    and tier_before is null
    and tier_after is null
    and started_at is null
    and completed_at is null
    and (requested_by is null or requested_by = auth.uid())
  );

-- no client updates/deletes (backend/service updates run state)

-- verification completed -> activity
create or replace function public.trg_verification_runs_log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed'
     and (old.status is distinct from new.status) then
    perform public.log_activity_event(
      new.profile_id,
      new.profile_id,
      'verification_completed',
      'verification_run',
      new.id,
      jsonb_build_object(
        'verification_run_id', new.id,
        'tier_before', new.tier_before,
        'tier_after', new.tier_after,
        'score_before', new.score_before,
        'score_after', new.score_after
      ),
      'public'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_verification_runs_log_activity on public.verification_runs;
create trigger trg_verification_runs_log_activity
after update on public.verification_runs
for each row
execute function public.trg_verification_runs_log_activity();

-- -------------------------------------------------------------------
-- github_daily_contributions
-- -------------------------------------------------------------------
create table if not exists public.github_daily_contributions (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  contributions int not null default 0 check (contributions >= 0),
  commits_count int not null default 0 check (commits_count >= 0),
  prs_count int not null default 0 check (prs_count >= 0),
  issues_count int not null default 0 check (issues_count >= 0),
  reviews_count int not null default 0 check (reviews_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, day)
);

create index if not exists idx_github_daily_contributions_profile_day
  on public.github_daily_contributions (profile_id, day desc);

drop trigger if exists trg_github_daily_contributions_set_updated_at on public.github_daily_contributions;
create trigger trg_github_daily_contributions_set_updated_at
before update
on public.github_daily_contributions
for each row
execute function public.set_updated_at();

alter table public.github_daily_contributions enable row level security;

drop policy if exists "Anyone can read github daily contributions" on public.github_daily_contributions;
create policy "Anyone can read github daily contributions"
  on public.github_daily_contributions for select
  using (true);

-- no client write policies (sync is backend/service-managed)

-- -------------------------------------------------------------------
-- achievement_definitions
-- -------------------------------------------------------------------
create table if not exists public.achievement_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
    check (code = lower(code) and code ~ '^[a-z0-9_]{3,60}$'),
  name text not null,
  description text not null,
  category text not null default 'general',
  points_reward int not null default 0 check (points_reward >= 0),
  icon_token text,
  criteria jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_achievement_definitions_category
  on public.achievement_definitions (category, is_active);

drop trigger if exists trg_achievement_definitions_set_updated_at on public.achievement_definitions;
create trigger trg_achievement_definitions_set_updated_at
before update
on public.achievement_definitions
for each row
execute function public.set_updated_at();

alter table public.achievement_definitions enable row level security;

drop policy if exists "Anyone can read achievement definitions" on public.achievement_definitions;
create policy "Anyone can read achievement definitions"
  on public.achievement_definitions for select
  using (true);

-- no client write policies (catalog is backend/service-managed)

insert into public.achievement_definitions (code, name, description, category, points_reward, icon_token, criteria, is_active)
values
  ('early_adopter', 'Early Adopter', 'Joined Tierd in the early phase.', 'community', 25, 'badge-early', '{}'::jsonb, true),
  ('challenge_winner', 'Challenge Winner', 'Won at least one challenge.', 'challenges', 100, 'badge-challenge-winner', '{"min_wins":1}'::jsonb, true),
  ('streak_4_weeks', '4-Week Streak', 'Maintained a 4-week positive score streak.', 'consistency', 50, 'badge-streak-4', '{"min_streak_weeks":4}'::jsonb, true),
  ('streak_8_weeks', '8-Week Streak', 'Maintained a 8-week positive score streak.', 'consistency', 100, 'badge-streak-8', '{"min_streak_weeks":8}'::jsonb, true),
  ('verified_profile', 'Verified Profile', 'Completed identity and account verification.', 'verification', 40, 'badge-verified', '{"verification_required":true}'::jsonb, true),
  ('open_source_builder', 'Open Source Builder', 'Published verified public projects.', 'projects', 60, 'badge-oss', '{"min_verified_projects":1}'::jsonb, true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  points_reward = excluded.points_reward,
  icon_token = excluded.icon_token,
  criteria = excluded.criteria,
  is_active = excluded.is_active,
  updated_at = now();

-- -------------------------------------------------------------------
-- profile_achievements
-- -------------------------------------------------------------------
create table if not exists public.profile_achievements (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievement_definitions(id) on delete cascade,
  awarded_by text not null default 'system',
  progress_value numeric(5,2) not null default 100 check (progress_value >= 0 and progress_value <= 100),
  metadata jsonb not null default '{}'::jsonb,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (profile_id, achievement_id)
);

create index if not exists idx_profile_achievements_profile_achieved
  on public.profile_achievements (profile_id, achieved_at desc);

create index if not exists idx_profile_achievements_achievement_achieved
  on public.profile_achievements (achievement_id, achieved_at desc);

alter table public.profile_achievements enable row level security;

drop policy if exists "Anyone can read profile achievements" on public.profile_achievements;
create policy "Anyone can read profile achievements"
  on public.profile_achievements for select
  using (true);

-- no client write policies (awards are backend/service-managed)

-- profile_achievements -> activity
create or replace function public.trg_profile_achievements_log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ach_code text;
begin
  select a.code into ach_code
  from public.achievement_definitions a
  where a.id = new.achievement_id;

  perform public.log_activity_event(
    new.profile_id,
    new.profile_id,
    'achievement_unlocked',
    'achievement',
    new.achievement_id,
    jsonb_build_object(
      'achievement_id', new.achievement_id,
      'achievement_code', ach_code
    ),
    'public'
  );

  return new;
end;
$$;

drop trigger if exists trg_profile_achievements_log_activity on public.profile_achievements;
create trigger trg_profile_achievements_log_activity
after insert on public.profile_achievements
for each row
execute function public.trg_profile_achievements_log_activity();

-- -------------------------------------------------------------------
-- helper views
-- -------------------------------------------------------------------
create or replace view public.profile_github_contributions_52w as
select
  g.profile_id,
  g.day,
  g.contributions,
  g.commits_count,
  g.prs_count,
  g.issues_count,
  g.reviews_count
from public.github_daily_contributions g
where g.day >= (current_date - interval '364 days')::date
order by g.profile_id, g.day;

create or replace view public.profile_public_links as
select
  pea.profile_id,
  pea.provider,
  pea.account_handle,
  pea.account_url,
  pea.is_primary,
  pea.is_verified,
  pea.verified_at,
  pea.connected_at
from public.profile_external_accounts pea
where pea.is_verified = true
   or pea.provider in ('website', 'github', 'linkedin');
