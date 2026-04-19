create table if not exists public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null check (char_length(content) > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_post_comments_post_id on public.post_comments (post_id);
