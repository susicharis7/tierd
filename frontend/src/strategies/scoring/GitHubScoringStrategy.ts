import type { ScoreResult, ScoringInput, ScoringStrategy } from "./ScoringStrategy";

function roundScore(value: number): number {
  return Math.max(0, Math.round(value));
}

export class GitHubScoringStrategy implements ScoringStrategy {
  async calculate(input: ScoringInput): Promise<ScoreResult> {
    const contributions = input.githubSignals.totalContributions;
    const activeDays = input.githubSignals.activeDays;
    const hasGithubSignals = contributions > 0 || activeDays > 0;

    if (!hasGithubSignals) {
      return {
        source: "github",
        score: 0,
        explanation: "No GitHub contribution signals available yet.",
      };
    }

    const score = roundScore(contributions * 0.08 + activeDays * 1.2);
    return {
      source: "github",
      score,
      explanation: `${contributions} contributions across ${activeDays} active days in the last 52 weeks.`,
    };
  }
}
