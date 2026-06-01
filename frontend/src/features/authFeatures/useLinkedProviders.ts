import { useCallback, useEffect, useState } from "react";
import {
  authProviderStrategies,
  type AuthProviderStrategy,
  type ExternalAccountProvider,
} from "../../strategies/auth";
import {
  externalAccountRepository,
  type ExternalAccountRow,
} from "../../repositories/externalAccountRepository";
import { oauthTokenRepository } from "../../repositories/oauthTokenRepository";
import {
  linkProviderWithStrategy,
  unlinkProviderWithStrategy,
} from "./auth";
import { useAuth } from "./AuthProvider";

export type LinkedProviderMap = Partial<Record<ExternalAccountProvider, ExternalAccountRow>>;

export interface UseLinkedProvidersResult {
  /** All providers the app supports, in display order. */
  strategies: ReadonlyArray<AuthProviderStrategy>;
  /** Map of provider id → row, for providers currently linked. */
  linked: LinkedProviderMap;
  loading: boolean;
  error: string | null;
  /** Start the OAuth link flow for a provider. Redirects away from the page. */
  link: (strategy: AuthProviderStrategy) => Promise<void>;
  /** Unlink a provider from the current user; cleans up the stored token. */
  unlink: (strategy: AuthProviderStrategy) => Promise<void>;
  /** Re-fetch the linked-providers list from Supabase. */
  refresh: () => Promise<void>;
}

/**
 * Reads + mutates the set of OAuth providers attached to the signed-in user.
 *
 * Backed by `profile_external_accounts`. Link and unlink go through the same
 * AuthProviderStrategy interface used by the AuthDialog, so adding a third
 * provider stays a one-file change.
 */
export function useLinkedProviders(): UseLinkedProvidersResult {
  const { userId, session } = useAuth();
  const [linked, setLinked] = useState<LinkedProviderMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // When AuthProvider sees USER_UPDATED (e.g. after a link), the session is
  // replaced and identities change — re-fetch so the UI flips from "Connect"
  // to "Unlink" without a page reload.
  const identitySignature = session?.user?.identities
    ?.map((i) => i.provider)
    .sort()
    .join(",");

  const refresh = useCallback(async () => {
    if (!userId) {
      setLinked({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await externalAccountRepository.listByProfile(userId);
      const next: LinkedProviderMap = {};
      for (const row of rows) {
        next[row.provider] = row;
      }
      setLinked(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load linked accounts.";
      setError(message);
      console.error("[useLinkedProviders] refresh failed", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh, identitySignature]);

  // Link/unlink errors bubble up to the caller for transient UI handling;
  // we don't store them on the hook so a one-off action failure doesn't
  // bleed into the persistent error state that's reserved for read failures.
  const link = useCallback(async (strategy: AuthProviderStrategy) => {
    // Redirects away — completion handled by AuthProvider on USER_UPDATED.
    await linkProviderWithStrategy(strategy);
  }, []);

  const unlink = useCallback(
    async (strategy: AuthProviderStrategy) => {
      if (!userId) throw new Error("Not signed in.");
      await unlinkProviderWithStrategy(strategy);
      // Best-effort cleanup of stored token + external account row.
      // Supabase will keep the auth identity gone regardless; we just tidy our tables.
      await Promise.allSettled([
        oauthTokenRepository.removeByProvider(userId, strategy.id),
        externalAccountRepository.removeByProvider(userId, strategy.id),
      ]);
      await refresh();
    },
    [userId, refresh],
  );

  return {
    strategies: authProviderStrategies,
    linked,
    loading,
    error,
    link,
    unlink,
    refresh,
  };
}
