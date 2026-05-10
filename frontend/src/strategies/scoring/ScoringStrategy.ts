import type {
  ChallengeStatsRow,
  ProfilePublicMetricsRow,
} from "../../repositories/rankingRepository";

export type ScoringInput = {
  userId: string;
  profileMetrics: ProfilePublicMetricsRow | null;
  challengeStats: ChallengeStatsRow | null;
  githubSignals: {
    totalContributions: number;
    activeDays: number;
  };
};

export type ScoreResult = {
  source: "github" | "challenges" | "social_activity";
  score: number;
  explanation: string;
};

export interface ScoringStrategy {
  calculate(input: ScoringInput): Promise<ScoreResult>;
}

