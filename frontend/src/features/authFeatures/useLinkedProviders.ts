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
  const { userId } = useAuth();
  const [linked, setLinked] = useState<LinkedProviderMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [refresh]);

  const link = useCallback(async (strategy: AuthProviderStrategy) => {
    setError(null);
    try {
      // Redirects away — completion handled by AuthProvider on USER_UPDATED.
      await linkProviderWithStrategy(strategy);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to link ${strategy.id}.`;
      setError(message);
      throw err;
    }
  }, []);

  const unlink = useCallback(
    async (strategy: AuthProviderStrategy) => {
      if (!userId) throw new Error("Not signed in.");
      setError(null);
      try {
        await unlinkProviderWithStrategy(strategy);
        // Best-effort cleanup of stored token + external account row.
        // Supabase will keep the auth identity gone regardless; we just tidy our tables.
        await Promise.allSettled([
          oauthTokenRepository.removeByProvider(userId, strategy.id),
          externalAccountRepository.removeByProvider(userId, strategy.id),
        ]);
        await refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : `Failed to unlink ${strategy.id}.`;
        setError(message);
        throw err;
      }
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
