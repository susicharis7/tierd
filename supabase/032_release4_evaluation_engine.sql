-- 032_release4_evaluation_engine.sql
-- Release 4: backend/supabase-driven evaluation runs + readiness + signal snapshot.

create extension if not exists pgcrypto;

create table if not exists public.evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  progress_pct int not null default 0
    check (progress_pct >= 0 and progress_pct <= 100),
  stage_key text not null default 'queued',
  stage_label text not null default 'Queued',
  readiness jsonb not null default '{}'::jsonb,
  signals jsonb not null default '{}'::jsonb,
  deterministic_breakdown jsonb not null default '{}'::jsonb,
  ai_feedback jsonb not null default '{}'::jsonb,
  ai_adjustment int not null default 0,
  final_delta int not null default 0,
  score_before int,
  score_after int,
  tier_before text,
  tier_after text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evaluation_runs_time_window_chk check (
    completed_at is null or started_at is null or completed_at >= started_at
  )
);

create index if not exists idx_evaluation_runs_profile_created
  on public.evaluation_runs (profile_id, created_at desc);

create index if not exists idx_evaluation_runs_status_created
  on public.evaluation_runs (status, created_at desc);

create unique index if not exists idx_evaluation_runs_single_active_per_profile
  on public.evaluation_runs (profile_id)
  where status in ('queued', 'running');

drop trigger if exists trg_evaluation_runs_set_updated_at on public.evaluation_runs;
create trigger trg_evaluation_runs_set_updated_at
before update
on public.evaluation_runs
for each row
execute function public.set_updated_at();

alter table public.evaluation_runs enable row level security;

drop policy if exists "Users can read own evaluation runs" on public.evaluation_runs;
create policy "Users can read own evaluation runs"
  on public.evaluation_runs for select
  to authenticated
  using (auth.uid() = profile_id);

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

create or replace function public.get_profile_evaluation_signal_snapshot(p_profile_id uuid)
returns jsonb
language plpgsql
stable
as $$
declare
  v_metrics public.profile_public_metrics%rowtype;
  v_total_contributions int := 0;
  v_active_days int := 0;
  v_projects_total int := 0;
  v_projects_verified int := 0;
  v_projects_live int := 0;
  v_has_github_link boolean := false;
  v_has_linkedin_link boolean := false;
  v_has_email_2fa boolean := false;
begin
  if p_profile_id is null then
    return '{}'::jsonb;
  end if;

  select *
    into v_metrics
  from public.profile_public_metrics ppm
  where ppm.profile_id = p_profile_id;

  select
    coalesce(sum(g.contributions), 0)::int,
    coalesce(count(*) filter (where g.contributions > 0), 0)::int
    into v_total_contributions, v_active_days
  from public.profile_github_contributions_52w g
  where g.profile_id = p_profile_id;

  select
    count(*)::int,
    count(*) filter (where pr.is_verified)::int,
    count(*) filter (where pr.live_url is not null and btrim(pr.live_url) <> '')::int
    into v_projects_total, v_projects_verified, v_projects_live
  from public.projects pr
  where pr.owner_id = p_profile_id;

  select exists (
    select 1
    from public.profile_external_accounts pea
    where pea.profile_id = p_profile_id
      and pea.provider = 'github'
  )
  into v_has_github_link;

  select exists (
    select 1
    from public.profile_external_accounts pea
    where pea.profile_id = p_profile_id
      and pea.provider = 'linkedin'
  )
  into v_has_linkedin_link;

  select coalesce(p.email_2fa_enabled, false)
    into v_has_email_2fa
  from public.profiles p
  where p.id = p_profile_id;

  return jsonb_build_object(
    'profileId', p_profile_id,
    'generatedAt', now(),
    'identity', jsonb_build_object(
      'hasGithubLinked', v_has_github_link,
      'hasLinkedinLinked', v_has_linkedin_link,
      'hasEmail2faEnabled', v_has_email_2fa,
      'isProfileVerified', coalesce(v_metrics.is_verified, false)
    ),
    'github', jsonb_build_object(
      'totalContributions52w', v_total_contributions,
      'activeDays52w', v_active_days
    ),
    'projects', jsonb_build_object(
      'total', v_projects_total,
      'verified', v_projects_verified,
      'withLiveUrl', v_projects_live
    ),
    'activity', jsonb_build_object(
      'weeklyScore', coalesce(v_metrics.weekly_score, 0),
      'postsLast30d', coalesce(v_metrics.posts_last_30d, 0),
      'streakWeeks', coalesce(v_metrics.streak_weeks, 0),
      'challengeSubmissions', coalesce(v_metrics.challenge_submissions_count, 0),
      'challengeWins', coalesce(v_metrics.challenge_wins_count, 0),
      'followers', coalesce(v_metrics.followers_count, 0)
    ),
    'ranking', jsonb_build_object(
      'currentScore', coalesce(v_metrics.total_score, 0),
      'tierCode', coalesce(v_metrics.tier_code, 'unranked'),
      'tierName', coalesce(v_metrics.tier_name, 'Unranked')
    )
  );
end;
$$;
