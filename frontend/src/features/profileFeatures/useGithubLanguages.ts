import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

const STALE_MS = 60_000;

export type GithubLanguage = {
  name: string;
  /** GitHub's official color hex, when known. */
  color: string | null;
  /** Aggregated byte size across the user's owner-affiliated, non-fork repos. */
  size: number;
};

export const githubLanguageKeys = {
  byProfile: (profileId: string | null) =>
    ["github-languages", "by-profile", profileId] as const,
};

/**
 * Reads the `metadata.top_languages` slot we write into the github row of
 * `profile_external_accounts` on each sync. Returns the languages sorted
 * descending by byte size (the backend pre-sorts; we keep the order).
 *
 * `profile_external_accounts` is public-readable by RLS, so this works
 * for both the signed-in user and any profile we render.
 */
export function useGithubLanguages(profileId: string | null | undefined) {
  return useQuery({
    queryKey: githubLanguageKeys.byProfile(profileId ?? null),
    queryFn: async (): Promise<GithubLanguage[]> => {
      const { data, error } = await supabase
        .from("profile_external_accounts")
        .select("metadata")
        .eq("profile_id", profileId!)
        .eq("provider", "github")
        .maybeSingle();

      if (error) throw error;
      const raw = (data?.metadata as Record<string, unknown> | null)
        ?.top_languages;
      if (!Array.isArray(raw)) return [];

      return (raw as Array<Partial<GithubLanguage>>)
        .filter((l): l is GithubLanguage =>
          Boolean(l && typeof l.name === "string" && typeof l.size === "number"),
        )
        .map((l) => ({
          name: l.name,
          color: typeof l.color === "string" ? l.color : null,
          size: l.size,
        }));
    },
    enabled: Boolean(profileId),
    staleTime: STALE_MS,
  });
}
