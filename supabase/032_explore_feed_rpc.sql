-- Fast Explore feed page: limit posts first, then count engagement for only that page.
create or replace function public.fetch_explore_feed(
  feed_limit integer default 10,
  before_created_at timestamptz default null
)
returns table (
  id uuid,
  content text,
  image_url text,
  created_at timestamptz,
  user_id uuid,
  like_count integer,
  comment_count integer,
  author_username text,
  author_full_name text,
  author_avatar_url text
)
language sql
stable
security invoker
set search_path = public
as $$
  with page as (
    select
      p.id,
      p.content,
      p.image_url,
      p.created_at,
      p.user_id
    from public.posts p
    where before_created_at is null
       or p.created_at < before_created_at
    order by p.created_at desc
    limit least(greatest(feed_limit, 1), 50)
  )
  select
    page.id,
    page.content,
    page.image_url,
    page.created_at,
    page.user_id,
    coalesce(likes.like_count, 0)::integer as like_count,
    coalesce(comments.comment_count, 0)::integer as comment_count,
    profiles.username as author_username,
    profiles.full_name as author_full_name,
    profiles.avatar_url as author_avatar_url
  from page
  join public.profiles profiles on profiles.id = page.user_id
  left join lateral (
    select count(*)::integer as like_count
    from public.post_likes l
    where l.post_id = page.id
  ) likes on true
  left join lateral (
    select count(*)::integer as comment_count
    from public.post_comments c
    where c.post_id = page.id
  ) comments on true
  order by page.created_at desc;
$$;

grant execute on function public.fetch_explore_feed(integer, timestamptz) to anon, authenticated;
