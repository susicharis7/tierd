import { rankingRepository, type LeaderboardRow } from "../repositories/rankingRepository";
import { ChallengeScoringStrategy } from "../strategies/scoring/ChallengeScoringStrategy";
import { GitHubScoringStrategy } from "../strategies/scoring/GitHubScoringStrategy";
import {
  type ScoreResult,
  type ScoringInput,
  type ScoringStrategy,
} from "../strategies/scoring/ScoringStrategy";
import { SocialActivityScoringStrategy } from "../strategies/scoring/SocialActivityScoringStrategy";

export type LeaderboardEntry = {
  rank: number;
  profileId: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  score: number;
  delta: number;
  tier: string;
  tierCode: string | null;
  hasCompletedEvaluation: boolean;
  streakWeeks: number;
  percentile: number;
};

export type ProfileProgress = {
  profileId: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  totalScore: number;
  weeklyScore: number;
  streakWeeks: number;
  bestStreakWeeks: number;
  tierCode: string | null;
  tierName: string;
  tierMinScore: number;
  nextTierCode: string | null;
  nextTierName: string | null;
  nextTierMinScore: number | null;
  pointsToNextTier: number;
  progressToNextTierPct: number;
  globalRank: number | null;
  globalPercentile: number;
  countryRank: number | null;
  countryPercentile: number | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  postsLast30d: number;
  challengeWinsCount: number;
  hasCompletedEvaluation: boolean;
  evaluationCompletedAt: string | null;
};

export type EvaluationResult = {
  userId: string;
  totalScore: number;
  breakdown: ScoreResult[];
};

export type ActiveChallenge = {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  endsAt: string;
  participantsCount: number;
};

export type TopChallenger = {
  rank: number;
  profileId: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  winsCount: number;
  totalAwardedPoints: number;
};

const strategies: ScoringStrategy[] = [
  new GitHubScoringStrategy(),
  new ChallengeScoringStrategy(),
  new SocialActivityScoringStrategy(),
];

function toLeaderboardEntry(row: LeaderboardRow): LeaderboardEntry {
  const username = row.username ?? "builder";
  return {
    rank: row.rank,
    profileId: row.profile_id,
    username,
    fullName: row.full_name ?? username,
    avatarUrl: row.avatar_url,
    score: row.score,
    delta: row.delta,
    tier: row.tier_name ?? row.tier_code ?? "Unranked",
    tierCode: row.tier_code,
    hasCompletedEvaluation: row.has_completed_evaluation ?? false,
    streakWeeks: row.streak_weeks,
    percentile: row.percentile,
  };
}

function toProgressPercent(
  totalScore: number,
  tierMinScore: number,
  nextTierMinScore: number | null,
): number {
  if (!nextTierMinScore || nextTierMinScore <= tierMinScore) return 100;
  const width = nextTierMinScore - tierMinScore;
  const progressed = Math.max(0, totalScore - tierMinScore);
  return Math.max(0, Math.min(100, (progressed / width) * 100));
}

export const rankingService = {
  async getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const rows = await rankingRepository.fetchGlobalLeaderboard(limit);
    return rows.map(toLeaderboardEntry);
  },

  async getLandingTopBuilders(limit = 8): Promise<LeaderboardEntry[]> {
    const rows = await rankingRepository.fetchLandingTopBuilders(limit);
    return rows.map(toLeaderboardEntry);
  },

  async getRisingDevelopers(limit = 5): Promise<LeaderboardEntry[]> {
    const rows = await rankingRepository.fetchRisingDevelopers(limit);
    return rows.map(toLeaderboardEntry);
  },

  async getProfileProgress(profileId: string): Promise<ProfileProgress | null> {
    const metrics = await rankingRepository.fetchProfilePublicMetricsById(profileId);
    if (!metrics) return null;

    const tierName = metrics.tier_name ?? "Unranked";
    const tierMinScore = metrics.tier_min_score ?? 0;
    const nextTierMinScore = metrics.next_tier_min_score ?? null;
    const pointsToNextTier = metrics.points_to_next_tier ?? 0;
    const progressToNextTierPct = toProgressPercent(
      metrics.total_score,
      tierMinScore,
      nextTierMinScore,
    );

    return {
      profileId: metrics.profile_id,
      fullName: metrics.full_name ?? metrics.username ?? "Builder",
      username: metrics.username ?? "builder",
      avatarUrl: metrics.avatar_url,
      totalScore: metrics.total_score,
      weeklyScore: metrics.weekly_score,
      streakWeeks: metrics.streak_weeks,
      bestStreakWeeks: metrics.best_streak_weeks,
      tierCode: metrics.tier_code,
      tierName,
      tierMinScore,
      nextTierCode: metrics.next_tier_code,
      nextTierName: metrics.next_tier_name,
      nextTierMinScore,
      pointsToNextTier,
      progressToNextTierPct,
      globalRank: metrics.global_rank,
      globalPercentile: metrics.global_percentile ?? 0,
      countryRank: metrics.country_rank,
      countryPercentile: metrics.country_percentile,
      followersCount: metrics.followers_count,
      followingCount: metrics.following_count,
      postsCount: metrics.posts_count,
      postsLast30d: metrics.posts_last_30d,
      challengeWinsCount: metrics.challenge_wins_count,
      hasCompletedEvaluation: metrics.has_completed_evaluation ?? false,
      evaluationCompletedAt: metrics.evaluation_completed_at ?? null,
    };
  },

  async calculateUserScore(userId: string): Promise<EvaluationResult> {
    const [profileMetrics, challengeStats, githubSignals] = await Promise.all([
      rankingRepository.fetchProfilePublicMetricsById(userId),
      rankingRepository.fetchChallengeStats(userId),
      rankingRepository.fetchGithubContributionSignals(userId),
    ]);

    const input: ScoringInput = {
      userId,
      profileMetrics,
      challengeStats,
      githubSignals,
    };

    const breakdown = await Promise.all(
      strategies.map((strategy) => strategy.calculate(input)),
    );
    const totalScore = breakdown.reduce((sum, item) => sum + item.score, 0);

    return { userId, totalScore, breakdown };
  },

  async getTopChallengers(limit = 5): Promise<TopChallenger[]> {
    const rows = await rankingRepository.fetchTopChallengers(limit);
    return rows
      .filter((row): row is typeof row & { profile_id: string } =>
        Boolean(row.profile_id),
      )
      .map((row, i) => {
        const username = row.username ?? "builder";
        return {
          rank: row.challenger_rank ?? i + 1,
          profileId: row.profile_id,
          username,
          fullName: row.full_name ?? username,
          avatarUrl: row.avatar_url,
          winsCount: row.wins_count ?? 0,
          totalAwardedPoints: row.total_awarded_points ?? 0,
        };
      });
  },

  async getActiveFeaturedChallenge(): Promise<ActiveChallenge | null> {
    const row = await rankingRepository.fetchActiveFeaturedChallenge();
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      rewardPoints: row.reward_points,
      endsAt: row.ends_at,
      participantsCount: row.participants_count,
    };
  },
};
