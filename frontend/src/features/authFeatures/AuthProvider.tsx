import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { ProfileRow } from "./authTypes";
import {
  consumeOAuthCallbackError,
  getProfileByUserId,
  getSession,
  logout as doLogout,
  onAuthStateChange,
  PENDING_OAUTH_PROVIDER_KEY,
  type OAuthCallbackError,
} from "./auth";
import { findStrategyBySupabaseProvider } from "../../strategies/auth";
import { externalAccountRepository } from "../../repositories/externalAccountRepository";
import { oauthTokenRepository } from "../../repositories/oauthTokenRepository";
import { toast } from "../../components/ui/sonner";

/**
 * Turns a Supabase OAuth callback error into a sentence we'd actually want a
 * user to read. The headline case is `identity_already_exists`, which fires
 * when a user tries to link a GitHub/LinkedIn account that's already attached
 * to a *different* Tierd user — Supabase's default message ("Identity is
 * already linked to another user") is true but unhelpful out of context.
 */
function humanizeCallbackError(err: OAuthCallbackError): string {
  const strategy = findStrategyBySupabaseProvider(err.pendingProvider);
  const providerName = strategy?.label.replace(/^Continue with /, "") ?? "account";

  const isAlreadyLinked =
    /identity_already_exists/i.test(err.errorCode) ||
    /already.linked.to.another.user/i.test(err.errorDescription);
  if (isAlreadyLinked) {
    return `That ${providerName} account is already linked to another Tierd account. Sign in with that one, or unlink it there first.`;
  }

  if (/access_denied/i.test(err.errorCode)) {
    return `${providerName} sign-in was cancelled.`;
  }

  return err.errorDescription || `Couldn't complete ${providerName} sign-in.`;
}

/**
 * Walks every OAuth identity attached to the current Supabase user and mirrors
 * it into our `profile_external_accounts` table. Iterating identities (rather
 * than reading `app_metadata.provider`) is critical for the LINK flow: when a
 * user with an existing email/password account links GitHub, `app_metadata.provider`
 * stays as "email" and the new identity is only visible inside `user.identities`.
 *
 * Idempotent — safe to run on SIGNED_IN, USER_UPDATED, and INITIAL_SESSION.
 *
 * `provider_token` is only present on the OAuth callback that just completed,
 * and Supabase doesn't tell us which provider it belongs to. We stash the
 * intended provider in sessionStorage before the redirect and read it back here.
 */
async function persistOAuthIdentity(session: Session) {
  const identities = session.user.identities ?? [];

  for (const identity of identities) {
    const strategy = findStrategyBySupabaseProvider(identity.provider);
    if (!strategy) continue;

    const extracted = strategy.extractIdentity(session);
    if (!extracted) continue;

    try {
      await externalAccountRepository.upsertFromOAuth(session.user.id, extracted);
    } catch (err) {
      console.error("[AuthProvider] external account upsert failed", err, {
        provider: identity.provider,
      });
    }
  }

  if (!session.provider_token) return;

  let pendingProviderId: string | null = null;
  try {
    pendingProviderId = sessionStorage.getItem(PENDING_OAUTH_PROVIDER_KEY);
  } catch {
    // sessionStorage may be unavailable; fall through to app_metadata fallback.
  }

  const tokenStrategy =
    findStrategyBySupabaseProvider(pendingProviderId) ??
    findStrategyBySupabaseProvider(session.user.app_metadata?.provider);

  if (tokenStrategy) {
    try {
      await oauthTokenRepository.upsert({
        profileId: session.user.id,
        provider: tokenStrategy.id,
        accessToken: session.provider_token,
        refreshToken: session.provider_refresh_token ?? null,
        scopes: tokenStrategy.scopes,
      });
    } catch (err) {
      console.error("[AuthProvider] oauth token persist failed", err);
    }
  }

  try {
    sessionStorage.removeItem(PENDING_OAUTH_PROVIDER_KEY);
  } catch {
    // ignore
  }
}

interface AuthContextValue {
  session: Session | null;
  userId: string | null;
  profile: ProfileRow | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const lastUserIdRef = useRef<string | null>(null);

  const syncProfile = useCallback(
    async (uid: string | null) => {
      lastUserIdRef.current = uid;

      if (!uid) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const row = await getProfileByUserId(uid);
        setProfile(row);
      } catch (err) {
        console.error("[AuthProvider] profile fetch failed", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    const uid = lastUserIdRef.current;
    if (!uid) return;
    try {
      const row = await getProfileByUserId(uid);
      setProfile(row);
    } catch (err) {
      console.error("[AuthProvider] refreshProfile failed", err);
    }
  }, []);

  useEffect(() => {
    // Surface OAuth callback errors (e.g. linkIdentity rejected because the
    // identity belongs to another Tierd user) before anything else runs.
    // Must happen on mount because Supabase put the info in the URL hash and
    // the hash gets cleared either by us here or by detectSessionInUrl below.
    const callbackError = consumeOAuthCallbackError();
    if (callbackError) {
      toast.error(humanizeCallbackError(callbackError));
    }

    let mounted = true;

    const init = async () => {
      try {
        const sess = await getSession();
        if (!mounted) return;
        setSession(sess);
        await syncProfile(sess?.user?.id ?? null);
      } catch {
        if (mounted) setLoading(false);
      }
    };

    void init();

    const {
      data: { subscription },
    } = onAuthStateChange((event, sess) => {
      if (!mounted) return;
      if (event === "TOKEN_REFRESHED") return;

      setSession(sess);
      void syncProfile(sess?.user?.id ?? null);

      // SIGNED_IN: initial OAuth sign-in or password login.
      // USER_UPDATED: fires after linkIdentity completes — same persistence path,
      //   since the session now carries the newly linked identity + its provider_token.
      // INITIAL_SESSION: covers the case where a page refresh follows a link flow
      //   whose USER_UPDATED event was missed; upsert is idempotent so the extra
      //   work is harmless.
      if (
        (event === "SIGNED_IN" ||
          event === "USER_UPDATED" ||
          event === "INITIAL_SESSION") &&
        sess
      ) {
        void persistOAuthIdentity(sess);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncProfile]);

  const logout = useCallback(async () => {
    await doLogout();
    setSession(null);
    setProfile(null);
    lastUserIdRef.current = null;
  }, []);

  const userId = session?.user?.id ?? lastUserIdRef.current;

  return (
    <AuthContext.Provider
      value={{ session, userId, profile, loading, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
