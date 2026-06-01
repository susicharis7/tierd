-- Stores OAuth provider access tokens captured at the SIGNED_IN callback.
-- Kept separate from profile_external_accounts because that table is public-readable.
-- Tokens here are owner-only via RLS.

create table if not exists public.oauth_provider_tokens (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('github', 'linkedin')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, provider)
);

drop trigger if exists trg_oauth_provider_tokens_set_updated_at on public.oauth_provider_tokens;
create trigger trg_oauth_provider_tokens_set_updated_at
before update on public.oauth_provider_tokens
for each row
execute function public.set_updated_at();

alter table public.oauth_provider_tokens enable row level security;

drop policy if exists "Owner can read own oauth tokens" on public.oauth_provider_tokens;
create policy "Owner can read own oauth tokens"
  on public.oauth_provider_tokens for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "Owner can insert own oauth tokens" on public.oauth_provider_tokens;
create policy "Owner can insert own oauth tokens"
  on public.oauth_provider_tokens for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "Owner can update own oauth tokens" on public.oauth_provider_tokens;
create policy "Owner can update own oauth tokens"
  on public.oauth_provider_tokens for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "Owner can delete own oauth tokens" on public.oauth_provider_tokens;
create policy "Owner can delete own oauth tokens"
  on public.oauth_provider_tokens for delete
  to authenticated
  using (auth.uid() = profile_id);
