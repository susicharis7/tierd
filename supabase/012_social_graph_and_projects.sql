-- 012_social_graph_and_projects.sql
-- Social graph + technologies + projects

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.normalize_slug_text()
returns trigger
language plpgsql
as $$
begin
  if new.slug is not null then
    new.slug := lower(trim(new.slug));
    new.slug := regexp_replace(new.slug, '[^a-z0-9]+', '-', 'g');
    new.slug := regexp_replace(new.slug, '(^-+|-+$)', '', 'g');
    new.slug := nullif(new.slug, '');
  end if;

  return new;
end;
$$;

-- -------------------------------------------------------------------
-- follows
-- -------------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow_chk check (follower_id <> following_id)
);

create index if not exists idx_follows_following_id_created_at
  on public.follows (following_id, created_at desc);

create index if not exists idx_follows_follower_id_created_at
  on public.follows (follower_id, created_at desc);

alter table public.follows enable row level security;

drop policy if exists "Anyone can read follows" on public.follows;
create policy "Anyone can read follows"
  on public.follows for select
  using (true);

drop policy if exists "Users can follow from own profile" on public.follows;
create policy "Users can follow from own profile"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id and follower_id <> following_id);

drop policy if exists "Users can unfollow from own profile" on public.follows;
create policy "Users can unfollow from own profile"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- -------------------------------------------------------------------
-- technologies
-- -------------------------------------------------------------------
create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_technologies_slug_unique
  on public.technologies (slug);

create unique index if not exists idx_technologies_name_lower_unique
  on public.technologies (lower(name));

create index if not exists idx_technologies_is_active
  on public.technologies (is_active);

drop trigger if exists trg_technologies_normalize_slug on public.technologies;
create trigger trg_technologies_normalize_slug
before insert or update of slug
on public.technologies
for each row
execute function public.normalize_slug_text();

drop trigger if exists trg_technologies_set_updated_at on public.technologies;
create trigger trg_technologies_set_updated_at
before update
on public.technologies
for each row
execute function public.set_updated_at();

alter table public.technologies enable row level security;

drop policy if exists "Anyone can read technologies" on public.technologies;
create policy "Anyone can read technologies"
  on public.technologies for select
  using (true);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated.
-- Service role can manage catalog.

insert into public.technologies (slug, name, category)
values
  ('react', 'React', 'frontend'),
  ('typescript', 'TypeScript', 'language'),
  ('node-js', 'Node.js', 'backend'),
  ('postgresql', 'PostgreSQL', 'database'),
  ('next-js', 'Next.js', 'frontend'),
  ('docker', 'Docker', 'devops'),
  ('python', 'Python', 'language'),
  ('rust', 'Rust', 'language'),
  ('go', 'Go', 'language'),
  ('ai-ml', 'AI/ML', 'domain'),
  ('swift', 'Swift', 'language'),
  ('java', 'Java', 'language'),
  ('c-plus-plus', 'C++', 'language'),
  ('vue', 'Vue', 'frontend'),
  ('react-native', 'React Native', 'mobile')
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  is_active = true,
  updated_at = now();

-- -------------------------------------------------------------------
-- profile_technologies
-- -------------------------------------------------------------------
create table if not exists public.profile_technologies (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete restrict,
  is_primary boolean not null default false,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  primary key (profile_id, technology_id)
);

create index if not exists idx_profile_technologies_profile_sort
  on public.profile_technologies (profile_id, is_primary desc, sort_order asc, created_at desc);

create index if not exists idx_profile_technologies_technology
  on public.profile_technologies (technology_id);

alter table public.profile_technologies enable row level security;

drop policy if exists "Anyone can read profile technologies" on public.profile_technologies;
create policy "Anyone can read profile technologies"
  on public.profile_technologies for select
  using (true);

drop policy if exists "Users can add own profile technologies" on public.profile_technologies;
create policy "Users can add own profile technologies"
  on public.profile_technologies for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "Users can update own profile technologies" on public.profile_technologies;
create policy "Users can update own profile technologies"
  on public.profile_technologies for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "Users can delete own profile technologies" on public.profile_technologies;
create policy "Users can delete own profile technologies"
  on public.profile_technologies for delete
  to authenticated
  using (auth.uid() = profile_id);

-- -------------------------------------------------------------------
-- projects
-- -------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  slug text,
  name text not null,
  description text,
  repo_url text,
  live_url text,
  cover_image_url text,
  is_featured boolean not null default false,
  is_verified boolean not null default false,
  stars_count int not null default 0 check (stars_count >= 0),
  forks_count int not null default 0 check (forks_count >= 0),
  watchers_count int not null default 0 check (watchers_count >= 0),
  open_issues_count int not null default 0 check (open_issues_count >= 0),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_projects_owner_slug_unique
  on public.projects (owner_id, slug)
  where slug is not null;

create index if not exists idx_projects_owner_created_at
  on public.projects (owner_id, created_at desc);

create index if not exists idx_projects_featured
  on public.projects (is_featured, created_at desc);

create index if not exists idx_projects_stars
  on public.projects (stars_count desc);

drop trigger if exists trg_projects_normalize_slug on public.projects;
create trigger trg_projects_normalize_slug
before insert or update of slug
on public.projects
for each row
execute function public.normalize_slug_text();

drop trigger if exists trg_projects_set_updated_at on public.projects;
create trigger trg_projects_set_updated_at
before update
on public.projects
for each row
execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "Anyone can read projects" on public.projects;
create policy "Anyone can read projects"
  on public.projects for select
  using (true);

drop policy if exists "Users can create own projects" on public.projects;
create policy "Users can create own projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects"
  on public.projects for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects"
  on public.projects for delete
  to authenticated
  using (auth.uid() = owner_id);

-- -------------------------------------------------------------------
-- project_technologies
-- -------------------------------------------------------------------
create table if not exists public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete restrict,
  is_primary boolean not null default false,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  primary key (project_id, technology_id)
);

create index if not exists idx_project_technologies_project_sort
  on public.project_technologies (project_id, is_primary desc, sort_order asc, created_at desc);

create index if not exists idx_project_technologies_technology
  on public.project_technologies (technology_id);

alter table public.project_technologies enable row level security;

drop policy if exists "Anyone can read project technologies" on public.project_technologies;
create policy "Anyone can read project technologies"
  on public.project_technologies for select
  using (true);

drop policy if exists "Owners can insert project technologies" on public.project_technologies;
create policy "Owners can insert project technologies"
  on public.project_technologies for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update project technologies" on public.project_technologies;
create policy "Owners can update project technologies"
  on public.project_technologies for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete project technologies" on public.project_technologies;
create policy "Owners can delete project technologies"
  on public.project_technologies for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.owner_id = auth.uid()
    )
  );
