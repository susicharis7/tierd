-- 023_email_2fa.sql
-- Email 2FA persistence primitives.

alter table public.profiles
  add column if not exists email_2fa_enabled boolean not null default false;

create table if not exists public.user_verifications (
  id bigserial primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  verification_type text not null
    check (verification_type in ('email_2fa', 'email_2fa_trust')),
  token_hash char(64),
  code_hash char(64),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint user_verifications_payload_chk check (
    token_hash is not null or code_hash is not null
  )
);

create index if not exists idx_user_verifications_user_type
  on public.user_verifications (profile_id, verification_type, created_at desc);

create index if not exists idx_user_verifications_code_hash
  on public.user_verifications (code_hash)
  where code_hash is not null;

create index if not exists idx_user_verifications_token_hash
  on public.user_verifications (token_hash)
  where token_hash is not null;

create index if not exists idx_user_verifications_expires_at
  on public.user_verifications (expires_at);

alter table public.user_verifications enable row level security;

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
