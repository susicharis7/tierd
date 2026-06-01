import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  evaluationRepository,
  type EvaluationStatusResponse,
} from "../../repositories/evaluationRepository";
import { invalidateRankingQueries } from "../rankingFeatures/rankingCache";

export const evaluationKeys = {
  status: (profileId: string | null) => ["evaluation", "status", profileId] as const,
};

function getRefetchInterval(data: EvaluationStatusResponse | undefined) {
  const status = data?.latestRun?.status;
  if (status === "queued" || status === "running") return 1200;
  return false;
}

export function useEvaluationStatusQuery(profileId: string | null) {
  return useQuery({
    queryKey: evaluationKeys.status(profileId),
    queryFn: () => evaluationRepository.getStatus(),
    enabled: Boolean(profileId),
    refetchInterval: (query) => getRefetchInterval(query.state.data),
    staleTime: 5_000,
  });
}

export function useStartEvaluationMutation(profileId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => evaluationRepository.start(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: evaluationKeys.status(profileId),
      });
    },
    onSettled: async () => {
      await invalidateRankingQueries(queryClient);
    },
  });
}
