import type { QueryClient } from "@tanstack/react-query";

export async function invalidateRankingQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ["ranking"] });
}
