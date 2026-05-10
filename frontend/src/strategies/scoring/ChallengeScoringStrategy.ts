import type { ScoreResult, ScoringInput, ScoringStrategy } from "./ScoringStrategy";

function roundScore(value: number): number {
  return Math.max(0, Math.round(value));
}

export class ChallengeScoringStrategy implements ScoringStrategy {
  async calculate(input: ScoringInput): Promise<ScoreResult> {
    const metrics = input.challengeStats ?? input.profileMetrics;
    if (!metrics) {
      return {
        source: "challenges",
        score: 0,
        explanation: "No challenge metrics available.",
      };
    }

    const wins = (metrics.challenge_wins_count as number | null) ?? 0;
    const submissions = (metrics.challenge_submissions_count as number | null) ?? 0;
    const joined = (metrics.joined_challenges_count as number | null) ?? 0;

    const score = roundScore(wins * 20 + submissions * 6 + joined * 2);

    return {
      source: "challenges",
      score,
      explanation: `${wins} wins, ${submissions} submissions, ${joined} joined challenges.`,
    };
  }
}

