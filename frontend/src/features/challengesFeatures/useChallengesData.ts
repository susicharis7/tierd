import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/ui/sonner";
import {
  challengeRepository,
  type ChallengePhase,
} from "../../repositories/challengeRepository";

const CHALLENGES_STALE_MS = 20_000;

export const challengeKeys = {
  overview: (phase: ChallengePhase | "all", limit: number) =>
    ["challenges", "overview", phase, limit] as const,
  detail: (challengeId: string | null) =>
    ["challenges", "detail", challengeId] as const,
  participants: (challengeId: string | null) =>
    ["challenges", "participants", challengeId] as const,
  leaderboard: (challengeId: string | null) =>
    ["challenges", "leaderboard", challengeId] as const,
  mineActive: (profileId: string | null) =>
    ["challenges", "mine-active", profileId] as const,
  mineParticipation: (challengeId: string | null, profileId: string | null) =>
    ["challenges", "mine-participation", challengeId, profileId] as const,
};

export function useChallengesOverviewQuery(phase: ChallengePhase | "all", limit = 30) {
  return useQuery({
    queryKey: challengeKeys.overview(phase, limit),
    queryFn: () =>
      challengeRepository.listOverview({
        phase: phase === "all" ? undefined : phase,
        limit,
      }),
    staleTime: CHALLENGES_STALE_MS,
  });
}

export function useChallengeDetailQuery(challengeId: string | null) {
  return useQuery({
    queryKey: challengeKeys.detail(challengeId),
    queryFn: () => challengeRepository.getOverviewById(challengeId!),
    enabled: Boolean(challengeId),
    staleTime: CHALLENGES_STALE_MS,
  });
}

export function useChallengeParticipantsQuery(challengeId: string | null) {
  return useQuery({
    queryKey: challengeKeys.participants(challengeId),
    queryFn: () => challengeRepository.listParticipants(challengeId!),
    enabled: Boolean(challengeId),
    staleTime: CHALLENGES_STALE_MS,
  });
}

export function useChallengeLeaderboardQuery(challengeId: string | null) {
  return useQuery({
    queryKey: challengeKeys.leaderboard(challengeId),
    queryFn: () => challengeRepository.listLeaderboard(challengeId!),
    enabled: Boolean(challengeId),
    staleTime: CHALLENGES_STALE_MS,
  });
}

export function useMyActiveChallengeQuery(profileId: string | null) {
  return useQuery({
    queryKey: challengeKeys.mineActive(profileId),
    queryFn: () => challengeRepository.getMyActiveChallenge(profileId!),
    enabled: Boolean(profileId),
    staleTime: CHALLENGES_STALE_MS,
  });
}

export function useMyChallengeParticipationQuery(
  challengeId: string | null,
  profileId: string | null,
) {
  return useQuery({
    queryKey: challengeKeys.mineParticipation(challengeId, profileId),
    queryFn: () => challengeRepository.getMyParticipantRow(challengeId!, profileId!),
    enabled: Boolean(challengeId && profileId),
    staleTime: CHALLENGES_STALE_MS,
  });
}

export function useJoinChallengeMutation(profileId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      if (!profileId) throw new Error("You must be logged in to join.");
      await challengeRepository.join(challengeId, profileId);
    },
    onSuccess: async (_, challengeId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: challengeKeys.detail(challengeId) }),
        queryClient.invalidateQueries({
          queryKey: challengeKeys.participants(challengeId),
        }),
        queryClient.invalidateQueries({
          queryKey: challengeKeys.mineParticipation(challengeId, profileId),
        }),
        queryClient.invalidateQueries({ queryKey: challengeKeys.mineActive(profileId) }),
        queryClient.invalidateQueries({ queryKey: ["challenges", "overview"] }),
      ]);
      toast("Joined challenge.");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Could not join challenge.";
      toast(message);
    },
  });
}

export function formatChallengeTimeLeft(endsAtIso: string): string | null {
  const end = new Date(endsAtIso).getTime();
  if (Number.isNaN(end)) return null;
  const diff = end - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
}

export function formatChallengeStartsIn(startsAtIso: string): string | null {
  const start = new Date(startsAtIso).getTime();
  if (Number.isNaN(start)) return null;
  const diff = start - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
}

