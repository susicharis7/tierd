create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null check (char_length(content) > 0),
  image_url  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_user_id    on public.posts (user_id);
create index if not exists idx_posts_created_at on public.posts (created_at desc);
