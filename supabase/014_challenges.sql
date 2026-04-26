-- 014_challenges.sql
-- Challenges lifecycle + participants + submissions + winners (+ score hook)

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

create or replace function public.normalize_slug_text()
returns trigger
language plpgsql
as $$
begin
  if new.slug is not null then
    new.slug := lower(trim(new.slug));
    new.slug := regexp_replace(new.slug, '[^a-z0-9]+', '-', 'g');
    new.slug := regexp_replace(new.slug, '(^-+|-+$)', '', 'g');
    new.slug := nullif(new.slug, '');
  end if;

  return new;
end;
$$;

-- -------------------------------------------------------------------
-- challenges
-- -------------------------------------------------------------------
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text,
  title text not null,
  description text not null,
  rules text,
  category text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'all_levels')),
  scope text not null check (scope in ('global', 'country')),
  scope_key text,
  status text not null default 'draft' check (status in ('draft', 'published', 'live', 'ended', 'archived')),
  is_featured boolean not null default false,
  reward_points int not null default 0 check (reward_points >= 0),
  max_participants int check (max_participants is null or max_participants > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint challenges_scope_key_chk check (
    (scope = 'global' and scope_key is null) or
    (scope = 'country' and scope_key is not null)
  ),
  constraint challenges_time_window_chk check (ends_at > starts_at)
);

create unique index if not exists idx_challenges_slug_unique
  on public.challenges (slug)
  where slug is not null;

create index if not exists idx_challenges_status_window
  on public.challenges (status, starts_at, ends_at);

create index if not exists idx_challenges_featured_window
  on public.challenges (is_featured desc, starts_at desc);

create index if not exists idx_challenges_category_difficulty
  on public.challenges (category, difficulty);

create index if not exists idx_challenges_scope
  on public.challenges (scope, scope_key);

drop trigger if exists trg_challenges_normalize_slug on public.challenges;
create trigger trg_challenges_normalize_slug
before insert or update of slug
on public.challenges
for each row
execute function public.normalize_slug_text();

drop trigger if exists trg_challenges_set_updated_at on public.challenges;
create trigger trg_challenges_set_updated_at
before update
on public.challenges
for each row
execute function public.set_updated_at();

alter table public.challenges enable row level security;

drop policy if exists "Anyone can read challenges" on public.challenges;
create policy "Anyone can read challenges"
  on public.challenges for select
  using (true);

-- No client write policies: challenge lifecycle is backend/service-managed.

-- -------------------------------------------------------------------
-- challenge_participants
-- -------------------------------------------------------------------
create table if not exists public.challenge_participants (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'joined' check (status in ('joined', 'withdrawn', 'disqualified')),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  primary key (challenge_id, profile_id)
);

create index if not exists idx_challenge_participants_profile_joined
  on public.challenge_participants (profile_id, joined_at desc);

create index if not exists idx_challenge_participants_challenge_status
  on public.challenge_participants (challenge_id, status, joined_at desc);

drop trigger if exists trg_challenge_participants_set_updated_at on public.challenge_participants;
create trigger trg_challenge_participants_set_updated_at
before update
on public.challenge_participants
for each row
execute function public.set_updated_at();

alter table public.challenge_participants enable row level security;

drop policy if exists "Anyone can read challenge participants" on public.challenge_participants;
create policy "Anyone can read challenge participants"
  on public.challenge_participants for select
  using (true);

drop policy if exists "Users can join active challenges" on public.challenge_participants;
create policy "Users can join active challenges"
  on public.challenge_participants for insert
  to authenticated
  with check (
    auth.uid() = profile_id
    and status = 'joined'
    and exists (
      select 1
      from public.challenges c
      where c.id = challenge_id
        and c.status in ('published', 'live')
        and c.starts_at <= now()
        and c.ends_at > now()
    )
  );

drop policy if exists "Users can update own challenge participation" on public.challenge_participants;
create policy "Users can update own challenge participation"
  on public.challenge_participants for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (
    auth.uid() = profile_id
    and status in ('joined', 'withdrawn')
  );

drop policy if exists "Users can delete own challenge participation" on public.challenge_participants;
create policy "Users can delete own challenge participation"
  on public.challenge_participants for delete
  to authenticated
  using (auth.uid() = profile_id);

-- -------------------------------------------------------------------
-- challenge_submissions
-- -------------------------------------------------------------------
create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  description text,
  repo_url text,
  demo_url text,
  submission_url text,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'reviewed', 'rejected', 'winner')),
  score numeric(6,2) check (score is null or score >= 0),
  rank int check (rank is null or rank > 0),
  feedback text,
  metadata jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_challenge_submissions_challenge_submitted
  on public.challenge_submissions (challenge_id, submitted_at desc);

create index if not exists idx_challenge_submissions_profile_submitted
  on public.challenge_submissions (profile_id, submitted_at desc);

create index if not exists idx_challenge_submissions_challenge_score
  on public.challenge_submissions (challenge_id, score desc nulls last);

drop trigger if exists trg_challenge_submissions_set_updated_at on public.challenge_submissions;
create trigger trg_challenge_submissions_set_updated_at
before update
on public.challenge_submissions
for each row
execute function public.set_updated_at();

alter table public.challenge_submissions enable row level security;

drop policy if exists "Anyone can read challenge submissions" on public.challenge_submissions;
create policy "Anyone can read challenge submissions"
  on public.challenge_submissions for select
  using (true);

drop policy if exists "Users can submit own challenge work" on public.challenge_submissions;
create policy "Users can submit own challenge work"
  on public.challenge_submissions for insert
  to authenticated
  with check (
    auth.uid() = profile_id
    and status in ('draft', 'submitted')
    and score is null
    and rank is null
    and reviewed_at is null
    and reviewed_by is null
    and exists (
      select 1
      from public.challenge_participants cp
      where cp.challenge_id = challenge_id
        and cp.profile_id = profile_id
        and cp.status = 'joined'
    )
    and exists (
      select 1
      from public.challenges c
      where c.id = challenge_id
        and c.status in ('published', 'live')
        and c.starts_at <= now()
        and c.ends_at > now()
    )
  );

drop policy if exists "Users can update own unreviewed submissions" on public.challenge_submissions;
create policy "Users can update own unreviewed submissions"
  on public.challenge_submissions for update
  to authenticated
  using (
    auth.uid() = profile_id
    and reviewed_at is null
    and reviewed_by is null
    and score is null
    and rank is null
  )
  with check (
    auth.uid() = profile_id
    and status in ('draft', 'submitted')
    and reviewed_at is null
    and reviewed_by is null
    and score is null
    and rank is null
  );

drop policy if exists "Users can delete own unreviewed submissions" on public.challenge_submissions;
create policy "Users can delete own unreviewed submissions"
  on public.challenge_submissions for delete
  to authenticated
  using (
    auth.uid() = profile_id
    and reviewed_at is null
    and reviewed_by is null
    and score is null
    and rank is null
  );

-- -------------------------------------------------------------------
-- challenge_winners
-- -------------------------------------------------------------------
create table if not exists public.challenge_winners (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid references public.challenge_submissions(id) on delete set null,
  position int not null check (position > 0),
  awarded_points int not null default 0 check (awarded_points >= 0),
  badge text,
  summary text,
  awarded_at timestamptz not null default now(),
  created_by text not null default 'system',
  created_at timestamptz not null default now(),
  unique (challenge_id, position),
  unique (challenge_id, profile_id)
);

create index if not exists idx_challenge_winners_awarded_at
  on public.challenge_winners (awarded_at desc);

create index if not exists idx_challenge_winners_profile_awarded
  on public.challenge_winners (profile_id, awarded_at desc);

alter table public.challenge_winners enable row level security;

drop policy if exists "Anyone can read challenge winners" on public.challenge_winners;
create policy "Anyone can read challenge winners"
  on public.challenge_winners for select
  using (true);

-- No client write policies: winners are backend/service-managed.

-- -------------------------------------------------------------------
-- winner -> score_events hook
-- -------------------------------------------------------------------
create or replace function public.award_points_for_challenge_winner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.awarded_points > 0 then
    insert into public.score_events (
      profile_id,
      points,
      reason_type,
      reason_ref_id,
      metadata,
      created_at
    )
    values (
      new.profile_id,
      new.awarded_points,
      'challenge_win',
      new.challenge_id,
      jsonb_build_object(
        'challenge_winner_id', new.id,
        'challenge_id', new.challenge_id,
        'submission_id', new.submission_id,
        'position', new.position,
        'badge', new.badge
      ),
      coalesce(new.awarded_at, now())
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_challenge_winners_award_points on public.challenge_winners;
create trigger trg_challenge_winners_award_points
after insert
on public.challenge_winners
for each row
execute function public.award_points_for_challenge_winner();

-- -------------------------------------------------------------------
-- helper views
-- -------------------------------------------------------------------
create or replace view public.challenge_public_overview as
select
  c.id,
  c.slug,
  c.title,
  c.description,
  c.rules,
  c.category,
  c.difficulty,
  c.scope,
  c.scope_key,
  c.status,
  c.is_featured,
  c.reward_points,
  c.max_participants,
  c.starts_at,
  c.ends_at,
  c.metadata,
  c.created_by,
  c.created_at,
  c.updated_at,
  coalesce(cp.participants_count, 0) as participants_count,
  coalesce(cs.submissions_count, 0) as submissions_count,
  coalesce(cw.winners_count, 0) as winners_count,
  case
    when now() < c.starts_at then 'upcoming'
    when now() >= c.starts_at and now() < c.ends_at then 'active'
    else 'past'
  end as phase
from public.challenges c
left join (
  select challenge_id, count(*)::int as participants_count
  from public.challenge_participants
  where status = 'joined'
  group by challenge_id
) cp on cp.challenge_id = c.id
left join (
  select challenge_id, count(*)::int as submissions_count
  from public.challenge_submissions
  group by challenge_id
) cs on cs.challenge_id = c.id
left join (
  select challenge_id, count(*)::int as winners_count
  from public.challenge_winners
  group by challenge_id
) cw on cw.challenge_id = c.id;

create or replace view public.challenge_recent_winners as
select
  w.id as winner_id,
  w.challenge_id,
  c.slug as challenge_slug,
  c.title as challenge_title,
  w.profile_id,
  p.username,
  p.full_name,
  p.avatar_url,
  w.position,
  w.awarded_points,
  w.badge,
  w.summary,
  w.awarded_at
from public.challenge_winners w
join public.challenges c on c.id = w.challenge_id
join public.profiles p on p.id = w.profile_id
order by w.awarded_at desc, w.created_at desc;

create or replace view public.challenge_top_challengers as
with agg as (
  select
    w.profile_id,
    count(*)::int as wins_count,
    sum(w.awarded_points)::int as total_awarded_points,
    min(w.position)::int as best_position,
    max(w.awarded_at) as last_win_at
  from public.challenge_winners w
  group by w.profile_id
)
select
  dense_rank() over (
    order by
      a.wins_count desc,
      a.total_awarded_points desc,
      a.best_position asc,
      a.last_win_at desc,
      a.profile_id asc
  ) as challenger_rank,
  a.profile_id,
  p.username,
  p.full_name,
  p.avatar_url,
  a.wins_count,
  a.total_awarded_points,
  a.best_position,
  a.last_win_at
from agg a
join public.profiles p on p.id = a.profile_id;
