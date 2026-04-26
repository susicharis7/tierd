-- 016_views_and_performance.sql
-- Final views + performance indexes for landing/explore/profile/leaderboard/challenges

-- -------------------------------------------------------------------
-- Extra indexes (read-heavy surfaces)
-- -------------------------------------------------------------------
create index if not exists idx_posts_user_created_desc
  on public.posts (user_id, created_at desc);

create index if not exists idx_post_likes_user_created_desc
  on public.post_likes (user_id, created_at desc);

create index if not exists idx_post_comments_user_created_desc
  on public.post_comments (user_id, created_at desc);

create index if not exists idx_projects_owner_featured_created
  on public.projects (owner_id, is_featured desc, created_at desc);

create index if not exists idx_challenges_live_featured_window
  on public.challenges (status, is_featured desc, starts_at, ends_at);

create index if not exists idx_challenge_winners_profile_position_awarded
  on public.challenge_winners (profile_id, position, awarded_at desc);

create index if not exists idx_verification_runs_profile_status_created
  on public.verification_runs (profile_id, status, created_at desc);

create index if not exists idx_activity_events_target_type_created
  on public.activity_events (target_profile_id, event_type, created_at desc);

create index if not exists idx_github_daily_contributions_day_desc
  on public.github_daily_contributions (day desc);

-- -------------------------------------------------------------------
-- Aggregation views
-- -------------------------------------------------------------------
create or replace view public.profile_follow_counts as
select
  p.id as profile_id,
  coalesce(fers.followers_count, 0)::int as followers_count,
  coalesce(fing.following_count, 0)::int as following_count
from public.profiles p
left join (
  select f.following_id as profile_id, count(*) as followers_count
  from public.follows f
  group by f.following_id
) fers on fers.profile_id = p.id
left join (
  select f.follower_id as profile_id, count(*) as following_count
  from public.follows f
  group by f.follower_id
) fing on fing.profile_id = p.id;

create or replace view public.profile_post_counts as
select
  p.id as profile_id,
  coalesce(pc.total_posts, 0)::int as total_posts,
  coalesce(pc.posts_last_30d, 0)::int as posts_last_30d
from public.profiles p
left join (
  select
    po.user_id as profile_id,
    count(*) as total_posts,
    count(*) filter (where po.created_at >= now() - interval '30 days') as posts_last_30d
  from public.posts po
  group by po.user_id
) pc on pc.profile_id = p.id;

create or replace view public.profile_project_counts as
select
  p.id as profile_id,
  coalesce(pr.total_projects, 0)::int as total_projects,
  coalesce(pr.featured_projects, 0)::int as featured_projects,
  coalesce(pr.verified_projects, 0)::int as verified_projects,
  coalesce(pr.total_project_stars, 0)::int as total_project_stars
from public.profiles p
left join (
  select
    pj.owner_id as profile_id,
    count(*) as total_projects,
    count(*) filter (where pj.is_featured) as featured_projects,
    count(*) filter (where pj.is_verified) as verified_projects,
    coalesce(sum(pj.stars_count), 0) as total_project_stars
  from public.projects pj
  group by pj.owner_id
) pr on pr.profile_id = p.id;

create or replace view public.profile_challenge_stats as
with joined_cte as (
  select cp.profile_id, count(*)::int as joined_count
  from public.challenge_participants cp
  where cp.status = 'joined'
  group by cp.profile_id
),
sub_cte as (
  select cs.profile_id, count(*)::int as submissions_count
  from public.challenge_submissions cs
  group by cs.profile_id
),
win_cte as (
  select
    cw.profile_id,
    count(*)::int as wins_count,
    min(cw.position)::int as best_position,
    max(cw.awarded_at) as last_win_at
  from public.challenge_winners cw
  group by cw.profile_id
)
select
  p.id as profile_id,
  coalesce(j.joined_count, 0)::int as joined_challenges_count,
  coalesce(s.submissions_count, 0)::int as challenge_submissions_count,
  coalesce(w.wins_count, 0)::int as challenge_wins_count,
  w.best_position,
  w.last_win_at
from public.profiles p
left join joined_cte j on j.profile_id = p.id
left join sub_cte s on s.profile_id = p.id
left join win_cte w on w.profile_id = p.id;

create or replace view public.profile_achievement_counts as
select
  p.id as profile_id,
  coalesce(a.achievements_count, 0)::int as achievements_count
from public.profiles p
left join (
  select pa.profile_id, count(*)::int as achievements_count
  from public.profile_achievements pa
  group by pa.profile_id
) a on a.profile_id = p.id;

-- -------------------------------------------------------------------
-- Public profile metrics view (single source for profile page cards)
-- -------------------------------------------------------------------
create or replace view public.profile_public_metrics as
select
  p.id as profile_id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.headline,
  p.bio,
  p.country_code,
  p.city,
  p.company,
  p.website_url,
  p.github_username,
  p.linkedin_url,
  p.is_verified,
  p.last_active_at,

  coalesce(ps.total_score, 0)::int as total_score,
  coalesce(ps.weekly_score, 0)::int as weekly_score,
  ps.weekly_window_start,
  coalesce(ps.streak_weeks, 0)::int as streak_weeks,
  coalesce(ps.best_streak_weeks, 0)::int as best_streak_weeks,
  ps.peak_rank_global,
  ps.last_score_event_at,

  pswt.tier_code,
  pswt.tier_name,
  pswt.tier_min_score,

  nt.next_tier_code,
  nt.next_tier_name,
  nt.next_tier_min_score,
  nt.points_to_next_tier,

  gl.rank as global_rank,
  gl.percentile as global_percentile,

  cr.rank as country_rank,
  cr.percentile as country_percentile,

  coalesce(ff.followers_count, 0)::int as followers_count,
  coalesce(ff.following_count, 0)::int as following_count,
  coalesce(pp.total_posts, 0)::int as posts_count,
  coalesce(pp.posts_last_30d, 0)::int as posts_last_30d,
  coalesce(pr.total_projects, 0)::int as projects_count,
  coalesce(pr.featured_projects, 0)::int as featured_projects_count,
  coalesce(pr.verified_projects, 0)::int as verified_projects_count,
  coalesce(pr.total_project_stars, 0)::int as total_project_stars,
  coalesce(ch.joined_challenges_count, 0)::int as joined_challenges_count,
  coalesce(ch.challenge_submissions_count, 0)::int as challenge_submissions_count,
  coalesce(ch.challenge_wins_count, 0)::int as challenge_wins_count,
  ch.best_position as best_challenge_position,
  ch.last_win_at,
  coalesce(ach.achievements_count, 0)::int as achievements_count
from public.profiles p
left join public.profile_scores ps on ps.profile_id = p.id
left join public.profile_scores_with_tier pswt on pswt.profile_id = p.id
left join public.live_global_leaderboard gl on gl.profile_id = p.id
left join public.leaderboard_current_entries cr
  on cr.profile_id = p.id
 and cr.scope = 'country'
 and cr.period = 'all_time'
 and cr.scope_key = p.country_code
left join public.profile_follow_counts ff on ff.profile_id = p.id
left join public.profile_post_counts pp on pp.profile_id = p.id
left join public.profile_project_counts pr on pr.profile_id = p.id
left join public.profile_challenge_stats ch on ch.profile_id = p.id
left join public.profile_achievement_counts ach on ach.profile_id = p.id
left join lateral (
  select
    t2.code as next_tier_code,
    t2.name as next_tier_name,
    t2.min_score as next_tier_min_score,
    greatest(0, t2.min_score - coalesce(ps.total_score, 0))::int as points_to_next_tier
  from public.tiers t2
  where t2.min_score > coalesce(ps.total_score, 0)
  order by t2.min_score asc
  limit 1
) nt on true;

-- -------------------------------------------------------------------
-- Landing / Explore helpers
-- -------------------------------------------------------------------
create or replace view public.landing_top_builders as
select
  l.rank,
  l.profile_id,
  l.username,
  l.full_name,
  l.avatar_url,
  l.score,
  l.delta,
  l.streak_weeks,
  l.tier_code,
  l.tier_name,
  l.percentile
from public.live_global_leaderboard l
order by l.rank
limit 5;

create or replace view public.active_featured_challenge as
select
  c.*
from public.challenge_public_overview c
where c.phase = 'active'
  and c.is_featured = true
order by c.starts_at desc
limit 1;

create or replace view public.trending_projects as
select
  p.id,
  p.owner_id as profile_id,
  pr.username,
  pr.full_name,
  pr.avatar_url,
  p.slug,
  p.name,
  p.description,
  p.repo_url,
  p.live_url,
  p.is_featured,
  p.is_verified,
  p.stars_count,
  p.forks_count,
  p.watchers_count,
  p.open_issues_count,
  (
    (p.stars_count * 1.0) +
    (p.forks_count * 2.0) +
    (p.watchers_count * 0.7) -
    (p.open_issues_count * 0.1)
  )::numeric(12,2) as trending_score,
  p.created_at,
  p.updated_at
from public.projects p
join public.profiles pr on pr.id = p.owner_id
where p.is_verified = true
order by trending_score desc, p.updated_at desc, p.created_at desc;

create or replace view public.community_stats as
select
  (select count(*)::int from public.profiles) as total_builders,
  (select count(*)::int from public.posts) as total_posts,
  (select count(*)::int from public.projects where is_verified = true) as total_verified_projects,
  (select count(*)::int from public.challenges where status in ('published', 'live')) as active_or_published_challenges;
