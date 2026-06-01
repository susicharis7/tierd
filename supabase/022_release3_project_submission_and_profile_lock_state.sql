-- 022_release3_project_submission_and_profile_lock_state.sql
-- Project submission auto-verification + locked/unlocked profile state refresh

create extension if not exists pgcrypto;

create or replace function public.extract_github_owner_from_url(p_repo_url text)
returns text
language plpgsql
immutable
as $$
declare
  v_url text := lower(trim(coalesce(p_repo_url, '')));
  v_owner text;
begin
  if v_url = '' then
    return null;
  end if;

  select (regexp_match(v_url, '^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\?#]+)'))[1]
    into v_owner;

  if v_owner is null then
    select (regexp_match(v_url, '^git@github\.com:([^\/\s]+)'))[1]
      into v_owner;
  end if;

  if v_owner is null then
    return null;
  end if;

  v_owner := lower(trim(v_owner));
  v_owner := regexp_replace(v_owner, '^@+', '');
  return nullif(v_owner, '');
end;
$$;

create or replace function public.compute_project_verified_from_repo(
  p_owner_id uuid,
  p_repo_url text
)
returns boolean
language sql
stable
as $$
  with repo_owner as (
    select public.extract_github_owner_from_url(p_repo_url) as owner
  ), github_accounts as (
    select
      lower(regexp_replace(trim(coalesce(pea.account_handle, '')), '^@+', '')) as handle,
      public.extract_github_owner_from_url(pea.account_url) as url_owner
    from public.profile_external_accounts pea
    where pea.profile_id = p_owner_id
      and pea.provider = 'github'
      and pea.is_verified = true
  )
  select exists (
    select 1
    from repo_owner ro
    join github_accounts ga
      on (ga.handle = ro.owner or ga.url_owner = ro.owner)
    where ro.owner is not null
  );
$$;

create or replace function public.trg_projects_auto_verify()
returns trigger
language plpgsql
as $$
begin
  new.is_verified := public.compute_project_verified_from_repo(
    new.owner_id,
    new.repo_url
  );
  return new;
end;
$$;

drop trigger if exists trg_projects_auto_verify on public.projects;
create trigger trg_projects_auto_verify
before insert or update of owner_id, repo_url
on public.projects
for each row
execute function public.trg_projects_auto_verify();

create or replace function public.refresh_profile_verification_state(p_profile_id uuid)
returns void
language plpgsql
as $$
declare
  v_has_verified_oauth boolean := false;
  v_has_submitted_project boolean := false;
  v_has_completed_run boolean := false;
  v_is_unlocked boolean := false;
begin
  if p_profile_id is null then
    return;
  end if;

  select exists (
    select 1
    from public.profile_external_accounts pea
    where pea.profile_id = p_profile_id
      and pea.provider in ('github', 'linkedin')
      and pea.is_verified = true
  )
  into v_has_verified_oauth;

  select exists (
    select 1
    from public.projects p
    where p.owner_id = p_profile_id
  )
  into v_has_submitted_project;

  select exists (
    select 1
    from public.verification_runs vr
    where vr.profile_id = p_profile_id
      and vr.status = 'completed'
  )
  into v_has_completed_run;

  v_is_unlocked := (
    v_has_verified_oauth
    and v_has_submitted_project
    and v_has_completed_run
  );

  update public.profiles p
     set is_verified = v_is_unlocked
   where p.id = p_profile_id
     and p.is_verified is distinct from v_is_unlocked;
end;
$$;

create or replace function public.trg_projects_refresh_profile_verification_state()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_profile_verification_state(old.owner_id);
    return old;
  end if;

  perform public.refresh_profile_verification_state(new.owner_id);

  if tg_op = 'UPDATE' and old.owner_id is distinct from new.owner_id then
    perform public.refresh_profile_verification_state(old.owner_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_projects_refresh_profile_verification_state on public.projects;
create trigger trg_projects_refresh_profile_verification_state
after insert or update or delete
on public.projects
for each row
execute function public.trg_projects_refresh_profile_verification_state();

create or replace function public.trg_external_accounts_refresh_profile_verification_state()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    if old.provider in ('github', 'linkedin') then
      perform public.refresh_profile_verification_state(old.profile_id);
    end if;
    return old;
  end if;

  if new.provider in ('github', 'linkedin') then
    perform public.refresh_profile_verification_state(new.profile_id);
  end if;

  if tg_op = 'UPDATE'
     and old.profile_id is distinct from new.profile_id
     and old.provider in ('github', 'linkedin') then
    perform public.refresh_profile_verification_state(old.profile_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_external_accounts_refresh_profile_verification_state
  on public.profile_external_accounts;
create trigger trg_external_accounts_refresh_profile_verification_state
after insert or update or delete
on public.profile_external_accounts
for each row
execute function public.trg_external_accounts_refresh_profile_verification_state();

create or replace function public.trg_verification_runs_refresh_profile_verification_state()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_profile_verification_state(old.profile_id);
    return old;
  end if;

  perform public.refresh_profile_verification_state(new.profile_id);

  if tg_op = 'UPDATE' and old.profile_id is distinct from new.profile_id then
    perform public.refresh_profile_verification_state(old.profile_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_verification_runs_refresh_profile_verification_state
  on public.verification_runs;
create trigger trg_verification_runs_refresh_profile_verification_state
after insert or update or delete
on public.verification_runs
for each row
execute function public.trg_verification_runs_refresh_profile_verification_state();

-- Backfill project verification based on connected GitHub handles.
update public.projects p
   set is_verified = public.compute_project_verified_from_repo(p.owner_id, p.repo_url)
 where p.is_verified is distinct from public.compute_project_verified_from_repo(p.owner_id, p.repo_url);

-- Backfill profile lock/unlock state for all existing profiles.
do $$
declare
  r record;
begin
  for r in select p.id from public.profiles p loop
    perform public.refresh_profile_verification_state(r.id);
  end loop;
end;
$$;
