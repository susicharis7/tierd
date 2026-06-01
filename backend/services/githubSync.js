const { supabaseAdmin } = require("../lib/supabase");
const {
  fetchViewerContributionDays,
  fetchViewerTopLanguages,
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

async function markExternalAccountSynced(profileId, extraMetadata = null) {
  // Best-effort — failing this shouldn't fail the sync itself, but log it
  // so we notice if last_synced_at silently stops updating.
  const patch = { last_synced_at: new Date().toISOString() };

  // Merge any extra metadata we want to attach (e.g. top_languages). Read
  // the current row first so we don't blow away keys we don't know about.
  if (extraMetadata) {
    const { data: existing } = await supabaseAdmin
      .from("profile_external_accounts")
      .select("metadata")
      .eq("profile_id", profileId)
      .eq("provider", "github")
      .maybeSingle();
    const merged = { ...(existing?.metadata ?? {}), ...extraMetadata };
    patch.metadata = merged;
  }

  const { error } = await supabaseAdmin
    .from("profile_external_accounts")
    .update(patch)
    .eq("profile_id", profileId)
    .eq("provider", "github");
  if (error) {
    console.error("[githubSync] failed to bump last_synced_at", error);
  }
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

  // Contributions are the headline data — if this fails, fail the whole
  // sync. Languages are nice-to-have; tolerate their failure so a temporary
  // rate-limit / 5xx on the languages query doesn't block the heatmap.
  let contribResult;
  try {
    contribResult = await fetchViewerContributionDays(accessToken);
  } catch (err) {
    if (err instanceof GitHubTokenInvalidError) {
      await deleteGithubAccessToken(profileId);
    }
    throw err;
  }

  let topLanguages = [];
  try {
    topLanguages = await fetchViewerTopLanguages(accessToken, 5);
  } catch (err) {
    console.warn(
      "[githubSync] languages fetch failed; continuing without them",
      err?.message ?? err,
    );
  }

  const rowsWritten = await upsertContributionDays(profileId, contribResult.days);
  await markExternalAccountSynced(profileId, {
    top_languages: topLanguages,
  });

  return {
    githubLogin: contribResult.login,
    totalContributions: contribResult.totalContributions,
    daysSynced: rowsWritten,
    topLanguages,
  };
}

module.exports = {
  syncGithubForProfile,
  GitHubNotLinkedError,
};
