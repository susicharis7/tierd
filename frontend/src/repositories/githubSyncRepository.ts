import { supabase } from "../lib/supabase";

// Accept either name so existing setups with VITE_API_URL keep working.
// VITE_BACKEND_URL is the documented canonical name in .env.example.
const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_API_URL
)?.trim();

export type GithubSyncSuccess = {
  ok: true;
  githubLogin: string | null;
  totalContributions: number;
  daysSynced: number;
};

/** Typed error codes the backend can return. Anything else surfaces as "unknown". */
export type GithubSyncErrorCode =
  | "github_not_linked"
  | "github_token_invalid"
  | "not_signed_in"
  | "backend_unreachable"
  | "unknown";

export class GithubSyncError extends Error {
  code: GithubSyncErrorCode;
  constructor(code: GithubSyncErrorCode, message: string) {
    super(message);
    this.name = "GithubSyncError";
    this.code = code;
  }
}

/**
 * Calls POST /api/sync/github/me on the backend, passing the current
 * Supabase access token. The backend uses it to resolve the caller and
 * pulls their GitHub contribution calendar into github_daily_contributions.
 *
 * Throws `GithubSyncError` with a typed code so the UI can decide what to
 * say (re-link prompt vs. retry vs. raw error).
 */
export const githubSyncRepository = {
  async syncMe(): Promise<GithubSyncSuccess> {
    if (!BACKEND_URL) {
      throw new GithubSyncError(
        "backend_unreachable",
        "VITE_BACKEND_URL is not set.",
      );
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new GithubSyncError("not_signed_in", "You must be signed in.");
    }

    let response: Response;
    try {
      response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/sync/github/me`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error.";
      throw new GithubSyncError("backend_unreachable", message);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new GithubSyncError(
        "unknown",
        `Backend returned a non-JSON response (HTTP ${response.status}).`,
      );
    }

    if (!response.ok) {
      const body = (payload ?? {}) as { error?: string; message?: string };
      const code: GithubSyncErrorCode =
        body.error === "github_not_linked"
          ? "github_not_linked"
          : body.error === "github_token_invalid"
            ? "github_token_invalid"
            : response.status === 401
              ? "not_signed_in"
              : "unknown";
      throw new GithubSyncError(code, body.message ?? `Sync failed (HTTP ${response.status}).`);
    }

    return payload as GithubSyncSuccess;
  },
};
