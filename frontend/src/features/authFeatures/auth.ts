import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { AuthProviderStrategy } from "../../strategies/auth";
import type { LoginInput, ProfileRow, RegisterInput } from "./authTypes";

const DEBUG_AUTH = true;

const NOT_CONFIGURED_MSG =
  "Supabase is not configured. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";

function authLog(...args: unknown[]) {
  if (DEBUG_AUTH) console.log("[AUTH]", ...args);
}

export async function register(regInput: RegisterInput) {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MSG);

  const { email, password, username, fullName } = regInput;
  authLog("register:start", { email, username, fullName });

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
      },
    },
  });

  authLog("register:result", { data, error });
  if (error) throw error;
  return data;
}

export async function login(logInput: LoginInput) {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MSG);

  const { email, password } = logInput;
  authLog("login:start", { email });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  authLog("login:result", {
    error,
    userId: data?.user?.id ?? null,
    hasSession: !!data?.session,
  });

  if (error) throw error;
  return data;
}

/** sessionStorage key recording which provider an OAuth callback belongs to. */
export const PENDING_OAUTH_PROVIDER_KEY = "tierd.pendingOAuthProvider";

function recordPendingOAuthProvider(strategy: AuthProviderStrategy) {
  try {
    sessionStorage.setItem(PENDING_OAUTH_PROVIDER_KEY, strategy.supabaseProvider);
  } catch {
    // Some browsers throw on sessionStorage access (e.g., privacy mode).
  }
}

export type OAuthCallbackError = {
  errorCode: string;
  errorDescription: string;
  /** supabaseProvider id (e.g. "github", "linkedin_oidc") if we set the marker. */
  pendingProvider: string | null;
};

/**
 * Reads (and clears) an OAuth callback error that Supabase places in the URL
 * hash when a sign-in or link flow is rejected. The most common case we care
 * about: linkIdentity fails with `identity_already_exists` because the OAuth
 * account is already attached to a different Tierd user. Without this, the
 * browser silently returns to `/` and the user has no idea what happened.
 *
 * Also consumes the pending-provider marker, but only in the error path —
 * on the success path that marker is left for `persistOAuthIdentity`.
 */
export function consumeOAuthCallbackError(): OAuthCallbackError | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes("error")) return null;

  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const errorCode = params.get("error_code") ?? params.get("error") ?? "";
  const errorDescription = (params.get("error_description") ?? "").replace(/\+/g, " ");
  if (!errorCode && !errorDescription) return null;

  let pendingProvider: string | null = null;
  try {
    pendingProvider = sessionStorage.getItem(PENDING_OAUTH_PROVIDER_KEY);
    sessionStorage.removeItem(PENDING_OAUTH_PROVIDER_KEY);
  } catch {
    // ignore
  }

  try {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  } catch {
    // ignore
  }

  authLog("oauth:callback-error", { errorCode, errorDescription, pendingProvider });
  return { errorCode, errorDescription, pendingProvider };
}

export async function signInWithOAuthStrategy(strategy: AuthProviderStrategy) {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MSG);
  authLog("oauth:start", { provider: strategy.supabaseProvider });

  recordPendingOAuthProvider(strategy);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: strategy.supabaseProvider,
    options: {
      scopes: strategy.scopes,
      redirectTo: window.location.origin,
    },
  });

  authLog("oauth:redirect", { error });
  if (error) throw error;
}

/**
 * Adds an OAuth identity to the *already signed-in* user. Used from the
 * profile page to attach GitHub/LinkedIn to an existing Tierd account.
 *
 * Requires "Allow manual linking" to be enabled in Supabase Auth settings.
 * Redirects through the provider — completion is handled by AuthProvider's
 * onAuthStateChange listener (USER_UPDATED event).
 */
export async function linkProviderWithStrategy(strategy: AuthProviderStrategy) {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MSG);
  authLog("link:start", { provider: strategy.supabaseProvider });

  recordPendingOAuthProvider(strategy);

  const { data, error } = await supabase.auth.linkIdentity({
    provider: strategy.supabaseProvider,
    options: {
      scopes: strategy.scopes,
      redirectTo: window.location.origin,
    },
  });

  authLog("link:redirect", { error, hasUrl: !!data?.url });
  if (error) throw error;
}

/**
 * Removes an OAuth identity from the current user. Supabase requires at
 * least one identity to remain — attempting to unlink the last one returns
 * an error which we surface to the caller for UI handling.
 *
 * If our app-side row (profile_external_accounts) exists but the matching
 * auth identity does not — e.g. seed data or a stale row from a connection
 * revoked outside the app — this resolves successfully so the caller can
 * still clean up the app-side row.
 */
export async function unlinkProviderWithStrategy(strategy: AuthProviderStrategy) {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MSG);
  authLog("unlink:start", { provider: strategy.supabaseProvider });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("You must be signed in to unlink a provider.");

  const identity = session.user.identities?.find(
    (i) => i.provider === strategy.supabaseProvider,
  );

  if (!identity) {
    authLog("unlink:no-auth-identity", { provider: strategy.supabaseProvider });
    return;
  }

  const { error } = await supabase.auth.unlinkIdentity(identity);
  authLog("unlink:result", { error });
  if (error) throw error;
}

export async function logout() {
  if (!isSupabaseConfigured) return;
  authLog("logout:start");
  const { error } = await supabase.auth.signOut();
  authLog("logout:result", { error });
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  authLog("getSession:start");

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  authLog("getSession:result", {
    error,
    userId: session?.user?.id ?? null,
    hasSession: !!session,
  });

  if (error) throw error;
  return session;
}

export async function getProfileByUserId(userId: string): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export async function getSessionUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session?.user?.id ?? null;
};



export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  if (!isSupabaseConfigured) {
    const noop = { unsubscribe: () => {} };
    queueMicrotask(() => callback("INITIAL_SESSION" as AuthChangeEvent, null));
    return { data: { subscription: noop } };
  }
  return supabase.auth.onAuthStateChange((event, session) => {
    authLog("onAuthStateChange:event", {
      event,
      userId: session?.user?.id ?? null,
      hasSession: !!session,
    });
    callback(event, session);
  });
}

export async function updateProfile(
  userId: string,
  fields: { full_name?: string; username?: string; avatar_url?: string },
): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MSG);

  const { data, error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", userId)
    .select("id, username, full_name, avatar_url, created_at, updated_at")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string> {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MSG);

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}


