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
  getProfileByUserId,
  getSession,
  logout as doLogout,
  onAuthStateChange,
} from "./auth";
import { findStrategyBySupabaseProvider } from "../../strategies/auth";
import { externalAccountRepository } from "../../repositories/externalAccountRepository";
import { oauthTokenRepository } from "../../repositories/oauthTokenRepository";

async function persistOAuthIdentity(session: Session) {
  const supabaseProvider = session.user.app_metadata?.provider;
  const strategy = findStrategyBySupabaseProvider(supabaseProvider);
  if (!strategy) return;

  const identity = strategy.extractIdentity(session);
  if (!identity) return;

  try {
    await externalAccountRepository.upsertFromOAuth(session.user.id, identity);
  } catch (err) {
    console.error("[AuthProvider] external account upsert failed", err);
  }

  // provider_token is only present on the initial OAuth callback session;
  // page reloads restore the session without it.
  if (session.provider_token) {
    try {
      await oauthTokenRepository.upsert({
        profileId: session.user.id,
        provider: identity.provider,
        accessToken: session.provider_token,
        refreshToken: session.provider_refresh_token ?? null,
        scopes: strategy.scopes,
      });
    } catch (err) {
      console.error("[AuthProvider] oauth token persist failed", err);
    }
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
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && sess) {
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
