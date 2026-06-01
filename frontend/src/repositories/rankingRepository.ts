import { supabase } from "../lib/supabase";

export type LeaderboardRow = {
  rank: number;
  profile_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  score: number;
  delta: number;
  streak_weeks: number;
  best_streak_weeks: number;
  peak_rank_global: number | null;
  percentile: number;
  tier_code: string | null;
  tier_name: string | null;
  has_completed_evaluation: boolean;
};

export type ProfilePublicMetricsRow = {
  profile_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
  total_score: number;
  weekly_score: number;
  streak_weeks: number;
  best_streak_weeks: number;
  peak_rank_global: number | null;
  global_rank: number | null;
  global_percentile: number | null;
  country_rank: number | null;
  country_percentile: number | null;
  tier_code: string | null;
  tier_name: string | null;
  tier_min_score: number | null;
  next_tier_code: string | null;
  next_tier_name: string | null;
  next_tier_min_score: number | null;
  points_to_next_tier: number | null;
  posts_count: number;
  posts_last_30d: number;
  followers_count: number;
  following_count: number;
  challenge_wins_count: number;
  challenge_submissions_count: number;
  joined_challenges_count: number;
  has_completed_evaluation: boolean;
  evaluation_completed_at: string | null;
};

export type ChallengeStatsRow = {
  profile_id: string | null;
  joined_challenges_count: number | null;
  challenge_submissions_count: number | null;
  challenge_wins_count: number | null;
  best_position: number | null;
  last_win_at: string | null;
};

export const rankingRepository = {
  async fetchGlobalLeaderboard(limit: number): Promise<LeaderboardRow[]> {
    const { data, error } = await supabase
      .from("live_global_leaderboard")
      .select(
        "rank, profile_id, username, full_name, avatar_url, score, delta, streak_weeks, best_streak_weeks, peak_rank_global, percentile, tier_code, tier_name, has_completed_evaluation",
      )
      .order("rank", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      rank: (row.rank as number | null) ?? 0,
      profile_id: (row.profile_id as string | null) ?? "",
      username: (row.username as string | null) ?? null,
      full_name: (row.full_name as string | null) ?? null,
      avatar_url: (row.avatar_url as string | null) ?? null,
      score: (row.score as number | null) ?? 0,
      delta: (row.delta as number | null) ?? 0,
      streak_weeks: (row.streak_weeks as number | null) ?? 0,
      best_streak_weeks: (row.best_streak_weeks as number | null) ?? 0,
      peak_rank_global: (row.peak_rank_global as number | null) ?? null,
      percentile: (row.percentile as number | null) ?? 0,
      tier_code: (row.tier_code as string | null) ?? null,
      tier_name: (row.tier_name as string | null) ?? null,
      has_completed_evaluation:
        (row.has_completed_evaluation as boolean | null) ?? false,
    }));
  },

  async fetchLandingTopBuilders(limit: number): Promise<LeaderboardRow[]> {
    const { data, error } = await supabase
      .from("landing_top_builders")
      .select(
        "rank, profile_id, username, full_name, avatar_url, score, delta, streak_weeks, percentile, tier_code, tier_name, has_completed_evaluation",
      )
      .order("rank", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      rank: (row.rank as number | null) ?? 0,
      profile_id: (row.profile_id as string | null) ?? "",
      username: (row.username as string | null) ?? null,
      full_name: (row.full_name as string | null) ?? null,
      avatar_url: (row.avatar_url as string | null) ?? null,
      score: (row.score as number | null) ?? 0,
      delta: (row.delta as number | null) ?? 0,
      streak_weeks: (row.streak_weeks as number | null) ?? 0,
      best_streak_weeks: (row.streak_weeks as number | null) ?? 0,
      peak_rank_global: null,
      percentile: (row.percentile as number | null) ?? 0,
      tier_code: (row.tier_code as string | null) ?? null,
      tier_name: (row.tier_name as string | null) ?? null,
      has_completed_evaluation:
        (row.has_completed_evaluation as boolean | null) ?? false,
    }));
  },

  async fetchRisingDevelopers(limit: number): Promise<LeaderboardRow[]> {
    const { data, error } = await supabase
      .from("live_global_leaderboard")
      .select(
        "rank, profile_id, username, full_name, avatar_url, score, delta, streak_weeks, best_streak_weeks, peak_rank_global, percentile, tier_code, tier_name, has_completed_evaluation",
      )
      .order("delta", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      rank: (row.rank as number | null) ?? 0,
      profile_id: (row.profile_id as string | null) ?? "",
      username: (row.username as string | null) ?? null,
      full_name: (row.full_name as string | null) ?? null,
      avatar_url: (row.avatar_url as string | null) ?? null,
      score: (row.score as number | null) ?? 0,
      delta: (row.delta as number | null) ?? 0,
      streak_weeks: (row.streak_weeks as number | null) ?? 0,
      best_streak_weeks: (row.best_streak_weeks as number | null) ?? 0,
      peak_rank_global: (row.peak_rank_global as number | null) ?? null,
      percentile: (row.percentile as number | null) ?? 0,
      tier_code: (row.tier_code as string | null) ?? null,
      tier_name: (row.tier_name as string | null) ?? null,
      has_completed_evaluation:
        (row.has_completed_evaluation as boolean | null) ?? false,
    }));
  },

  async fetchProfilePublicMetricsById(
    profileId: string,
  ): Promise<ProfilePublicMetricsRow | null> {
    const { data, error } = await supabase
      .from("profile_public_metrics")
      .select(
        "profile_id, username, full_name, avatar_url, country_code, total_score, weekly_score, streak_weeks, best_streak_weeks, peak_rank_global, global_rank, global_percentile, country_rank, country_percentile, tier_code, tier_name, tier_min_score, next_tier_code, next_tier_name, next_tier_min_score, points_to_next_tier, posts_count, posts_last_30d, followers_count, following_count, challenge_wins_count, challenge_submissions_count, joined_challenges_count, has_completed_evaluation, evaluation_completed_at",
      )
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      profile_id: (data.profile_id as string | null) ?? "",
      username: (data.username as string | null) ?? null,
      full_name: (data.full_name as string | null) ?? null,
      avatar_url: (data.avatar_url as string | null) ?? null,
      country_code: (data.country_code as string | null) ?? null,
      total_score: (data.total_score as number | null) ?? 0,
      weekly_score: (data.weekly_score as number | null) ?? 0,
      streak_weeks: (data.streak_weeks as number | null) ?? 0,
      best_streak_weeks: (data.best_streak_weeks as number | null) ?? 0,
      peak_rank_global: (data.peak_rank_global as number | null) ?? null,
      global_rank: (data.global_rank as number | null) ?? null,
      global_percentile: (data.global_percentile as number | null) ?? null,
      country_rank: (data.country_rank as number | null) ?? null,
      country_percentile: (data.country_percentile as number | null) ?? null,
      tier_code: (data.tier_code as string | null) ?? null,
      tier_name: (data.tier_name as string | null) ?? null,
      tier_min_score: (data.tier_min_score as number | null) ?? null,
      next_tier_code: (data.next_tier_code as string | null) ?? null,
      next_tier_name: (data.next_tier_name as string | null) ?? null,
      next_tier_min_score: (data.next_tier_min_score as number | null) ?? null,
      points_to_next_tier: (data.points_to_next_tier as number | null) ?? null,
      posts_count: (data.posts_count as number | null) ?? 0,
      posts_last_30d: (data.posts_last_30d as number | null) ?? 0,
      followers_count: (data.followers_count as number | null) ?? 0,
      following_count: (data.following_count as number | null) ?? 0,
      challenge_wins_count: (data.challenge_wins_count as number | null) ?? 0,
      challenge_submissions_count:
        (data.challenge_submissions_count as number | null) ?? 0,
      joined_challenges_count:
        (data.joined_challenges_count as number | null) ?? 0,
      has_completed_evaluation:
        (data.has_completed_evaluation as boolean | null) ?? false,
      evaluation_completed_at:
        (data.evaluation_completed_at as string | null) ?? null,
    };
  },

  async fetchChallengeStats(profileId: string): Promise<ChallengeStatsRow | null> {
    const { data, error } = await supabase
      .from("profile_challenge_stats")
      .select(
        "profile_id, joined_challenges_count, challenge_submissions_count, challenge_wins_count, best_position, last_win_at",
      )
      .eq("profile_id", profileId)
      .maybeSingle();
    if (error) throw error;
    return (data as ChallengeStatsRow | null) ?? null;
  },

  async fetchGithubContributionSignals(profileId: string): Promise<{
    totalContributions: number;
    activeDays: number;
  }> {
    const { data, error } = await supabase
      .from("profile_github_contributions_52w")
      .select("contributions")
      .eq("profile_id", profileId);
    if (error) throw error;

    const rows = data ?? [];
    let totalContributions = 0;
    let activeDays = 0;
    for (const row of rows) {
      const contributions = (row.contributions as number | null) ?? 0;
      totalContributions += contributions;
      if (contributions > 0) activeDays += 1;
    }

    return { totalContributions, activeDays };
  },

  async fetchTopChallengers(limit: number): Promise<
    Array<{
      profile_id: string | null;
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
      total_awarded_points: number | null;
      wins_count: number | null;
      challenger_rank: number | null;
    }>
  > {
    const { data, error } = await supabase
      .from("challenge_top_challengers")
      .select(
        "profile_id, username, full_name, avatar_url, total_awarded_points, wins_count, challenger_rank",
      )
      .order("challenger_rank", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  },

  async fetchActiveFeaturedChallenge(): Promise<{
    id: string;
    title: string;
    description: string;
    reward_points: number;
    ends_at: string;
    participants_count: number;
  } | null> {
    const { data, error } = await supabase
      .from("active_featured_challenge")
      .select(
        "id, title, description, reward_points, ends_at, participants_count",
      )
      .maybeSingle();
    if (error) throw error;
    if (!data?.id) return null;
    return {
      id: data.id as string,
      title: (data.title as string | null) ?? "Active challenge",
      description:
        (data.description as string | null) ?? "Join the active challenge.",
      reward_points: (data.reward_points as number | null) ?? 0,
      ends_at: (data.ends_at as string | null) ?? new Date().toISOString(),
      participants_count: (data.participants_count as number | null) ?? 0,
    };
  },
};
