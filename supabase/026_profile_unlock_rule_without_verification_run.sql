-- 026_profile_unlock_rule_without_verification_run.sql
-- Unlock rule:
-- - email 2FA enabled (verified badge prerequisite)
-- - at least one submitted project
-- - at least one synced OAuth account (GitHub or LinkedIn)
--
-- Note: verification_runs completion is no longer required for unlock.

create or replace function public.refresh_profile_verification_state(p_profile_id uuid)
returns void
language plpgsql
as $$
declare
  v_has_synced_oauth boolean := false;
  v_has_submitted_project boolean := false;
  v_has_email_2fa_enabled boolean := false;
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
  )
  into v_has_synced_oauth;

  select exists (
    select 1
    from public.projects p
    where p.owner_id = p_profile_id
  )
  into v_has_submitted_project;

  select coalesce(p.email_2fa_enabled, false)
    into v_has_email_2fa_enabled
  from public.profiles p
  where p.id = p_profile_id;

  v_is_unlocked := (
    v_has_synced_oauth
    and v_has_submitted_project
    and v_has_email_2fa_enabled
  );

  update public.profiles p
     set is_verified = v_is_unlocked
   where p.id = p_profile_id
     and p.is_verified is distinct from v_is_unlocked;
end;
$$;

-- Backfill all profiles after rule change.
do $$
declare
  r record;
begin
  for r in select p.id from public.profiles p loop
    perform public.refresh_profile_verification_state(r.id);
  end loop;
end;
$$;
