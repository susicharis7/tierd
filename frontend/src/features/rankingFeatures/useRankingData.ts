import { useQuery } from "@tanstack/react-query";
import { rankingService } from "../../services/rankingService";

const RANKING_STALE_MS = 30_000;

export const rankingKeys = {
  globalLeaderboard: (limit: number) =>
    ["ranking", "global-leaderboard", limit] as const,
  landingTopBuilders: (limit: number) =>
    ["ranking", "landing-top-builders", limit] as const,
  risingDevelopers: (limit: number) =>
    ["ranking", "rising-developers", limit] as const,
  profileProgress: (profileId: string | null) =>
    ["ranking", "profile-progress", profileId] as const,
  profileEvaluation: (profileId: string | null) =>
    ["ranking", "profile-evaluation", profileId] as const,
  activeChallenge: () => ["ranking", "active-featured-challenge"] as const,
  topChallengers: (limit: number) => ["ranking", "top-challengers", limit] as const,
};

export function useGlobalLeaderboardQuery(limit = 50) {
  return useQuery({
    queryKey: rankingKeys.globalLeaderboard(limit),
    queryFn: () => rankingService.getGlobalLeaderboard(limit),
    staleTime: RANKING_STALE_MS,
  });
}

export function useLandingTopBuildersQuery(limit = 8) {
  return useQuery({
    queryKey: rankingKeys.landingTopBuilders(limit),
    queryFn: () => rankingService.getLandingTopBuilders(limit),
    staleTime: RANKING_STALE_MS,
  });
}

export function useRisingDevelopersQuery(limit = 5) {
  return useQuery({
    queryKey: rankingKeys.risingDevelopers(limit),
    queryFn: () => rankingService.getRisingDevelopers(limit),
    staleTime: RANKING_STALE_MS,
  });
}

export function useProfileProgressQuery(profileId: string | null) {
  return useQuery({
    queryKey: rankingKeys.profileProgress(profileId),
    queryFn: () => rankingService.getProfileProgress(profileId!),
    enabled: Boolean(profileId),
    staleTime: RANKING_STALE_MS,
  });
}

export function useProfileEvaluationQuery(profileId: string | null) {
  return useQuery({
    queryKey: rankingKeys.profileEvaluation(profileId),
    queryFn: () => rankingService.calculateUserScore(profileId!),
    enabled: Boolean(profileId),
    staleTime: RANKING_STALE_MS,
  });
}

export function useActiveChallengeQuery() {
  return useQuery({
    queryKey: rankingKeys.activeChallenge(),
    queryFn: () => rankingService.getActiveFeaturedChallenge(),
    staleTime: RANKING_STALE_MS,
  });
}

export function useTopChallengersQuery(limit = 5) {
  return useQuery({
    queryKey: rankingKeys.topChallengers(limit),
    queryFn: () => rankingService.getTopChallengers(limit),
    staleTime: RANKING_STALE_MS,
  });
}
