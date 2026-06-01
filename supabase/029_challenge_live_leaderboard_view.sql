-- 029_challenge_live_leaderboard_view.sql
-- Central challenge leaderboard projection in DB (no frontend ranking logic).

create or replace view public.challenge_live_leaderboard as
with winner_rows as (
  select
    cw.challenge_id,
    cw.profile_id,
    cw.position,
    null::numeric as score,
    cw.awarded_points,
    'winners'::text as source
  from public.challenge_winners cw
),
submission_rows as (
  select
    cs.challenge_id,
    cs.profile_id,
    coalesce(
      cs.rank,
      row_number() over (
        partition by cs.challenge_id
        order by cs.score desc nulls last, cs.submitted_at asc
      )
    )::int as position,
    cs.score,
    case
      when coalesce(
        cs.rank,
        row_number() over (
          partition by cs.challenge_id
          order by cs.score desc nulls last, cs.submitted_at asc
        )
      ) = 1 then 30
      else 10
    end::int as awarded_points,
    'submissions'::text as source
  from public.challenge_submissions cs
  where cs.status in ('submitted', 'reviewed', 'winner')
),
participant_rows as (
  select
    cp.challenge_id,
    cp.profile_id,
    row_number() over (
      partition by cp.challenge_id
      order by cp.joined_at asc
    )::int as position,
    null::numeric as score,
    case
      when row_number() over (
        partition by cp.challenge_id
        order by cp.joined_at asc
      ) = 1 then 30
      else 10
    end::int as awarded_points,
    'participants'::text as source
  from public.challenge_participants cp
  where cp.status = 'joined'
),
resolved as (
  select * from winner_rows
  union all
  select sr.*
  from submission_rows sr
  where not exists (
    select 1 from winner_rows wr where wr.challenge_id = sr.challenge_id
  )
  union all
  select pr.*
  from participant_rows pr
  where not exists (
    select 1 from winner_rows wr where wr.challenge_id = pr.challenge_id
  )
    and not exists (
      select 1 from submission_rows sr where sr.challenge_id = pr.challenge_id
    )
)
select
  r.challenge_id,
  r.profile_id,
  p.username,
  p.full_name,
  p.avatar_url,
  r.position,
  r.score,
  r.awarded_points,
  r.source
from resolved r
join public.profiles p on p.id = r.profile_id;

