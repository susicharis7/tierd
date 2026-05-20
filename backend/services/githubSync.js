const { supabaseAdmin } = require("../lib/supabase");
const {
  fetchViewerContributionDays,
  GitHubTokenInvalidError,
} = require("../lib/github");

/**
 * Thrown when the user hasn't linked GitHub yet (no row in oauth_provider_tokens).
 * Distinct from "token rejected" so the route can return a clearer message.
 */
class GitHubNotLinkedError extends Error {
  constructor() {
    super("No GitHub account linked for this profile.");
    this.name = "GitHubNotLinkedError";
  }
}

async function readGithubAccessToken(profileId) {
  const { data, error } = await supabaseAdmin
    .from("oauth_provider_tokens")
    .select("access_token")
    .eq("profile_id", profileId)
    .eq("provider", "github")
    .maybeSingle();

  if (error) throw new Error(`oauth_provider_tokens read failed: ${error.message}`);
  if (!data) throw new GitHubNotLinkedError();
  return data.access_token;
}

async function deleteGithubAccessToken(profileId) {
  const { error } = await supabaseAdmin
    .from("oauth_provider_tokens")
    .delete()
    .eq("profile_id", profileId)
    .eq("provider", "github");
  // Best-effort cleanup; we don't want a delete failure to mask the original
  // 401 the caller is being told about.
  if (error) console.error("[githubSync] failed to delete revoked token", error);
}

async function upsertContributionDays(profileId, days) {
  if (days.length === 0) return 0;

  const rows = days.map((d) => ({
    profile_id: profileId,
    day: d.date,
    contributions: d.contributionCount,
  }));

  const { error } = await supabaseAdmin
    .from("github_daily_contributions")
    .upsert(rows, { onConflict: "profile_id,day" });

  if (error) {
    throw new Error(`github_daily_contributions upsert failed: ${error.message}`);
  }
  return rows.length;
}

/**
 * Pulls the GitHub contribution calendar for one profile and writes it into
 * `github_daily_contributions`. Idempotent — re-running just re-upserts the
 * same (profile_id, day) rows.
 *
 * Throws `GitHubNotLinkedError` if there's no stored token, and
 * `GitHubTokenInvalidError` if GitHub rejects the token (the bad token row
 * is deleted as a side effect so the user can re-link cleanly).
 */
async function syncGithubForProfile(profileId) {
  const accessToken = await readGithubAccessToken(profileId);

  let result;
  try {
    result = await fetchViewerContributionDays(accessToken);
  } catch (err) {
    if (err instanceof GitHubTokenInvalidError) {
      await deleteGithubAccessToken(profileId);
    }
    throw err;
  }

  const rowsWritten = await upsertContributionDays(profileId, result.days);

  return {
    githubLogin: result.login,
    totalContributions: result.totalContributions,
    daysSynced: rowsWritten,
  };
}

module.exports = {
  syncGithubForProfile,
  GitHubNotLinkedError,
};
