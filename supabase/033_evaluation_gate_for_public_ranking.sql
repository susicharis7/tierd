-- 033_evaluation_gate_for_public_ranking.sql
-- Gate public ranking/tier display until at least one completed evaluation run exists.

create or replace view public.profile_evaluation_state as
select
  p.id as profile_id,
  coalesce(e.has_completed_evaluation, false) as has_completed_evaluation,
  e.evaluation_completed_at
from public.profiles p
left join (
  select
    er.profile_id,
    bool_or(er.status = 'completed') as has_completed_evaluation,
    max(er.completed_at) filter (where er.status = 'completed') as evaluation_completed_at
  from public.evaluation_runs er
  group by er.profile_id
) e on e.profile_id = p.id;

create or replace view public.profile_scores_with_tier as
with base as (
  select
    ps.profile_id,
    case
      when coalesce(pes.has_completed_evaluation, false) then ps.total_score
      else 0
    end::int as effective_total_score,
    case
      when coalesce(pes.has_completed_evaluation, false) then ps.weekly_score
      else 0
    end::int as effective_weekly_score,
    case
      when coalesce(pes.has_completed_evaluation, false) then ps.streak_weeks
      else 0
    end::int as effective_streak_weeks,
    case
      when coalesce(pes.has_completed_evaluation, false) then ps.best_streak_weeks
      else 0
    end::int as effective_best_streak_weeks,
    coalesce(pes.has_completed_evaluation, false) as has_completed_evaluation,
    pes.evaluation_completed_at,
    ps.total_score as raw_total_score,
    ps.weekly_score as raw_weekly_score,
    ps.streak_weeks as raw_streak_weeks,
    ps.best_streak_weeks as raw_best_streak_weeks,
    ps.weekly_window_start,
    ps.peak_rank_global,
    ps.last_score_event_at,
    ps.created_at,
    ps.updated_at
  from public.profile_scores ps
  left join public.profile_evaluation_state pes on pes.profile_id = ps.profile_id
)
select
  b.profile_id,
  b.effective_total_score as total_score,
  b.effective_weekly_score as weekly_score,
  b.weekly_window_start,
  b.effective_streak_weeks as streak_weeks,
  b.effective_best_streak_weeks as best_streak_weeks,
  b.peak_rank_global,
  b.last_score_event_at,
  b.created_at,
  b.updated_at,
  t.code as tier_code,
  t.name as tier_name,
  t.min_score as tier_min_score,
  b.has_completed_evaluation,
  b.evaluation_completed_at,
  b.raw_total_score,
  b.raw_weekly_score,
  b.raw_streak_weeks,
  b.raw_best_streak_weeks
from base b
left join lateral (
  select tt.code, tt.name, tt.min_score
  from public.tiers tt
  where tt.min_score <= b.effective_total_score
  order by tt.min_score desc
  limit 1
) t on true;

create or replace view public.live_global_leaderboard as
select
  dense_rank() over (
    order by pst.total_score desc, pst.updated_at asc, pst.profile_id asc
  ) as rank,
  pst.profile_id,
  p.username,
  p.full_name,
  p.avatar_url,
  pst.total_score as score,
  pst.weekly_score as delta,
  pst.streak_weeks,
  pst.best_streak_weeks,
  pst.peak_rank_global,
  pst.tier_code,
  pst.tier_name,
  round(
    (
      100 - (
        percent_rank() over (
          order by pst.total_score desc, pst.updated_at asc, pst.profile_id asc
        ) * 100
      )
    )::numeric,
    2
  ) as percentile,
  pst.has_completed_evaluation,
  pst.evaluation_completed_at
from public.profile_scores_with_tier pst
join public.profiles p on p.id = pst.profile_id;

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

  coalesce(pswt.total_score, 0)::int as total_score,
  coalesce(pswt.weekly_score, 0)::int as weekly_score,
  pswt.weekly_window_start,
  coalesce(pswt.streak_weeks, 0)::int as streak_weeks,
  coalesce(pswt.best_streak_weeks, 0)::int as best_streak_weeks,
  pswt.peak_rank_global,
  pswt.last_score_event_at,

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
  coalesce(ach.achievements_count, 0)::int as achievements_count,
  coalesce(pswt.has_completed_evaluation, false) as has_completed_evaluation,
  pswt.evaluation_completed_at
from public.profiles p
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
    greatest(0, t2.min_score - coalesce(pswt.total_score, 0))::int as points_to_next_tier
  from public.tiers t2
  where t2.min_score > coalesce(pswt.total_score, 0)
  order by t2.min_score asc
  limit 1
) nt on true;

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
  l.percentile,
  l.has_completed_evaluation
from public.live_global_leaderboard l
order by l.rank
limit 5;
