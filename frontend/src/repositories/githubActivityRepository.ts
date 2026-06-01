import { supabase } from "../lib/supabase";

export type GithubContributionDay = {
  /** ISO date (YYYY-MM-DD). */
  day: string;
  contributions: number;
};

/**
 * Reads the last-52-weeks contribution rows for one profile from the
 * `profile_github_contributions_52w` helper view. The view has an
 * "anyone can read" RLS policy, so this works for both the signed-in
 * user's own profile and any other profile we render.
 *
 * Returns rows in ascending date order. Days with no GitHub activity at
 * all simply aren't in the table — the caller is responsible for filling
 * those slots with zero when building a calendar grid.
 */
export const githubActivityRepository = {
  async listLast52Weeks(profileId: string): Promise<GithubContributionDay[]> {
    const { data, error } = await supabase
      .from("profile_github_contributions_52w")
      .select("day, contributions")
      .eq("profile_id", profileId)
      .order("day", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      day: row.day as string,
      contributions: (row.contributions as number | null) ?? 0,
    }));
  },
};
