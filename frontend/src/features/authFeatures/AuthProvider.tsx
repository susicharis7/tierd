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
import { githubSyncRepository } from "../../repositories/githubSyncRepository";
import {
  twoFactorRepository,
  TwoFactorApiError,
  type TwoFactorStatus,
} from "../../repositories/twoFactorRepository";
import { toast } from "../../components/ui/sonner";
import { TwoFactorGate } from "./components/TwoFactorGate";

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
    // ignore
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

  if (tokenStrategy?.id === "github") {
    void githubSyncRepository.syncMe().catch((err) => {
      console.warn("[AuthProvider] auto-sync after GitHub link failed", err);
    });
  }
}

type TwoFactorState = TwoFactorStatus & {
  checked: boolean;
  statusError: string | null;
};

const DEFAULT_2FA: TwoFactorState = {
  checked: true,
  enabled: false,
  requiresVerification: false,
  hasTrustedDevice: false,
  emailMasked: null,
  statusError: null,
};

interface AuthContextValue {
  session: Session | null;
  userId: string | null;
  profile: ProfileRow | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  twoFactor: TwoFactorState;
  refreshTwoFactorStatus: () => Promise<void>;
  initTwoFactorSetup: () => Promise<void>;
  verifyTwoFactorSetup: (code: string) => Promise<void>;
  resendTwoFactorChallenge: () => Promise<void>;
  verifyTwoFactorChallenge: (code: string, rememberDevice: boolean) => Promise<void>;
  disableTwoFactor: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function humanize2faError(err: unknown) {
  if (err instanceof TwoFactorApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Security check failed.";
}

function twoFactorSessionKey(userId: string) {
  return `tierd.2fa.session_verified.${userId}`;
}

function readTwoFactorSessionVerified(userId: string | null): boolean {
  if (!userId) return false;
  try {
    return sessionStorage.getItem(twoFactorSessionKey(userId)) === "1";
  } catch {
    return false;
  }
}

function markTwoFactorSessionVerified(userId: string | null, verified: boolean) {
  if (!userId) return;
  try {
    const key = twoFactorSessionKey(userId);
    if (verified) {
      sessionStorage.setItem(key, "1");
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignore storage failures
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [twoFactor, setTwoFactor] = useState<TwoFactorState>(DEFAULT_2FA);
  const [twoFactorSessionVerified, setTwoFactorSessionVerified] = useState(false);

  const lastUserIdRef = useRef<string | null>(null);
  const twoFactorReqIdRef = useRef(0);
  const initialTwoFactorChallengeSentForRef = useRef<string | null>(null);

  const syncProfile = useCallback(async (uid: string | null) => {
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
  }, []);

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

  const syncTwoFactorStatus = useCallback(async (uid: string | null) => {
    if (!uid) {
      setTwoFactor(DEFAULT_2FA);
      setTwoFactorSessionVerified(false);
      return;
    }

    const reqId = ++twoFactorReqIdRef.current;
    setTwoFactor((prev) => ({ ...prev, checked: false, statusError: null }));

    try {
      const status = await twoFactorRepository.getStatus();
      if (reqId !== twoFactorReqIdRef.current) return;
      setTwoFactor({
        ...status,
        checked: true,
        statusError: null,
      });
    } catch (err) {
      if (reqId !== twoFactorReqIdRef.current) return;
      const message = humanize2faError(err);
      setTwoFactor((prev) => ({
        ...prev,
        checked: true,
        statusError: message,
      }));
    }
  }, []);

  const refreshTwoFactorStatus = useCallback(async () => {
    await syncTwoFactorStatus(session?.user?.id ?? null);
  }, [session?.user?.id, syncTwoFactorStatus]);

  const initTwoFactorSetup = useCallback(async () => {
    await twoFactorRepository.initSetup();
    await refreshTwoFactorStatus();
  }, [refreshTwoFactorStatus]);

  const verifyTwoFactorSetup = useCallback(
    async (code: string) => {
      await twoFactorRepository.verifySetup({ code });
      markTwoFactorSessionVerified(session?.user?.id ?? null, true);
      setTwoFactorSessionVerified(true);
      await refreshTwoFactorStatus();
    },
    [refreshTwoFactorStatus, session?.user?.id],
  );

  const resendTwoFactorChallenge = useCallback(async () => {
    await twoFactorRepository.resendChallenge();
  }, []);

  const sendInitialTwoFactorChallenge = useCallback(async () => {
    const uid = session?.user?.id ?? lastUserIdRef.current;
    if (!uid || initialTwoFactorChallengeSentForRef.current === uid) return;

    initialTwoFactorChallengeSentForRef.current = uid;
    try {
      await twoFactorRepository.resendChallenge();
    } catch (err) {
      initialTwoFactorChallengeSentForRef.current = null;
      throw err;
    }
  }, [session?.user?.id]);

  const verifyTwoFactorChallenge = useCallback(
    async (code: string, rememberDevice: boolean) => {
      await twoFactorRepository.verifyChallenge({ code, rememberDevice });
      markTwoFactorSessionVerified(session?.user?.id ?? null, true);
      setTwoFactorSessionVerified(true);
      await refreshTwoFactorStatus();
    },
    [refreshTwoFactorStatus, session?.user?.id],
  );

  const disableTwoFactor = useCallback(
    async (code: string) => {
      await twoFactorRepository.disable({ code });
      markTwoFactorSessionVerified(session?.user?.id ?? null, false);
      setTwoFactorSessionVerified(false);
      await refreshTwoFactorStatus();
    },
    [refreshTwoFactorStatus, session?.user?.id],
  );

  useEffect(() => {
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
        setTwoFactorSessionVerified(readTwoFactorSessionVerified(sess?.user?.id ?? null));
        await Promise.all([
          syncProfile(sess?.user?.id ?? null),
          syncTwoFactorStatus(sess?.user?.id ?? null),
        ]);
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
      if (!sess?.user?.id) {
        markTwoFactorSessionVerified(lastUserIdRef.current, false);
        initialTwoFactorChallengeSentForRef.current = null;
        setTwoFactorSessionVerified(false);
      } else {
        setTwoFactorSessionVerified(readTwoFactorSessionVerified(sess.user.id));
      }
      void syncProfile(sess?.user?.id ?? null);
      void syncTwoFactorStatus(sess?.user?.id ?? null);

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
  }, [syncProfile, syncTwoFactorStatus]);

  const logout = useCallback(async () => {
    const uid = session?.user?.id ?? null;
    await doLogout();
    markTwoFactorSessionVerified(uid, false);
    setSession(null);
    setProfile(null);
    setTwoFactor(DEFAULT_2FA);
    setTwoFactorSessionVerified(false);
    initialTwoFactorChallengeSentForRef.current = null;
    lastUserIdRef.current = null;
  }, [session?.user?.id]);

  const userId = session?.user?.id ?? lastUserIdRef.current;

  const shouldBlockForTwoFactor =
    Boolean(session) &&
    twoFactor.checked &&
    twoFactor.enabled &&
    twoFactor.requiresVerification &&
    !twoFactorSessionVerified;

  return (
    <AuthContext.Provider
      value={{
        session,
        userId,
        profile,
        loading,
        logout,
        refreshProfile,
        twoFactor,
        refreshTwoFactorStatus,
        initTwoFactorSetup,
        verifyTwoFactorSetup,
        resendTwoFactorChallenge,
        verifyTwoFactorChallenge,
        disableTwoFactor,
      }}
    >
      {children}
      {shouldBlockForTwoFactor && (
        <TwoFactorGate
          emailMasked={twoFactor.emailMasked}
          statusError={twoFactor.statusError}
          onVerify={verifyTwoFactorChallenge}
          onInitialSend={sendInitialTwoFactorChallenge}
          onResend={resendTwoFactorChallenge}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
