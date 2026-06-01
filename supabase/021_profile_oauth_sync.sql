-- 021_profile_oauth_sync.sql
-- OAuth sync support objects (used by app-layer OAuth identity upserts).

create index if not exists idx_profile_external_accounts_profile_provider_lookup
  on public.profile_external_accounts (profile_id, provider);

create or replace view public.profile_oauth_summary as
select
  pea.profile_id,
  bool_or(pea.provider = 'github' and pea.is_verified) as has_verified_github,
  bool_or(pea.provider = 'linkedin' and pea.is_verified) as has_verified_linkedin,
  max(pea.last_synced_at) as last_synced_at
from public.profile_external_accounts pea
group by pea.profile_id;
