-- 027_challenge_participation_points.sql
-- Awards challenge completion points when a challenge is ended.
-- Rule: first place gets +30, all other joined participants get +10.

create or replace function public.award_challenge_participation_points(
  p_challenge_id uuid,
  p_awarded_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first_profile_id uuid;
begin
  if p_challenge_id is null then
    return;
  end if;

  select cw.profile_id
    into v_first_profile_id
  from public.challenge_winners cw
  where cw.challenge_id = p_challenge_id
  order by cw.position asc
  limit 1;

  if v_first_profile_id is null then
    select cs.profile_id
      into v_first_profile_id
    from public.challenge_submissions cs
    where cs.challenge_id = p_challenge_id
      and cs.status in ('submitted', 'reviewed', 'winner')
    order by cs.rank asc nulls last, cs.score desc nulls last, cs.submitted_at asc
    limit 1;
  end if;

  if v_first_profile_id is null then
    select cp.profile_id
      into v_first_profile_id
    from public.challenge_participants cp
    where cp.challenge_id = p_challenge_id
      and cp.status = 'joined'
    order by cp.joined_at asc
    limit 1;
  end if;

  insert into public.score_events (
    profile_id,
    points,
    reason_type,
    reason_ref_id,
    metadata,
    created_at
  )
  select
    cp.profile_id,
    case
      when cp.profile_id = v_first_profile_id then 30
      else 10
    end as points,
    'challenge_participation',
    p_challenge_id,
    jsonb_build_object(
      'challenge_id', p_challenge_id,
      'first_profile_id', v_first_profile_id,
      'rule', 'first_30_others_10'
    ),
    coalesce(p_awarded_at, now())
  from public.challenge_participants cp
  where cp.challenge_id = p_challenge_id
    and cp.status = 'joined'
    and not exists (
      select 1
      from public.score_events se
      where se.profile_id = cp.profile_id
        and se.reason_type = 'challenge_participation'
        and se.reason_ref_id = p_challenge_id
    )
    and (
      cp.profile_id <> v_first_profile_id
      or not exists (
        select 1
        from public.score_events se2
        where se2.profile_id = cp.profile_id
          and se2.reason_type = 'challenge_win'
          and se2.reason_ref_id = p_challenge_id
      )
    );
end;
$$;

create or replace function public.trg_challenges_award_participation_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and old.status is distinct from new.status
     and new.status = 'ended' then
    perform public.award_challenge_participation_points(
      new.id,
      coalesce(new.ends_at, now())
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_challenges_award_participation_points
  on public.challenges;
create trigger trg_challenges_award_participation_points
after update of status
on public.challenges
for each row
execute function public.trg_challenges_award_participation_points();

-- Backfill already-ended challenges, idempotent because of NOT EXISTS guard.
do $$
declare
  r record;
begin
  for r in
    select c.id, c.ends_at
    from public.challenges c
    where c.status = 'ended'
  loop
    perform public.award_challenge_participation_points(r.id, r.ends_at);
  end loop;
end;
$$;

