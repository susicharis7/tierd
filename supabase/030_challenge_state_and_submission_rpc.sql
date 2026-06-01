-- 030_challenge_state_and_submission_rpc.sql
-- Centralizes challenge state + submission workflow in Supabase.

create or replace view public.challenge_participants_with_state as
with latest_submission as (
  select distinct on (cs.challenge_id, cs.profile_id)
    cs.challenge_id,
    cs.profile_id,
    cs.status as submission_status,
    cs.submitted_at
  from public.challenge_submissions cs
  order by cs.challenge_id, cs.profile_id, cs.updated_at desc, cs.submitted_at desc
)
select
  cp.challenge_id,
  cp.profile_id,
  p.username,
  p.full_name,
  p.avatar_url,
  cp.joined_at,
  cp.status as participant_status,
  ls.submission_status,
  case
    when c.status = 'archived' then 'cancelled'
    when now() < c.starts_at then 'upcoming'
    when now() >= c.starts_at and now() < c.ends_at then
      case
        when ls.submission_status in ('submitted', 'reviewed', 'winner') then 'submitted'
        else 'joined'
      end
    when c.status = 'ended' and coalesce(cw.winners_count, 0) > 0 then 'completed'
    when c.status = 'ended' and ls.submission_status in ('submitted', 'reviewed', 'winner') then 'under_review'
    else 'expired'
  end as user_state
from public.challenge_participants cp
join public.challenges c on c.id = cp.challenge_id
join public.profiles p on p.id = cp.profile_id
left join latest_submission ls
  on ls.challenge_id = cp.challenge_id
 and ls.profile_id = cp.profile_id
left join (
  select challenge_id, count(*)::int as winners_count
  from public.challenge_winners
  group by challenge_id
) cw on cw.challenge_id = cp.challenge_id
where cp.status = 'joined';

create or replace view public.challenge_my_state as
with me as (
  select auth.uid() as profile_id
),
latest_submission as (
  select distinct on (cs.challenge_id, cs.profile_id)
    cs.challenge_id,
    cs.profile_id,
    cs.status as submission_status
  from public.challenge_submissions cs
  join me on me.profile_id = cs.profile_id
  order by cs.challenge_id, cs.profile_id, cs.updated_at desc, cs.submitted_at desc
),
joined as (
  select cp.challenge_id, cp.profile_id
  from public.challenge_participants cp
  join me on me.profile_id = cp.profile_id
  where cp.status = 'joined'
),
winners as (
  select cw.challenge_id, cw.profile_id
  from public.challenge_winners cw
  join me on me.profile_id = cw.profile_id
),
winner_counts as (
  select challenge_id, count(*)::int as winners_count
  from public.challenge_winners
  group by challenge_id
)
select
  c.id as challenge_id,
  me.profile_id,
  (j.profile_id is not null) as has_joined,
  (ls.submission_status is not null and ls.submission_status <> 'draft') as has_submission,
  ls.submission_status,
  (w.profile_id is not null) as is_winner,
  case
    when c.status = 'archived' then 'cancelled'
    when now() < c.starts_at then 'upcoming'
    when now() >= c.starts_at and now() < c.ends_at and j.profile_id is null then 'active'
    when now() >= c.starts_at and now() < c.ends_at and j.profile_id is not null and (ls.submission_status is null or ls.submission_status = 'draft') then 'joined'
    when now() >= c.starts_at and now() < c.ends_at and ls.submission_status in ('submitted', 'reviewed', 'winner') then 'submitted'
    when c.status = 'ended' and coalesce(wc.winners_count, 0) > 0 and (ls.submission_status is not null or w.profile_id is not null) then 'completed'
    when c.status = 'ended' and ls.submission_status in ('submitted', 'reviewed', 'winner') then 'under_review'
    when c.status = 'ended' then 'expired'
    else 'cancelled'
  end as user_state,
  (c.status in ('published', 'live') and c.starts_at <= now() and c.ends_at > now() and j.profile_id is null) as can_join,
  (c.status in ('published', 'live') and c.starts_at <= now() and c.ends_at > now() and j.profile_id is not null) as can_submit,
  (c.status in ('published', 'live') and c.starts_at <= now() and c.ends_at > now() and j.profile_id is not null) as can_update_submission
from public.challenges c
cross join me
left join joined j on j.challenge_id = c.id
left join latest_submission ls on ls.challenge_id = c.id and ls.profile_id = me.profile_id
left join winners w on w.challenge_id = c.id and w.profile_id = me.profile_id
left join winner_counts wc on wc.challenge_id = c.id;

create or replace function public.validate_challenge_submission_payload(
  p_repo_url text,
  p_demo_url text,
  p_description text,
  p_test_command text,
  p_demo_video_url text
)
returns void
language plpgsql
as $$
begin
  if p_repo_url is null or btrim(p_repo_url) = '' then
    raise exception 'Repository URL is required.';
  end if;

  if p_repo_url !~* '^https:\/\/github\.com\/.+' then
    raise exception 'Repository URL must start with https://github.com/.';
  end if;

  if p_demo_url is not null and btrim(p_demo_url) <> '' and p_demo_url !~* '^https?:\/\/.+' then
    raise exception 'Live demo URL must be a valid URL.';
  end if;

  if p_demo_video_url is not null and btrim(p_demo_video_url) <> '' and p_demo_video_url !~* '^https?:\/\/.+' then
    raise exception 'Demo video URL must be a valid URL.';
  end if;

  if p_description is null or length(btrim(p_description)) < 50 then
    raise exception 'Description must be at least 50 characters.';
  end if;

  if p_test_command is null or btrim(p_test_command) = '' then
    raise exception 'Test command is required.';
  end if;
end;
$$;

create or replace function public.submit_challenge_submission(
  p_challenge_id uuid,
  p_repo_url text,
  p_demo_url text default null,
  p_description text default null,
  p_test_command text default null,
  p_demo_video_url text default null
)
returns public.challenge_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := auth.uid();
  v_challenge public.challenges%rowtype;
  v_existing_id uuid;
  v_row public.challenge_submissions%rowtype;
begin
  if v_profile_id is null then
    raise exception 'Authentication required.';
  end if;

  select *
    into v_challenge
  from public.challenges c
  where c.id = p_challenge_id;

  if v_challenge.id is null then
    raise exception 'Challenge not found.';
  end if;

  if v_challenge.status not in ('published', 'live') then
    raise exception 'Challenge is not active.';
  end if;

  if now() < v_challenge.starts_at then
    raise exception 'Challenge has not started yet.';
  end if;

  if now() >= v_challenge.ends_at then
    raise exception 'Submission is disabled after deadline.';
  end if;

  if not exists (
    select 1
    from public.challenge_participants cp
    where cp.challenge_id = p_challenge_id
      and cp.profile_id = v_profile_id
      and cp.status = 'joined'
  ) then
    raise exception 'Join challenge before submitting.';
  end if;

  perform public.validate_challenge_submission_payload(
    p_repo_url,
    p_demo_url,
    p_description,
    p_test_command,
    p_demo_video_url
  );

  select cs.id
    into v_existing_id
  from public.challenge_submissions cs
  where cs.challenge_id = p_challenge_id
    and cs.profile_id = v_profile_id
  order by cs.updated_at desc, cs.submitted_at desc
  limit 1;

  if v_existing_id is not null then
    update public.challenge_submissions
       set repo_url = btrim(p_repo_url),
           demo_url = nullif(btrim(coalesce(p_demo_url, '')), ''),
           description = btrim(p_description),
           status = 'submitted',
           metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
             'test_command', btrim(p_test_command),
             'demo_video_url', nullif(btrim(coalesce(p_demo_video_url, '')), '')
           ),
           submitted_at = now(),
           updated_at = now()
     where id = v_existing_id
     returning * into v_row;
  else
    insert into public.challenge_submissions (
      challenge_id,
      profile_id,
      title,
      description,
      repo_url,
      demo_url,
      status,
      metadata,
      submitted_at
    )
    values (
      p_challenge_id,
      v_profile_id,
      'Challenge submission',
      btrim(p_description),
      btrim(p_repo_url),
      nullif(btrim(coalesce(p_demo_url, '')), ''),
      'submitted',
      jsonb_build_object(
        'test_command', btrim(p_test_command),
        'demo_video_url', nullif(btrim(coalesce(p_demo_video_url, '')), '')
      ),
      now()
    )
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

