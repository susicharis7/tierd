-- 013_scoring_and_leaderboard.sql
-- Tiers + score ledger + aggregates + leaderboard snapshots/views

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
-- tiers
-- -------------------------------------------------------------------
create table if not exists public.tiers (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  min_score int not null check (min_score >= 0),
  sort_order int not null check (sort_order > 0),
  color_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_tiers_code_unique
  on public.tiers (lower(code));

create unique index if not exists idx_tiers_name_unique
  on public.tiers (lower(name));

create unique index if not exists idx_tiers_min_score_unique
  on public.tiers (min_score);

create index if not exists idx_tiers_min_score_desc
  on public.tiers (min_score desc);

drop trigger if exists trg_tiers_set_updated_at on public.tiers;
create trigger trg_tiers_set_updated_at
before update
on public.tiers
for each row
execute function public.set_updated_at();

alter table public.tiers enable row level security;

drop policy if exists "Anyone can read tiers" on public.tiers;
create policy "Anyone can read tiers"
  on public.tiers for select
  using (true);

insert into public.tiers (code, name, min_score, sort_order, color_token)
values
  ('aegis', 'Aegis', 2800, 1, 'tier-aegis'),
  ('tier_5', 'Tier 5', 2500, 2, 'tier-5'),
  ('tier_4', 'Tier 4', 2200, 3, 'tier-4'),
  ('tier_3', 'Tier 3', 1800, 4, 'tier-3'),
  ('tier_2', 'Tier 2', 1400, 5, 'tier-2'),
  ('tier_1', 'Tier 1', 800, 6, 'tier-1'),
  ('unranked', 'Unranked', 0, 7, 'tier-unranked')
on conflict (min_score) do update
set
  code = excluded.code,
  name = excluded.name,
  sort_order = excluded.sort_order,
  color_token = excluded.color_token,
  updated_at = now();

-- -------------------------------------------------------------------
-- profile_scores (aggregate table)
-- -------------------------------------------------------------------
create table if not exists public.profile_scores (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  total_score int not null default 0 check (total_score >= 0),
  weekly_score int not null default 0 check (weekly_score >= 0),
  weekly_window_start date not null default date_trunc('week', now())::date,
  streak_weeks int not null default 0 check (streak_weeks >= 0),
  best_streak_weeks int not null default 0 check (best_streak_weeks >= 0),
  peak_rank_global int check (peak_rank_global is null or peak_rank_global > 0),
  last_score_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profile_scores_total_score_desc
  on public.profile_scores (total_score desc, updated_at asc);

create index if not exists idx_profile_scores_weekly_score_desc
  on public.profile_scores (weekly_score desc, updated_at asc);

drop trigger if exists trg_profile_scores_set_updated_at on public.profile_scores;
create trigger trg_profile_scores_set_updated_at
before update
on public.profile_scores
for each row
execute function public.set_updated_at();

alter table public.profile_scores enable row level security;

drop policy if exists "Anyone can read profile scores" on public.profile_scores;
create policy "Anyone can read profile scores"
  on public.profile_scores for select
  using (true);

-- -------------------------------------------------------------------
-- score_events (ledger table)
-- -------------------------------------------------------------------
create table if not exists public.score_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  points int not null check (points <> 0),
  reason_type text not null,
  reason_ref_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  awarded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_score_events_profile_created_at
  on public.score_events (profile_id, created_at desc);

create index if not exists idx_score_events_reason_type
  on public.score_events (reason_type);

create index if not exists idx_score_events_reason_ref_id
  on public.score_events (reason_ref_id);

create index if not exists idx_score_events_created_at
  on public.score_events (created_at desc);

alter table public.score_events enable row level security;

drop policy if exists "Users can read own score events" on public.score_events;
create policy "Users can read own score events"
  on public.score_events for select
  to authenticated
  using (auth.uid() = profile_id);

-- intentionally no INSERT/UPDATE/DELETE policies for clients
-- score_events should be written by trusted backend/service role only.

-- -------------------------------------------------------------------
-- Keep profile_scores row present for every profile
-- -------------------------------------------------------------------
create or replace function public.ensure_profile_score_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile_scores (profile_id, weekly_window_start)
  values (new.id, date_trunc('week', now())::date)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_profiles_ensure_score_row on public.profiles;
create trigger trg_profiles_ensure_score_row
after insert on public.profiles
for each row
execute function public.ensure_profile_score_row();

insert into public.profile_scores (profile_id, weekly_window_start)
select p.id, date_trunc('week', now())::date
from public.profiles p
left join public.profile_scores ps on ps.profile_id = p.id
where ps.profile_id is null;

-- -------------------------------------------------------------------
-- Apply score_events -> profile_scores
-- -------------------------------------------------------------------
create or replace function public.apply_score_event_to_profile_scores()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.profile_scores%rowtype;
  event_week date := date_trunc('week', coalesce(new.created_at, now()))::date;
  next_total int;
  next_weekly int;
  next_streak int;
  next_best int;
begin
  insert into public.profile_scores (profile_id, weekly_window_start)
  values (new.profile_id, event_week)
  on conflict (profile_id) do nothing;

  select *
    into current_row
  from public.profile_scores
  where profile_id = new.profile_id
  for update;

  if current_row.weekly_window_start = event_week then
    next_weekly := greatest(0, current_row.weekly_score + new.points);
    next_streak := current_row.streak_weeks;
  else
    if new.points > 0
       and current_row.weekly_window_start = (event_week - 7)
       and current_row.weekly_score > 0 then
      next_streak := current_row.streak_weeks + 1;
    elsif new.points > 0 then
      next_streak := 1;
    else
      next_streak := 0;
    end if;

    next_weekly := greatest(0, new.points);
  end if;

  next_total := greatest(0, current_row.total_score + new.points);
  next_best := greatest(current_row.best_streak_weeks, next_streak);

  update public.profile_scores
     set total_score = next_total,
         weekly_score = next_weekly,
         weekly_window_start = event_week,
         streak_weeks = next_streak,
         best_streak_weeks = next_best,
         last_score_event_at = coalesce(new.created_at, now()),
         updated_at = now()
   where profile_id = new.profile_id;

  return new;
end;
$$;

drop trigger if exists trg_score_events_apply on public.score_events;
create trigger trg_score_events_apply
after insert on public.score_events
for each row
execute function public.apply_score_event_to_profile_scores();

-- -------------------------------------------------------------------
-- leaderboard snapshots
-- -------------------------------------------------------------------
create table if not exists public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('global', 'country', 'technology')),
  scope_key text,
  period text not null check (period in ('weekly', 'monthly', 'all_time')),
  week_start date,
  month_start date,
  effective_at timestamptz not null default now(),
  created_by text not null default 'system',
  created_at timestamptz not null default now(),
  constraint leaderboard_snapshots_scope_key_chk check (
    (scope = 'global' and scope_key is null) or
    (scope in ('country', 'technology') and scope_key is not null)
  ),
  constraint leaderboard_snapshots_period_window_chk check (
    (period = 'weekly' and week_start is not null and month_start is null) or
    (period = 'monthly' and month_start is not null and week_start is null) or
    (period = 'all_time' and week_start is null and month_start is null)
  )
);

create index if not exists idx_leaderboard_snapshots_latest
  on public.leaderboard_snapshots (scope, scope_key, period, effective_at desc, created_at desc);

alter table public.leaderboard_snapshots enable row level security;

drop policy if exists "Anyone can read leaderboard snapshots" on public.leaderboard_snapshots;
create policy "Anyone can read leaderboard snapshots"
  on public.leaderboard_snapshots for select
  using (true);

-- -------------------------------------------------------------------
-- leaderboard entries
-- -------------------------------------------------------------------
create table if not exists public.leaderboard_entries (
  snapshot_id uuid not null references public.leaderboard_snapshots(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  rank int not null check (rank > 0),
  score int not null check (score >= 0),
  delta int not null default 0,
  percentile numeric(5,2),
  peak_rank int check (peak_rank is null or peak_rank > 0),
  tier_code text,
  streak_weeks int not null default 0 check (streak_weeks >= 0),
  projects_count int not null default 0 check (projects_count >= 0),
  created_at timestamptz not null default now(),
  primary key (snapshot_id, profile_id)
);

create unique index if not exists idx_leaderboard_entries_snapshot_rank_unique
  on public.leaderboard_entries (snapshot_id, rank);

create index if not exists idx_leaderboard_entries_profile_created
  on public.leaderboard_entries (profile_id, created_at desc);

create index if not exists idx_leaderboard_entries_snapshot_score
  on public.leaderboard_entries (snapshot_id, score desc);

alter table public.leaderboard_entries enable row level security;

drop policy if exists "Anyone can read leaderboard entries" on public.leaderboard_entries;
create policy "Anyone can read leaderboard entries"
  on public.leaderboard_entries for select
  using (true);

-- intentionally no INSERT/UPDATE/DELETE policies for clients
-- leaderboard writes should be done by trusted backend/service role only.

-- -------------------------------------------------------------------
-- helper views
-- -------------------------------------------------------------------
create or replace view public.profile_scores_with_tier as
select
  ps.profile_id,
  ps.total_score,
  ps.weekly_score,
  ps.weekly_window_start,
  ps.streak_weeks,
  ps.best_streak_weeks,
  ps.peak_rank_global,
  ps.last_score_event_at,
  ps.created_at,
  ps.updated_at,
  t.code as tier_code,
  t.name as tier_name,
  t.min_score as tier_min_score
from public.profile_scores ps
left join lateral (
  select tt.code, tt.name, tt.min_score
  from public.tiers tt
  where tt.min_score <= ps.total_score
  order by tt.min_score desc
  limit 1
) t on true;

create or replace view public.live_global_leaderboard as
select
  dense_rank() over (
    order by ps.total_score desc, ps.updated_at asc, ps.profile_id asc
  ) as rank,
  ps.profile_id,
  p.username,
  p.full_name,
  p.avatar_url,
  ps.total_score as score,
  ps.weekly_score as delta,
  ps.streak_weeks,
  ps.best_streak_weeks,
  ps.peak_rank_global,
  pst.tier_code,
  pst.tier_name,
  round(
    (
      100 - (
        percent_rank() over (
          order by ps.total_score desc, ps.updated_at asc, ps.profile_id asc
        ) * 100
      )
    )::numeric,
    2
  ) as percentile
from public.profile_scores ps
join public.profiles p on p.id = ps.profile_id
left join public.profile_scores_with_tier pst on pst.profile_id = ps.profile_id;

create or replace view public.leaderboard_latest_snapshots as
select distinct on (s.scope, coalesce(s.scope_key, ''), s.period)
  s.id,
  s.scope,
  s.scope_key,
  s.period,
  s.week_start,
  s.month_start,
  s.effective_at,
  s.created_by,
  s.created_at
from public.leaderboard_snapshots s
order by
  s.scope,
  coalesce(s.scope_key, ''),
  s.period,
  s.effective_at desc,
  s.created_at desc,
  s.id desc;

create or replace view public.leaderboard_current_entries as
select
  ls.scope,
  ls.scope_key,
  ls.period,
  ls.week_start,
  ls.month_start,
  ls.effective_at,
  e.snapshot_id,
  e.profile_id,
  e.rank,
  e.score,
  e.delta,
  e.percentile,
  e.peak_rank,
  e.tier_code,
  e.streak_weeks,
  e.projects_count,
  p.username,
  p.full_name,
  p.avatar_url
from public.leaderboard_latest_snapshots ls
join public.leaderboard_entries e on e.snapshot_id = ls.id
join public.profiles p on p.id = e.profile_id;
