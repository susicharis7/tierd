import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { invalidateRankingQueries } from "./rankingCache";

export function useRankingRealtimeSync(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const refresh = () => {
      void invalidateRankingQueries(queryClient);
    };

    const channel = supabase
      .channel("ranking-live-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "score_events" },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profile_scores" },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard_entries" },
        refresh,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
