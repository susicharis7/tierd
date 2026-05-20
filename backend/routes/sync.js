const express = require("express");
const { supabaseAdmin } = require("../lib/supabase");
const {
  syncGithubForProfile,
  GitHubNotLinkedError,
} = require("../services/githubSync");
const { GitHubTokenInvalidError } = require("../lib/github");

const router = express.Router();

/**
 * Pulls the Supabase access token off the Authorization header and resolves
 * it to a user. We use the admin client's getUser(jwt) which validates the
 * token against the project's JWT secret — anything tampered with comes back
 * as no-user.
 */
async function resolveCaller(req) {
  const header = req.headers.authorization ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(match[1]);
  if (error || !data?.user) return null;
  return data.user;
}

router.post("/github/me", async (req, res) => {
  const user = await resolveCaller(req);
  if (!user) {
    return res.status(401).json({ error: "Not signed in." });
  }

  try {
    const result = await syncGithubForProfile(user.id);
    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (err) {
    if (err instanceof GitHubNotLinkedError) {
      return res.status(400).json({
        error: "github_not_linked",
        message: "Link your GitHub account before syncing.",
      });
    }
    if (err instanceof GitHubTokenInvalidError) {
      return res.status(401).json({
        error: "github_token_invalid",
        message: "GitHub rejected the access token. Please reconnect GitHub.",
      });
    }
    console.error("[POST /api/sync/github/me] failed", err);
    return res.status(500).json({
      error: "sync_failed",
      message: err.message ?? "Sync failed.",
    });
  }
});

module.exports = router;
