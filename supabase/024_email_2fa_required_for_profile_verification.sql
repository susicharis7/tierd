-- 024_email_2fa_required_for_profile_verification.sql
-- A profile is unlocked only when OAuth + projects + verification run + email 2FA are complete.

create or replace function public.refresh_profile_verification_state(p_profile_id uuid)
returns void
language plpgsql
as $$
declare
  v_has_verified_oauth boolean := false;
  v_has_submitted_project boolean := false;
  v_has_completed_run boolean := false;
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

  select p.email_2fa_enabled
    into v_has_email_2fa_enabled
  from public.profiles p
  where p.id = p_profile_id;

  v_is_unlocked := (
    v_has_verified_oauth
    and v_has_submitted_project
    and v_has_completed_run
    and coalesce(v_has_email_2fa_enabled, false)
  );

  update public.profiles p
     set is_verified = v_is_unlocked
   where p.id = p_profile_id
     and p.is_verified is distinct from v_is_unlocked;
end;
$$;

create or replace function public.trg_profiles_refresh_profile_verification_state()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_profile_verification_state(old.id);
    return old;
  end if;

  perform public.refresh_profile_verification_state(new.id);
  return new;
end;
$$;

drop trigger if exists trg_profiles_refresh_profile_verification_state on public.profiles;
create trigger trg_profiles_refresh_profile_verification_state
after update of email_2fa_enabled on public.profiles
for each row
execute function public.trg_profiles_refresh_profile_verification_state();

-- Backfill profile lock/unlock state to include 2FA gate.
do $$
declare
  r record;
begin
  for r in select p.id from public.profiles p loop
    perform public.refresh_profile_verification_state(r.id);
  end loop;
end;
$$;
