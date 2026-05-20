import { useState } from "react";
import { useAuth } from "../../authFeatures/AuthProvider";
import { useLinkedProviders } from "../../authFeatures/useLinkedProviders";
import { useGithubSync } from "../../authFeatures/useGithubSync";
import { GithubSyncError } from "../../../repositories/githubSyncRepository";
import { toast } from "../../../components/ui/sonner";
import type { AuthProviderStrategy } from "../../../strategies/auth";

/**
 * Drop-in section for the profile page that lets a signed-in user link or
 * unlink OAuth providers (GitHub, LinkedIn). Reuses `authProviderStrategies`
 * so adding a third provider is one file in `strategies/auth/`.
 *
 * Styling is intentionally minimal — restyle to match your profile design.
 */
export function LinkedProvidersSection() {
  const { session } = useAuth();
  const { strategies, linked, loading, error, link, unlink } = useLinkedProviders();
  const { sync: syncGithub, syncing: githubSyncing } = useGithubSync();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSyncGithub = async () => {
    try {
      const result = await syncGithub();
      toast.success(
        `Synced ${result.daysSynced} days of GitHub contributions${
          result.githubLogin ? ` for @${result.githubLogin}` : ""
        }.`,
      );
    } catch (err) {
      if (err instanceof GithubSyncError) {
        if (err.code === "github_token_invalid") {
          toast.error("GitHub rejected the stored token. Reconnect GitHub to fix.");
        } else if (err.code === "github_not_linked") {
          toast.error("Link your GitHub account before syncing.");
        } else if (err.code === "backend_unreachable") {
          toast.error("Couldn't reach the sync service. Is the backend running?");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error(err instanceof Error ? err.message : "Sync failed.");
      }
    }
  };

  // Supabase refuses to unlink the last identity — disable Unlink proactively
  // so the user doesn't have to discover the constraint by clicking.
  const authIdentityCount = session?.user?.identities?.length ?? 0;
  const wouldOrphan = authIdentityCount <= 1;

  const humanizeError = (raw: string): string => {
    if (/at least 1 identity/i.test(raw)) {
      return "Can't unlink — this is your only sign-in method. Add another provider (or set a password) first.";
    }
    return raw;
  };

  const handleLink = async (strategy: AuthProviderStrategy) => {
    setActionError(null);
    setPendingId(strategy.id);
    try {
      await link(strategy);
      // Browser will redirect to the provider; nothing else to do here.
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start link flow.";
      setActionError(humanizeError(message));
      setPendingId(null);
    }
  };

  const handleUnlink = async (strategy: AuthProviderStrategy) => {
    setActionError(null);
    setPendingId(strategy.id);
    try {
      await unlink(strategy);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unlink.";
      setActionError(humanizeError(message));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Connected accounts</h3>
        <p className="text-xs text-muted-foreground">
          Link GitHub or LinkedIn to enrich your profile and unlock tier signals.
        </p>
      </header>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <ul className="space-y-2">
        {strategies.map((strategy) => {
          const row = linked[strategy.id];
          const isLinked = !!row;
          const isPending = pendingId === strategy.id;
          const displayName = strategy.label.replace(/^Continue with /, "");
          const unlinkBlocked = isLinked && wouldOrphan;

          return (
            <li
              key={strategy.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 text-foreground">
                  <strategy.Icon />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  {isLinked ? (
                    <p className="text-xs text-muted-foreground truncate">
                      {row?.account_handle ? `@${row.account_handle}` : "Linked"}
                      {row?.account_url && (
                        <>
                          {" · "}
                          <a
                            href={row.account_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-foreground transition-colors"
                          >
                            view
                          </a>
                        </>
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>

              {isLinked ? (
                <div className="flex items-center gap-2 shrink-0">
                  {strategy.id === "github" && (
                    <button
                      type="button"
                      disabled={githubSyncing || isPending || loading}
                      onClick={handleSyncGithub}
                      className="rounded-md border border-border/60 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {githubSyncing ? "Syncing…" : "Sync"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isPending || loading || unlinkBlocked}
                    onClick={() => handleUnlink(strategy)}
                    title={
                      unlinkBlocked
                        ? "This is your only sign-in method. Add another provider first."
                        : undefined
                    }
                    className="text-xs font-medium text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Unlinking…" : "Unlink"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isPending || loading}
                  onClick={() => handleLink(strategy)}
                  className="shrink-0 rounded-md border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Connecting…" : "Connect"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {actionError && <p className="text-xs text-red-400">{actionError}</p>}
    </section>
  );
}
