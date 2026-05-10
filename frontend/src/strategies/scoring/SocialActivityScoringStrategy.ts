import type { ScoreResult, ScoringInput, ScoringStrategy } from "./ScoringStrategy";

function roundScore(value: number): number {
  return Math.max(0, Math.round(value));
}

export class SocialActivityScoringStrategy implements ScoringStrategy {
  async calculate(input: ScoringInput): Promise<ScoreResult> {
    const metrics = input.profileMetrics;
    if (!metrics) {
      return {
        source: "social_activity",
        score: 0,
        explanation: "No social activity metrics available.",
      };
    }

    const postsLast30d = metrics.posts_last_30d;
    const weeklyScore = metrics.weekly_score;
    const followers = metrics.followers_count;
    const streakWeeks = metrics.streak_weeks;

    const score = roundScore(
      postsLast30d * 4 + weeklyScore * 0.35 + Math.min(followers / 20, 25) + streakWeeks * 2,
    );

    return {
      source: "social_activity",
      score,
      explanation: `${postsLast30d} posts in last 30d, weekly momentum ${weeklyScore}, ${followers} followers, streak ${streakWeeks}w.`,
    };
  }
}

