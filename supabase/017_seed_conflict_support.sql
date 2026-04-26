-- 017_seed_conflict_support.sql
-- Support ON CONFLICT targets used in seed scripts

create unique index if not exists idx_projects_owner_slug_upsert_unique
  on public.projects (owner_id, slug);

create unique index if not exists idx_challenges_slug_upsert_unique
  on public.challenges (slug);
