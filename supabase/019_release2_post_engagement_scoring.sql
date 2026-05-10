-- 019_release2_post_engagement_scoring.sql
-- Awards basic score events for posts, received likes, and received comments.

create or replace function public.trg_posts_award_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.score_events (
    profile_id,
    points,
    reason_type,
    reason_ref_id,
    metadata,
    awarded_by,
    created_at
  )
  values (
    new.user_id,
    10,
    'post_created',
    new.id,
    jsonb_build_object('post_id', new.id),
    null,
    coalesce(new.created_at, now())
  );

  return new;
end;
$$;

drop trigger if exists trg_posts_award_score on public.posts;
create trigger trg_posts_award_score
after insert on public.posts
for each row
execute function public.trg_posts_award_score();

create or replace function public.trg_post_likes_award_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner uuid;
begin
  select p.user_id into post_owner
  from public.posts p
  where p.id = new.post_id;

  if post_owner is null or post_owner = new.user_id then
    return new;
  end if;

  insert into public.score_events (
    profile_id,
    points,
    reason_type,
    reason_ref_id,
    metadata,
    awarded_by,
    created_at
  )
  values (
    post_owner,
    2,
    'post_liked',
    new.post_id,
    jsonb_build_object(
      'post_id', new.post_id,
      'liked_by', new.user_id
    ),
    new.user_id,
    coalesce(new.created_at, now())
  );

  return new;
end;
$$;

drop trigger if exists trg_post_likes_award_score on public.post_likes;
create trigger trg_post_likes_award_score
after insert on public.post_likes
for each row
execute function public.trg_post_likes_award_score();

create or replace function public.trg_post_comments_award_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner uuid;
begin
  select p.user_id into post_owner
  from public.posts p
  where p.id = new.post_id;

  if post_owner is null or post_owner = new.user_id then
    return new;
  end if;

  insert into public.score_events (
    profile_id,
    points,
    reason_type,
    reason_ref_id,
    metadata,
    awarded_by,
    created_at
  )
  values (
    post_owner,
    3,
    'post_commented',
    new.id,
    jsonb_build_object(
      'post_id', new.post_id,
      'comment_id', new.id,
      'commented_by', new.user_id
    ),
    new.user_id,
    coalesce(new.created_at, now())
  );

  return new;
end;
$$;

drop trigger if exists trg_post_comments_award_score on public.post_comments;
create trigger trg_post_comments_award_score
after insert on public.post_comments
for each row
execute function public.trg_post_comments_award_score();
