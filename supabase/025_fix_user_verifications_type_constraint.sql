-- 025_fix_user_verifications_type_constraint.sql
-- Normalizes user_verifications schema across old/new 2FA migrations.

-- If an old migration created user_id, keep backward compatibility by
-- ensuring profile_id exists and is backfilled.
alter table public.user_verifications
  add column if not exists profile_id uuid;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_verifications'
      and column_name = 'user_id'
  ) then
    execute '
      update public.user_verifications
         set profile_id = user_id
       where profile_id is null
    ';
  end if;
end;
$$;

-- Ensure FK exists for profile_id.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_verifications_profile_id_fkey'
  ) then
    alter table public.user_verifications
      add constraint user_verifications_profile_id_fkey
      foreign key (profile_id)
      references public.profiles(id)
      on delete cascade;
  end if;
end;
$$;

-- Normalize existing values then replace old type check.
-- Drop old check FIRST so normalization updates cannot violate legacy rules.
alter table public.user_verifications
  drop constraint if exists user_verifications_verification_type_check;

update public.user_verifications
   set verification_type = lower(verification_type)
 where verification_type is not null;

-- Map legacy/custom values into the two supported buckets so the new
-- constraint can be validated even on dirty historical data.
update public.user_verifications
   set verification_type = 'email_2fa'
 where verification_type not in ('email_2fa', 'email_2fa_trust')
   and code_hash is not null;

update public.user_verifications
   set verification_type = 'email_2fa_trust'
 where verification_type not in ('email_2fa', 'email_2fa_trust')
   and token_hash is not null;

-- If any rows still have unsupported type and no usable payload, remove them.
delete from public.user_verifications
 where verification_type not in ('email_2fa', 'email_2fa_trust');

alter table public.user_verifications
  add constraint user_verifications_verification_type_check
  check (verification_type in ('email_2fa', 'email_2fa_trust'));

-- Rebuild index on profile_id (old index may still be on user_id).
drop index if exists idx_user_verifications_user_type;
create index if not exists idx_user_verifications_user_type
  on public.user_verifications (profile_id, verification_type, created_at desc);

-- profile_id must be present.
alter table public.user_verifications
  alter column profile_id set not null;

-- RLS policies should use profile_id.
drop policy if exists "Users can read own verifications" on public.user_verifications;
create policy "Users can read own verifications"
  on public.user_verifications for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "Users can insert own verifications" on public.user_verifications;
create policy "Users can insert own verifications"
  on public.user_verifications for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "Users can update own verifications" on public.user_verifications;
create policy "Users can update own verifications"
  on public.user_verifications for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "Users can delete own verifications" on public.user_verifications;
create policy "Users can delete own verifications"
  on public.user_verifications for delete
  to authenticated
  using (auth.uid() = profile_id);
