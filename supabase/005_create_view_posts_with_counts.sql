create or replace view public.posts_with_counts as
select
  p.*,
  coalesce(lc.like_count, 0)::int       as like_count,
  coalesce(cc.comment_count, 0)::int     as comment_count
from public.posts p
left join (
  select post_id, count(*) as like_count
  from public.post_likes
  group by post_id
) lc on lc.post_id = p.id
left join (
  select post_id, count(*) as comment_count
  from public.post_comments
  group by post_id
) cc on cc.post_id = p.id;
