-- 034_fix_evaluation_activity_sync_readiness.sql
-- Treat synced zero-contribution GitHub data as valid activity signal for evaluation readiness.

create or replace function public.get_profile_evaluation_readiness(p_profile_id uuid)
returns jsonb
language plpgsql
stable
as $$
declare
  v_username text;
  v_profile_href text := '/profile/me';
  v_has_github_link boolean := false;
  v_has_project boolean := false;
  v_has_email_2fa boolean := false;
  v_has_activity boolean := false;
  v_completed_required int := 0;
  v_can_evaluate boolean := false;
begin
  if p_profile_id is null then
    return jsonb_build_object(
      'canEvaluate', false,
      'completedCount', 0,
      'totalRequired', 4,
      'steps', '[]'::jsonb
    );
  end if;

  select p.username
    into v_username
  from public.profiles p
  where p.id = p_profile_id;

  if v_username is not null and btrim(v_username) <> '' then
    v_profile_href := '/profile/' || lower(v_username);
  end if;

  select exists (
    select 1
    from public.profile_external_accounts pea
    where pea.profile_id = p_profile_id
      and pea.provider = 'github'
  )
  into v_has_github_link;

  select exists (
    select 1
    from public.projects pr
    where pr.owner_id = p_profile_id
  )
  into v_has_project;

  select coalesce(p.email_2fa_enabled, false)
    into v_has_email_2fa
  from public.profiles p
  where p.id = p_profile_id;

  select (
    exists (
      select 1
      from public.profile_external_accounts pea
      where pea.profile_id = p_profile_id
        and pea.provider = 'github'
        and pea.last_synced_at is not null
    )
    or exists (
      select 1
      from public.github_daily_contributions g
      where g.profile_id = p_profile_id
        and g.day >= (current_date - interval '364 days')::date
    )
    or exists (
      select 1
      from public.profile_public_metrics ppm
      where ppm.profile_id = p_profile_id
        and (
          ppm.posts_last_30d > 0
          or ppm.challenge_submissions_count > 0
          or ppm.weekly_score > 0
        )
    )
  )
  into v_has_activity;

  v_completed_required := (
    case when v_has_github_link then 1 else 0 end +
    case when v_has_project then 1 else 0 end +
    case when v_has_email_2fa then 1 else 0 end +
    case when v_has_activity then 1 else 0 end
  );

  v_can_evaluate := (v_completed_required = 4);

  return jsonb_build_object(
    'canEvaluate', v_can_evaluate,
    'completedCount', v_completed_required,
    'totalRequired', 4,
    'steps',
      jsonb_build_array(
        jsonb_build_object(
          'key', 'connect_github',
          'title', 'Connect GitHub',
          'description', 'Link your GitHub account to import repo and contribution signals.',
          'required', true,
          'done', v_has_github_link,
          'actionLabel', 'open profile',
          'actionHref', v_profile_href
        ),
        jsonb_build_object(
          'key', 'add_project',
          'title', 'Add at least 1 project',
          'description', 'Submit at least one project with repo/live proof.',
          'required', true,
          'done', v_has_project,
          'actionLabel', 'open profile',
          'actionHref', v_profile_href
        ),
        jsonb_build_object(
          'key', 'verify_identity',
          'title', 'Enable Email 2FA',
          'description', 'Activate email 2FA to verify account ownership.',
          'required', true,
          'done', v_has_email_2fa,
          'actionLabel', 'open security',
          'actionHref', '/security'
        ),
        jsonb_build_object(
          'key', 'analyze_activity',
          'title', 'Sync activity signals',
          'description', 'Sync GitHub/activity data. Zero recent contributions is still a valid inactivity signal.',
          'required', true,
          'done', v_has_activity,
          'actionLabel', 'open profile',
          'actionHref', v_profile_href
        )
      )
  );
end;
$$;

